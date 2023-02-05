import Future from "./Future";

export default class TimeUnit {
    /**
     * Time unit representing twenty-four {@link TimeUnit.HOURS hours}.
     */
    static DAYS = new TimeUnit("DAYS", "day", "days", 24*60*60*1000);
    /**
     * Time unit representing sixty {@link TimeUnit.MINUTES minutes}.
     */
    static HOURS = new TimeUnit("HOURS", "hour", "hours", 60*60*1000);
    /**
     * Time unit representing sixty {@link TimeUnit.SECONDS seconds}.
     */
    static MINUTES = new TimeUnit("MINUTES", "minute", "minutes", 60*1000);
    /**
     * Time unit representing one second, or a thousand {@link TimeUnit.MILLISECONDS milliseconds}.
     */
    static SECONDS = new TimeUnit("SECONDS", "second", "seconds", 1000);
    /**
     * Time unit representing one thousandth (0.001) of a {@link TimeUnit.SECONDS second}.
     */
    static MILLISECONDS = new TimeUnit("MILLISECONDS", "millisecond", "milliseconds", 1);
    /**
     * Time unit representing one thousandth (0.001) of a {@link TimeUnit.MILLISECONDS millisecond}.
     */
    static MICROSECONDS = new TimeUnit("MICROSECONDS", "microsecond", "microseconds", 0.001);
    /**
     * Time unit representing one thousandth (0.001) of a {@link TimeUnit.MICROSECONDS microsecond}.
     */
    static NANOSECONDS = new TimeUnit("NANOSECONDS", "nanosecond", "nanoseconds", 0.000001);

    /**
     * The name of this time unit.
     */
    private _name: string;
    /**
     * The singular name of this time unit in english.
     */
    private _singular: string;
    /**
     * The plural name of this time unit in english.
     */
    private _plural: string;
    /**
     * The amount of time this time unit represents in milliseconds.
     */
    private _timeInMillis: number;
    private constructor(name: string, singular: string, plural: string, timeInMillis: number) {
        this._name = name;
        this._singular = singular;
        this._plural = plural;
        this._timeInMillis = timeInMillis;
    }
    /**
     * Converts the specified duration from the specified TimeUnit into this one.
     * Example usage:
     * ```
     * //  24 hours          <--          1 days
     * //TimeUnit.HOURS      <--       TimeUnit.DAYS
     *   TimeUnit.HOURS.convertFrom(1, TimeUnit.DAYS); // 24
     * ```
     * @param sourceDuration the source duration to convert
     * @param sourceUnit the unit in which the sourceDuration is given
     * @see {@link TimeUnit.convertTo}
     * @returns the resulting duration
     */
    convertFrom(sourceDuration: number, sourceUnit: TimeUnit): number {
        return sourceDuration * sourceUnit._timeInMillis / this._timeInMillis;
    }
    /**
     * Converts the specified duration from this TimeUnit into the specified one.
     * Example usage:
     * ```
     * //   1 days          -->        24 hours
     * //TimeUnit.DAYS      -->     TimeUnit.HOURS
     *   TimeUnit.DAYS.convertTo(1, TimeUnit.HOURS); // 24
     * ```
     * @param sourceDuration the source duration to convert
     * @param targetUnit the target TimeUnit to convert to
     * @returns the resulting duration
     */
    convertTo(sourceDuration: number, targetUnit: TimeUnit): number {
        return sourceDuration * this._timeInMillis / targetUnit._timeInMillis;
    }
    /**
     * Returns a Future, which will complete after
     * the specified amount of time in this TimeUnit
     * has passed.
     * @param timeout the duration in this TimeUnit to time out
     * @returns a new Future
     */
    sleep(timeout: number): Future<void> {
        let f = new Future<void>();
        setTimeout(()=>{
            f.complete(null);
        }, timeout * this._timeInMillis);
        return f;
    }
    /**
     * Performs a timed `setTimeout` using this time unit.
     * Given the variable `result`, the following statements are equivalent:
     * ```
     * result = TimeUnit.SECONDS.timeout(0.5, ()=>{
     *     console.log("done");
     * });
     *
     * result = TimeUnit.MILLISECONDS.timeout(500, ()=>{
     *     console.log("done")
     * }));
     *
     * result = setTimeout(()=>{
     *     console.log("done");
     * }, 500);
     * ```
     * @param timeout the duration in this TimeUnit to time out
     * @param callback the function to run
     * @param params any additional arguments to supply to the function
     * @returns the created timeout id
     */
    timeout(timeout: number, callback: Function, ...params: any[]): number {
        return setTimeout(callback, timeout * this._timeInMillis, ...params);
    }
    /**
     * Performs a timed `setInterval` using this time unit.
     * Given the variable `result`, the following statements are equivalent:
     * ```
     * result = TimeUnit.SECONDS.interval(0.5, ()=>{
     *     console.log("done");
     * });
     * 
     * result = TimeUnit.MILLISECONDS.interval(500, ()=>{
     *     console.log("done")
     * }));
     * 
     * result = setInterval(()=>{
     *     console.log("done");
     * }, 500);
     * ```
     * @param interval the interval in this TimeUnit to repeat at
     * @param callback the function to run periodically
     * @param params any additional arguments to supply to the function
     * @returns the created interval id
     */
    interval(interval: number, callback: Function, ...params: any[]): number {
        return setInterval(callback, interval * this._timeInMillis, ...params);
    }

    /**
     * Converts the specified duration into days.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.DAYS)}.
     * @param duration the duration to convert
     */
    toDays(duration: number) {
        return this.convertTo(duration, TimeUnit.DAYS);
    }
    /**
     * Converts the specified duration into hours.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.HOURS)}.
     * @param duration the duration to convert
     */
    toHours(duration: number) {
        return this.convertTo(duration, TimeUnit.HOURS);
    }
    /**
     * Converts the specified duration into minutes.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.MINUTES)}.
     * @param duration the duration to convert
     */
    toMinutes(duration: number) {
        return this.convertTo(duration, TimeUnit.MINUTES);
    }
    /**
     * Converts the specified duration into seconds.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.SECONDS)}.
     * @param duration the duration to convert
     */
    toSeconds(duration: number) {
        return this.convertTo(duration, TimeUnit.SECONDS);
    }
    /**
     * Converts the specified duration into milliseconds.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.MILLISECONDS)}.
     * @param duration the duration to convert
     */
    toMillis(duration: number) {
        return duration * this._timeInMillis;
    }
    /**
     * Converts the specified duration into microseconds.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.MICROSECONDS)}.
     * @param duration the duration to convert
     */
    toMicros(duration: number) {
        return this.convertTo(duration, TimeUnit.MICROSECONDS);
    }
    /**
     * Converts the specified duration into nanoseconds.
     * Equivalent to {@link TimeUnit.convertTo convertTo(duration, TimeUnit.NANOSECONDS)}.
     * @param duration the duration to convert
     */
    toNanos(duration: number) {
        return this.convertTo(duration, TimeUnit.NANOSECONDS);
    }

    name() {
        return this._name;
    }
    toString() {
        return this._name;
    }
    /**
     * Appends the time unit to the specified duration.
     * @param duration the duration
     * @returns the resulting string
     */
    stringify(duration: number | undefined): string {
        return (duration ? duration + " " : "unknown ") + (duration == 1 ? this._singular : this._plural);
    }
}