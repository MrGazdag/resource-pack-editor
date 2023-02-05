import RPEEventNode from "../../src/rpe/event/RPEEventNode";
import RPEEvent from "../../src/rpe/event/RPEEvent";
import RPEEventState from "../../src/rpe/event/RPEEventState";
import TimeUnit from "../../src/rpe/util/TimeUnit";
import RPECancellableEvent from "../../src/rpe/event/RPECancellableEvent";
import CancellationError from "../../src/rpe/error/CancellationError";

describe("Event Tests", function () {
    it("Simple Handling", (done)=>{
        // Register the node
        let node = new RPEEventNode();
        class TestEvent extends RPEEvent {
            static EVENT_ID = "test:test";
            value: string;

            constructor(value: string) {
                super();
                this.value = value;
            }
        }
        node.register(TestEvent, (e)=>{
            expect(e.getState()).toEqual(RPEEventState.BEFORE_EXECUTION);
            e.value += " (handled)";
        });

        // Testing the event
        (async ()=>{
            let event = new TestEvent("example");
            expect(event.getState()).toBeNull();
            await node.callEvent(event, (e)=>{
                expect(e.getState()).toEqual(RPEEventState.DURING_EXECUTION);
                expect(e.value).toEqual("example (handled)");
            });
            expect(event.getState()).toEqual(RPEEventState.AFTER_EXECUTION);
            done();
        })();
    });
    it("Simple Async Handling", (done)=>{
        // Register the node
        let node = new RPEEventNode();
        class TestEvent extends RPEEvent {
            static EVENT_ID = "test:test";
            sync: boolean = false;
            async: boolean = false;
            done: boolean = false;
        }
        node.register(TestEvent, (e)=>{
            e.sync = true;
        });
        node.registerAsync(TestEvent, (e)=>{
            return TimeUnit.MILLISECONDS.sleep(100).thenRun(()=>{
                e.async = true;
            });
        });

        // Testing the event
        (async ()=>{
            let event = new TestEvent();
            expect(event.getState()).toBeNull();
            let f = node.callEvent(event, (e)=>{
                expect(e.getState()).toEqual(RPEEventState.DURING_EXECUTION);
                expect(e.sync).toBeTrue();
                expect(e.async).toBeTrue();
                expect(e.done).toBeFalse();
                e.done = true;
            });
            expect(event.getState()).toEqual(RPEEventState.BEFORE_EXECUTION);
            expect(event.sync).toBeTrue();
            expect(event.async).toBeFalse();
            expect(event.done).toBeFalse();
            await f;
            expect(event.getState()).toEqual(RPEEventState.AFTER_EXECUTION);
            expect(event.sync).toBeTrue();
            expect(event.async).toBeTrue();
            expect(event.done).toBeTrue();
            done();
        })();
    });

    it("Advanced Handling", (done)=>{
        // Register the node
        let node = new RPEEventNode();
        class TestEvent extends RPEEvent {
            static EVENT_ID = "test:test";
            value: string;

            constructor(value: string) {
                super();
                this.value = value;
            }
        }
        node.register(TestEvent, (e)=>{
            expect(e.getState()).toEqual(RPEEventState.BEFORE_EXECUTION);
            e.value += " (handled)";
        });

        // Testing the event
        (async ()=>{
            let event = new TestEvent("example");
            expect(event.getState()).toBeNull();
            let f = node.prepareEvent(event);
            expect(event.getState()).toEqual(RPEEventState.BEFORE_EXECUTION);
            expect(event.value).toEqual("example (handled)");
            await f;
            await node.executeEvent(event, (e)=>{
                expect(e.getState()).toEqual(RPEEventState.DURING_EXECUTION);
            });
            f = node.completeEvent(event);
            expect(event.getState()).toEqual(RPEEventState.AFTER_EXECUTION);
            await f;
            done();
        })();
    });
    it("Cancellable Events", (done)=>{
        let node = new RPEEventNode();
        class TestEvent extends RPEEvent implements RPECancellableEvent {
            static EVENT_ID = "test:test";
            value: string;
            cancelled: boolean;

            constructor(value: string) {
                super();
                this.value = value;
                this.cancelled = false;
            }

            isCancelled(): boolean {
                return this.cancelled;
            }

            setCancelled(cancelled: boolean): void {
                this.cancelled = cancelled;
            }
        }
        node.register(TestEvent, (e)=>{
            if (e.value.includes("cancel")) {
                e.value += " is not good"
                e.setCancelled(true);
            } else {
                e.value += " is good";
            }
        });

        // Testing the event
        (async ()=>{
            let fail = (event: TestEvent, error: CancellationError|null)=>{
                expect(event).withContext("Event continued execution!").toBeNull();
                expect(error).withContext("Event was cancelled!").toBeTruthy();
                return true;
            };
            let complete = (event: TestEvent, error: CancellationError|null)=>{
                expect(event.getState()).withContext("Event did not continue execution!").toBe(RPEEventState.AFTER_EXECUTION);
                expect(error).withContext("Event was not cancelled!").toBeNull();
            };
            await node.callCancellableEvent(new TestEvent("thing")).handle(complete);
            await node.callCancellableEvent(new TestEvent("something")).handle(complete);
            await node.callCancellableEvent(new TestEvent("cancelthing")).handle(fail);
            await node.callCancellableEvent(new TestEvent("nothing")).handle(complete);
            await node.callCancellableEvent(new TestEvent("thing to cancel")).handle(fail);
            await node.callCancellableEvent(new TestEvent("very cancel")).handle(fail);
            done();
        })();
    });
});