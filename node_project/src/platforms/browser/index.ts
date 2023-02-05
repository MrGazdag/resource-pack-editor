import BrowserUtils from "./BrowserUtils";
import ResourcePackEditor from "../../rpe/ResourcePackEditor";
import RPEBrowserPlatform from "./RPEBrowserPlatform";

ResourcePackEditor.registerPlatform(new RPEBrowserPlatform());

//TODO temporary
window["BrowserConstants"] = BrowserUtils;