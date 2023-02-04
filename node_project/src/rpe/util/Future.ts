import CancellationError from "../error/CancellationError";
import CompletionError from "../error/CompletionError";
import ExecutionError from "../error/ExecutionError";
import TimeoutError from "../error/TimeoutError";
import TimeUnit from "./TimeUnit";

enum FutureState {
    INCOMPLETE,
    CANCELLED,
    COMPLETED_SUCCESS,
    COMPLETED_EXCEPTIONALLY,
}
/**
 * The JS equivalent of Java's CompletableFuture.
 * @template T the type of the result
 */
export default class Future<T> implements Promise<T> {
    /**
     * The result of this future.
     */
    private _result: T | null;
    /**
     * The error that occurred.
     */
    private _error: any | null;
    /**
     * The current state of the Future.
     */
    private _state: FutureState;
    /**
     * The estimated number of dependent children.
     * Note that this does not include children
     * of children.
     */
    private _childrenCount: number;
    /**
     * The underlying promise implementation.
     */
    private _completionPromise: Promise<T>;
    /**
     * The underlying promise's `resolve` method.
     */
    private _completionPromiseResolve: (result: any) => void;
    /**
     * The underlying promise's `reject` method.
     */
    private _completionPromiseReject: (error: any) => void;
    /**
     * Creates a new incomplete Future.
     */
    constructor() {
        this._result = null;
        this._error = null;
        this._state = FutureState.INCOMPLETE;
        this._childrenCount = 0;
        this._completionPromise = new Promise((resolve, reject)=>{
            this._completionPromiseResolve = resolve;
            this._completionPromiseReject = reject;
        });
    }
    [Symbol.toStringTag]: string = "Future";
    /**
     * The promise `then()` method.
     * @param completionHandler the completion handler, will be called on successful completion
     * @param errorHandler the error handler, will be called on unsuccessful completion
     * @returns a new Future
     * @template TCompletionResult the result from the completionHandler
     * @template TErrorResult the result from the error handler
     */
    then<TCompletionResult = T, TErrorResult = never>(completionHandler?: ((value: T) => TCompletionResult | Promise<TCompletionResult>) | undefined | null, errorHandler?: ((reason: any) => TErrorResult | Promise<TErrorResult>) | undefined | null): Future<TCompletionResult | TErrorResult> {
        let future = new Future<TCompletionResult|TErrorResult>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                let value = completionHandler(result);
                if (value instanceof Promise) {
                    value.then(result=>{
                        future.complete(result);
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } else {
                    future.complete(value);
                }
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            try {
                let value = errorHandler(error);
                if (value instanceof Promise) {
                    value.then(result=>{
                        future.complete(result);
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } else {
                    future.complete(value);
                }
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        });
        return future;
    }
    catch<TErrorResult = never>(errorHandler?: (reason: any) => TErrorResult | Promise<TErrorResult>): Promise<T | TErrorResult> {
        let future = new Future<T|TErrorResult>();
        this._childrenCount++;
        this._completionPromise.catch(error=>{
            try {
                let value = errorHandler(error);
                if (value instanceof Promise) {
                    value.then(result=>{
                        future.complete(result);
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } else {
                    future.complete(value);
                }
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        });
        return future;
    }
    finally(onfinally?: () => void): Promise<T> {
        let future = new Future<T>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                if (onfinally) onfinally();
                future.complete(result);
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            try {
                if (onfinally) onfinally();
                future.completeExceptionally(error);
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        });
        return future;
    }
    /**
     * Completes the Future with the specified result.
     * If the future has already completed (exceptionally
     * or not), this method does nothing.
     * @param result the result to complete with
     * @returns `true` if this Future was completed by this method
     */
    complete(result: T): boolean {
        if (this._state != FutureState.INCOMPLETE) return false;

        this._result = result;
        this._state = FutureState.COMPLETED_SUCCESS;
        this._completionPromiseResolve(this._result);
        return true;
    }
    
    /**
     * Completes this Future with the result of the given supplier function.
     * @param supplier a function returning the value to be used to complete this Future
     */
    completeAsync(supplier: Promise<T>|(() => Promise<T>)) {
        if (supplier instanceof Function) {
            supplier = supplier();
        }
        supplier.then(result=>{
            this.complete(result);
        }, error=>{
            this.completeExceptionally(error);
        });
    }
    /**
     * Completes the Future with the specified error.
     * If the future has already completed (exceptionally
     * or not), this method does nothing.
     * @param error the error
     * @returns `true` if this Future was completed by this method
     */
    completeExceptionally(error: Error|any): boolean {
        if (this._state != FutureState.INCOMPLETE) return false;

        this._error = error;
        this._state = FutureState.COMPLETED_EXCEPTIONALLY;
        this._completionPromiseReject(this._error);
        return true;
    }
    /**
     * If not already completed, completes this Future with a CancellationError. Dependent Futures that have
     * not already completed will also complete exceptionally, with a CompletionError caused by this CancellationError.
     * @returns `true` if this Future is now cancelled
     */
    cancel(): boolean {
        if (this._state == FutureState.INCOMPLETE) return false;
        this._state = FutureState.CANCELLED;
        this._error = new CancellationError("Future was cancelled");
        this._completionPromiseReject(this._error);
        return true;
    }
    /**
     * Waits at most the given time (or if 0, indefinitely) for this future to complete,
     * then resolves the returned Promise with the result, or rejects it
     * with the exception that occurred (if any).
     * 
     * @param timeout the timeout to wait, 0 waits indefinitely
     * @param unit the unit in which the timeout is given
     * @returns a Promise
     * 
     * @throws {TimeoutError} if the timeout has been exceeded
     * @throws {CompletionError} if the future completed exceptionally
     */
    async get(timeout: number=0, unit: TimeUnit=TimeUnit.MILLISECONDS): Promise<T> {
        if (timeout == 0 || this.isDone()) return this._completionPromise;
        
        let promiseResolve: (arg0: T) => void;
        let promiseReject: (arg0: CompletionError | TimeoutError) => void;
        let promise = new Promise<T>((resolve, reject)=>{
            promiseResolve = resolve;
            promiseReject = reject;
        });
        unit.timeout(timeout, ()=>{
            promiseReject(new TimeoutError(timeout, unit, "Future#get()"));
        });
        this._completionPromise.then(result=>{
            promiseResolve(result);
        }, error=>{
            promiseReject(new CompletionError(error));
        });
        
        return promise;
    }
    /**
     * Returns the result value (or throws any encountered exception) if completed, else returns the given `valueIfAbsent`.
     * @param valueIfAbsent the value to return if not completed
     * @returns the result value if completed, else the given `valueIfAbsent`
     * @throws {CompletionError} if this future completed exceptionally or a completion computation threw an error
     */
    getNow(valueIfAbsent: T=null): T {
        if (!this.isDone()) return valueIfAbsent;
        else if (this.isCompletedExceptionally()) throw new CompletionError("Timeout reached", this._error);
        else return this._result;
    }
    /**
     * Returns true if this Future was cancelled before it completed normally.
     * @returns `true` if this Future was cancelled before it completed normally
     */
    isCancelled(): boolean {
        return this._state == FutureState.CANCELLED;
    }
    /**
     * Returns true if this Future completed exceptionally, in any way. Possible causes
     * include cancellation, explicit invocation of {@link Future.completeExceptionally completeExceptionally()},
     * and abrupt termination of an action.
     * @returns `true` if this Future completed exceptionally
     */
    isCompletedExceptionally(): boolean {
        return this._state == FutureState.COMPLETED_EXCEPTIONALLY;
    }
    /**
     * Returns true if completed in any fashion: normally, exceptionally, or via cancellation.
     * @returns `true` if completed
     */
    isDone(): boolean {
        return (this._state & 2) > 0;
    }
    /**
     * Forcibly sets or resets the value subsequently returned by method `get()` and related methods, whether or not
     * already completed. This method is designed for use only in error recovery actions, and even such situations
     * may result in ongoing dependent completions using estabilished versus overwritten outcomes.
     * @param value the completion value
     */
    obtrudeValue(value: T) {
        this._result = value;
    }
    /**
     * Forcibly causes subsequent invocations of method `get()` and related methods to throw the given error, whether or not
     * already completed. This method is designed for use only in error recovery actions, and even such situations
     * may result in ongoing dependent completions using estabilished versus overwritten outcomes.
     * @param error the error
     */
    obtrudeException(error: Error) {
        this._error = error;
    }
    /**
     * Returns the estimated number of Futures whose completions are awaiting completion of this Future.
     * This method is designed for use in monitoring system state, not for synchronization control.
     * @returns the number of dependent Futures
     */
    getNumberOfDependents(): number {
        return this._childrenCount;
    }
    /**
     * Exceptionally completes this Future if not otherwise completed before the given timeout.
     * @param timeout how long to wait before completing exceptionally, in units of `unit`
     * @param unit a TimeUnit determining how to interpret the `timeout` parameter
     * @returns this Future
     */
    orTimeout(timeout: number, unit: TimeUnit=TimeUnit.MILLISECONDS): Future<T> {
        unit.timeout(timeout, ()=>{
            this.completeExceptionally(new TimeoutError(timeout, unit, this));
        });
        return this;
    }
    /**
     * Completes this Future with the given value if not otherwise completed before the given timeout.
     * @param value the value to use upon timeout
     * @param timeout how long to wait before completing normally with the given value, in units of `unit`
     * @param unit a TimeUnit determining how to interpret the `timeout` parameter
     * @returns this Future
     */
    completeOnTimeout(value: T, timeout: number, unit: TimeUnit=TimeUnit.MILLISECONDS): Future<T> {
        unit.timeout(timeout, ()=>{
            this.complete(value);
        });
        return this;
    }

    /**
     * Returns a new Future that, when this Future completes normally,
     * is executed with this Future's result as the argument to the
     * supplied function.
     * @param fn the function to use to compute the value of the returned Future
     * @template U the function's return type
     * @returns the new Future
     */
    thenApply<U>(fn: (result: T) => U): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            future.complete(fn(result));
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this Future completes normally,
     * is executed with this Future's result as the argument to the
     * supplied function.
     * @param fn the function to use to compute the value of the returned Future
     * @template U the function's return type
     * @returns the new Future
     */
    thenApplyAsync<U>(fn: (result: T) => Promise<U>): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                fn(result).then(result=>{
                    future.complete(result);
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this Future completes normally,
     * is executed with this Future's result as the argument to the
     * supplied action.
     * @param action the action to perform before completing the returned Future
     * @returns the new Future
     */
    thenAccept(action: (result: T) => void): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                action(result);
                future.complete();
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this Future completes normally,
     * is executed with this Future's result as the argument to the
     * supplied action.
     * @param action the action to perform before completing the returned Future
     * @returns the new Future
     */
    thenAcceptAsync(action: (result: T) => Promise<void>): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                action(result).then(()=>{
                    future.complete();
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this Future completes normally,
     * executes the given action.
     * @param action the action to perform before completing the returned Future
     * @returns the new Future
     */
    thenRun(action: () => void): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(()=>{
            try {
                action();
                future.complete();
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this Future completes normally,
     * executes the given action.
     * @param action the action to perform before completing the returned Future
     * @returns the new Future
     */
    thenRunAsync(action: () => Promise<void>): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(()=>{
            try {
                action().then(()=>{
                    future.complete();
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this and the other given Future both complete normally,
     * is executed with the two results as arguments to the supplied function.
     * @param other the other Future
     * @param fn the function to use to compute the value of the returned Future
     * @template U the type of the other CompletionStage's result
     * @template V the function's return type
     * @returns the new future
     */
    thenCombine<U,V>(other: Future<U>, fn: (first: T, second: U) => V): Future<V> {
        let future = new Future<V>();
        this._childrenCount++;
        let oneFinished = false;
        let firstResult: T;
        let secondResult: U;
        this._completionPromise.then(result=>{
            firstResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    future.complete(fn(firstResult, secondResult));
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            secondResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    future.complete(fn(firstResult, secondResult));
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this and the other given Future both complete normally,
     * is executed with the two results as arguments to the supplied function.
     * @param other the other Future
     * @param fn the function to use to compute the value of the returned Future
     * @template U the type of the other CompletionStage's result
     * @template V the function's return type
     * @returns the new future
     */
    thenCombineAsync<U,V>(other: Future<U>, fn: (first: T, second: U) => Promise<V>): Future<V> {
        let future = new Future<V>();
        this._childrenCount++;
        let oneFinished = false;
        let firstResult: T;
        let secondResult: U;
        this._completionPromise.then(result=>{
            firstResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    fn(firstResult, secondResult).then(result=>{
                        future.complete(result);
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            secondResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    fn(firstResult, secondResult).then(result=>{
                        future.complete(result);
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this and the other given Future both complete normally,
     * is executed with the two results as arguments to the supplied action.
     * @param other the other Future
     * @param fn the action to perform before completing the returned Future
     * @template U the type of the other CompletionStage's result
     * @returns the new future
     */
    thenAcceptBoth<U>(other: Future<U>, fn: (first: T, second: U) => void): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        let oneFinished = false;
        let firstResult: T;
        let secondResult: U;
        this._completionPromise.then(result=>{
            firstResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    fn(firstResult, secondResult);
                    future.complete();
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            secondResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    fn(firstResult, secondResult);
                    future.complete();
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this and the other given Future both complete normally,
     * is executed with the two results as arguments to the supplied action.
     * @param other the other Future
     * @param fn the action to perform before completing the returned Future
     * @template U the type of the other CompletionStage's result
     * @returns the new future
     */
    thenAcceptBothAsync<U>(other: Future<U>, fn: (first: T, second: U) => Promise<void>): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        let oneFinished = false;
        let firstResult: T;
        let secondResult: U;
        this._completionPromise.then(result=>{
            firstResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    fn(firstResult, secondResult).then(()=>{
                        future.complete();
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            secondResult = result;
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    fn(firstResult, secondResult).then(()=>{
                        future.complete();
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this and the other given Future both complete normally,
     * executes the given action.
     * @param other the other Future
     * @param action the action to perform before completing the returned Future
     * @returns the new future
     */
    runAfterBoth(other: Future<any>, action: () => void): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        let oneFinished = false;
        this._completionPromise.then(()=>{
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    action();
                    future.complete();
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then(()=>{
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    action();
                    future.complete();
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when this and the other given Future both complete normally,
     * executes the given action.
     * @param other the other Future
     * @param action the action to perform before completing the returned Future
     * @returns the new future
     */
    runAfterBothAsync(other: Future<any>, action: () => Promise<void>): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        let oneFinished = false;
        this._completionPromise.then(()=>{
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    action().then(()=>{
                        future.complete();
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then(()=>{
            if (!oneFinished) {
                oneFinished = true;
            } else {
                try {
                    action().then(()=>{
                        future.complete();
                    }, error=>{
                        future.completeExceptionally(error);
                    });
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when either this or the other given Future complete normally,
     * is executed with the corresponding result as argument to the supplied function.
     * @param other the other Future
     * @param fn the function to use to compute the value of the returned Future
     * @template U the function's return type
     * @returns the new future
     */
    applyToEither<U>(other: Future<T>, fn: (result: any) => U): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                future.complete(fn(result));
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            try {
                future.complete(fn(result));
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when either this or the other given Future complete normally,
     * is executed with the corresponding result as argument to the supplied function.
     * @param other the other Future
     * @param fn the function to use to compute the value of the returned Future
     * @template U the function's return type
     * @returns the new future
     */
    applyToEitherAsync<U>(other: Future<T>, fn: (result: any) => Promise<U>): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                fn(result).then(result=>{
                    future.complete(result);
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            try {
                fn(result).then(result=>{
                    future.complete(result);
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when either this or the other given Future complete normally,
     * is executed with the corresponding result as argument to the supplied action.
     * @param other the other Future
     * @param action the action to perform before completing the returned Future
     * @returns the new future
     */
    acceptEither(other: Future<T>, action: (result: any) => void): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                action(result);
                future.complete();
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            try {
                action(result);
                future.complete();
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when either this or the other given Future complete normally,
     * is executed with the corresponding result as argument to the supplied action.
     * @param other the other Future
     * @param action the action to perform before completing the returned Future
     * @returns the new future
     */
    acceptEitherAsync(other: Future<T>, action: (result: any) => Promise<void>): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                action(result).then(()=>{
                    future.complete();
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then((result: any)=>{
            try {
                action(result).then(()=>{
                    future.complete();
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when either this or the other given Future complete normally,
     * executes the given action.
     * @param other the other Future
     * @param action the action to perform before completing the returned Future
     * @returns the new future
     */
    runAfterEither(other: Future<T>, action: () => void): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(()=>{
            try {
                action();
                future.complete();
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then(()=>{
            try {
                action();
                future.complete();
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that, when either this or the other given Future complete normally,
     * executes the given action.
     * @param other the other Future
     * @param action the action to perform before completing the returned Future
     * @returns the new future
     */
    runAfterEitherAsync(other: Future<T>, action: () => Promise<void>): Future<void> {
        let future = new Future<void>();
        this._childrenCount++;
        this._completionPromise.then(()=>{
            try {
                action().then(()=>{
                    future.complete();
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        other._completionPromise.then(()=>{
            try {
                action().then(()=>{
                    future.complete();
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, (error: Error)=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that is completed with the same value as the future returned
     * by the given function.
     * 
     * When this future completes normally, the given function is invoked with this future's
     * result as the argument, returning another Future. When that future completes normally,
     * the future returned by this method is completed with the same value.
     * 
     * To ensure progress, the supplied function must arrange eventual completion of its result.
     * @param fn the function to use to compute another Future
     * @template U the type of the returned future's result
     * @returns the new Future
     */
    thenCompose<U>(fn: (result: T) => Future<U>): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            fn(result).handle((result, error)=>{
                if (error) {
                    future.completeExceptionally(error);
                } else {
                    future.complete(result);
                }
            });
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that is completed with the same value as the future returned
     * by the given function.
     * 
     * When this future completes normally, the given function is invoked with this future's
     * result as the argument, returning another Future. When that future completes normally,
     * the future returned by this method is completed with the same value.
     * 
     * To ensure progress, the supplied function must arrange eventual completion of its result.
     * @param fn the function to use to compute another Future
     * @template U the type of the returned future's result
     * @returns the new Future
     */
    thenComposeAsync<U>(fn: (result: T) => Promise<Future<U>>): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                fn(result).then(result=>{
                    result.handle((result, error)=>{
                        if (error) {
                            future.completeExceptionally(error);
                        } else {
                            future.complete(result);
                        }
                    });
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(new ExecutionError(error));
            }
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future with the same result or exception as this future, that executes
     * the given action when this future completes.
     * 
     * When this future is complete, the given action is invoked with the result (or `null`
     * if none) and the exception (or `null` if none) of this future as arguments. The returned
     * future is completed when the action returns.
     * 
     * Unlike the {@link Future.handle() `handle()`} method, this method is not designed to
     * translate completion outcomes, so the supplied action should not throw an exception.
     * However, if it does, the following rules apply:
     * - if this future completed normally but the supplied action throws an exception,
     *   then the returned future completes exceptionally with the supplied action's exception
     * - if this future completed exceptionally, and the supplied action throws an exception,
     *   then the returned future completes exceptionally with this future's exception
     * @param action the action to perform
     * @returns the new Future
     */
    whenComplete(action: (result: T | null, error: Error | null) => void): Future<T> {
        let future = new Future<T>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                action(result, null);
                future.complete(result);
            } catch (error) {
                future.completeExceptionally(error);
            }
        }, error=>{
            try {
                action(null, error);
            } catch (_error) {}
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future with the same result or exception as this future, that executes
     * the given action when this future completes.
     * 
     * When this future is complete, the given action is invoked with the result (or `null`
     * if none) and the exception (or `null` if none) of this future as arguments. The returned
     * future is completed when the action returns.
     * 
     * Unlike the {@link Future.handle() `handle()`} method, this method is not designed to
     * translate completion outcomes, so the supplied action should not throw an exception.
     * However, if it does, the following rules apply:
     * - if this future completed normally but the supplied action throws an exception,
     *   then the returned future completes exceptionally with the supplied action's exception
     * - if this future completed exceptionally, and the supplied action throws an exception,
     *   then the returned future completes exceptionally with this future's exception
     * @param action the action to perform
     * @returns the new Future
     */
    whenCompleteAsync(action: (result: T | null, error: Error | null) => Promise<void>): Future<T> {
        let future = new Future<T>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                action(result, null).then(()=>{
                    future.complete(result);
                }, error=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(error);
            }
        }, error=>{
            try {
                action(null, error).then(()=>{
                    future.completeExceptionally(error);
                },()=>{
                    future.completeExceptionally(error);
                });
            } catch (_error) {}
        });
        return future;
    }
    /**
     * Returns a new Future with the same result or exception as this future, that executes
     * one of the given actions when this future completes.
     * 
     * When this future is complete, one of the given actions is invoked with the result
     * or the exception of this future as arguments, respectively. The returned
     * future is completed when the called action returns.
     * 
     * Unlike the {@link Future.handle() `handle()`} method, this method is not designed to
     * translate completion outcomes, so the supplied actions should not throw exceptions.
     * However, if it does, the following rules apply:
     * - if this future completed normally but the supplied action throws an exception,
     *   then the returned future completes exceptionally with the supplied action's exception
     * - if this future completed exceptionally, and the supplied action throws an exception,
     *   then the returned future completes exceptionally with this future's exception
     * @param onResult the action to perform when the future completes successfully
     * @param onError the action to perform when the future completes exceptionally
     * @returns the new Future
     */
    whenCompleteBoth(onResult: (result: T) => void, onError: (error: Error) => void): Future<T> {
        let future = new Future<T>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                onResult(result);
                future.complete(result);
            } catch (error) {
                future.completeExceptionally(error);
            }
        }, error=>{
            try {
                onError(error);
            } catch (_error) {}
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future with the same result or exception as this future, that executes
     * one of the given actions when this future completes.
     * 
     * When this future is complete, one of the given actions is invoked with the result
     * or the exception of this future as arguments, respectively. The returned
     * future is completed when the called action returns.
     * 
     * Unlike the {@link Future.handle() `handle()`} method, this method is not designed to
     * translate completion outcomes, so the supplied actions should not throw exceptions.
     * However, if it does, the following rules apply:
     * - if this future completed normally but the supplied action throws an exception,
     *   then the returned future completes exceptionally with the supplied action's exception
     * - if this future completed exceptionally, and the supplied action throws an exception,
     *   then the returned future completes exceptionally with this future's exception
     * @param onResult the action to perform when the future completes successfully
     * @param onError the action to perform when the future completes exceptionally
     * @returns the new Future
     */
    whenCompleteBothAsync(onResult: (result: T) => Promise<void>, onError: (error: Error) => Promise<void>): Future<T> {
        let future = new Future<T>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                onResult(result).then(()=>{
                    future.complete(result);
                }, (error: Error)=>{
                    future.completeExceptionally(error);
                });
            } catch (error) {
                future.completeExceptionally(error);
            }
        }, error=>{
            try {
                onError(error).then(()=>{
                    future.completeExceptionally(error);
                },()=>{
                    future.completeExceptionally(error);
                });
            } catch (_error) {}
        });
        return future;
    }
    /**
     * Returns a new Future that, when this future completes either normally or exceptionally, is executed with this future's
     * result and exception as arguments to the supplied function.
     * 
     * When this future is complete, the given function is invoked with the result (or `null` if none) and the exception (or
     * `null` if none) of this future as arguments, and the function's result is used to complete the returned future.
     * @param fn the action to perform
     * @template U the function's return type
     * @returns the new Future
     */
    handle<U>(fn: (result: T | null, error: Error | null) => U): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                future.complete(fn(result, null));
            } catch (error) {
                future.completeExceptionally(error);
            }
        }, error=>{
            try {
                future.complete(fn(null, error));
            } catch (error) {
                future.completeExceptionally(error);
            }
        });
        return future;
    }
    /**
     * Returns a new Future that, when this future completes either normally or exceptionally, is executed with this future's
     * result and exception as arguments to the supplied function.
     * 
     * When this future is complete, the given function is invoked with the result (or `null` if none) and the exception (or
     * `null` if none) of this future as arguments, and the function's result is used to complete the returned future.
     * @param fn the action to perform
     * @template U the function's return type
     * @returns the new Future
     */
    handleAsync<U>(fn: (result: T | null, error: Error | null) => Promise<U>): Future<U> {
        let future = new Future<U>();
        this._childrenCount++;
        this._completionPromise.then(result=>{
            try {
                fn(result, null).then(result=>{
                    future.complete(result);
                }, error=>{
                    future.complete(error);
                });
            } catch (error) {
                future.completeExceptionally(error);
            }
        }, error=>{
            try {
                fn(null, error).then(result=>{
                    future.complete(result);
                }, error=>{
                    future.complete(error);
                });
            } catch (error) {
                future.completeExceptionally(error);
            }
        });
        return future;
    }
    /**
     * Returns a new Future that, when this future completes exceptionally, is executed
     * with this future's exception as the argument to the supplied function. Otherwise,
     * if this future completes normally, then the returned future also completes normally
     * with the same value.
     * @param fn the value, or the function whose value will be used to complete the returned Future if this Future completes exceptionally
     * @returns the new Future
     */
    exceptionally(fn: T | ((error: Error) => T)): Future<T> {
        let future = new Future<T>();
        this._completionPromise.then(result=>{
            future.complete(result);
        }, error=>{
            if (fn instanceof Function) {
                try {
                    future.complete(fn(error));
                } catch (error) {
                    future.completeExceptionally(new ExecutionError(error));
                }
            } else {
                future.complete(fn);
            }
        });
        return future;
    }
    /**
     * Returns a new Future that is already completed with the given value.
     * @param value the value
     * @template U the type of the value
     * @returns the completed Future
     */
    static completedFuture<U>(value: U): Future<U> {
        let future = new Future<U>();
        future.complete(value);
        return future;
    }
    /**
     * Returns a new Future that is already completed exceptionally with the given exception.
     * @param error the error
     * @template U the type of the value
     * @returns the exceptionally completed Future
     */
    static failedFuture<U>(error: Error): Future<U> {
        let future = new Future<U>();
        future.completeExceptionally(error);
        return future;
    }
    /**
     * Creates a Future from the specified Promise or async function.
     * @param promise the Promise or async function to use
     * @template U the type of the initial Promise
     * @returns the created Future
     */
    static asyncFuture<U>(promise: Promise<U> | (() => Promise<U>)): Future<U> {
        let future = new Future<U>();
        if (promise instanceof Function) promise = promise();
        promise.then(result=>{
            future.complete(result);
        }, error=>{
            future.completeExceptionally(error);
        });
        return future;
    }
    /**
     * Returns a new Future that is completed when all of the given Futures complete. If any of the given futures
     * complete exceptionally, then the returned Future also does so, with a CompletionError holding this error as
     * its cause. Otherwise, the results, if any, of the given Futures are not reflected in the returned Future, but
     * may be obtained by inspecting them individually. If no Futures are provided, this method returns a Future
     * completed with the value null.
     * @param  {...Future<*>} futures the futures
     * @returns a new Future that is completed when all of the given Futures complete
     */
    static allOf(...futures: Future<any>[]): Future<void> {
        if (futures.length == 0) return this.completedFuture(null);

        let future = new Future<void>();
        let count = 0;
        futures.forEach(f=>{
            f.handle((_result, error)=>{
                if (error) {
                    future.completeExceptionally(new CompletionError(undefined, error));
                } else {
                    if (++count == futures.length) {
                        future.complete(undefined);
                    }
                }
            });
        });
        return future;
    }
    /**
     * Returns a new Future that is completed when any of the given Futures complete, with the same result. Otherwise,
     * if it completed exceptionally, the returned Future also does so, with a CompletionError holding this exception
     * as its cause. If no futures are provided, this method returns an incomplete Future.
     * @param  {...Future<any>} futures the futures
     * @returns a new Future that is completed with the result or exception of any of the given futures when one completes
     */
    static anyOf(...futures: Future<any>[]): Future<any> {
        let future = new Future<any>();
        futures.forEach(f=>{
            f.handle((result,error)=>{
                if (error) future.completeExceptionally(error);
                else future.complete(result);
            });
        });
        return future;
    }
}
