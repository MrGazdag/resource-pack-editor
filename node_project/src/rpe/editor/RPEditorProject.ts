import RPEGame from "../game/RPEGame";
import RPEGameVersion from "../game/RPEGameVersion";
import Future from "../util/Future";
import RPEAssetSource from "./RPEAssetSource";

/**
 * A serializable class, containing persistent data about the
 * current state of a project.
 */
export default class RPEditorProject {
    /**
     * Creates a new project.
     * @param game the RPEGame instance to use
     * @param gameVersion the game version
     * @param projectType the project type (if applicable)
     * @param projectId the id of the project
     * @param projectName the name of the project
     * @returns a new project instance
     */
    static create(game: RPEGame, gameVersion: RPEGameVersion, projectType: string, projectId: string, projectName: string): RPEditorProject {
        return null; // TODO
    }
    /**
     * Loads an existing project.
     * @param data the project data file to load from
     * @returns the project
     */
    static load(data: any): Future<RPEditorProject> {
        /**
         */
        let gameId: string = data.game;
        /**
         */
        let gameVersionString: string = data.gameVersion;
        /**
         */
        let projectId: string = data.projectId;
        let projectName: string = data.projectName;
        /**
         */
        let projectType: string = data.projectType;
        let gameData = data.gameData;
        /*return ResourcePackEditor.loadGame(gameId).thenCompose(game=>{
            let created = {
                game: game,
                gameVersion: null
            };
            return game.getGameVersion(gameVersionString).thenApply(gameVersion=>{
                created.gameVersion = gameVersion;
                return created;
            });
        });
        */
       return null; // TODO
    }
    /**
     * The RPEGame instance of the game being edited.
     */
    game: RPEGame | null;
    gameData: any;
    gameVersion: RPEGameVersion;
    projectId: string;
    projectName: string;
    projectType: string;
    /**
     */
    assetSources: RPEAssetSource[];
    /**
     * Creates a new RPEditorProject instance.
     * @param game the game instance, or `null` if unknown
     * @param gameVersion the game version
     * @param projectName the name of the project
     * @param projectType the type of the project
     */
    constructor(game: RPEGame | null, gameVersion: RPEGameVersion, projectName: string, projectType: string) {
        this.game = game;
        this.gameVersion = gameVersion;
        this.projectName = projectName;
        this.projectType = projectType;
        this.assetSources = [];
        
    }
    /**
     * Serializes this state into a JSONObject
     * @returns the serialized data
     */
    serialize(): any {
        return {};
    }
    /**
     * Deserializes the state in the
     * specified JSON object.
     * @param data 
     */
    deserialize(data: any) {
        
    }
    private _deserializeGameData(data: any) {

    }
}