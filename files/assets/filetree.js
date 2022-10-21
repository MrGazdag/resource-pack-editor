class NodeTreeParent {
    /**
     * The identation level of this node.
     * @type {number}
     */
    _identation;
    /**
     * Children nodes.
     * @type {Array<NodeTreeNode>}
     */
    _childrenArray;
    /**
     * Children nodes.
     * @type {Object<string, NodeTreeNode>}
     */
    _childrenMap;
    /**
     * The container element for children nodes.
     * @type {HTMLElement}
     */
    _folderInnerObj;
    constructor() {
        this._childrenArray = [];
        this._childrenMap = {};
        this._identation = -1;
    }
    /**
     * Creates a child node.
     * @param {string} id the id of the child node
     * @param {boolean} isContainer true if the child node should be a directory, false otherwise
     * @returns {NodeTreeNode} the created NodeTreeNode.
     */
    createChild(id, isContainer) {
        let child = new NodeTreeNode(this._tree, this, id, isContainer);
        this.addChild(child);
        return child;
    }

    /**
     * Adds the specified node to this node's children.
     * @param {NodeTreeNode} node the node to add
     */
    addChild(node) {
        let foldersFirst = true;
        // Binary sort to sort by name
        let search = binarySearch(this._childrenArray, node, (a, b)=>{
            if (foldersFirst) {
                if (a._isContainer != b._isContainer) {
                    return a._isContainer ? -1 : 1;
                }
            }
            return a._id.localeCompare(b._id);
        });
        if (search < 0) {
            // negative index means it is not in the list
            node.setParent(this);
            let next = this._childrenArray[(-search) - 1];
            this._folderInnerObj.insertBefore(node._rootObj, next == null ? null : next._rootObj);
            this._childrenArray.splice((-search) - 1, 0, node);
            this._childrenMap[node._id] = node;
        }
    }

    removeChild(node) {
        this._childrenArray.splice(this._childrenArray.indexOf(node));
        delete this._childrenMap[node._id];
        this._folderInnerObj.removeChild(node._rootObj);
    }
    /**
     * Returns the child node with the specified ID. If a node with that ID cannot be found,
     * then this method returns null.
     * @param {string} childId the ID of the child node
     * @returns {NodeTreeNode|null} the found child node, or null if none found
     */
    getChild(childId) {
        return this._childrenMap[childId];
    }
    getChildAtIndex(index) {
        return this._childrenArray[index];
    }
    indexOf(child) {
        return this._childrenArray.indexOf(child);
    }
    isExpanded() {
        return false;
    }
    getChildCount() {
        return this._childrenArray.length;
    }
}
class NodeTree extends NodeTreeParent {
    /**
     * The currently selected NodeTreeNode object.
     * @type {NodeTreeNode}
     */
    _selectedNode;
    /**
     * @type {FocusableObject}
     */
    _focusObj;
    /**
     * Creates a new NodeTree object.
     * @param {HTMLElement} rootObject the html element to use as the root
     */
    constructor(rootObject) {
        super();
        this._folderInnerObj = rootObject;
        this._focusObj = new FocusableObject(this._folderInnerObj);
        this._focusObj.keyDown = (event)=>{
            if (event.code == "Space" || event.code == "Enter") {
                if (this._selectedNode != null) {
                    this._selectedNode.open();
                }
            } else if (event.code == "ArrowUp") {
                this.selectPrevious();
            } else if (event.code == "ArrowDown") {
                this.selectNext();
            } else if (event.code == "ArrowLeft") {
                if (this._selectedNode != null) {
                    if (this._selectedNode.isContainer() && this._selectedNode.isExpanded()) {
                        this._selectedNode.setExpanded(false);
                    } else if (this._selectedNode.getParent() instanceof NodeTreeNode) {
                        this.select(this._selectedNode.getParent());
                    }
                }
            } else if (event.code == "ArrowRight") {
                if (this._selectedNode != null && this._selectedNode.isContainer()) {
                    if (this._selectedNode.isExpanded()) {
                        let found = this._findNextImpl(this._selectedNode, -1);
                        // Only select the next selectable node if it is actually a descendant
                        if (found.isChildOf(this._selectedNode)) {
                            this.select(found);
                        }
                    } else {
                        this._selectedNode.setExpanded(true);
                    }
                }
            } else if (event.code == "Home") {
                this.selectFirst();
            } else if (event.code == "End") {
                this.selectLast();
            } else {
                return;
            }
            event.preventDefault();
        };
    }

