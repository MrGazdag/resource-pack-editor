import Future from "../util/Future";
import RPEPlatformLocalEntry from "./RPEPlatformLocalEntry";
import RPEPlatformLocalFileBinding from "./RPEPlatformLocalFileBinding";

export default abstract class RPEPlatformLocalFile extends RPEPlatformLocalEntry {
    /**
     * The platform binding for this class.
     */
    static BINDING: RPEPlatformLocalFileBinding = new RPEPlatformLocalFileBinding();
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
    static saveFilePicker(suggestedFileName: string | undefined=undefined, fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        return RPEPlatformLocalFile.BINDING.saveFilePicker(suggestedFileName, fileTypes, excludeAllTypesOption);
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
    static openFilePicker(fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        return RPEPlatformLocalFile.BINDING.openFilePicker(fileTypes, excludeAllTypesOption);
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
    static openFilePickerMultiple(fileTypes: { description: string; accept: { [mimeType: string]: string[]; }; }[]=[], excludeAllTypesOption: boolean=false): Future<RPEPlatformLocalFile[]> {
        return RPEPlatformLocalFile.BINDING.openFilePickerMultiple(fileTypes, excludeAllTypesOption);
    }
    /**
     * Loads a file from its serialized form.
     * @param serialized the serialized object
     * @returns a new Future
     */
    static loadSerialized(serialized: any): Future<RPEPlatformLocalFile> {
        return RPEPlatformLocalFile.BINDING.loadSerialized(serialized);
    }
    /**
     * Loads one or more files from its serialized form(s).
     * @param serialized the serialized array
     * @returns a new Future
     */
    static loadSerializedMultiple(serialized: any[]): Future<RPEPlatformLocalFile[]> {
        return RPEPlatformLocalFile.BINDING.loadSerializedMultiple(serialized);
    }
    isFile(): boolean {
        return true;
    }
    asFile(): RPEPlatformLocalFile {
        return this;
    }
    /**
     * Tries to load the file for reading in binary form.
     * @returns a new Future
     */
    abstract arrayBuffer(): Future<ArrayBuffer>;
    /**
     * Tries to load the file for reading in textual form.
     * @returns a new Future
     */
    abstract text(): Future<string>;
    /**
     * Returns the size of the file in bytes.
     * @returns a new Future
     */
    abstract size(): Future<number>;
    /**
     * Returns the last modification date of this file,
     * in milliseconds from the UNIX epoch
     * @returns a new Future
     */
    abstract lastModified(): Future<number>;
}