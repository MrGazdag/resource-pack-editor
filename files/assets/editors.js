class FileAccessor {
    /**
     * @returns {Promise<string>}
     */
    async readText(){}
    /**
     * @returns {Promise<Blob>}
     */
    async readBlob(){}
    /**
     * @returns {boolean} true if this file can be written to
     */
    isWritable(){return false;}
    /**
     * @param {string} text the text to write
     */
    async writeText(text){}
    /**
     * @param {Blob} blob the blob to write
     */
    async writeBlob(blob){}
}
class ZipFileAccessor extends FileAccessor {
    _zipEntry;
    _textCache;
    _modified;
    _name;
    constructor(entry) {
        super();
        this._zipEntry = entry;
        this._modified = false;
        this._name = entry.filename
    }
    async fileName() {
        return this._zipEntry.filename;
    }
    async readText() {
        if (this._textCache == null) {
            this._textCache = await this._zipEntry.getData(new zip.TextWriter());
        }
        return this._textCache;
    }
    async readBlob() {return await this._zipEntry.getData(new zip.BlobWriter());}
    async rename(newName) {
        this._modified = true;
        this._name = newName;
    }
}
class OpenedFileAccessor extends FileAccessor {
    _handle;
    constructor(handle) {
        super();
        this._handle = handle;
    }
    async readText() {
        return await (await this._handle.getFile()).text();
    }
    async readBlob() {
        return new Blob([(await (await this._handle.getFile()).arrayBuffer())]);
    }
    isWritable() {
        return true;
    }
    async writeText(text) {
        let w = await this._handle.createWritable();
        await w.write(text);
        await w.close();
    }
    async writeBlob(blob) {
        let w = await this._handle.createWritable();
        await w.write(blob);
        await w.close();
    }
}
class Editor {
    /**
     * @type {Page}
     */
    _page;
    /**
     * @type {*}
     */
    _options;
    /**
     * @type {string}
     */
    _id;
    /**
     * @type {FileAccessor}
     */
    _file;
    /**
     * Creates a new editor.
     * @param {string} id the id of this editor
     * @param {Page} page the editor page object
     * @param {FileAccessor} file the file being edited
     * @param {*} options the options
     */
    constructor(id, page, file, options) {
        this._id = id;
        this._page = page;
        this._page.getBodyElement().classList.add(id);
        this._file = file;
        this._options = options;
    }
}
class TextEditor extends Editor {
    static LINTERS = {
        "raw": (editor)=>new TextEditorLinter(editor),
        "json": (editor)=>new GenericJsonLinter(editor)
    }
    /**
     * @type {Array<TextToken>}
     */
    tokens;
    /**
     * @type {Array<{tokens: {content: HTMLElement, overlay: HTMLElement}[], contentRoot: HTMLElement, selectRoot: HTMLElement, content: string, length: number}>}
     */
    lines;
    /**
     * @type {Array<TextCursor>}
     */
    cursors;
    /**
     * @type {TextEditorLinter}
     */
    linter;
    /**
     * @type {number}
     */
    length;

