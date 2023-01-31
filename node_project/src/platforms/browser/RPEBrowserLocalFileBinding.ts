import RPEPlatformLocalFile from "../../rpe/platform/RPEPlatformLocalFile";
import RPEPlatformLocalFileBinding from "../../rpe/platform/RPEPlatformLocalFileBinding";
import Future from "../../rpe/util/Future";
import BrowserUtils from "./BrowserUtils";
import RPEBrowserLocalFile from "./RPEBrowserLocalFile";

export default class RPEBrowserLocalFileBinding extends RPEPlatformLocalFileBinding {
    constructor() {
        super(BrowserUtils.BINDING_KEY);
    }
    /**
     * Shows a file picker to allow the user to select
     * a single file to save to.
     * 
     * The `fileTypes` array can be set to indicate what
     * type of file the user can save. The `description`
     * field contains a short description of the file type,
     * and the `accept` property contains an object, where
     * the keys are set to the possible MIME types, and the
     * values are arrays containing allowed file extensions.
     * 
     * An example of this is the following:
     * ```
     * saveFilePicker([
     *  {
     *      description: "PNG Image"
     *      accept: {
     *          "image/png": [".png"]
     *      }
     *  },
     *  {
     *      description: "JPG Image"
     *      accept: {
     *          "image/jpg": [".jpg", ".jpeg"]
     *      }
     *  }
     * ])
     * ```
     * 
     * @param {string|undefined} suggestedFileName the suggested file name
     * @param {{description: string, accept: {[mimeType: string]: string[]}}[]} fileTypes the possible file types
     * @param {boolean} excludeAllTypesOption `true` to disable the `All Types (*.*)` option, defaults to `false`
     * @returns {Future<RPEPlatformLocalFile[]>} a new Future
     */
    saveFilePicker(suggestedFileName: string | undefined=undefined, fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        let options: SaveFilePickerOptions = {};
        if (suggestedFileName) options.suggestedName = suggestedFileName;
        if (fileTypes && fileTypes.length > 0) {
            options.types = fileTypes;
        }
        if (excludeAllTypesOption) options.excludeAcceptAllOption = excludeAllTypesOption;
        return Future.asyncFuture(/** @type {Promise<FileSystemFileHandle>} */(showSaveFilePicker(options))).thenApply(handle=>{
            return [new RPEBrowserLocalFile(handle)];
        });
    }
    /**
     * Opens a file picker to allow the user to select
     * a single file. For multiple files, use
     * {@link RPEPlatformBindingLocalFile.openFilePickerMultiple()}.
     * 
     * The `fileTypes` array can be set to indicate what
     * type of file the user can select. The `description`
     * field contains a short description of the file type,
     * and the `accept` property contains an object, where
     * the keys are set to the accepted MIME type, and the
     * values are arrays containing allowed file extensions.
     * 
     * An example of this is the following:
     * ```
     * openFilePicker([{
     *     description: "Images"
     *     accept: {
     *         "image/*": [".png", ".gif", ".jpg", ".jpeg"]
     *     }
     * }])
     * ```
     * 
     * @param {{description: string, accept: {[mimeType: string]: string[]}}[]} fileTypes the allowed file types
     * @param {boolean} excludeAllTypesOption `true` to disable the `All Types (*.*)` option, defaults to `false`
     * @returns {Future<RPEPlatformLocalFile[]>} a new Future
     */
    openFilePicker(fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        let options: OpenFilePickerOptions = {};
        if (fileTypes && fileTypes.length > 0) {
            options.types = fileTypes;
        }
        if (excludeAllTypesOption) options.excludeAcceptAllOption = excludeAllTypesOption;
        return Future.asyncFuture(/** @type {Promise<FileSystemFileHandle[]>} */(showOpenFilePicker(options))).thenApply(handles=>{
            return handles.map(handle=>new RPEBrowserLocalFile(handle));
        });
    }
    /**
     * Opens a file picker to allow the user to select
     * one or more file(s). For single files only, use
     * {@link RPEPlatformBindingLocalFile.openFilePicker()}.
     * 
     * The `fileTypes` array can be set to indicate what
     * type of files the user can select. The `description`
     * field contains a short description of the file type,
     * and the `accept` property contains an object, where
     * the keys are set to the accepted MIME type, and the
     * values are arrays containing allowed file extensions.
     * 
     * An example of this is the following:
     * ```
     * openFilePickerMultiple([{
     *     description: "Images"
     *     accept: {
     *         "image/*": [".png", ".gif", ".jpg", ".jpeg"]
     *     }
     * }])
     * ```
     * 
     * @param {{description: string, accept: {[mimeType: string]: string[]}}[]} fileTypes the allowed file types
     * @param {boolean} excludeAllTypesOption `true` to disable the `All Types (*.*)` option, defaults to `false`
     * @returns {Future<RPEPlatformLocalFile[]>} a new Future
     */
    openFilePickerMultiple(fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        let options: OpenFilePickerOptions = {
            multiple: true
        };
        if (fileTypes && fileTypes.length > 0) {
            options.types = fileTypes;
        }
        if (excludeAllTypesOption) options.excludeAcceptAllOption = excludeAllTypesOption;
        return Future.asyncFuture(/** @type {Promise<FileSystemFileHandle[]>} */(showOpenFilePicker(options))).thenApply(handles=>{
            return handles.map(handle=>new RPEBrowserLocalFile(handle));
        });
    }
    /**
     * Loads a file from its serialized form.
     * @param {*} serialized the serialized object
     * @returns {Future<RPEPlatformLocalFile>} a new Future
     */
    loadSerialized(serialized: any): Future<RPEPlatformLocalFile> {
        this.throw(this.loadSerialized);
    }
    /**
     * Loads one or more files from its serialized form(s).
     * @param {*[]} serialized the serialized array
     * @returns {Future<RPEPlatformLocalFile[]>} a new Future
     */
    loadSerializedMultiple(serialized: any[]): Future<RPEPlatformLocalFile[]> {
        this.throw(this.loadSerializedMultiple);
    }
};