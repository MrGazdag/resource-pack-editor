import TimeUnit from "../util/TimeUnit";

export default class TimeoutError extends Error {
    /**
     * The duration after the timeout was reached.
     * This is interpreted in the {@link TimeUnit}
     * represented by {@link TimeoutError.unit `unit`},
     * or `null` if unknown.
     */
    private _duration: number;
    /**
     * The unit in which {@link TimeoutError.duration `duration`}
     * is interpreted, or `null` if unknown.
     */
    private _unit: TimeUnit | null;
    /**
     * The timeout target.
     */
    private _timeunitTarget: any;
    /**
     * Creates a new TimeoutError.
     * @param duration the duration after the timeout was reached
     * @param unit the TimeUnit in which duration is interpreted
     * @param timeunitTarget the timeunit target
     */
    constructor(duration: number, unit: TimeUnit, timeunitTarget: any=undefined) {
        super((timeunitTarget ? "Timeout on " + timeunitTarget + " reached after " : "Timeout reached after ") + (unit == null ? "an unknown duration" : unit.stringify(duration)));
        this.name = "TimeoutError";
        this._duration = duration;
        this._unit = unit;
        this._timeunitTarget = timeunitTarget;
    }
    
    /**
     * The duration after the timeout was reached.
     * This is interpreted in the {@link TimeUnit}
     * represented by {@link TimeoutError.unit `unit`},
     * or `null` if unknown.
     */
    get duration() {
        return this._duration;
    }
    /**
     * The unit in which {@link TimeoutError.duration `duration`}
     * is interpreted, or `null` if unknown.
     */
    get unit() {
        return this._unit;
    }
    /**
     * The timeout target.
     */
    get timeunitTarget() {
        return this._timeunitTarget;
    }
}