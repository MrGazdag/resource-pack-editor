import FailedRequestError from "../../rpe/error/FailedRequestError";
import Future from "../../rpe/util/Future";
import RPEBrowserLocalSavedEntry from "./RPEBrowserLocalSavedEntry";
import RPEBrowserLocalSavedProject from "./RPEBrowserLocalSavedProject";

export default class BrowserUtils {
    static BINDING_KEY = "browser";
    private static FILE_CACHE_IDB_KEY = "filecache";
    private static FILE_CACHE_IDB_OBJECTSTORE_KEY = "saved_files";
    private static FILE_CACHE_IDB: Future<IDBDatabase> = null;
    private static SAVED_PROJECT_MAP: Map<string, RPEBrowserLocalSavedProject> = new Map();
    private static initFileCache(): Future<IDBDatabase> {
        if (this.FILE_CACHE_IDB) return this.FILE_CACHE_IDB;
        this.FILE_CACHE_IDB = new Future<IDBDatabase>();
        let req = window.indexedDB.open("", 1);
        req.onerror = ()=>{
            this.FILE_CACHE_IDB.completeExceptionally(new FailedRequestError("Failed to open the file cache IndexedDB: " + req.error));
            this.FILE_CACHE_IDB = null;
        };
        req.onsuccess = ()=>{
            let db = req.result;
            db.onclose = ()=>{

            };
            this.FILE_CACHE_IDB.complete(req.result);
        };
        req.onupgradeneeded = ()=>{
            let db = req.result;
            let objectStore = db.createObjectStore(this.FILE_CACHE_IDB_OBJECTSTORE_KEY, {"keyPath": "fullKey"});
            objectStore.createIndex("fullKey", "fullKey", {unique: true});
        };
        return this.FILE_CACHE_IDB;
    }
    private static initTransaction(readWrite: boolean = false): Future<IDBTransaction> {
        return this.initFileCache().thenApply(db => {
            return db.transaction(this.FILE_CACHE_IDB_OBJECTSTORE_KEY, readWrite ? "readwrite" : "readonly");
        });
    }
    static storeFile(entry: RPEBrowserLocalSavedEntry): Future<string> {
        return this.initTransaction(true).thenCompose(tr => {
            let objectStore = tr.objectStore(this.FILE_CACHE_IDB_OBJECTSTORE_KEY);
            objectStore.add(entry);
            return Future.asyncFuture(async ()=>{
                let f = new Future<string>();
                while (true) {
                    let req = objectStore.get(entry.fullKey); // TODO: this breaks with async functions
                    let future = new Future<boolean>();
                    req.onsuccess = ()=>{
                        future.complete(!req);
                    };
                    req.onerror = ()=>{
                        future.completeExceptionally(req.error);
                    }
                    if (await future) {
                        break;
                    } else {
                        entry.referenceID = this.genereateReferenceID();
                        entry.fullKey = entry.projectID + "/" + entry.referenceID;
                    }
                }
                tr.oncomplete = ()=>{
                    f.complete(entry.referenceID);
                };
                tr.onerror = ()=>{
                    f.completeExceptionally(tr.error);
                };
                return await f;
            });
        });
    }
    static readFile(projectID: string, referenceID: string): Future<RPEBrowserLocalSavedEntry|null> {
        return this.initTransaction().thenCompose(tr => {
            let objectStore = tr.objectStore(this.FILE_CACHE_IDB_OBJECTSTORE_KEY);
            let f = new Future<RPEBrowserLocalSavedEntry>();
            let req = objectStore.get(projectID + "/" + referenceID);
            req.onsuccess = ()=>{
                f.complete(req.result ?? null);
            }
            req.onerror = ()=>{
                f.completeExceptionally(req.error);
            };
            return f;
        });
    }
    private static genereateReferenceID() {
        return crypto.randomUUID();
    }
    static createSavedEntry(projectID: string, referenceID: string, handle: FileSystemHandle): RPEBrowserLocalSavedEntry {
        return {
            fullKey: projectID + "/" + referenceID,
            projectID: projectID,
            referenceID: referenceID ?? this.genereateReferenceID(),
            lastKnownName: handle.name,
            handle: handle
        };
    }
    static createSavedProject(projectID: string): RPEBrowserLocalSavedProject {
        return {
            projectID: projectID,
            files: {}
        };
    }
}