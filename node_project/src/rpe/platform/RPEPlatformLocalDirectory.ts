import Future from "../util/Future";
import RPEPlatformLocalDirectoryBinding from "./RPEPlatformLocalDirectoryBinding";
import RPEPlatformLocalEntry from "./RPEPlatformLocalEntry";

export default abstract class RPEPlatformLocalDirectory extends RPEPlatformLocalEntry {
    requestResolution(): Future<boolean> {
        throw new Error("Method not implemented.");
    }
    /**
     * The platform binding for this class.
     */
    static BINDING: RPEPlatformLocalDirectoryBinding = new RPEPlatformLocalDirectoryBinding();
    /**
     * Opens a directory picker to allow the user to
     * select a directory. By default this method does
     * not request any permissions, but depending on
     * the context, some might be given automatically.
     * 
     * By specifying an ID, the underlying implementation can
     * remember different directories for different IDs. If the
     * same ID is used for another picker, then the picker will
     * open in the same directory.
     * 
     * @param id the ID of this picker or `null`
     * @param startIn an entry to start in, or the name of a well known directory
     * @returns a new Future
     */
    static openDirectoryPicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        return RPEPlatformLocalDirectory.BINDING.openDirectoryPicker(id, startIn);
    }
    /**
     * Opens a directory picker to allow the user to
     * select a directory, and requests read permissions
     * to the selected directory.
     * 
     * By specifying an ID, the underlying implementation can
     * remember different directories for different IDs. If the
     * same ID is used for another picker, then the picker will
     * open in the same directory.
     * 
     * @param id the ID of this picker or `null`
     * @param startIn an entry to start in, or the name of a well known directory
     * @returns a new Future
     */
    static openDirectoryReadPicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        return RPEPlatformLocalDirectory.BINDING.openDirectoryReadPicker(id, startIn);
    }
    /**
     * Opens a directory picker to allow the user to
     * select a directory, and requests write permissions
     * to the selected directory.
     * 
     * By specifying an ID, the underlying implementation can
     * remember different directories for different IDs. If the
     * same ID is used for another picker, then the picker will
     * open in the same directory.
     * 
     * @param id the ID of this picker or `null`
     * @param startIn an entry to start in, or the name of a well known directory
     * @returns a new Future
     */
    static openDirectoryWritePicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        return RPEPlatformLocalDirectory.BINDING.openDirectoryWritePicker(id, startIn);
    }
    /**
     * Opens a directory picker to allow the user to
     * select a directory, and requests read and write
     * permissions to the selected directory.
     * 
     * By specifying an ID, the underlying implementation can
     * remember different directories for different IDs. If the
     * same ID is used for another picker, then the picker will
     * open in the same directory.
     * 
     * @param id the ID of this picker or `null`
     * @param startIn an entry to start in, or the name of a well known directory
     * @returns a new Future
     */
    static openDirectoryReadWritePicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        return RPEPlatformLocalDirectory.BINDING.openDirectoryReadWritePicker(id, startIn);
    }
    /**
     * Loads a directory from its serialized form.
     * @param serialized the serialized object
     * @returns a new Future
     */
    static loadSerialized(serialized: any): Future<RPEPlatformLocalDirectory> {
        return RPEPlatformLocalDirectory.BINDING.loadSerialized(serialized);
    }
    /**
     * Loads one or more directories from its serialized form(s).
     * @param serialized the serialized array
     * @returns a new Future
     */
    static loadSerializedMultiple(serialized: any[]): Future<RPEPlatformLocalDirectory[]> {
        return RPEPlatformLocalDirectory.BINDING.loadSerializedMultiple(serialized);
    }
    isDirectory(): boolean {
        return true;
    }
    asDirectory(): RPEPlatformLocalDirectory {
        return this;
    }
    /**
     * Loads the children of this directory.
     * @returns a new Future
     */
    abstract children(): Future<RPEPlatformLocalEntry[]>;
}