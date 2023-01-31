export default class RPEEvent {
    static readonly EVENT_ID: string = null;
    getID() {
        return this.constructor["EVENT_ID"];
    }
}