    getScrollOffset() {
        return this._folderInnerObj.getBoundingClientRect().top;
    }

    /**
     * Returns the currently selected node. If there aren't any nodes selected, this
     * method returns null.
     * @returns {NodeTreeNode|null} the selected node or null
     */
    getSelectedNode() {
        return this._selectedNode;
    }

    /**
     * Selects the specified element.
     * @param {NodeTreeNode|null} node the node to select, or null to clear selection
     * @returns {boolean} true if the node has been selected, false otherwise
     */
    select(node) {
        if (node != null && !node.isSelectable()) return false;
        return this._selectImpl(node);
    }
    /**
     * Selects the specified element.
     * @param {NodeTreeNode|null} node the node to select, or null to clear selection
     * @returns {boolean} true if the node has been selected, false otherwise
     */
    _selectImpl(node) {
        if (this._selectedNode != null) {
            this._selectedNode.markAsSelected(false);
        }
        this._selectedNode = node;
        if (node != null) {
            node.expandParents();
            node.markAsSelected(true);
            let target = node.getScrollTarget();
            let height = 20;
            let advance = height*Math.ceil((this._folderInnerObj.clientHeight*0.3)/height);
            if (target < height) {
                this._folderInnerObj.scrollBy(0, target - advance);
            } else if (target > this._folderInnerObj.clientHeight - height) {
                this._folderInnerObj.scrollBy(0, target - this._folderInnerObj.clientHeight + advance);
            }
        }
        return true;
    }
    selectPrevious() {
        return this.select(this._findPreviousImpl());
    }
    /**
     * Selects the previous visible and selectable element in this filetree.
     * @param {NodeTreeParent} parent the parent to start at, or undefined for the current previous
     * @param {number} index the index to start at, or undefined for the last element
     */
    _findPreviousImpl(parent, index) {
        if (parent == undefined) {
            if (this._selectedNode == null) {
                parent = this;
                index = this.getChildCount();
            } else {
                parent = this._selectedNode.getParent();
                index = parent.indexOf(this._selectedNode);
            }
        } else if (index == undefined) {
            parent = this;
            index = this.getChildCount();
        }

        let current;

        while (true) {
            // Go to previous element in current container.
            index--;
            current = parent.getChildAtIndex(index);
            if (current == undefined) {
                // Index is out of bounds, lets try to go to the parent's previous sibling.
                if (parent instanceof NodeTreeNode) {
                    if (parent.isSelectable()) {
                        // Parents are always above the children, and this is selectable
                        // Lets select the parent node.
                        return parent;
                    } else {
                        // We need to go to the last visible element of the previous sibling.
                        current = parent;
                        parent = parent.getParent();
                        index = parent.indexOf(current);
                        continue;
                    }
                } else {
                    // This is the root node, we are at the start
                    // We cannot go back anymore, lets just do nothing.
                    return false;
                }
            } else {
                if (current.isContainer() && current.isExpanded()) {
                    // This node has other visible children, try to select those
                    parent = current;
                    index = parent.getChildCount();
                    continue;
                } else if (current.isSelectable()) {
                    return current;
                } else {
                    // This node is not selectable
                    continue;
                }
            }
        }
    }
    selectNext() {
        return this.select(this._findNextImpl());
    }
    /**
     * Selects the next visible and selectable element in this filetree.
     * @param {NodeTreeParent} parent the parent to start at, or undefined for the current next
     * @param {number} index the index to start at, or undefined for the first element
     */
    _findNextImpl(parent, index) {
        if (parent == undefined) {
            if (this._selectedNode == null) {
                parent = this;
                index = -1;
            } else {
                parent = this._selectedNode.getParent();
                index = parent.indexOf(this._selectedNode);
            }
        } else if (index == undefined) {
            parent = this;
            index = -1;
        }

        let current = parent.getChildAtIndex(index);

        if (current != undefined && current.isContainer() && current.isExpanded()) {
            // This node has other visible children, try to select those
            parent = current;
            index = -1;
        }

        while (true) {
            // Go to next element in current container.
            index++;
            current = parent.getChildAtIndex(index);
            if (current == undefined) {
                // Index is out of bounds, lets try to go to the parent's next sibling.
                if (parent instanceof NodeTreeNode) {
                    // We need to go to the next sibling of the parent.
                    current = parent;
                    parent = parent.getParent();
                    index = parent.indexOf(current);
                    continue;
                } else {
                    // This is the root node, we are at the start
                    // We cannot go back anymore, lets just do nothing.
                    return null;
                }
            } else {
                if (current.isSelectable()) {
                    return current;
                } else if (current.isContainer() && current.isExpanded()) {
                    // This node has other visible children, try to select those
                    parent = current;
                    index = parent.getChildCount();
                    continue;
                } else {
                    // This node is not selectable
                    continue;
                }
            }
        }
    }
    selectFirst() {
        return this.select(this._findNextImpl(this));
    }
    selectLast() {
        return this.select(this._findPreviousImpl(this));
    }
}
class NodeTreeNode extends NodeTreeParent {
    /**
     * The owning file tree.
     * @type {NodeTree}
     */
    _tree;
    /**
     * The node's parent. Might be the FileTree object itself.
     * @type {NodeTreeParent}
     */
    _parent;
    /**
     * The ID of this FileTreeNode.
     * @type {string}
     */
    _id;
    /**
     * Whether this file tree node is a folder or not.
     * @type {boolean}
     */
    _isContainer;
    /**
     * The displayed name of this file tree node.
     * @type {string}
     */
    _displayName;
    /**
     * A handler, which gets called whenever this node is requested to be opened.
     * @type {()=>void}
     */
    _openHandler;
    /**
     * This field represents if this node is selectable or not.
     * @type {boolean}
     */
    _selectable;

