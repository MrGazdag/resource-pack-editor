/**
 * Creates a new HTML element, and optionally adds an ID and/or classes to it.
 * @param {string} type the type of the element (e.g. div)
 * @param {string|undefined} id an optional id to add to this element
 * @param  {...string} classes an optional list of classes to add to this element
 * @returns {HTMLElement} the resulting HTMLElement
 */
function newObj(type, id, ...classes) {
    let e = document.createElement(type);
    if (id) e.id = id;
    if (classes && classes.length > 0) e.classList.add(...classes);
    return e;
}
/**
 * Creates a new namespaced HTML element, and optionally adds an ID and/or classes to it.
 * @param {string} namespace the namespace of this element (e.g. http://www.w3.org/2000/svg)
 * @param {string} type the type of the element (e.g. div)
 * @param {string|undefined} id an optional id to add to this element
 * @param  {...string} classes an optional list of classes to add to this element
 * @returns {HTMLElement} the resulting HTMLElement
 */
function newObjNS(namespace, type, id, ...classes) {
    let e = document.createElementNS(namespace, type);
    if (id) e.id = id;
    if (classes && classes.length > 0) e.classList.add(...classes);
    return e;
}

/**
 * Creates a new <svg> element, with a <use> element containing a link, and optionally adds an ID and/or classes to it.
 * @param {string} useLink the link to use within the <use> element (the xlink:href property)
 * @param {string|undefined} id an optional id to add to this element
 * @param  {...string} classes an optional list of classes to add to this element
 * @returns {HTMLElement} the resulting HTMLElement
 */
function newSvgUse(useLink, id, ...classes) {
    let svg = newObjNS("http://www.w3.org/2000/svg", "svg", id, ...classes);
    let use = newObjNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", useLink);
    svg.appendChild(use);
    return svg;
}
/**
 * Updates the specified <svg> object's <use> element link attribute to the specified value.
 * @param {HTMLElement} svg the svg acquired from newSvgUse()
 * @param {string} newUseLink the new link
 */
function updateSvgUse(svg, newUseLink) {
    svg.children[0].setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", newUseLink);
}
/**
 * Clears the children elements of the specified element.
 * @param {HTMLElement} element the element
 */
function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}
/**
 * Performs a binary search on the specified ordered array for the specified element.
 * If the object is found within the array, the index of the element is returned.
 * 
 * Let x be the position at which the element should be placed in the array.
 * If the object is not found within the array, this method will return -(x + 1).
 * @param {Array<*>} array the ordered array to search
 * @param {*} element the element to search for
 * @param {(a: *, b:*)=>number} compareFunction the function to use for comparing elements
 * @returns {number} the index of the element, or the insertion index
 */
