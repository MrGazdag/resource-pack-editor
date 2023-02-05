import RPEEventNode from "../../src/rpe/event/RPEEventNode";
import RPEEvent from "../../src/rpe/event/RPEEvent";
import RPEEventState from "../../src/rpe/event/RPEEventState";
import TimeUnit from "../../src/rpe/util/TimeUnit";

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
});