/**
 * A class for extended Error functionality,
 * including nested errors.
 */
export default class JError extends Error {
    /**
     * The message of this error, if any.
     */
    readonly message: string | undefined;
    /**
     * The cause of this error, if any.
     */
    readonly cause: Error | undefined;
    /**
     * Creates a new UnsupportedOperationError.
     * @param message the operation that was unsupported
     * @param cause an optional error that caused this UnsupportedOperationError
     */
    constructor(message: string=undefined, cause: Error=undefined) {
        super(message);
        this.message = message;
        this.cause = cause;
        this.name = this.constructor["name"];
        if (cause) this.stack += "\nCaused by: " + cause.stack;
    }
}