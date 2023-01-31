import Future from "../util/Future";
import PlatformBinding from "./PlatformBinding";
import RPEPlatformLocalFile from "./RPEPlatformLocalFile";

export default class RPEPlatformLocalFileBinding extends PlatformBinding {
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
     * @param suggestedFileName the suggested file name
     * @param fileTypes the possible file types
     * @param excludeAllTypesOption `true` to disable the `All Types (*.*)` option, defaults to `false`
     * @returns a new Future
     */
    saveFilePicker(suggestedFileName: string | undefined=undefined, fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        this.throw(this.saveFilePicker);
    }
    /**
     * Opens a file picker to allow the user to select
     * a single file. For multiple files, use
     * {@link RPEPlatformLocalFileBinding.openFilePickerMultiple()}.
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
     * @param fileTypes the allowed file types
     * @param excludeAllTypesOption `true` to disable the `All Types (*.*)` option, defaults to `false`
     * @returns a new Future
     */
    openFilePicker(fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        this.throw(this.openFilePicker);
    }
    /**
     * Opens a file picker to allow the user to select
     * one or more file(s). For single files only, use
     * {@link RPEPlatformLocalFileBinding.openFilePicker()}.
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
     * @param fileTypes the allowed file types
     * @param excludeAllTypesOption `true` to disable the `All Types (*.*)` option, defaults to `false`
     * @returns a new Future
     */
    openFilePickerMultiple(fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        this.throw(this.openFilePickerMultiple);
    }
    /**
     * Loads a file from its serialized form.
     * @param serialized the serialized object
     * @returns a new Future
     */
    loadSerialized(serialized: any): Future<RPEPlatformLocalFile> {
        this.throw(this.loadSerialized);
    }
    /**
     * Loads one or more files from its serialized form(s).
     * @param serialized the serialized array
     * @returns a new Future
     */
    loadSerializedMultiple(serialized: any[]): Future<RPEPlatformLocalFile[]> {
        this.throw(this.loadSerializedMultiple);
    }
}