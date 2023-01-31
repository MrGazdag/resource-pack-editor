import RPEAssetSource from "../editor/RPEAssetSource";
import RPEditor from "../editor/RPEditor";
import RPEditorProject from "../editor/RPEditorProject";
import ResourcePackEditor from "../ResourcePackEditor";
import Future from "../util/Future";
import RPEGameVersion from "./RPEGameVersion";
import RPESupportedGameEntry from "./RPESupportedGameEntry";

export default abstract class RPEGame {
    /**
     * The entry data of this game.
     */
    entry: RPESupportedGameEntry;
    /**
     * `true` if this game supports multiple
     * versions, `false` if only the latest
     * version is supported
     */
    multiVersion: boolean = false;
    id: string;
    /**
     */
    private _availableVersionsArray: Future<RPEGameVersion[]>;
    /**
     */
    private _availableVersionsMap: Future<Map<string, RPEGameVersion>>;
    constructor(id: string) {
        this.id = id;
        this.entry = ResourcePackEditor.availableGames.get(id);
    }
    /**
     * Returns a Future which will be completed
     * with the available game versions.
     * 
     * After the first invocation, the Future will
     * be cached.
     * @returns a Future
     */
    getAvailableGameVersionsArray(): Future<RPEGameVersion[]> {
        if (this._availableVersionsArray) return this._availableVersionsArray;
        else return this.reloadAvailableGameVersions().thenCompose((_)=>{
            return this._availableVersionsArray;
        });
    }
    /**
     * Returns a Future which will be completed
     * with the available game versions.
     * 
     * After the first invocation, the Future will
     * be cached.
     * @returns a Future
     */
    getAvailableGameVersionsMap(): Future<Map<string, RPEGameVersion>> {
        if (this._availableVersionsMap) return this._availableVersionsMap;
        else return this.reloadAvailableGameVersions().thenCompose((_)=>{
            return this._availableVersionsMap;
        });
    }
    /**
     * Reloads the available game versions.
     * @returns a Future
     */
    reloadAvailableGameVersions(): Future<Map<string, RPEGameVersion>> {
        if (this._availableVersionsMap && !this._availableVersionsMap.isDone()) return this._availableVersionsMap;
        else {
            this._availableVersionsArray = this._loadAvailableGameVersions();
            this._availableVersionsMap = this._availableVersionsArray.thenApply(array=>{
                /**
                 */
                let map: Map<string, RPEGameVersion> = new Map();
                for (let version of array) {
                    map.set(version.id, version);
                }
                return map;
            });
            return this._availableVersionsMap;
        }
    }
    /**
     * Returns a Future which will be completed
     * with the available game versions.
     * @returns a Future
     */
    protected abstract _loadAvailableGameVersions(): Future<RPEGameVersion[]>;

    /**
     * Returns a Future which will be completed
     * with the specified version, or `null` if
     * the specified version does not exist.
     * @param version the version to search for
     * @returns a Future
     */
    getGameVersion(version: string): Future<RPEGameVersion | null> {
        return this.getAvailableGameVersionsMap().thenApply(map=>{
            return map.get(version);
        });
    }

    /**
     * Returns the latest supported version
     * as an RPEGameVersion object.
     * @returns an RPEGameVersion
     */
    abstract getLatestSupportedVersion(): RPEGameVersion;

    /**
     * Creates a RPEditorProject object for
     * the specified RPEditor instance
     * specialized for storing state data
     * that is related to this game.
     * @param editor the target editor
     * @param options options for creating the project
     * @returns a new RPEditorState
     */
    createProject(editor: RPEditor, options: any): RPEditorProject {
        return null; //TODO
    }
    /**
     * 
     * @param editor the target editor
     * @param projectData the serialized project data
     * @returns 
     */
    loadProject(editor: RPEditor, projectData: any): RPEditorProject {
        return null; // TODO
    }
    initializeEditor(editor: any, editorData: any, version: any) {}
    /**
     * Creates an RPEAssetSource object
     * @param type the type of asset source to create
     * @param data the existing data to load (or null if not present)
     * @returns the created source, or null if it could not be created
     */
    createAssetSource(type: string, data: any | null): RPEAssetSource {
        if (type == "file") {

        }
        return null; // TODO
    }
    /**
     * Loads a resource for this game.
     * @param path the path to the resource
     * @returns a Future with the response
     */
    loadResource(path: string): Future<Response> {
        return Future.asyncFuture(fetch("assets/data/" + this.id + "/" + path));
    }
}