import Future from "../../util/Future";
import RPEAssetSource from "../RPEAssetSource";
import ExternalDirectoryAssetSource from "./ExternalDirectoryAssetSource";

export default class ExternalFileAssetSource extends RPEAssetSource {
    /**
     * The file to use.
     */
    private _fileHandle: FileSystemFileHandle;
    /**
     * Creates a FileAssetSource from a file handle.
     * @param mountPath the mounting path of this asset source
     * @param fileHandle the file handle
     */
    constructor(mountPath: string, fileHandle: FileSystemFileHandle) {
        super(false, mountPath);
        this._fileHandle = fileHandle;
    }

    _loadAssetSourceImpl(): Future<void> {
        throw new Error();
    }
}
let e: ExternalDirectoryAssetSource;