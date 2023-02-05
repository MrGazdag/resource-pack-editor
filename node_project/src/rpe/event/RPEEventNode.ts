import RPEEventHandler from "./RPEEventHandler";
import RPEEventState from "./RPEEventState";
import RPEEvent from "./RPEEvent";
import Constructor from "../util/Constructor";
import Future from "../util/Future";

export default class RPEEventNode {
    private readonly beforeHandlers: Map<Constructor<any>,RPEEventHandler<any>[]>;
    private readonly duringHandlers: Map<Constructor<any>,RPEEventHandler<any>[]>;
    private readonly afterHandlers: Map<Constructor<any>,RPEEventHandler<any>[]>;

    constructor() {
        this.beforeHandlers = new Map();
        this.duringHandlers = new Map();
        this.afterHandlers = new Map();
    }
    private array<T extends RPEEvent>(handling: RPEEventState, clazz: Constructor<T>): RPEEventHandler<T>[] {
        let map: Map<Constructor<any>,RPEEventHandler<any>[]>;
        switch (handling) {
            case RPEEventState.BEFORE_EXECUTION: map = this.beforeHandlers; break;
            case RPEEventState.DURING_EXECUTION: map = this.duringHandlers; break;
            case RPEEventState.AFTER_EXECUTION: map = this.afterHandlers; break;
        }
        if (map.has(clazz)) return map.get(clazz);
        else {
            let array = [];
            map.set(clazz, array);
            return array;
        }
    }
    register<T extends RPEEvent>(clazz: Constructor<T>, handler: (event: T)=>void, handling: RPEEventState = RPEEventState.BEFORE_EXECUTION) {
        this.array(handling, clazz).push(RPEEventHandler.newHandler(handler));
    }
    registerAsync<T extends RPEEvent>(clazz: Constructor<T>, handler: (event: T)=>Future<void>, handling: RPEEventState = RPEEventState.BEFORE_EXECUTION) {
        this.array(handling, clazz).push(RPEEventHandler.newAsyncHandler(handler));
    }
    private callLayer<T extends RPEEvent>(layer: RPEEventState, event: T, runner: (event: T)=>void = undefined): Future<T> {
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
            } else if (runner) {
                sync.push(handler);
            } else {
                try {
                    handler.handle(event);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        if (runner) {
            runner(event);
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
    callEvent<T extends RPEEvent>(event: T, runner: (event: T)=>void): Future<T> {
        RPEEvent.setState(event, RPEEventState.BEFORE_EXECUTION);
        return this.callLayer(RPEEventState.BEFORE_EXECUTION, event).thenCompose(result=>{
            RPEEvent.setState(result, RPEEventState.DURING_EXECUTION);
            return this.callLayer(RPEEventState.DURING_EXECUTION, result, runner);
        }).thenCompose(result=>{
            RPEEvent.setState(result, RPEEventState.AFTER_EXECUTION);
            return this.callLayer(RPEEventState.AFTER_EXECUTION, result);
        });
    }
    prepareEvent<T extends RPEEvent>(event: T): Future<T> {
        return this.callLayer(RPEEventState.BEFORE_EXECUTION, event);
    }
    startEvent<T extends RPEEvent>(event: T): Future<T> {
        return this.callLayer(RPEEventState.DURING_EXECUTION, event);
    }
    endEvent<T extends RPEEvent>(event: T): Future<T> {
        return this.callLayer(RPEEventState.AFTER_EXECUTION, event);
    }
}