    /**
     * @type {HTMLElement}
     */
    rootObj;
     /**
      * @type {HTMLElement}
      */
    linesRootObj;
    /**
     * @type {HTMLElement}
     */
    linesContentRootObj;
    /**
     * @type {HTMLElement}
     */
    linesSelectRootObj;
    /**
     * @type {HTMLElement}
     */
    linesCursorRootObj;
    /**
     * @type {HTMLElement}
     */
    lineCountRootObj;
    /**
     * @type {string}
     */
    lineSeparator;
    /**
     * @type {number}
     */
    currentScrollX;
    /**
     * @type {number}
     */
    currentScrollY;
    /**
     * Creates a new TextEditor.
     * @param {Page} page the editor page object
     * @param {FileAccessor} file the file being edited
     * @param {*} options the options
     */
    constructor(page, file, options) {
        super("editor_text", page, file, options);
        this.rootObj = newObj("div");
        page.getBodyElement().appendChild(this.rootObj);
        this.lineCountRootObj = newObj("div", undefined, "lineCountRoot");
        this.rootObj.appendChild(this.lineCountRootObj);

        this.linesRootObj = newObj("div", undefined, "linesRoot");
        this.rootObj.appendChild(this.linesRootObj);

        this.linesSelectRootObj = newObj("div", undefined, "linesSelectRoot");
        this.linesRootObj.appendChild(this.linesSelectRootObj);
        this.linesContentRootObj = newObj("div", undefined, "linesContentRoot");
        this.linesRootObj.appendChild(this.linesContentRootObj);
        this.linesCursorRootObj = newObj("div", undefined, "linesCursorRoot");
        this.linesRootObj.appendChild(this.linesCursorRootObj);

        this.lines = [];
        this.cursors = [];

        this.lineSeparator = "\n";

        this.currentScrollX = 0;
        this.currentScrollY = 0;

        page.getBodyElement().addEventListener("wheel", (e)=>{
            this.scrollBy(e.deltaX*0.5, e.deltaY*0.5);
        });

        file.readText().then((text)=>{
            this.setText(text);
            this.createCursor(0, 0);
            page.keyDown = (e)=>{
                if (e.code == "ArrowLeft") {
                    for (let cursor of this.cursors) cursor.moveLeft();
                } else if (e.code == "ArrowRight") {
                    for (let cursor of this.cursors) cursor.moveRight();
                } else if (e.code == "ArrowUp") {
                    for (let cursor of this.cursors) cursor.moveUp();
                } else if (e.code == "ArrowDown") {
                    for (let cursor of this.cursors) cursor.moveDown();
                } else if (e.code == "Enter") {
                    for (let cursor of this.cursors) this.insertText(this.lineSeparator, cursor.line, cursor.currentColumn);
                    e.preventDefault(); // calls keyPress event too
                } else if (e.code == "Backspace") {
                    for (let cursor of this.cursors) this.removeTextBackwards(1, cursor.line, cursor.currentColumn);
                } else if (e.code == "Delete") {
                    for (let cursor of this.cursors) this.removeTextForwards(1, cursor.line, cursor.currentColumn);
                } else if (e.code == "Home") {
                    if (e.ctrlKey) {
                        // Move to absolute beginning
                        for (let cursor of this.cursors) cursor.moveStart();
                    } else {
                        for (let cursor of this.cursors) cursor.moveLineStart();
                    }
                } else if (e.code == "End") {
                    if (e.ctrlKey) {
                        // Move to absolute end
                        for (let cursor of this.cursors) cursor.moveEnd();
                    } else {
                        for (let cursor of this.cursors) cursor.moveLineEnd();
                    }
                }
                console.log(e);
            };
            page.keyPress = (e)=>{
                console.log(e);
                for (let cursor of this.cursors) {
                    this.insertText(e.key, cursor.line, cursor.currentColumn);
                }
            };
            page.getBodyElement().addEventListener("mousedown", (e)=>{
                this.clearCursors();
                let x = this.currentScrollX + e.layerX;
                let y = this.currentScrollX + e.layerY;
                let line = Math.floor(y/20.8);
                let column = Math.round(x/9.6);
                let cursor = this.cursors[0];
                cursor.moveTo(line, column);
            });
        });
        /*
        file.readText().then((text)=>{
            page.getBodyElement().innerHTML = text.replaceAll("\n", "<br>").replaceAll(" ", "&nbsp;");
        });
        */
       console.log(this);
    }
    scrollBy(x, y) {
        this.scrollTo(this.currentScrollX + x, this.currentScrollY + y);
    }
    scrollTo(x, y) {
        this._page.getBodyElement().scrollLeft = x;
        this._page.getBodyElement().scrollTop = y;
        this.currentScrollX = this._page.getBodyElement().scrollLeft;
        this.currentScrollY = this._page.getBodyElement().scrollTop;
    }

    /**
     * Sets the whole text of this editor.
     * @param {string} text the text to set
     */
    setText(text) {
        clearChildren(this.lineCountRootObj);
        clearChildren(this.linesSelectRootObj);
        clearChildren(this.linesContentRootObj);
        this.length = 0;
        this.insertText(text, 0, 0);
        console.log(this.lines);
    }

