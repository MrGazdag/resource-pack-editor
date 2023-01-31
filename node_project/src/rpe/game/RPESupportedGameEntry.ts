import ResourcePackEditor from "../ResourcePackEditor";
import Future from "../util/Future";
import Utils from "../util/Utils";
import RPEGame from "./RPEGame";

export default class RPESupportedGameEntry {
    /**
     * The ID of this entry.
     */
    id: string;
    /**
     * The name of this supported game.
     */
    name: string;
    /**
     * An URL containing the logo of this game.
     * This is relative to the game's data path,
     * which is `assets/data/<game_id>/`.
     */
    logo: string;
    /**
     * A cached Future, which returns an RPEGame object.
     */
    private _loadedGameFuture: Future<RPEGame> | null;
    constructor(data: { id: string; name: string; logo: string; }) {
        this.id = data.id;
        this.name = data.name;
        this.logo = data.logo;
        this._loadedGameFuture = null;
    }
    loadGame() {
        if (this._loadedGameFuture) return this._loadedGameFuture;

        this._loadedGameFuture = Future.asyncFuture(async ()=> {
            Utils.loadScript("assets/game/" + this.id + ".js");
            return ResourcePackEditor.loadedGames[this.id];
        });
        return this._loadedGameFuture;
    }
}