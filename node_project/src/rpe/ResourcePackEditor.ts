import RPEGame from "./game/RPEGame";
import RPESupportedGameEntry from "./game/RPESupportedGameEntry";
import Future from "./util/Future";
import RPEEventNode from "./event/RPEEventNode";
import RPEPlatform from "./platform/RPEPlatform";
import IllegalStateError from "./error/IllegalStateError";

const ResourcePackEditor = new class ResourcePackEditor {
    /*
    packManager: {
        /**
         * /
        loadedPacks: [],
        vanillaPack: null,
        async loadFilePack(writable) {
            
        },
        async loadFolderPack(writable) {
            
        },
        async loadPackUrl(url) {
            let packBlob = await (await fetch(url)).blob();
            let zipReader = new zip.ZipReader(new zip.BlobReader(packBlob));
            
            let pack = new ZipArchive(zipReader);
            if (vanillaPack != null) {
                loadedPacks.splice(loadedPacks.splice(loadedPacks.length-1, 0, pack));
            }
            this._loadPack(pack);
            return pack;
        },
        async loadVanillaPack(versionString) {

        },
        /**
         * Adds the specified pack.
         * @param pack the pack to add
         * /
        private _loadPack(pack) {
            this.loadedPacks.push(pack);
        }
    },
    /**
     * /
    versionSupport: null,
    init() {
    },
    getPackEntry(path, startPackIndex) {
        if (startPackIndex == undefined) startPackIndex = this.packManager.loadedPacks.length-1;
        for (let i = startPackIndex; i >= 0; i--) {
            const pack = this.packManager.loadedPacks[i];
            let entry = pack.getEntry(path);
            if (entry != null) return entry;
        }
    }
    */
   readonly EDITOR_VERSION = "0.0.1";
   private readonly initialization = new Future<void>();
   eventNode: RPEEventNode = new RPEEventNode();
   private platform: RPEPlatform;
   /**
    * A map containing the loaded games.
    */
   loadedGames: Map<string, RPEGame> = new Map();
    /**
     * This variable contains a cached array of the supported
     * games. Initially this is empty, and after the first call to
     * {@link ResourcePackEditor.reloadAvailableGames()}, this will
     * be populated when the available games have loaded.
     */
    availableGames = new Map<string, RPESupportedGameEntry>();
    /**
     */
    private _availableGamesFutureCache: Future<Map<string, RPESupportedGameEntry>> | null;

    /**
     * Returns a Future which will resolve with a map of
     * supported game ID to supported game entry.
     * @returns a Future
     */
    reloadAvailableGames(): Future<Map<string, RPESupportedGameEntry>> {
        return this._availableGamesFutureCache = Future.asyncFuture(fetch("assets/data/games.json").then(r=>r.json()).then(data=>{
            this.availableGames.clear();
            for (let key of Object.keys(data)) {
                this.availableGames.set(key, new RPESupportedGameEntry(data[key]));
            }
            return this.availableGames;
        }));
    }
    /**
     * Returns a Future which will resolve with a map of
     * supported game ID to supported game entry.
     * 
     * This method only calls {@link ResourcePackEditor.reloadAvailableGames()}
     * if it has not been called before. Further invocations return
     * a cached Future instance.
     * @returns a Future
     */
    loadAvailableGames(): Future<Map<string, RPESupportedGameEntry>> {
        if (this._availableGamesFutureCache) return this._availableGamesFutureCache;
        return this.reloadAvailableGames();
    }
    /**
     * Tries to load an RPEGame by the specified ID.
     * @param id the id of the game to load
     * @returns a new Future
     */
    loadGame(id: string): Future<RPEGame> {
        if (this.loadedGames.has(id)) {
            return Future.completedFuture(this.loadedGames.get(id));
        } else if (this.availableGames.has(id)) {
            return this.availableGames.get(id).loadGame();
        } else {
            return Future.failedFuture(new Error("Game \"" + id + "\" is not supported and could not be loaded."));
        }
    }

    /**
     * Registers a game instance.
     * @param game the game instance to register
     */
    registerGame(game: RPEGame) {
        this.loadedGames[game.id] = game;
    }

    registerPlatform(platform: RPEPlatform) {
        if (this.platform) {
            throw new IllegalStateError("Tried to load a new platform implementation (\"" + platform.getID() + "\"), but there was an existing platform loaded (\"" + this.platform.getID() + "\")!");
        } else {
            this.platform = platform;
            this.platform.onload();
            this.initialization.complete();
        }
    }
    getPlatform() {
        return this.platform;
    }
    registerInitializationHandler(handler: ()=>void) {
        this.initialization.thenRun(handler);
    }
    isInitialized() {
        return this.initialization.isDone();
    }
};
export default ResourcePackEditor;