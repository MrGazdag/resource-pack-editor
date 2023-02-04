import Future from "../../src/rpe/util/Future";
import TimeUnit from "../../src/rpe/util/TimeUnit";
import TimeoutError from "../../src/rpe/error/TimeoutError";
import CompletionError from "../../src/rpe/error/CompletionError";

describe('Future tests', () => {
    it("Sequencing", ()=>{
        let f = new Future<number[]>();
        f.thenApply((result) => {
            result.push(2);
            return result;
        }).thenApply((result) => {
            result.push(3);
            return result;
        }).then((result) => {
            expect(result).toEqual([1,2,3]);
        });
        f.complete([1]);
    });
    it("Timeout testing", (done)=>{
       let f = new Future<string>();
       f.orTimeout(100, TimeUnit.MILLISECONDS);
       setTimeout(()=>{
            expect(f.isDone()).toBeTrue();
            expect(f.isCompletedExceptionally()).toBeTrue();
            expect(()=>f.getNow()).toThrowMatching((e)=>e instanceof CompletionError && e.cause instanceof TimeoutError);
            done();
       }, 200);
       f.catch(()=>{});
    });
});