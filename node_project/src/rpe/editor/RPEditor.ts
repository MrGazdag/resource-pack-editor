import RPEGame from "../game/RPEGame";
import RPEditorProject from "./RPEditorProject";

/**
 * A class that represents a loaded project.
 */
export default class RPEditor {
    /**
     * The game that is being edited.
     */
    game: RPEGame;
    /**
     * The project of the editor. The game object
     * usually produces a subclass of this.
     * Contains persistent data.
     */
    project: RPEditorProject;
    /**
     * Creates a new RPEditor.
     * @param game the game to edit
     */
    constructor(game: RPEGame) {
        this.game = game;
        //this.project = game.createProject(this);
        //this.assetSources = [];
    }
}