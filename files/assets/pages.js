/**
 * Represents a page in the main container.
 */
class Page {
    /**
     * The owning PageManagerInstance object.
     * @type {PageManagerInstance}
     */
    _pageManager;
    /**
     * The id of this page.
     * @type {string}
     */
    _id;
    /**
     * The current title of this page.
     * @type {string}
     */
    _title;
    /**
     * Whether this page can be closed or not.
     * @type {boolean}
     */
    _closable;
    
    /**
     * The header (the area where you can select the tab) element.
     * @type {HTMLElement}
     */
    _headerObj;
    /**
     * The title element within the header. Used for changing the title.
     * @type {HTMLElement}
     */
    _headerTitleObj;
    /**
     * The body element of the page.
     * @type {HTMLElement}
     */
    _bodyObj;
    constructor(pageManager, id, title, closable) {
        this._pageManager = pageManager;
        this._id = id;

        this._headerObj = document.createElement("page_header");
        this._headerTitleObj = document.createElement("span");
        this._headerObj.appendChild(this._headerTitleObj);
        let closeButton = newSvgUse("#x");
        closeButton.onclick = (e)=>{
            this._pageManager.closePage(this);
            e.stopPropagation();
        };
        this._headerObj.onclick = ()=>{
            this._pageManager.selectPage(this);
        };
        this._headerObj.appendChild(closeButton);

        this._bodyObj = document.createElement("page_body");
        this._bodyObj.style.display = "none";

        this.setTitle(title);
        this.setClosable(closable);
    }

    /**
     * Sets the page title to the specified string.
     * @param {string} title the new page title
     */
    setTitle(title) {
        this._title = title;
        this._headerTitleObj.textContent = title;
    }

    /**
     * Sets whether this page can be closed or not.
     * @param {boolean} closable the new value
     */
    setClosable(closable) {
        this._closable = closable;
        if (closable) {
            this._headerObj.classList.remove("pinned");
        } else {
            this._headerObj.classList.add("pinned");
        }
    }

    /**
     * Updates the page selection status.
     * To select a page, use PageManagerInstance#selectPage(Page).
     * @param {boolean} selected the new value
     */
    markSelected(selected) {
        if (selected) {
            this._headerObj.classList.add("selected");
            this._bodyObj.style.display = "";
        } else {
            this._headerObj.classList.remove("selected");
            this._bodyObj.style.display = "none";
        }
    }

    /**
     * Returns whether this page can be closed.
     * @returns {boolean} true if this page can be closed, false otherwise
     */
    isClosable() {
        return this._closable;
    }

    getId() {
        return this._id;
    }

    /**
     * Returns the body element of this page.
     * @returns {HTMLElement} the body element
     */
    getBodyElement() {
        return this._bodyObj;
    }

    focusGain() {

    }

    focusLoss() {

    }

    /**
     * A method that gets called when this page is in focus and a key is pressed.
     * @param {KeyboardEvent} event the event
     */
    keyDown(event) {}
    /**
     * A method that gets called when this page is in focus and a key (that produces input) is pressed.
     * @param {KeyboardEvent} event the event
     */
    keyPress(event) {}
}
class PageManagerInstance {
    /**
     * The array of all pages in order of appearance.
     * @type {Array<Page>}
     */
    _pageArray;
    /**
     * An object containing Page instances based on their id.
     * @type {Object<string,Page>}
     */
    _pageMap;
    /**
     * The page header bar element.
     * @type {HTMLElement}
     */
    _pageBarObj;
    /**
     * The page body element.
     * @type {HTMLElement}
     */
    _pageBodyObj;
    /**
     * The element which gets displayed when no pages are available.
     * @type {HTMLElement}
     */
    _noPagesObj;
    /**
     * The currently selected page, or null if no page is currently selected.
     * @type {Page|null}
     */
    _selectedPage;
    /**
     * The focus object.
     * @type {FocusableObject}
     */
    _focusObj;
    constructor() {
        this._pageArray = [];
        this._pageMap = {};
        this._pageBarObj = document.getElementById("main_page_bar");
        this._pageBodyObj = document.getElementById("main_page_body");
        this._noPagesObj = document.getElementById("main_no_pages");
        this._selectedPage = null;
        this._focusObj = new FocusableObject(document.getElementById("main"));
        this._focusObj.focusGain = ()=>{this._selectedPage?.focusGain();};
        this._focusObj.focusLoss = ()=>{this._selectedPage?.focusLoss();};
        this._focusObj.keyDown = (e)=>{this._selectedPage?.keyDown(e);};
        this._focusObj.keyPress = (e)=>{this._selectedPage?.keyPress(e);};
    }
    /**
     * Creates a page and registers it in this PageManager.
     * @param {string} id the id of the page
     * @param {string} title the initial title of the page
     * @param {boolean} closable whether this page is closable
     * @returns {Page} a new Page instance
     */
    createPage(id, title, closable) {
        let page = new Page(this, id, title, closable);
        if (this._selectedPage == null) {
            this._noPagesObj.style.display = "none";
            this._selectedPage = page;
            page.markSelected(true);
        }
        this._pageArray.push(page);
        this._pageMap[id] = page;
        this._pageBarObj.appendChild(page._headerObj);
        this._pageBodyObj.appendChild(page._bodyObj);
        return page;
    }
    /**
     * Selects the specified page.
     * @param {Page|null} page the page to select, or null to deselect the current page
     */
    selectPage(page) {
        if (this._selectedPage != null) this._selectedPage.markSelected(false);
        this._selectedPage = page;
        if (this._selectedPage != null) this._selectedPage.markSelected(true);
    }
    /**
     * Closes the specified page, and unregisters it.
     * @param {Page} page the Page instance
     */
    closePage(page) {
        let index = this._pageArray.indexOf(page);
        this._pageArray.splice(this._pageArray.indexOf(page), 1);
        delete this._pageMap[page.getId()];
        this._pageBarObj.removeChild(page._headerObj);
        this._pageBodyObj.removeChild(page._bodyObj);
        if (this._pageArray.length == 0) {
            this._noPagesObj.style.display = "";
            this._selectedPage = null;
        } else if (this._selectedPage == page) {
            this.selectPage(this._pageArray[Math.min(index, this._pageArray.length-1)]);
        }
    }
    /**
     * Returns a Page with the specified id. If no matching page can be found, this method returns null.
     * @param {string} id the id to search
     * @returns {Page|null} the found Page, or null if no page has been found with this id
     */
    getPage(id) {
        return this._pageMap[id];
    }
};

const PageManager = new PageManagerInstance();