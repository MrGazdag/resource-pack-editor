import Future from "../util/Future";
import RPEAssetSourceState from "./RPEAssetSourceState";
export default abstract class RPEAssetSource {
    /**
     * True if this asset source is a directory (contains possibly multiple entries),
     * or false if this asset source is just a single file.
     */
    isDirectory: boolean;
    /**
     * The path at which this asset source is mounted.
     * If this is a directory, then all files in this asset
     * source will be put in this specified directory.
     * Otherwise, this file will be put at this specified path.
     */
    mountPath: string;
    /**
     * The current state of this asset source. See {@link RPEAssetSourceState}
     */
    state: RPEAssetSourceState;
    /**
     * A future, containing the last load attempt. This might be null though
     */
    loadPromise: Future<RPEAssetSource>;
    loadError: any;
    /**
     * `true` if this file can only be read, `false` if this file can be saved to as well.
     */
    isReadOnly: boolean;
    /**
     * Creates a new RPEAssetSource.
     * @param isDirectory true if this asset source is a directory, false otherwise
     * @param mountPath the initial mount path
     */
    constructor(isDirectory: boolean, mountPath: string) {
        this.isDirectory = isDirectory;
        this.mountPath = mountPath;
        this.isReadOnly = true;
    }

    getState(): RPEAssetSourceState {
        return this.state;
    }

    /**
     * Tries to load the asset source.
     * If the asset source is already loaded, then this method will return a completed future.
     * @returns a promise, which is completed by the same RPEAssetSource instance
     */
    loadAssetSource(): Future<RPEAssetSource> {
        if (this.state == RPEAssetSourceState.LOADED || this.state == RPEAssetSourceState.CURRENTLY_LOADING) return this.loadPromise;
        this.state = RPEAssetSourceState.CURRENTLY_LOADING;
        this.loadPromise = this._loadAssetSourceImpl().then(_=>this);
        this.loadPromise.then(_=>{
            this.state = RPEAssetSourceState.LOADED;
        }).catch(error=>{
            this.loadError = error;
            this.state = RPEAssetSourceState.LOAD_ERROR;
        });
        return this.loadPromise;
    }
    /**
     * Tries to load the asset source.
     * @returns a new Future
     */
    protected abstract _loadAssetSourceImpl(): Future<void>;
    
    setMountPath(mountPath: string) {
        this.mountPath = mountPath;
    }
}