import PlatformBindingError from "./PlatformBindingError";

export default class PlatformBinding {
    /**
     * The platform identifier.
     */
    private _platform: string | undefined;
    /**
     * Creates a new platform binding.
     * @param platform the platform string, or `undefined` for the default platform binding
     */
    constructor(platform: string | undefined=undefined) {
        this._platform = platform;
    }
    /**
     * Returns the platform implementation's name, or
     * `undefined` if this is the default implementation.
     */
    get platform() {
        return this._platform;
    }
    /**
     * Throws a PlatformBindingError, stating that either
     * the implementation of the passed method, or
     * the platform binding is missing for this class.
     * @param method the method
     * @returns
     */
    throw(method: Function): never {
        throw new PlatformBindingError(this._platform, this.constructor["name"], method.name);
    }
}