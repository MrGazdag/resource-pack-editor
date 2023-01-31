import CancellationError from "../error/CancellationError";
import FailedRequestError from "../error/FailedRequestError";
import IllegalStateError from "../error/IllegalStateError";
import Future from "../util/Future";
import PlatformBinding from "./PlatformBinding";
import RPEPlatformLocalFile from "./RPEPlatformLocalFile";
import RPEPlatformLocalDirectory from "./RPEPlatformLocalDirectory";
import RPEditorProject from "../editor/RPEditorProject";

/**
 * Represents a file or directory in the local file system.
 */
export default abstract class RPEPlatformLocalEntry extends PlatformBinding {
    /**
     * Returns whether this {@link RPEPlatformLocalEntry}
     * instance represents a directory.
     * @returns `true` if this is a directory, `false` otherwise
     * @see {@link RPEPlatformLocalEntry.asDirectory()}
     */
    isDirectory(): boolean {
        return false;
    }
    /**
     * Returns this entry as a {@link RPEPlatformLocalDirectory},
     * if this entry represents a directory. Otherwise,
     * this method throws an {@link IllegalStateError}.
     * @returns this entry as a directory
     * @throws {IllegalStateError} if this entry does not represent a directory
     * @see {@link RPEPlatformLocalEntry.isDirectory()}
     */
    asDirectory(): RPEPlatformLocalDirectory {
        throw new IllegalStateError("this entry is not a directory!");
    }
    /**
     * Returns whether this {@link RPEPlatformLocalEntry}
     * instance represents a file.
     * @returns `true` if this is a file, `false` otherwise
     * @see {@link RPEPlatformLocalEntry.asFile()}
     */
    isFile(): boolean {
        return false;
    }
    /**
     * Returns this entry as a {@link RPEPlatformLocalFile},
     * if this entry represents a file. Otherwise,
     * this method throws an {@link IllegalStateError}.
     * @returns this entry as a file
     * @throws {IllegalStateError} if this entry does not represent a file
     * @see {@link RPEPlatformLocalEntry.isFile()}
     */
    asFile(): RPEPlatformLocalFile {
        throw new IllegalStateError("this entry is not a file!");
    }
    /**
     * Returns whether it is possible to read from this entry
     * currently. To request permission to read from this entry, use
     * {@link RPEPlatformLocalEntry.requestReadPermission()}.
     * @returns `true` if it is possible to read from this entry currently, `false` otherwise
     */
    abstract canRead(): boolean;
    /**
     * Returns whether it is possible to write to this entry
     * currently. To request permission to write to this entry, use
     * {@link RPEPlatformLocalEntry.requestWritePermission()}.
     * @returns `true` if it is possible to write to this entry currently, `false` otherwise
     */
    abstract canWrite(): boolean;
    /**
     * Requests permission to read from this entry. This will
     * return a Future, which will either:
     *  - complete successfully with `true`, which means that the
     *    read permission has successfully been given by the user
     *  - complete successfully with `false`, which means that the
     *    read permission was explicitly denied by the user
     *  - complete exceptionally with a {@link FailedRequestError},
     *    if any errors occur while requesting
     *  - complete exceptionally with a {@link CancellationError},
     *    if the user cancels the request (for example: closing
     *    the window)
     * 
     * If the cause of error does not matter, then you can use the
     * following snippet to make sure the Future always completes
     * successfully:
     * ```
     *  let entry: RPEPlatformLocalEntry = ...;
     *  entry.requestReadPermission()
     *       .exceptionally(false)
     *       .thenAccept(result => {
     *           // Use result
     *           ...
     *       });
     * ```
     * 
     * If the permission to read is already present, then this
     * method will return a Future that is already completed with `true`.
     * 
     * @returns a new Future
     */
    abstract requestReadPermission(): Future<boolean>;
    /**
     * Requests permission to write to this entry. This will
     * return a Future, which will either:
     *  - complete successfully with `true`, which means that the
     *    write permission has successfully been given by the user
     *  - complete successfully with `false`, which means that the
     *    write permission was explicitly denied by the user
     *  - complete exceptionally with a {@link FailedRequestError},
     *    if any errors occur while requesting
     *  - complete exceptionally with a {@link CancellationError},
     *    if the user cancels the request (for example: closing
     *    the window)
     * 
     * If the cause of error does not matter, then you can use the
     * following snippet to make sure the Future always completes
     * successfully:
     * ```
     *  let entry: RPEPlatformLocalEntry = ...;
     *  entry.requestWritePermission()
     *       .exceptionally(false)
     *       .thenAccept(result => {
     *           // Use result
     *           ...
     *       });
     * ```
     * 
     * If the permission to write is already present, then this
     * method will return a Future that is already completed with `true`.
     * 
     * @returns a new Future
     */
    abstract requestWritePermission(): Future<boolean>;
    /**
     * Returns the name of this entry.
     * If the entry could not be located,
     * then this method returns `null`.
     * @returns the name of the entry, or `null` if the name is unknown
     */
    abstract name(): string | null;
    /**
     * Tries to delete this entry. The future will
     * complete with `true` if the file was successfully
     * deleted. Note that further attempts to read from/write
     * to this file instance will be unsuccessful.
     * @returns a new Future
     */
    abstract delete(): Future<boolean>;
    /**
     * Returns the last known name of this entry.
     * If the entry exists, and is located, this
     * method returns the current name of the entry.
     * @returns the last known name of the entry
     */
    abstract lastKnownName(): string;
    /**
     * Returns `true` if this file could not be resolved,
     * and manual correction is needed.
     * @returns `true` if this file is missing, `false` otherwise
     */
    abstract isMissing(): boolean;
    /**
     * Tries to resolve this entry automatically. This is only
     * necessary if the file could not be resolved.
     * 
     * This method will return a Future, which will either:
     *  - complete successfully, which means that the entry
     *    was successfully resolved automatically
     *  - complete exceptionally, if the entry could not be
     *    resolved automatically
     * 
     * If this file is already resolved (which can be checked
     * using {@link RPEPlatformLocalEntry.isMissing()})
     * @returns a new Future
     */
    abstract tryResolve(): Future<void>;
    /**
     * Requests the user to resolve this entry. This is only
     * necessary if the entry could not be resolved.
     * Note that this will involve user interaction.
     * 
     * This method will return a Future, which will either:
     *  - complete successfully with `true`, which means that the
     *    entry was successfully resolved
     *  - complete successfully with `false`, which means that the
     *    entry resolution request was explicitly denied by the user
     *  - complete exceptionally with a {@link FailedRequestError},
     *    if any errors occur while requesting
     *  - complete exceptionally with a {@link CancellationError},
     *    if the user cancels the request (for example: closing
     *    the window)
     * 
     * @returns a new Future
     */
    abstract requestResolution(): Future<boolean>;

    /**
     * Tries to serialize the entry. This should be
     * possible even if the entry cannot be resolved.
     * @param project the current project
     * @returns a new Future, that will complete with the serialized data
     */
    abstract serialize(project: RPEditorProject): Future<any>;
}