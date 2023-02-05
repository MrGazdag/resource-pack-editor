import RPEEventState from "./RPEEventState";

export default class RPEEvent {
    static readonly EVENT_ID: string = null;
    private state: RPEEventState = null;
    static setState(event: RPEEvent, state: RPEEventState) {
        event.state = state;
    }
    getState() {
        return this.state;
    }
    getID() {
        return this.constructor["EVENT_ID"];
    }
}