class Archive {
    /**
     * @type {Object<string,ArchiveEntry>}
     */
    entryMap;
    /**
     * @type {Array<ArchiveEntry>}
     */
    rootObjects;
    packModifiable;
    constructor() {
        this.entryMap = {};
        this.rootObjects = [];
    }
    loadTree() {

    }
    /**
     * Creates a new entry in the Resource Pack.
     * @param {string} path the path in the resource pack, eg. assets/minecraft/textures/block/stone.png
     * @returns {ArchiveEntry} the created PackEntry
     */
    createEntry(path) {
        let entry = this._createEntryImpl(path);
        
    }
    /**
     * Creates a new entry in the Resource Pack.
     * @param {string} path the path in the resource pack, eg. assets/minecraft/textures/block/stone.png
     * @returns {ArchiveEntry} the created PackEntry
     */
    _createEntryImpl(path) {}
    /**
     * Gets an entry at the specified path from this pack.
     * @param {string} path the path of the object
     * @returns {ArchiveEntry|null} the pack entry, or null if none found
     */
    getEntry(path) {
        return this.entryMap[path];
    }
    getEntryMap() {
        return this.entryMap;
    }
    deleteEntry(path) {
        delete this.entryMap[path];
    }
}
class ArchiveEntry {
    /**
     * The owning Archive instance.
     * @type {Archive}
     */
    archive;
    /**
     * The parent ArchiveEntry instance, or null if it is
     * a root entry.
     * @type {ArchiveEntry|null}
     */
    parentEntry;
    /**
     * The full path of this entry in the archive.
     * Example: assets/minecraft/textures/stone.png
     * @type {string}
     */
    fullPath;
    /**
     * The name of this entry in the archive.
     * Example: stone.png
     * @type {string}
     */
    entryName;
    /**
     * True if this ArchiveEntry represents a folder.
     * @type {boolean}
     */
    isDirectory;
    /**
     * @type {Array<ArchiveEntry>}
     */
    childrenArray;
    /**
     * True if this entry has been modified in some way.
     * @type {boolean}
     */
    modified;
    /**
     * True if this archive entry can be modified.
     * @type {boolean}
     */
    modifiable;
    /**
     * True if this entry has loaded its contents already,
     * and the contents are immediately accessible.
     * @type {boolean}
     */
    isLoaded;
    /**
     * Creates a new ArchiveEntry object.
     * @param {Archive} pack the owning archive
     * @param {ArchiveEntry|null} parentEntry the parent entry instance or null if this is a root entry
     * @param {boolean} isDirectory whether this entry is a directory
     * @param {boolean} modifiable whether this entry is modifiable
     */
    constructor(pack, parentEntry, entryName, isDirectory, modifiable) {
        this.archive = pack;
        this.parentEntry = parentEntry;
        this.fullPath = parentEntry == null ? entryName : parentEntry.fullPath + "/" + entryName;
        this.entryName = entryName;
        this.isDirectory = isDirectory;
        this.modifiable = modifiable;
        if (isDirectory) {
            this.childrenArray = [];
        }
    }
    /**
     * @returns {string|Blob} the contents of this entry as a string or a Blob
     */
    async getContents() {}
    /**
     * Adds an ArchiveEntry 
     * @param {ArchiveEntry} child the child entry to add
     */
    addChild(child) {
        this.childrenArray.push(child);
        child.fullPath = this.fullPath + child.entryName;
        child.parentEntry = this;
    }
}
class ZipArchive extends Archive {
    _zipReader;
    constructor(zipReader) {
        super();
        this._zipReader = zipReader;
    }
    loadTree() {

    }
    
    /**
     * Creates a new entry in the Resource Pack.
     * @param {string} path the path in the resource pack, eg. assets/minecraft/textures/block/stone.png
     * @returns {ZipArchiveEntry} the created PackEntry
     */
    _createEntryImpl(path) {

    }
}
class MinecraftAssetedArchive extends Archive {
    _assetIndex;
    _zipReader;
    constructor(zipReader) {
        super();
        this._zipReader = zipReader;
    }
    loadTree() {

    }
    
