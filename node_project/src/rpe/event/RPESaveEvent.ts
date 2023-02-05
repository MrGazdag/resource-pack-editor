import RPEEvent from "./RPEEvent";

export default class RPESaveEvent extends RPEEvent {
    static readonly EVENT_ID: string = "rpe:save";
    constructor() {
        super();
    }
    getSave(): string {
        return "lofasz";
    }
}