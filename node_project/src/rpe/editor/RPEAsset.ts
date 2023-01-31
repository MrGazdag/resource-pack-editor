import RPEAssetSource from "./RPEAssetSource";

export default class RPEAsset {
    /**
     * The owning asset source.
     */
    assetSource: RPEAssetSource;
    /**
     * The asset channel that this asset belongs to, or `null`
     * if it belongs exclusively to the asset source.
     * 
     * Asset channels are made to allow the same files to be
     * present in multiple asset sources, for example: metadata
     * files about the asset sources themselves, or if files
     * are able to be organized in a different way than the game
     * requires it, to allow linking the directories correctly. 
     *
     */
    assetChannel: string | null;
    /**
     * The path of this asset in the asset channel specified by
     * the {@link RPEAsset.assetChannel `assetChannel`} variable,
     * or `null` to use the parent folder's path. If this is a
     * root asset, and this field is set to `null`, then the
     * asset should be in the root of the asset channel.
     */
    assetChannelPath: string | null;
    /**
     * The name of this asset.
     */
    name: string;
    /**
     * `true` if this asset is a directory, `false` otherwise.
     */
    private _isDirectory: boolean;
    /**
     * The parent asset, or null (if this is a root level entry)
     */
    parent: RPEAsset | null;
    /**
     * An array of children if this asset is a directory,
     * or `null` otherwise.
     */
    private _children: RPEAsset[] | null;

    /**
     * Returns the full path in the owning asset source.
     */
    get fullSourcePath() {
        let path = this.name;
        let parent = this.parent;
        while (parent != null) {
            path = parent.name + "/" + path;
            parent = parent.parent;
        }
        return path;
    }
    /**
     * Returns the full path in the current asset channel.
     */
    get fullChannelPath() {
        let path = this.name;
        let parent = this.parent;
        while (parent != null) {
            if (parent.assetChannel != this.assetChannel) {
                path = (this.assetChannel ? this.assetChannel : "private") + ":" + this.assetChannel;
                break;
            }
            path = parent.name + "/" + path;
            if (parent.assetChannelPath != null) path = parent.assetChannelPath + "/" + path;
            parent = parent.parent;
        }
        return path;
    }
    constructor(assetSource: RPEAssetSource, parent: RPEAsset, isDirectory: boolean) {
        this.assetSource = assetSource;
        this.parent = parent;
        this._isDirectory = isDirectory;
        if (this._isDirectory) this._children = [];
    }
    get isDirectory() {
        return this._isDirectory;
    }
    get children() {
        return this._children;
    }
}