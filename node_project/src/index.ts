import "./rpe/ResourcePackEditor";
import RPEEvent from "./rpe/event/RPEEvent";
import RPESaveEvent from "./rpe/event/RPESaveEvent";

window["RPEEvent"] = RPEEvent;
window["RPESaveEvent"] = RPESaveEvent;

let e = new RPEEvent();
console.log("generic:", e.getID());
e = new RPESaveEvent();
console.log("save:", e.getID());