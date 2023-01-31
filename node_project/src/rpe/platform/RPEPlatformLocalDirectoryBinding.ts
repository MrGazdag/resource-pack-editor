import Future from "../util/Future";
import PlatformBinding from "./PlatformBinding";
import RPEPlatformLocalDirectory from "./RPEPlatformLocalDirectory";
import RPEPlatformLocalEntry from "./RPEPlatformLocalEntry";

export default class RPEPlatformLocalDirectoryBinding extends PlatformBinding {
    /**
     * Opens a directory picker to allow the user to
     * select a directory. By default this method does
     * not request any permissions, but depending on
     * the context, some might be given automatically.
     * 
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
    openDirectoryPicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        this.throw(this.openDirectoryPicker);
    }
    /**
     * Opens a directory picker to allow the user to
     * select a directory, and requests read permissions
     * to the selected directory.
     * 
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
    openDirectoryReadPicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        this.throw(this.openDirectoryReadPicker);
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
    openDirectoryWritePicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        this.throw(this.openDirectoryWritePicker);
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
    openDirectoryReadWritePicker(id: string | null=null, startIn: RPEPlatformLocalEntry|"dekstop"|"documents"|"downloads"|"music"|"pictures"|"videos"|undefined=undefined): Future<RPEPlatformLocalDirectory> {
        this.throw(this.openDirectoryReadWritePicker);
    }
    /**
     * Loads a directory from its serialized form.
     * @param serialized the serialized object
     * @returns a new Future
     */
    loadSerialized(serialized: any): Future<RPEPlatformLocalDirectory> {
        this.throw(this.loadSerialized);
    }
    /**
     * Loads one or more directories from its serialized form(s).
     * @param serialized the serialized array
     * @returns a new Future
     */
    loadSerializedMultiple(serialized: any[]): Future<RPEPlatformLocalDirectory[]> {
        this.throw(this.loadSerializedMultiple);
    }
}