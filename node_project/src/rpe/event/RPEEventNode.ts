import RPEEventHandler from "./RPEEventHandler";
import RPEEventState from "./RPEEventState";
import RPEEvent from "./RPEEvent";
import Constructor from "../util/Constructor";
import Future from "../util/Future";
import RPECancellableEvent from "./RPECancellableEvent";
import CancellationError from "../error/CancellationError";

/**
 * Represents an event node, on which events can be called.
 * Event handling is set up in the following way:
 * - **{@link RPEEventNode.prepareEvent Preparation}**: The event first gets prepared, and all preparation/"before" handlers ({@link RPEEventState.BEFORE_EXECUTION})
 *   are called (both sync and async), to ensure that executing the event is possible.
 * - **{@link RPEEventNode.callFilteredEvent Filtering}**: After all preparation handlers finish, it might be
 *   determined that the event cannot be executed, and event handling will halt at this point. (see {@link RPECancellableEvent}).
 * - **{@link RPEEventNode.executeEvent Execution}**: If the event can be executed, then all async main/"during" handlers
 *   ({@link RPEEventState.DURING_EXECUTION}) are called, then the
 *   main task will be executed, and lastly all sync main/"during" handlers
 *   will be called.
 * - **{@link RPEEventNode.completeEvent Cleanup}**: After the event and all "during" handlers finish, all cleanup/"after"
 *   handlers ({@link RPEEventState.AFTER_EXECUTION}) are called.
 */
export default class RPEEventNode {
    private readonly prepHandlers: Map<Constructor<any>,RPEEventHandler<any>[]>;
    private readonly execHandlers: Map<Constructor<any>,RPEEventHandler<any>[]>;
    private readonly cleanupHandlers: Map<Constructor<any>,RPEEventHandler<any>[]>;

    /**
     * Creates a new EventNode.
     */
    constructor() {
        this.prepHandlers = new Map();
        this.execHandlers = new Map();
        this.cleanupHandlers = new Map();
    }

    /**
     * Returns the array for the specific Event type
     * and event state.
     *
     * @param eventState the event state
     * @param clazz the event class
     *
     * @template T the type of the event
     */
    private array<T extends RPEEvent>(eventState: RPEEventState, clazz: Constructor<T>): RPEEventHandler<T>[] {
        let map: Map<Constructor<any>,RPEEventHandler<any>[]>;
        switch (eventState) {
            case RPEEventState.BEFORE_EXECUTION: map = this.prepHandlers; break;
            case RPEEventState.DURING_EXECUTION: map = this.execHandlers; break;
            case RPEEventState.AFTER_EXECUTION: map = this.cleanupHandlers; break;
        }
        if (map.has(clazz)) return map.get(clazz);
        else {
            let array = [];
            map.set(clazz, array);
            return array;
        }
    }

    /**
     * Registers a synchronous event handler, for the
     * specified event type and event state.
     * @param clazz the type of the event
     * @param handler the event handler itself
     * @param eventState the event state
     *
     * @see {@link RPEEventNode.registerAsync}
     */
    register<T extends RPEEvent>(clazz: Constructor<T>, handler: (event: T)=>void, eventState: RPEEventState = RPEEventState.BEFORE_EXECUTION) {
        while (clazz["EVENT_ID"]) {
            this.array(eventState, clazz).push(RPEEventHandler.newHandler(handler));
            clazz = Object.getPrototypeOf(clazz);
        }
    }
    /**
     * Registers an asynchronous event handler, for the
     * specified event type and event state.
     * @param clazz the type of the event
     * @param handler the event handler itself
     * @param eventState the event state
     *
     * @see {@link RPEEventNode.register}
     */
    registerAsync<T extends RPEEvent>(clazz: Constructor<T>, handler: (event: T)=>Future<void>, eventState: RPEEventState = RPEEventState.BEFORE_EXECUTION) {
        while (clazz["EVENT_ID"]) {
            this.array(eventState, clazz).push(RPEEventHandler.newAsyncHandler(handler));
            clazz = Object.getPrototypeOf(clazz);
        }
    }

