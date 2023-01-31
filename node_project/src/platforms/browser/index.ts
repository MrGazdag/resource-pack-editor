import RPEPlatformLocalFile from "../../rpe/platform/RPEPlatformLocalFile";
import BrowserUtils from "./BrowserUtils";
import RPEBrowserLocalFileBinding from "./RPEBrowserLocalFileBinding";

RPEPlatformLocalFile.BINDING = new RPEBrowserLocalFileBinding();

window["BrowserConstants"] = BrowserUtils;