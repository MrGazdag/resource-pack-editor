import RPEditorProject from "../../rpe/editor/RPEditorProject";
import UnsupportedOperationError from "../../rpe/error/UnsupportedOperationError";
import RPEPlatformLocalFile from "../../rpe/platform/RPEPlatformLocalFile";
import Future from "../../rpe/util/Future";
import BrowserUtils from "./BrowserUtils";

export default class RPEBrowserLocalFile extends RPEPlatformLocalFile {
    size(): Future<number> {
        throw new Error("Method not implemented.");
    }
    canRead(): boolean {
        throw new Error("Method not implemented.");
    }
    canWrite(): boolean {
        throw new Error("Method not implemented.");
    }
    requestReadPermission(): Future<boolean> {
        throw new Error("Method not implemented.");
    }
    requestWritePermission(): Future<boolean> {
        throw new Error("Method not implemented.");
    }
    lastKnownName(): string {
        throw new Error("Method not implemented.");
    }
    isMissing(): boolean {
        throw new Error("Method not implemented.");
    }
    tryResolve(): Future<void> {
        throw new Error("Method not implemented.");
    }
    requestResolution(): Future<boolean> {
        throw new Error("Method not implemented.");
    }
    serialize(project: RPEditorProject): Future<any> {
        throw new Error("Method not implemented.");
    }
    /**
     * @type {string}
     */
    private _referenceId: string;
    /**
     * @type {string}
     */
    private _lastKnownName: string;
    /**
     * @type {Future<File>}
     */
    private _file: Future<File>;
    /**
     * @type {FileSystemFileHandle}
     */
    private _handle: FileSystemFileHandle;
    /**
     * Creates a new file.
     * @param handle
     * @param file
     * @param data
     */
    constructor(handle?: FileSystemFileHandle, file?: File, data?: { referenceId: string; lastKnownName: string }) {
        super(BrowserUtils.BINDING_KEY);
        if (handle) {
            this._handle = handle;
        }
        if (file) {
            this._file = Future.completedFuture(file);
        }
        if (data) {
            this._referenceId = data.referenceId;
            this._lastKnownName = data.lastKnownName;
        }
    }
    private _getReferenceId() {
        if (this._referenceId) return this._referenceId;
        else return this._referenceId = crypto.randomUUID();
    }
    private _loadFile() {
        if (this._file) return this._file;
        else return this._file = Future.asyncFuture(this._handle.getFile());
    }
    arrayBuffer() {
        return this._loadFile().thenApplyAsync(file=>file.arrayBuffer());
    }
    text() {
        return this._loadFile().thenApplyAsync(file=>file.text());
    }
    name() {
        let name: string;
        if (this._handle) name = this._handle.name;
        else if (this._file && this._file.isDone()) name = this._file.getNow().name;
        else return undefined;
        this._lastKnownName = name;
    }
    
    lastModified() {
        return this._loadFile().thenApply(file=>file.lastModified);
    }
    delete() {
        if (this._handle["remove"]) return Future.asyncFuture(this._handle["remove"]()).thenApply(_=>true);
        else throw new UnsupportedOperationError("RPEBrowserLocalFile.delete()");
    }
    
}