function binarySearch(array, element, compareFunction) {
    var m = 0;
    var n = array.length - 1;
    while (m <= n) {
        var k = (n + m) >> 1;
        var cmp = compareFunction(element, array[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return k;
        }
    }
    return -m - 1;
}
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
class Dropdown {
    _element;
    _selected;
    _selectedIndex;
    _open;
    _disabled;
    _updateListener;

    /**
     * @type {FocusableObject}
     */
    _focusObj;

    _entriesArray;
    _entriesObj;
    _entriesInnerObj;
    constructor(element) {
        this._element = element;
        this._element.focusable = true;
        this._element.classList.add("dropdown");
        this._selected = newObj("div", null, "dropdown_entry", "dropdown_selected");
        this._selected.onclick = (event)=>{
            if (!this._disabled) {
                FocusTree.requestFocus(this._focusObj);
                this.setOpen(!this._open);
            }
        };
        this._element.appendChild(this._selected);
        this._element.appendChild(newSvgUse("#chevron_down"));
        this._entriesObj = newObj("div", null, "dropdown_entries");
        this._entriesInnerObj = newObj("div", null, "dropdown_entries_inner");
        this._entriesObj.appendChild(this._entriesInnerObj);
        this._element.appendChild(this._entriesObj);
        this._focusObj = new FocusableObject(this._element);
        this._focusObj.keyDown = (event) => {
            if (event.code == "Escape") {
                this.setOpen(false);
            } else if (event.code == "Space" && !this._disabled) {
                this.setOpen(!this._open);
            } else if (event.code == "ArrowUp") {
                this.setSelected(Math.max(this._selectedIndex-1, 0));
            } else if (event.code == "ArrowDown") {
                this.setSelected(Math.min(this._selectedIndex+1, this._entriesArray.length-1));
            }
        };
        this._focusObj.focusLoss = ()=>{
            this.setOpen(false);
        };
    }
    setSelected(selected) {
        if (Number.isFinite(selected)) {
            this._selected.textContent = this._entriesArray[selected];
            this._selectedIndex = selected;
        } else {
            this._selected.textContent = selected;
            this._selectedIndex = this._entriesArray.indexOf(selected);
        }
    }
    setUpdateListener(func) {
        this._updateListener = func;
    }
    setEntries(entries) {
        clearChildren(this._entriesInnerObj);
        this._entriesArray = entries;
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            let entryObj = newObj("div", null, "dropdown_entry");
            entryObj.textContent = entry;
            entryObj.onclick = ()=>{
                this.setSelected(i);
                if (this._updateListener) this._updateListener(entry);
                this.setOpen(false);
            };
            this._entriesInnerObj.appendChild(entryObj);
        }
    }
    setOpen(value) {
        this._open = value;
        this._element.classList.toggle("open", value);
    }
    setDisabled(value) {
        this._disabled = value;
        this._element.classList.toggle("disabled", value);
    }
}
const FocusTree = {
    /**
     * @type {FocusableObject}
     */
    focusedElement: null,
    onkeydown(event) {
        if (this.focusedElement != null) {
            this.focusedElement.keyDown(event);
        }
    },
    onkeypress(event) {
        if (this.focusedElement != null) {
            this.focusedElement.keyPress(event);
        }
    },
    /**
     * @param {MouseEvent} event the MouseEvent to handle
     */
    onclick(event) {
        this.requestFocus(null);
    },
    /**
     * @param {FocusableObject} focusObj the object to focus
     */
    requestFocus(focusObj) {
        if (this.focusedElement == focusObj) return;

        if (this.focusedElement != null) {
            this.focusedElement.focusLoss();
        }
        this.focusedElement = focusObj;
        if (focusObj != null) focusObj.focusGain();
    }
}
class FocusableObject {
    /**
     * @type {(event: KeyboardEvent)=>void}
     */
    keyDown = ()=>{};
    /**
     * @type {(event: KeyboardEvent)=>void}
     */
    keyPress = ()=>{};
    /**
     * @type {()=>void}
     */
    focusGain = ()=>{};
    /**
     * @type {()=>void}
     */
    focusLoss = ()=>{};
    _focusRootObj;
    /**
     * Creates a new focusable object.
     * @param {HTMLElement|null} focusRootObj the focus root HTML Element (or null for none)
     */
    constructor(focusRootObj) {
        this._focusRootObj = focusRootObj;
        if (focusRootObj != null) focusRootObj.addEventListener("click", (e)=>{
            this.requestFocus();
            e.stopPropagation();
        });
    }
    requestFocus() {
        FocusTree.requestFocus(this);
    }
}
window.addEventListener("keydown", (e)=>{FocusTree.onkeydown(e)});
window.addEventListener("keypress", (e)=>{FocusTree.onkeypress(e)});
window.addEventListener("click", (e)=>{FocusTree.onclick(e)});
const Dragging = {
    _drag_box: document.getElementById("drag_box"),
    /**
     * @type {(x: number, y: number)=>void}
     */
    _currentCallback: null,
    /**
     * Starts a drag.
     * @param {(x: number, y: number)=>void} callback 
     */
    startDrag(cursor, callback) {
        if (this._currentCallback != null) return;
        this._currentCallback = callback;
        this._drag_box.style.cursor = cursor;
        this._drag_box.style.display = "";
    },
    _onmove(event) {
        if (this._currentCallback != null) {
            this._currentCallback(event.x, event.y);
        }
    },
    stopDrag() {
        if (this._currentCallback == null) return;
        this._currentCallback = null;
        this._drag_box.style.display = "none";
    },
    _init() {
        this._drag_box.addEventListener("mousemove", (event)=>this._onmove(event));
        this._drag_box.addEventListener("mouseup", (event)=>this.stopDrag());
        this._drag_box.style.display = "none";
    }
}
Dragging._init();