    /**
     * Creates a new entry in the Resource Pack.
     * @param {string} path the path in the resource pack, eg. assets/minecraft/textures/block/stone.png
     * @returns {ZipArchiveEntry} the created PackEntry
     */
    _createEntryImpl(path) {

    }
}
class ZipArchiveEntry extends ArchiveEntry {
    contents;
    zipEntry;
}
class VirtualPack extends Archive {
    constructor() {
        super();
    }
    _createEntryImpl(path, contents) {
        
    }
}
class PackOperationContext {
    /**
     * @type {{[problemCategory: string]: {problemName: string, problems: [PackProblem]}}}
     */
    problemList;
    /**
     * @type {{[problemId: string]: PackProblem}}
     */
    problemMap;
    /**
     * @type {{[problemId: string]: string}}
     */
    selectedResolutions;
    data;
    constructor() {
        this.problemList = {};
        this.data = {};
    }
    createProblemType(id, name) {
        if (!this.problemList.hasOwnProperty(id)) {
            this.problemList[id] = {problemName: name, problems: []};
        }
        return this.problemList[id];
    }
    warn(problemCategory, problemId, problemName, message, affectedEntries=[]) {
        let problem = new PackProblem(problemId, message, affectedEntries);
        this.createProblemType(problemCategory, problemName).problems.push(problem);
        this.problemMap[problemId] = problem;
    }
    issue(problemCategory, problemId, problemName, message, affectedEntries, actions, defaultAction=null) {
        let problem = new PackProblem(problemId, message, affectedEntries, actions, defaultAction);
        this.createProblemType(problemCategory, problemName).problems.push(problem);
        this.problemMap[problemId] = problem;
    }
    error(problemCategory, problemId, problemName, message, affectedEntries, actions, defaultAction=null) {
        let problem = new PackProblem(problemId, message, affectedEntries, actions, defaultAction);
        this.createProblemType(problemCategory, problemName).problems.push(problem);
        this.problemMap[problemId] = problem;
    }
    getResolution(problemId) {
        let selected = this.selectedResolutions[problemId];
        if (selected) return selected;
        else return this.problemMap[problemId]?.defaultAction;
    }
}
/**
 * A PackProblem can be one of four severity levels:
 * - **a warning:** this is just a warning message, that notifies
 *   the user that there might be something wrong, but it is
 *   not necessarily a breaking problem.
 * 
 * - **an issue:** there is a problem, and the user can automatically
 *   apply a solution, but they can choose from other
 *   alternative solution.
 * 
 * - **a critical issue:** there is a problem, and the user must
 *   decide how to resolve it, with no default option being
 *   present
 * 
 * - **an error:** there is something wrong, that is preventing
 *   the completion of the task, and the user must manually
 *   resolve this issue (no possible fix found)
 */
class PackProblem {
    /**
     * This is just a warning message, that notifies
     * the user that there might be something wrong,
     * but it is not necessarily a breaking problem.
     */
    static SEVERITY_WARNING = "warning";
    /**
     * There is a problem, and the user can automatically
     * apply a solution, but they can choose from other
     * alternative solutions.
     */
    static SEVERITY_ISSUE = "issue";
    /**
     * There is a problem, and the user must decide how
     * to resolve it, with no default option being present.
     */
    static SEVERITY_CRITICAL_ISSUE = "critical_issue";
    /**
     * There is something wrong, that is preventing the
     * completion of the task, and the user must manually
     * resolve this issue (no possible fix found).
     */
    static SEVERITY_ERROR = "error";
    /**
     * The id of the problem.
     * @type {string}
     */
    problemId;
    /**
     * The affected PackEntry objects.
     * @type {ArchiveEntry[]}
     */
    affectedEntries;
    /**
     * The message of the problem.
     * @type {string}
     */
    message;
    /**
     * The actions to take to fix this problem.
     * Might be null.
     * @type {{id: string, name: string}[]|null}
     * @see {@link PackProblem}
     */
    actions;
    /**
     * The default action that will be taken upon
     * no user input.
     * @type {string}
     */
    defaultAction;
    /**
     * The severity level of this problem.
     * @type {string}
     * @see {@link PackProblem.SEVERITY_WARNING}
     * @see {@link PackProblem.SEVERITY_ISSUE}
     * @see {@link PackProblem.SEVERITY_CRITICAL_ISSUE}
     * @see {@link PackProblem.SEVERITY_ERROR}
     */
    severity;
    /**
     * Creates a PackProblem instance. The severity gets
     * determined automatically, based on the constructor
     * parameters:
     * - warning: `actions` is `null`
     * - issue: `actions` is an array, which is not empty, and `defaultAction` points to a valid action in the `actions` array
     * - critical issue: `actions` is an array, which is not empty, and `defaultAction` is `null`
     * - error: `actions` is an empty array (`[]`)
     * 
     * @param {string} problemId the problem id
     * @param {string} message the message
     * @param {ArchiveEntry[]} affectedEntries an array of the affected PackEntry objects
     * @param {{id: string, name: string}[]|null} actions the possible actions to take, or null to indicate no action needed. `id` represents the id of this action (used with `defaultAction`), and `name` represents the displayed name of this option
     * @param {string|null} defaultAction the default action that will be taken when no additional user input is entered
     */
    constructor(problemId, message, affectedEntries, actions=null, defaultAction=null) {
        this.problemId = problemId;
        this.message = message;
        this.affectedEntries = affectedEntries;
        this.actions = actions;
        this.defaultAction = defaultAction;
        if (actions == null) {
            this.severity = PackProblem.SEVERITY_WARNING;
        } else if (actions.length == 0) {
            this.severity = PackProblem.SEVERITY_ERROR;
        } else if (defaultAction == null) {
            this.severity = PackProblem.SEVERITY_ERROR;
        } else {
            this.severity = PackProblem.SEVERITY_CRITICAL_ISSUE;
        }
    }
}
class PackOperation {
    /**
     * Performs the operation on the resource pack.
     * 
     * @param {Archive} pack the resource pack
     * @param {PackOperationContext} context the current pack context
     * @param {boolean} reverse whether to reverse the action or not
     * @param {*} options the options to use
     */
    perform(pack, context, reverse, options) {}

