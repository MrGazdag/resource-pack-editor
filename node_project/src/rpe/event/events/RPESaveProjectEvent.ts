import RPEEvent from "../RPEEvent";
import RPEditorProject from "../../editor/RPEditorProject";
import RPEditor from "../../editor/RPEditor";
import RPECancellableEvent from "../RPECancellableEvent";

export default class RPESaveProjectEvent extends RPEEvent implements RPECancellableEvent {
    static readonly EVENT_ID: string = "rpe:save";
    private readonly editor: RPEditor;
    private readonly project: RPEditorProject;
    private _cancelled: boolean;

    constructor(editor: RPEditor, project: RPEditorProject) {
        super();
        this.editor = editor;
        this.project = project;
    }

    getEditor(): RPEditor {
        return this.editor;
    }
    getProject(): RPEditorProject {
        return this.project;
    }
    isCancelled() {
        return this._cancelled;
    }
    setCancelled(cancelled: boolean) {
        this._cancelled = cancelled;
    }
}