let fto = document.getElementById("filetree");
let rs = document.getElementById("filetree_resizer");
let m = document.getElementById("main");
rs.onmousedown = ()=>{
    Dragging.startDrag("ew-resize", (x,y)=>{
        fto.style.width = x + "px";
        rs.style.left = (x-3) + "px";
    });
};

const Landing = {
    _currentPage: null,
    _homePage: document.getElementById("l_home"),
    _newPage: document.getElementById("l_new"),
    _openPage: document.getElementById("l_open"),

    _lOpenBack: document.getElementById("l_open_back"),
    /**
     * @type {Dropdown}
     */
    _lOpenPackFormat: null,
    _lOpenPackType: null,
    _lOpenPackTypeTP: document.getElementById("l_open_packtype_texture"),
    _lOpenPackTypeRP: document.getElementById("l_open_packtype_resource"),
    _selectPage(page) {
        if (this._currentPage != null) {
            this._currentPage.style.display = "none";
        }
        this._currentPage = page;
        if (page != null) {
            page.style.display = "";
        }
    },
    async _doOpenPage() {
        await MinecraftVersions.awaitVersionLoad();
        let packVersionEntries = [];
        let packVersions = await MinecraftVersions.getPackVersions();
        for (let pv of packVersions) {
            if (pv.version < 1) continue;
            let str = "Version " + pv.version + " (";
            if (pv.firstPretty != null && pv.lastPretty != null) {
                str += pv.firstPretty + " - " + pv.lastPretty;
            } else if (pv.firstPretty == null) {
                str += pv.lastPretty + " and earlier";
            } else {
                str += pv.firstPretty + "+";
            }
            packVersionEntries.push(str + ")");
        }

        this._lOpenPackFormat.setEntries(packVersionEntries);
        this._lOpenPackFormat.setSelected("Select...");
        this._selectPage(this._openPage);
    },
    _init() {
        this._currentPage = this._homePage;
        let newBtn = document.getElementById("l_home_btn_new");
        //newBtn.onclick = ()=>this._selectPage(this._newPage);
        newBtn.onclick = ()=>{document.getElementById("landing").style.display = "none";openVersion("1.19.2");};
        let openBtn = document.getElementById("l_home_btn_open");
        openBtn.onclick = async ()=>this._doOpenPage();
        
        this._lOpenBack.onclick = ()=>this._selectPage(this._homePage);
        this._lOpenPackFormat = new Dropdown(document.getElementById("l_open_opts_packformat"));

        this._lOpenPackTypeTP.onclick = ()=>{
            if (this._lOpenPackType == this._lOpenPackTypeTP) return;

            if (this._lOpenPackType != null) {
                this._lOpenPackType.classList.remove("selected");
            }
            this._lOpenPackType = this._lOpenPackTypeTP;
            this._lOpenPackType.classList.add("selected");
            
            this._lOpenPackFormat.setDisabled(true);
            this._lOpenPackFormat.setSelected("Not applicable");
        }
        this._lOpenPackTypeRP.onclick = ()=>{
            if (this._lOpenPackType == this._lOpenPackTypeRP) return;

            if (this._lOpenPackType != null) {
                this._lOpenPackType.classList.remove("selected");
            }
            this._lOpenPackType = this._lOpenPackTypeRP;
            this._lOpenPackType.classList.add("selected");

            this._lOpenPackFormat.setDisabled(false);
            this._lOpenPackFormat.setSelected("Select...");
        }
    }
}

const ResourcePackEditor = {
    packManager: {
        /**
         * @type {Array<Archive>}
         */
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
         * @param {Archive} pack the pack to add
         */
        _loadPack(pack) {
            this.loadedPacks.push(pack);
        }
    },
    getFile(path, startPackIndex=0) {
        for (let i = startPackIndex; i < this.packManager.loadedPacks.length; i++) {
            const pack = this.packManager.loadedPacks[i];
            
        }
    }
};
let _inited = false;
function init() {
    if (_inited) return;
    _inited = true;
    Landing._init();
}