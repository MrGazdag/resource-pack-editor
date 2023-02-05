import Future from "../../src/rpe/util/Future";
import TimeUnit from "../../src/rpe/util/TimeUnit";
import TimeoutError from "../../src/rpe/error/TimeoutError";
import CompletionError from "../../src/rpe/error/CompletionError";

describe('Future tests', () => {
    it("Timeout", (done)=>{
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
    it("Transforming", (done)=>{
        let f = new Future<string[]>();
        f.thenApply((result) => {
            expect(result instanceof Array<string>).toBeTrue();
            return result[0];
        }).thenApply((result) => {
            expect(typeof result).toEqual("string");
            expect(result.length).toBe(8);
            return result.substring(2, 6);
        }).thenApply((result) => {
            expect(typeof result).toEqual("string");
            expect(result).toEqual("cdef");
            return result.length;
        }).thenAccept((result)=>{
            expect(typeof result).toEqual("number");
            expect(result).toEqual(4);
        }).thenRun(done);
        f.complete(["abcdefgh"]);
    });
    it("Sequencing", (done)=>{
        let f = new Future<number[]>();
        f.thenApply((result) => {
            result.push(2);
            return result;
        }).thenApply((result) => {
            result.push(3);
            return result;
        }).then((result) => {
            expect(result).toEqual([1,2,3]);
            done();
        });
        f.complete([1]);
    });
    it("Sequencing 2", (done)=>{
        let f = new Future<number[]>();
        let f2 = f.thenApply((result) => {
            result.push(2);
            return result;
        });
        f.thenApply((result) => {
            result.push(3);
            return result;
        }).thenAccept((result) => {
            expect(result).toEqual([1,2,3,4]);
            done();
        });
        f2.thenApply((result) => {
            result.push(4);
            return result;
        });
        f.complete([1]);
    });
});