    /**
     * Inserts the specified text at the specified position.
     * @param {string} text the text to insert
     * @param {number} lineIndex the index of the line to insert at, defaults to last line
     * @param {number} column the column in the line to insert at, defaults to last line's length
     */
    insertText(text, lineIndex=this.lines.length-1, column=this.lines[this.lines.length-1].length) {
        let startPos = this.getCharacterOffset(lineIndex, column);
        let line = this.lines[lineIndex];
        let remaining;
        if (line == null) {
            line = this.createLine();
            remaining = "";
        } else {
            remaining = line.content.substring(column);
        }
        line.length -= remaining.length;
        line.content = line.content.substring(0, line.length);
        let textLineStartIndex = 0;
        for (let i = 0; i < text.length; i++) {
            let newline = text.startsWith(this.lineSeparator, i);
            if (newline) {
                line.length += i - 1 + this.lineSeparator.length - textLineStartIndex;
                line.content += text.substring(textLineStartIndex, i);
                line.contentRoot.textContent = line.content;
                textLineStartIndex = i+this.lineSeparator.length;
                i+=this.lineSeparator.length-1;

                lineIndex++;
                line = this.createLine(lineIndex);
            }
        }
        line.length += text.length - textLineStartIndex;
        line.content += text.substring(textLineStartIndex);

        line.length += remaining.length;
        line.content += remaining;
        this.length += text.length;

        line.contentRoot.textContent = line.content;

        for (let cursor of this.cursors) {
            if (cursor.position >= startPos) cursor.moveToOffset(cursor.position+text.length);
        }
    }
    /**
     * Removes characters starting from the specified position backwards.
     * @param {number} length the amount of characters to remove
     * @param {number} lineIndex the index of the line to remove from, defaults to last line
     * @param {number} column the column in the line to remove from, defaults to last line's length
     */
    removeTextBackwards(length, lineIndex=this.lines.length-1, column=this.lines[this.lines.length-1].length) {
        let startPos = this.getCharacterOffset(lineIndex, column);
        let line = this.lines[lineIndex];
        if (line == null) {
            return;
        }
        let remaining = line.content.substring(column);
        line.length -= remaining.length;
        line.content = line.content.substring(0, line.length);
        let pos = column;
        for (let i = 0; i < length; i++) {
            pos--;
            if (pos == -1) {
                if (lineIndex == 0) {
                    length = i;
                    pos = 0;
                    break;
                }

                this.removeLine(lineIndex);
                lineIndex--;
                line = this.lines[lineIndex];

                line.length -= this.lineSeparator.length;
                line.content = line.content.substring(0, line.length);
                pos = line.length;
            }
        }
        line.length = pos;
        line.content = line.content.substring(0, pos);
        this.length -= pos;

        line.length += remaining.length;
        line.content += remaining;

        line.contentRoot.textContent = line.content;

        for (let cursor of this.cursors) {
            if (cursor.position > startPos) cursor.moveToOffset(cursor.position-length);
            else if (cursor.position > startPos-length) cursor.moveToOffset(startPos-length);
        }
    }

    /**
     * Creates a new line, which will have the specified index.
     * @param {number} index the index of the created line, defaults to the line count (meaning it will create a new line at the end of the file)
     * @returns {{tokens: {content: HTMLElement, overlay: HTMLElement}[], contentRoot: HTMLElement, selectRoot: HTMLElement, content: string, length: number}} the line object
     */
    createLine(index=this.lines.length) {
        if (index > this.lines.length) index = this.lines.length;
        
        if (this.lines.length > 0) {
            // If this is the current last line,
            // and we have at least one line,
            // add newline to previous line
            this.lines[index-1].content += this.lineSeparator;
            this.lines[index-1].length += this.lineSeparator.length;
        }
        let contentRoot = document.createElement("div");
        let selectRoot = document.createElement("div");
        this.linesRootObj.appendChild(contentRoot);
        let line = {
            length: 0,
            contentRoot: contentRoot,
            selectRoot: selectRoot,
            content: "",
            tokens: []
        };
        this.lines.splice(index, 0, line);
        this.linesContentRootObj.insertBefore(contentRoot, this.linesContentRootObj.children[index]);
        this.linesSelectRootObj.insertBefore(selectRoot, this.linesSelectRootObj.children[index]);

        let lineCountObj = newObj("div");
        lineCountObj.textContent = this.lines.length;
        this.lineCountRootObj.appendChild(lineCountObj);
        return line;
    }

