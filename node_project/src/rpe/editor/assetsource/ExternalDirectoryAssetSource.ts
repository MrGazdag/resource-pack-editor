import RPEPlatformLocalDirectory from "../../platform/RPEPlatformLocalDirectory";
import Future from "../../util/Future";
import RPEAssetSource from "../RPEAssetSource";

export default class ExternalDirectoryAssetSource extends RPEAssetSource {
    private _directoryHandle: RPEPlatformLocalDirectory;
    /**
     * Creates a DirectoryAssetSource from a directory handle.
     * @param mountPath the mounting path of this asset source
     * @param directoryHandle the directory handle
     */
    constructor(mountPath: string, directoryHandle: RPEPlatformLocalDirectory) {
        super(true, mountPath);
        this._directoryHandle = directoryHandle;
    }
    _loadAssetSourceImpl(): Future<void> {
        throw new Error("faszom nincs még meg");
    }
}