    /*
     * State
     */
    /**
     * Whether this node is expanded or not.
     * @type {boolean}
     */
    _isExpanded;

    /*
     * HTML Elements
     */

    /**
     * The root `ftnode` element.
     * @type {HTMLElement}
     */
    _rootObj;
    /**
     * The head `ftnode_head` element, containing the name and icon.
     * @type {HTMLElement}
     */
    _headObj;
    /**
     * The folder opener element (chevron).
     * @type {HTMLElement}
     */
    _folderOpenerObj;
    /**
     * The name span element.
     * @type {HTMLElement}
     */
    _nameObj;
    /**
     * Creates a new NodeTreeNode.
     * @param {NodeTree} fileTree the parent NodeTree
     * @param {NodeTreeNode|null} parent the parent NodeTreeNode instance, or null if this is a root node
     * @param {string} id the ID of this node (not visible)
     * @param {boolean} isContainer whether this is a container node
     */
    constructor(fileTree, parent, id, isContainer) {
        super();
        this._tree = fileTree;
        this._id = id;
        this._displayName = "";
        this._icon = "";
        this._isContainer = isContainer;
        this._selectable = true;

        this._rootObj = newObj("ftnode");
        this._headObj = newObj("ftnode_head");
        this._rootObj.appendChild(this._headObj);
        if (isContainer) {
            this._rootObj.classList.add("folder");
            this._folderOpenerObj = newSvgUse("#chevron_right", null, "chevron");
            this._folderOpenerObj.onmousedown = (e)=>{
                e.stopPropagation();
            }
            this._folderOpenerObj.onclick = (e)=>{
                this.toggleExpanded();
                e.stopPropagation();
            };
            this._headObj.appendChild(this._folderOpenerObj);
            this._folderInnerObj = newObj("ftnode_inner");
            this._rootObj.appendChild(this._folderInnerObj);
            this.setExpanded(false);
        } else {
            this._folderOpenerObj = newSvgUse("", null, "chevron");
            this._headObj.appendChild(this._folderOpenerObj);
        }

        this._nameObj = newObj("span");
        this._nameObj.textContent = "Entry";
        this._headObj.appendChild(this._nameObj);

        this._headObj.onmousedown = ()=>{
            this._tree.select(this);
        };
        this._headObj.ondblclick = ()=>{
            this.open();
        };

        this.setParent(parent);
        this.setDisplayName("Node");
    }

    getRootElement() {
        return this._rootObj;
    }

    getScrollTarget() {
        return this._rootObj.getBoundingClientRect().top - ft.getScrollOffset();
    }

    /**
     * Returns the owning NodeTree instance.
     * @returns {NodeTree} the owning NodeTree instance
     */
    getFileTree() {
        return this._tree;
    }

    /**
     * Returns the parent NodeTreeNode instance.
     * @returns {NodeTreeParent} the parent NodeTreeNode
     */
    getParent() {
        return this._parent;
    }

    /**
     * 
     * @param {NodeTreeParent} parent the new parent node, or null to make it a root node.
     */
    setParent(parent) {
        this._parent = parent;
        this._identation = parent != null ? parent._identation + 1 : 0;
        this._headObj.style.paddingLeft = this._identation * 20;
    }

