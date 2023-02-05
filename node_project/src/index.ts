import "./rpe/ResourcePackEditor";
import RPEEvent from "./rpe/event/RPEEvent";
import RPESaveProjectEvent from "./rpe/event/events/RPESaveProjectEvent";

window["RPEEvent"] = RPEEvent;
window["RPESaveProjectEvent"] = RPESaveProjectEvent;

let e = new RPEEvent();
console.log("generic:", e.getID());
e = new RPESaveProjectEvent(null, null);
console.log("save:", e.getID());