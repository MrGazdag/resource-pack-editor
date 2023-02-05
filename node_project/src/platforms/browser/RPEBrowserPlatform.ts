import RPEPlatform from "../../rpe/platform/RPEPlatform";
import ResourcePackEditor from "../../rpe/ResourcePackEditor";
import RPESaveProjectEvent from "../../rpe/event/events/RPESaveProjectEvent";
import Future from "../../rpe/util/Future";
import RPEPlatformLocalFile from "../../rpe/platform/RPEPlatformLocalFile";
import RPEBrowserLocalFileBinding from "./RPEBrowserLocalFileBinding";

export default class RPEBrowserPlatform extends RPEPlatform {
    constructor() {
        super("browser", "Browser");
    }
    onload(): void {
        RPEPlatformLocalFile.BINDING = new RPEBrowserLocalFileBinding();
        ResourcePackEditor.eventNode.registerAsync(RPESaveProjectEvent, (e)=>{
            return Future.asyncFuture(async ()=>{

            });
        });
    }

}