    /**
     * Returns the ID of this NodeTreeNode.
     * @returns {string} the ID
     */
    getID() {
        return this._id;
    }
    /**
     * Returns whether or not this node is a container node.
     * @returns {boolean} true if this is a container node, false otherwise
     */
    isContainer() {
        return this._isContainer;
    }

    /**
     * Sets the displayed name of this filetree object.
     * @param {string} displayName the new displayed name
     */
    setDisplayName(displayName) {
        this._displayName = displayName;
        this._nameObj.textContent = displayName;
    }

    /**
     * Returns the displayed name of this NodeTreeNode.
     * @returns {string} the current displayed name
     */
    getDisplayName() {
        return this._displayName;
    }

    /**
     * Sets the handler function to call, when this node is requested to be opened.
     * @param {null|()=>void} openHandler the new opening handler, or null to remove
     */
    setOpenHandler(openHandler) {
        this._openHandler = openHandler;
    }

    /**
     * Returns whether this node is selectable or not.
     * @returns true if this node is selectable, false otherwise
     */
    isSelectable() {
        return this._selectable;
    }

    /**
     * Sets if this node is selectable.
     * @param {boolean} value the new value
     */
    setSelectable(value) {
        this._selectable = value;
    }

    open() {
        if (!this._isContainer) {
            if (this._openHandler)this._openHandler();
        } else this.toggleExpanded();
    }

    isChildOf(parent) {
        let current = this._parent;
        while (current instanceof NodeTreeNode) {
            if (current == parent) return true;
            else current = current.getParent();
        }
        return current == parent;
    }

    /**
     * Sets whether this container node is opened.
     * Only applies to container nodes.
     * @param {boolean} newValue the new value
     */
    setExpanded(newValue) {
        this._isExpanded = newValue;
        if (newValue) {
            this._folderInnerObj.style.display = "";
            updateSvgUse(this._folderOpenerObj, "#chevron_down");
        } else {
            this._folderInnerObj.style.display = "none";
            updateSvgUse(this._folderOpenerObj, "#chevron_right");
        }
    }

    /**
     * Returns whether this container node has been expanded.
     * @returns {boolean} true if this node is expanded, false otherwise
     */
    isExpanded() {
        return this._isExpanded;
    }

    /**
     * Toggles between the expanded states of this container node.
     * @see {@link NodeTreeNode.setExpanded}
     */
    toggleExpanded() {
        this.setExpanded(!this._isExpanded);
    }

    /**
     * Marks/unmarks this node as selected.
     * @param {boolean} selected the new value
     * 
     * @see {@link NodeTree.select}
     */
    markAsSelected(selected) {
        if (selected) {
            this._headObj.classList.add("selected");
        } else {
            this._headObj.classList.remove("selected");
        }
    }

    /**
     * Expands all parent container nodes.
     */
    expandParents() {
        let parent = this._parent;
        while (parent != null && parent instanceof NodeTreeNode) {
            parent.setExpanded(true);
            parent = parent._parent;
        }
    }
}
class IconNodeTreeNode extends NodeTreeNode {
    /**
     * The name of this NodeTreeNode.
     * @type {string}
     */
    _icon;
    /**
     * The icon SVG element.
     * @type {HTMLElement}
     */
    _iconObj;
    constructor(fileTree, parent, id, isContainer) {
        super(fileTree, parent, id, isContainer);
        
        this._iconObj = newSvgUse("#", null, "icon");
        this._headObj.insertBefore(this._iconObj, this._nameObj);
        this.setIcon(null);
    }

    /**
     * Returns the icon of this node. If this node
     * does not have an icon, then `null` is returned.
     * @returns {string|null} the ID of the current icon, or null if there is no icon
     */
    getIcon() {
        return this._icon;
    }

    /**
     * Changes the icon id of this NodeTreeNode.
     * @param {string|null} icon the new icon id, or null to remove the icon
     */
    setIcon(icon) {
        this._icon = icon;
        if (icon != null) {
            this._iconObj.style.display = "";
            updateSvgUse(this._iconObj, "#" + icon);
        } else {
            this._iconObj.style.display = "none";
        }
    }
    
    /**
     * Creates a child node.
     * @param {string} id the id of the child node
     * @param {boolean} isContainer true if the child node should be a directory, false otherwise
     * @returns {IconNodeTreeNode} the created NodeTreeNode.
     */
    createChild(id, isContainer) {
        let child = new IconNodeTreeNode(this._tree, this, id, isContainer);
        this.addChild(child);
        return child;
    }
}