    static UPDATE_OPERATIONS = {
        "rename": new class extends PackOperation {
            /**
             * Renames entries during a resource pack update.
             * 
             * @param {Archive} pack the resource pack
             * @param {PackOperationContext} context the current pack context
             * @param {boolean} reverse whether to reverse the action or not
             * @param {{type: "exact", changes: [{from: string, to: string}]}|{type: "regex", changes: [{from: string, to: string}], changesReverse: [{from: string, to: string}]}} options the options to use
             */
            perform(pack, context, reverse, options) {
                //TODO somehow make this functional
                //     make it somehow use same logic for resuming state
                //     make it warn on collisions
                //     somehow make it so that it cannot rename elements twice twice
                //     the api should know the affected entries
                //     the new entries should also know their source entry maybe

                if (context.data.problems) {
                    // Resume from previous state
                    for (let key of Object.keys(context.data.problems)) {

                    }
                } else {
                    context.data.problems = {};
                    if (options.type == "exact") {
                        if (reverse) {
                            for (let entry of options.changes) {
                                if (entry.from == entry.to) continue;
                                let oldEntry = pack.getEntry(entry.to);
                                if (oldEntry) {
                                    if (pack.getEntry(entry.from)) {
                                        // File already exists at the destination
                                        context.data.problems[entry.from] = {type: "exact", entry: oldEntry, to: entry.to};
                                    } else {
                                        pack.deleteEntry(oldEntry);
                                        pack.createEntry(entry.from, oldEntry.getContents());
                                    }
                                }
                            }
                        } else {
                            for (let entry of options.changes) {
                                let oldEntry = pack.getEntry(entry.from);
                                if (oldEntry) newPack.createEntry(entry.to, oldEntry.getContents());
                            }
                        }
                    } else if (options.type == "regex") {
                        for (let entry of (reverse ? options.changesReverse : options.changes)) {
                            let regex = new RegExp(entry.from);
                            for (let key of Object.keys(pack.getEntryMap())) {
                                if (key.match(regex)) {
                                    let oldEntry = pack.getEntry(key);
                                    if (oldEntry) newPack.createEntry(key.replace(regex, entry.to), oldEntry.getContents());
                                }
                            }
                        }
                    } else {
                        context.warn("invalid_source_data", "file_out_of_date", "Invalid Source Data", "Invalid rename option \"" + options.type + "\"");
                    }
                }
            }
            /**
             * Renames exactly one entry.
             * @param {Archive} pack the pack
             * @param {PackOperationContext} context the context
             * @param {string} from original entry name
             * @param {string} to new entry name
             */
            _doExact(pack, packEntry, context, from, to) {

            }
        },
        "splitTextureMap": new SplitTextureMapPackUpdater(),
    };
}
class RenamePackUpdater extends PackOperation {
    
}
class SplitTextureMapPackUpdater extends PackOperation {
    perform(oldPack, newPack, context,  options) {
        
    }
}