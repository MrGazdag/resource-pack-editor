export default class PlatformBindingError extends Error {
    /**
     * Creates a new PlatformBindingError.
     * @param platform the platform, or `undefined` for the default implementation
     * @param className the class name
     * @param methodName the method that was used
     */
    constructor(platform: string | undefined, className: string, methodName: string) {
        super(PlatformBindingError._message(platform, className, methodName));
        this.name = "PlatformBindingError";
    }
    /**
     * Returns the correct error message
     * @param platform the platform, or `undefined` for the default implementation
     * @param className the class name
     * @param methodName the method that was used
     * @returns the error message
     */
    private static _message(platform: string | undefined, className: string, methodName: string): string {
        if (platform) return "Platform bindings on platform \"" + platform + "\" for class \"" + className + "\" does not implement the method \"" + methodName + "()\"!"
        else return "Missing platform bindings for class \"" + className + "\"!";
    }
}