/*
let tree = document.getElementById("filetree");
let a = new FileTreeNode("root1", "teszt1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasdasdasd", "icon_folder", true);
let b = new FileTreeNode("root2", "teszt2", "icon_folder", true);
let c = new FileTreeNode("root3", "teszt3", "icon_folder", true);
let d = new FileTreeNode("kép.png", "kép.png", "icon_image", true);
let e = new FileTreeNode("fájl.txt", "fájl.txt", "icon_file", true);

a.addChild(b);
b.addChild(c);
c.addChild(d);
b.addChild(e);
tree.appendChild(a._rootObj);
*/

var ft = new NodeTree(document.getElementById("filetree"));

async function openTest() {
    let folder = await window.showDirectoryPicker({mode: "readwrite"});
    let node = new IconNodeTreeNode(ft, ft, "pack_root_" + folder.name, true);
    node.setDisplayName("Resource Pack Root - " + folder.name);
    node.setIcon("icon_resource_pack");
    node.setOpenHandler(()=>{console.log("ez a főmappa baszod");});

    node._child = folder;
    iterateTest("res_" + folder.name, "", node, folder);
    ft.addChild(node);
    console.log(node);
};
/**
 * Iterates the child elements of the specified folder, and creates new nodes
 * @param {string} namespace the namespace to use
 * @param {string} pathSoFar the current path so far
 * @param {IconNodeTreeNode} parent the parent node
 * @param {FileSystemDirectoryHandle} folder the opened folder
 */
async function iterateTest(namespace, pathSoFar, parent, folder) {
    for await (let child of folder.values()) {
        let isFolder = child.kind == "directory";
        let icon = isFolder ? "icon_folder" : child.name.endsWith("png") ? "icon_texture" : "icon_file_generic";
        let node = parent.createChild(child.name, isFolder);
        node.setDisplayName(child.name);
        node.setIcon(icon);
        node.setOpenHandler(()=>{
            let key = namespace + ":" + pathSoFar + child.name;
            let page = PageManager.getPage(key);
            let newPage = page == null;
            if (newPage) {
                page = PageManager.createPage(key, child.name, true);
            }
            PageManager.selectPage(page);
            if (newPage) {
                let file = new OpenedFileAccessor(child);
                let editor;
                if (child.name.endsWith(".png")) editor = new ImageEditor(page, file);
                else editor = new TextEditor(page, file);
            }
        });
        node._child = child;
        if (isFolder) iterateTest(namespace, pathSoFar + child.name + "/", node, child);
    }
};

/**
 * Opens a version, and adds it to the filetree view.
 * @param {string} version the version id to open
 */
async function openVersion(version) {
    let verData = MinecraftVersions._versionMap[version];
    let namespace = "mc_asset_" + verData.id + "";
    let node = new IconNodeTreeNode(ft, ft, "mc_" + verData.id, true);
    node.setDisplayName("Minecraft Version - " + verData.id);
    node.setIcon("icon_resource_pack");
    node.setOpenHandler(()=>{console.log("ez a főmappa baszod");});
    let entries = await (await MinecraftVersions.loadJar(verData)).getEntries();
    for (let jarEntry of entries) {
        let name = jarEntry.filename;
        if (name.endsWith(".class")) continue;
        let parts = name.split("/");
        let current = node;
        for (let i = 0; i < parts.length-1; i++) {
            let part = parts[i];
            if (current.getChild(part) == null) {
                current = current.createChild(part, true);
                current.setDisplayName(part);
                current.setIcon("icon_folder");
            } else current = current.getChild(part);
        }
        let lastName = parts[parts.length-1];
        let thisNode = current.createChild(lastName, false);
        thisNode.setDisplayName(lastName);
        thisNode.setIcon(lastName.endsWith("png") ? "icon_texture" : "icon_file_generic");
        thisNode.setOpenHandler(()=>{
            let key = namespace + ":" + name;
            let page = PageManager.getPage(key);
            let newPage = page == null;
            if (newPage) {
                page = PageManager.createPage(key, lastName, true);
            }
            PageManager.selectPage(page);
            if (newPage) {
                let file = new ZipFileAccessor(jarEntry);
                let editor;
                if (lastName.endsWith(".png")) editor = new ImageEditor(page, file);
                else editor = new TextEditor(page, file);
            }
        });
        thisNode._child = jarEntry;
    }
    ft.addChild(node);
};