    removeLine(index) {
        if (this.lines.length == 1) return;
        let line = this.lines[index];
        line.contentRoot.remove();
        line.selectRoot.remove();
        this.length -= line.length;
        this.lines.splice(index, 1);
        this.lineCountRootObj.removeChild(this.lineCountRootObj.lastChild);
        // don't forget about the newlines at the end of the lines
    }

    /**
     * Returns the position of the specified character index in the text.
     * @param {number} index the character index to convert
     * @returns {[line: number, column: number]|null} an array containing [line, column] or null if the specified index is out of bounds
     */
    getCharacterPosition(index) {
        if (index < 0 || index > this.length) return null;
        for (let lineIndex = 0; lineIndex < this.lines.length; lineIndex++) {
            const lineObj = this.lines[lineIndex];
            if (index - lineObj.length < 0) {
                // We found the line
                return [lineIndex, index];
            } else {
                index-=lineObj.length;
            }
        }
        // We should never reach this point
        console.error("what the fuck");
        return null;
    }
    /**
     * Returns the character offset of a character position.
     * @param {number} line the line index
     * @param {number} column the column
     * @returns {number} the offset
     */
    getCharacterOffset(line, column) {
        if (line < 0 || line > this.lines.length-1) return null;
        let offset = 0;
        for (let lineIndex = 0; lineIndex < line; lineIndex++) {
            const lineObj = this.lines[lineIndex];
            offset+=lineObj.length;
        }
        offset += column;
        let lineObj = this.lines[line];
        if (column > lineObj.length) return null;
        else return offset;
    }
    /**
     * Creates a cursor object
     * @param {number} line the line to create the cursor at
     * @param {number} column the column to create the cursor at
     * @returns {TextCursor} the created cursor
     */
    createCursor(line, column) {
        let offset = this.getCharacterOffset(line, column);
        let cursor = new TextCursor(this, offset, line, column);
        this.cursors.push(cursor);
        return cursor;
    }
    removeDuplicateCursors() {
        let map = {};
        for (let i = 0; i < this.cursors.length; i++) {
            const cursor = this.cursors[i];
            let key = cursor.line + "," + cursor.currentColumn;
            if (map[key]) {
                delete this.cursors[i];
                i--;
            } else {
                map[key] = cursor;
            }
        }
    }
    clearCursors() {
        for (let i = 1; i < this.cursors.length; i++) {
            delete this.cursors[i];
        }
    }
}
class TextCursor {
    /**
     * The owning TextEditor instance.
     * @type {TextEditor}
     */
    textEditor;
    /**
     * The offset in the text as a number.
     * @type {number}
     */
    position;
    /**
     * The line number.
     * @type {number}
     */
    line;
    /**
     * The column number
     * @type {number}
     */
    currentColumn;
    /**
     * The desired column number
     * @type {number}
     */
    desiredColumn;
    /**
     * The cursor HTMLElement object.
     * @type {HTMLElement}
     */
    obj;
    /**
     * The cooldown timeout ID of the blinking animation start.
     * @type {number|null}
     */
    blinkTimeoutId;
    /**
     * Creates a cursor.
     * @param {TextEditor} textEditor the owning TextEditor
     * @param {number} position the offset in the text
     * @param {number} line the line number
     * @param {number} column the column number
     */
    constructor(textEditor, position, line, column) {
        this.textEditor = textEditor;
        this.position = position;
        this.line = line;
        this.currentColumn = column;
        this.desiredColumn = column;
        this.obj = newObj("div");
        this.refresh();
        textEditor.linesCursorRootObj.appendChild(this.obj);
    }
    /**
     * Refreshes the cursor visually.
     */
    refresh() {
        console.log("position:", this.position, "line:", this.line, "column:", this.currentColumn);
        this.obj.style.top = this.line * 1.3 + "em"
        this.obj.style.left = this.currentColumn * 9.6 + "px";

        this.obj.classList.remove("blinking");
        if (this.blinkTimeoutId) clearTimeout(this.blinkTimeoutId);
        this.blinkTimeoutId = setTimeout(()=>this.obj.classList.add("blinking"), 500);
    }
    getLine() {
        return this.textEditor.lines[this.line];
    }
    isLastLine() {
        return this.line == this.textEditor.lines.length-1;
    }
    moveToOffset(offset) {
        let pos = this.textEditor.getCharacterPosition(offset);
        this.moveTo(pos[0], pos[1]);
    }
    /**
     * Moves to the specified position.
     * @param {number} line the line index to move to
     * @param {number} column the column to move to
     */
    moveTo(line, column) {
        line = Math.max(0, Math.min(line, this.textEditor.lines.length-1));
        column = Math.max(0, Math.min(column, this.textEditor.lines[line].length-(line == this.textEditor.lines.length-1 ? 0 : this.textEditor.lineSeparator.length)));
        if (line == this.line) {
            if (this.currentColumn == column) {
                // Do nothing
                return;
            }
            this.position += column-this.currentColumn;
            this.currentColumn = column;
        } else if (line < this.line) {
            let col = this.currentColumn;
            for (let i = this.line; i > line; i--) {
                this.position -= col;
                col = this.textEditor.lines[i-1].length;
            }
            this.position -= col-column;
            this.currentColumn = column;
        } else {
            let col = this.currentColumn;
            for (let i = this.line; i < line; i++) {
                this.position += this.textEditor.lines[i].length - col;
                col = 0;
            }
            this.position += column;
            this.currentColumn = column;
        }
        this.line = line;
        this.desiredColumn = column;
        this.refresh();
    }
    moveLeft() {
        if (this.currentColumn-1 < 0) {
            if (this.line == 0) {
                // we're at the last character of the last line, don't do anything
                return;
            } else {
                this.position-=this.textEditor.lineSeparator.length;
                this.line--;
                this.currentColumn = this.getLine().length-this.textEditor.lineSeparator.length;
            }
        } else {
            this.position--;
            this.currentColumn--;
        }
        this.desiredColumn = this.currentColumn;
        this.refresh();
        //TODO: clear selection
    }
    moveStart() {
        this.position = 0;
        this.line = 0;
        this.currentColumn = 0;
        this.desiredColumn = this.currentColumn;
        this.refresh();
        //TODO: clear selection
    }
    moveLineStart() {
        this.position -= this.currentColumn;
        this.currentColumn = 0;
        this.desiredColumn = this.currentColumn;
        this.refresh();
        //TODO: clear selection
    }
    moveRight() {
        let lineOffset = this.isLastLine() ? 0 : this.textEditor.lineSeparator.length;
        if (this.currentColumn+1 > this.getLine().length-lineOffset) {
            if (this.isLastLine()) {
                // we're at the last character of the last line, don't do anything
                return;
            } else {
                this.position+=lineOffset;
                this.currentColumn = 0;
                this.line++;
            }
        } else {
            this.position++;
            this.currentColumn++;
        }
        this.desiredColumn = this.currentColumn;
        this.refresh();
        //TODO: clear selection
    }
    moveEnd() {
        this.position = this.textEditor.length;
        this.line = this.textEditor.lines.length-1;
        this.currentColumn = this.getLine().length;
        this.desiredColumn = this.currentColumn;
        this.refresh();
        //TODO: clear selection
    }
    moveLineEnd() {
        this.position += this.getLine().length - this.textEditor.lineSeparator.length - this.currentColumn;
        this.currentColumn = this.getLine().length - this.textEditor.lineSeparator.length;
        this.desiredColumn = this.currentColumn;
        this.refresh();
        //TODO: clear selection
    }
    moveUp() {
        if (this.line == 0) {
            if (this.currentColumn == 0) {
                // do nothing
                return;
            } else {
                this.currentColumn = 0;
                this.position = 0;
            }
        } else {
            this.line--;
            this.position -= this.currentColumn;
            if (this.desiredColumn > this.getLine().length-this.textEditor.lineSeparator.length) {
                this.currentColumn = this.getLine().length-this.textEditor.lineSeparator.length;
                this.position -= this.textEditor.lineSeparator.length;
            } else {
                this.currentColumn = this.desiredColumn;
                this.position -= this.getLine().length-this.desiredColumn;
            }
        }
        this.refresh();
        //TODO: clear selection
    }
    moveDown() {
        if (this.isLastLine()) {
            if (this.currentColumn == this.getLine().length) {
                // do nothing
                return;
            } else {
                this.position += this.getLine().length
                this.currentColumn = this.getLine().length;
            }
        } else {
            this.position += this.getLine().length - this.currentColumn;
            this.line++;
            if (this.desiredColumn > this.getLine().length-this.textEditor.lineSeparator.length) {
                this.currentColumn = this.getLine().length-this.textEditor.lineSeparator.length;
                this.position += this.getLine().length-this.textEditor.lineSeparator.length;
            } else {
                this.currentColumn = this.desiredColumn;
                this.position += this.desiredColumn;
            }
        }
        this.refresh();
        //TODO: clear selection
    }
}
class TextToken {

}
class TextReader {
    /**
     * @type {string}
     */
    _text;
    /**
     * @type {number}
     */
    _cursor;
    constructor(text, cursor=0) {
        this._text = text;
        this._cursor = cursor;
    }
    peek(offset=0) {
        return this._text.charAt(this._cursor+offset);
    }
    skip(amount=1) {
        this._cursor+=amount;
        return this;
    }
    skipUntil(target) {
        let targetIndex = this._text.indexOf(target, this._cursor);
        if (targetIndex > -1) this._cursor = targetIndex;
        return this;
    }
    getUntil(target) {
        let targetIndex = this._text.indexOf(target, this._cursor);
        if (targetIndex == -1) return null;
        let result = this._text.substring(this._cursor, targetIndex);
        this._cursor = targetIndex;
        return result;
    }

}
class TextEditorLinter {
    _editor;
    constructor(editor) {
        this._editor = editor;
    }
    group(wholeText) {
        return {start: 0}
    }
}
class GenericJsonLinter extends TextEditorLinter {

}
class ImageEditor extends Editor {
    /**
     * @type {HTMLCanvasElement}
     */
    _canvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    _ctx;

