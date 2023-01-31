enum RPEAssetSourceState {
    /**
     * The asset source is currently unloaded,
     * and requires loading.
     */
    UNLOADED,
    /**
     * The asset source is currently being loaded.
     */
    CURRENTLY_LOADING,
    /**
     * The asset source has successfully been loaded.
     */
    LOADED,
    /**
     * The asset source could not be loaded.
     */
    LOAD_ERROR
}
export default RPEAssetSourceState;