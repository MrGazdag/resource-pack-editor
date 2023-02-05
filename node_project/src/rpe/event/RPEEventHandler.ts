import Future from "../util/Future";

class RPEEventHandler<T> {
    readonly async: boolean;
    private readonly func: (event: T)=>(void|Future<void>);

    private constructor(async: boolean, func: (event: T) => (void | Future<void>)) {
        this.async = async;
        this.func = func;
    }

    handle(event: T) {
        this.func(event);
    }
    handleAsync(event: T): Future<void> {
        return this.func(event) as (Future<void>);
    }
    static newHandler<T>(func: (event: T)=>void): RPEEventHandler<T> {
        return new RPEEventHandler<T>(false, func);
    }
    static newAsyncHandler<T>(func: (event: T)=>Future<void>): RPEEventHandler<T> {
        return new RPEEventHandler<T>(true, func);
    }
}
export default RPEEventHandler;