    /**
     * Calls the specified layer's handlers for
     * the given event.
     *
     * If `task` is absent, then all handlers are called
     * in registration order.
     *
     * If `task` is present, then the execution order
     * will change: All async handlers are called first,
     * then `task` is executed, then the sync handlers are called.
     *
     * The returned Future will complete after all handlers
     * (and `task` if present) finish.
     *
     * @param layer the layer to call
     * @param event the event being called
     * @param task the task to execute
     */
    private callLayer<T extends RPEEvent>(layer: RPEEventState, event: T, task: (event: T)=>void|undefined = undefined): Future<T> {
        let async: Future<void>[] = [];
        let sync: RPEEventHandler<T>[] = [];
        let array = this.array(layer, event.constructor as Constructor<T>);
        for (let handler of array) {
            if (handler.async) {
                try {
                    async.push(handler.handleAsync(event));
                } catch (e) {
                    console.error(e);
                }
            } else if (task) {
                sync.push(handler);
            } else {
                try {
                    handler.handle(event);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        if (task) {
            task(event);
            for (let syncHandler of sync) {
                try {
                    syncHandler.handle(event);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        return Future.allOf(...async).handle(()=>{
            return event;
        });
    }

    /**
     * Calls the event. Execution is
     * @param event the event to call
     * @param task the main event task to execute
     */
    callEvent<T extends RPEEvent>(event: T, task: (event: T)=>void|undefined = undefined): Future<T> {
        RPEEvent.setState(event, RPEEventState.BEFORE_EXECUTION);
        return this.callLayer(RPEEventState.BEFORE_EXECUTION, event).thenCompose(result=>{
            RPEEvent.setState(result, RPEEventState.DURING_EXECUTION);
            return this.callLayer(RPEEventState.DURING_EXECUTION, result, task);
        }).thenCompose(result=>{
            RPEEvent.setState(result, RPEEventState.AFTER_EXECUTION);
            return this.callLayer(RPEEventState.AFTER_EXECUTION, result);
        });
    }

    /**
     * Calls the event. After all preparation handlers finish, it
     * is determined whether this event should be executed or not
     * (using the specified `filter` function). If the event is to
     * be executed, then event handling will continue normally. Otherwise,
     * the event handling will stop, and the main event will not be executed.
     * @param event the event itself
     * @param task the main event task to execute
     * @param filter the function to detect if an event should be executed
     */
    callFilteredEvent<T extends RPEEvent>(event: T, task: (event: T)=>void|undefined, filter: (event: T)=>boolean): Future<T> {
        RPEEvent.setState(event, RPEEventState.BEFORE_EXECUTION);
        // Call the preparation handlers
        return this.callLayer(RPEEventState.BEFORE_EXECUTION, event).thenCompose(result=>{
            if (filter(result)) {
                // The event was cancelled
                return Future.failedFuture(new CancellationError("The event was cancelled."));
            }

            // Call the main event and handlers
            RPEEvent.setState(result, RPEEventState.DURING_EXECUTION);
            return this.callLayer(RPEEventState.DURING_EXECUTION, result, task).thenCompose(result => {
                // Finally, call the cleanup handlers
                RPEEvent.setState(result, RPEEventState.AFTER_EXECUTION);
                return this.callLayer(RPEEventState.AFTER_EXECUTION, result);
            });
        });
    }
    callCancellableEvent<T extends RPEEvent & RPECancellableEvent>(event: T, task: (event: T)=>void|undefined = undefined): Future<T> {
        return this.callFilteredEvent(event, task, event=>event.isCancelled());
    }
    prepareEvent<T extends RPEEvent>(event: T): Future<T> {
        RPEEvent.setState(event, RPEEventState.BEFORE_EXECUTION);
        return this.callLayer(RPEEventState.BEFORE_EXECUTION, event);
    }
    executeEvent<T extends RPEEvent>(event: T, task: (event: T)=>void|undefined = undefined): Future<T> {
        RPEEvent.setState(event, RPEEventState.DURING_EXECUTION);
        return this.callLayer(RPEEventState.DURING_EXECUTION, event, task);
    }
    completeEvent<T extends RPEEvent>(event: T): Future<T> {
        RPEEvent.setState(event, RPEEventState.AFTER_EXECUTION);
        return this.callLayer(RPEEventState.AFTER_EXECUTION, event);
    }
}
