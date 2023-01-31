import Future from "./Future";

const Utils = {
    SVG_NAMESPACE: "http://www.w3.org/2000/svg",
    XLINK_NAMESPACE: "http://www.w3.org/1999/xlink",
    NATURAL_COLLATOR: new Intl.Collator(undefined, {numeric: true}),
    /**
     * Returns the contents of the specified url.
     * @param url the URL to get
     * @param optionsConsumer request init data
     * @param progressConsumer a callback containing 
     */
    async getLargeFileBlob(url: string, fetchOptions: RequestInit, progressConsumer: (read: number, length: number) => void) {
        let fetchResult = await fetch(url, fetchOptions);
        let reader = fetchResult.body.getReader();
        let array = [];
        let read = 0;
        let length = parseInt(fetchResult.headers.get("Content-Length"));
        if (!progressConsumer) progressConsumer = ()=>{};
        while (true) {
            let result = await reader.read();
            if (result.done) break;
            read += result.value.length;
            progressConsumer(read, length);
            array.push(result.value);
        }
        return new Blob(array);
    },
    /**
     * Creates a new HTML element, and optionally adds an ID and/or classes to it.
     * @param type the type of the element (e.g. div)
     * @param parent an optional parent to add this element to
     * @param id an optional id to add to this element
     * @param classes an optional list of classes to add to this element
     * @returns the resulting HTMLElement
     */
    dom(type: string, parent: Node | undefined, id: string | undefined, ...classes: string[]): HTMLElement {
        let e = document.createElement(type);
        if (id) e.id = id;
        if (classes && classes.length > 0) e.classList.add(...classes);
        if (parent) parent.appendChild(e);
        return e;
    },
    /**
     * Creates a new namespaced HTML element, and optionally adds an ID and/or classes to it.
     * @param namespace the namespace of this element (e.g. http://www.w3.org/2000/svg)
     * @param type the type of the element (e.g. div)
     * @param parent an optional parent to add this element to
     * @param id an optional id to add to this element
     * @param  {...string} classes an optional list of classes to add to this element
     * @returns the resulting HTMLElement
     */
    domNS(namespace: string, type: string, parent: Node | undefined, id: string | undefined, ...classes: string[]): Element {
        let e = document.createElementNS(namespace, type);
        if (id) e.id = id;
        if (classes && classes.length > 0) e.classList.add(...classes);
        if (parent) parent.appendChild(e);
        return e;
    },
    /**
     * Creates a new <svg> element, with a <use> element containing a link, and optionally adds an ID and/or classes to it.
     * @param useLink the link to use within the <use> element (the xlink:href property)
     * @param id an optional id to add to this element
     * @param  {...string} classes an optional list of classes to add to this element
     * @returns the resulting HTMLElement
     */
    svgUse(useLink: string, id: string | undefined, ...classes: string[]): HTMLElement {
        let svg = this.domNS(this.SVG_NAMESPACE, "svg", id, ...classes);
        let use = this.domNS(this.SVG_NAMESPACE, "use");
        use.setAttributeNS(this.XLINK_NAMESPACE, "xlink:href", useLink);
        svg.appendChild(use);
        return svg;
    },
    /**
     * Updates the specified <svg> object's <use> element link attribute to the specified value.
     * @param svg the svg acquired from newSvgUse()
     * @param newUseLink the new link
     */
    updateSvgUse(svg: HTMLElement, newUseLink: string) {
        svg.children[0].setAttributeNS(this.XLINK_NAMESPACE, "xlink:href", newUseLink);
    },
    /**
     * Clears the children elements of the specified element.
     * @param element the element
     */
    clearChildren(element: HTMLElement) {
        while (element.firstChild) {
            element.removeChild(element.lastChild);
        }
    },
    /**
     * Performs a binary search on the specified ordered array for the specified element.
     * If the object is found within the array, the index of the element is returned.
     * 
     * Let x be the position at which the element should be placed in the array.
     * If the object is not found within the array, this method will return -(x + 1).
     * @param array the ordered array to search
     * @param element the element to search for
     * @param compareFunction the function to use for comparing elements
     * @returns the index of the element, or the insertion index
     */
    binarySearch(array: Array<any>, element: any, compareFunction: (a: any, b: any) => number): number {
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
    },
    /**
     * Loads the image at the specified source URL in an asynchronous way.
     * @param src the URL to load the image from
     * @returns a Future which will complete with an Image object
     */
    loadImageAsync(src: string): Future<HTMLImageElement> {
        let f = new Future<HTMLImageElement>();
        const img = new Image();
        img.onload = () => f.complete(img);
        img.onerror = f.completeExceptionally;
        img.src = src;
        return f;
    },
    /**
     * Loads the specified script in an asynchronous way.
     * @param scriptSourceURL the URL of the script
     * @param parent the parent HTMLElement to append to
     * @returns a new Future
     */
    loadScript(scriptSourceURL: string, parent: HTMLElement=document.head): Future<void> {
        let future = new Future<void>();
        let script = this.dom("script");
        script.onload = ()=>future.complete();
        script.onerror = (e: Error)=>future.completeExceptionally(e);
        script.src = scriptSourceURL;
        return future;
    },

    /**
     * Returns a comparator function using natural sorting
     * for the specified type, using the specified string 
     * extractor function.
     * @param func string extractor function
     * @template T the original type
     * @returns the comparator function
     */
    naturalComparator<T>(func: (element: T) => string=a=>a?a.toString():"null"): (a: T, b: T) => number {
        return (a, b)=>{
            return this.NATURAL_COLLATOR.compare(func(a), func(b));
        };
    },

    /**
     * Sorts the array of type T `array` naturally, with
     * the string extractor function `func`.
     * @param array the array to sort
     * @param func the string extractor function
     * @returns the same array
     * @template T the original type 
     */
    naturalSort<T>(array: T[], func: (element: T) => string=a=>a?a.toString():"null"): T[] {
        array.sort(this.naturalComparator(func));
        return array;
    }
}
export default Utils;