    /**
     * @type {HTMLCanvasElement}
     */
    _renderingCanvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    _renderCtx;
    _cameraX;
    _cameraY;
    /**
     * @type {number}
     */
    _zoomCount;
    /**
     * Creates a new ImageEditor.
     * @param {Page} page the page
     * @param {FileAccessor} file the file
     * @param {*} options an optional object containing editor settings
     */
    constructor(page, file, options) {
        super("editor_image", page, file, options);
        this._canvas = document.createElement("canvas");
        
        this._renderingCanvas = document.createElement("canvas");
        this._renderCtx = this._renderingCanvas.getContext("2d");
        let body = page.getBodyElement();
        body.appendChild(this._renderingCanvas);
        body.onresize = ()=>{
            this._renderingCanvas.width = body.clientWidth;
            this._renderingCanvas.height = body.clientHeight;
            this._repaint();
        }
        this._renderingCanvas.width = body.clientWidth;
        this._renderingCanvas.height = body.clientHeight;

        this._renderingCanvas.onwheel = (e)=>{
            this._zoom(Math.sign(e.wheelDelta), e.layerX, e.layerY);
        };

        this._zoomCount = 5;
        this._cameraX = 0;
        this._cameraY = 0;

        console.log(this);
        this._loadImage();
    }
    static zúm = Math.sqrt(2);
    _pixelSize(offset=0) {
        return Math.floor(Math.pow(ImageEditor.zúm, this._zoomCount+offset));
    }
    _zoom(amount, focusX, focusY) {
        let W = this._renderingCanvas.width;
        let H = this._renderingCanvas.height;
        let w = this._canvas.width;
        let h = this._canvas.height;

        let ops = this._pixelSize();
        let nps = this._pixelSize(amount);

        if (nps < 1 || nps > Math.max(W, H)/5) return;

        let cx = focusX-(W/2)-this._cameraX;
        let cy = focusY-(H/2)-this._cameraY;
        this._cameraX += cx - (cx/ops)*nps;
        this._cameraY += cy - (cy/ops)*nps;

        this._zoomCount += amount;
        this._repaint();
    }
    async _loadImage() {
        let img = await loadImage("data:image/png;base64," + btoa(String.fromCharCode(...new Uint8Array(await (await this._file.readBlob()).arrayBuffer()))));
        
        this._canvas.width = img.naturalWidth;
        this._canvas.height = img.naturalHeight;
        this._ctx = this._canvas.getContext("2d");
        this._ctx.drawImage(img, 0, 0);
        this._repaint();
    }
    static gridSize = 20;
    static gridColorA = "#bbe3";
    static gridColorB = "#4443";
    static borderStyle = "#eee solid 2px";
    _screenToImgX(screenX) {
        return (screenX-this._cameraX)/this._pixelSize();
    }
    _screenToImgY(screenY) {
        return (screenY-this._cameraY)/this._pixelSize();
    }
    _repaint() {
        this._renderCtx.imageSmoothingEnabled = false;
        let pixelSize = this._pixelSize();

        let W = this._renderingCanvas.width;
        let H = this._renderingCanvas.height;
        let ow = this._canvas.width;
        let oh = this._canvas.height;

        let mw = ow * pixelSize;
        let mh = oh * pixelSize;

        this._renderCtx.clearRect(0, 0, W, H);

        let cornerX = (W/2)+this._cameraX-(mw/2);
        let cornerY = (H/2)+this._cameraY-(mh/2);

        let renderCornerX = Math.min(Math.max(0, cornerX), W);
        let renderCornerY = Math.min(Math.max(0, cornerY), H);

        let renderWidth = Math.min(Math.max(0, cornerX+mw), W) - renderCornerX;
        let renderHeight = Math.min(Math.max(0, cornerY+mh), H) - renderCornerY;

        /* Texture Border */
        this._renderCtx.strokeStyle = ImageEditor.borderStyle;
        this._renderCtx.strokeRect(renderCornerX, renderCornerY, renderWidth, renderHeight);

        let gridSize = ImageEditor.gridSize;
        let gridMinX = Math.floor(renderCornerX/gridSize)*gridSize;
        let gridMinY = Math.floor(renderCornerY/gridSize)*gridSize;
        
        let gridMaxX = Math.ceil((renderCornerX+renderWidth)/gridSize)*gridSize;
        let gridMaxY = Math.ceil((renderCornerY+renderHeight)/gridSize)*gridSize;

        for (let y = gridMinY; y < gridMaxY; y+=gridSize) {
            let actualY = y < renderCornerY ? renderCornerY : y;
            let actualHeight = actualY+gridSize > renderCornerY+renderHeight ? renderCornerY+renderHeight-actualY : y < renderCornerY ? y+gridSize-renderCornerY : gridSize;
            for (let x = gridMinX; x < gridMaxX; x+=gridSize) {
                let actualX = x < renderCornerX ? renderCornerX : x;
                let actualWidth = actualX+gridSize > renderCornerX+renderWidth ? renderCornerX+renderWidth-actualX : x < renderCornerX ? x+gridSize-renderCornerX : gridSize;
                this._renderCtx.fillStyle = ((y+x)/gridSize) % 2 == 0 ? ImageEditor.gridColorA : ImageEditor.gridColorB;
                this._renderCtx.fillRect(actualX, actualY, actualWidth, actualHeight);
            }
        }
        this._renderCtx.drawImage(this._canvas, (renderCornerX-cornerX)/pixelSize, (renderCornerY-cornerY)/pixelSize, renderWidth/pixelSize, renderHeight/pixelSize, renderCornerX, renderCornerY, renderWidth, renderHeight);
    }
}