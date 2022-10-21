const MinecraftVersions = {
    /**
     * @type {Array<{id: string, type: string, url: string, time: string, releaseTime: string, sha1: string, complianceLevel: number, packVersion: number, versionRange: {id: string, name: string}, majorVersion: string}>}
     */
    _versionArray: null,
    
    /**
     * @type {{[versionId: string]: {id: string, type: string, url: string, time: string, releaseTime: string, sha1: string, complianceLevel: number}}>}
     */
    _versionMap: null,
    _latest: null,
    _versionsLoading: null,
    /**
     * @type {{[versionId: string]: boolean}}
     */
    _supportedVersions: null,

    /**
     * @type {{version: number, firstVersion: string, lastVersion: string, firstPretty: string, lastPretty: string}[]}
     */
    _packVersions: null,

    _minecraftIconUrl: null,

    async _init() {
        await this.loadVersions();
    },
    async _loadVersionsImpl() {
        let packEditorDataFetch = fetch("assets/data/rpe.json");
        let manifestData = await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json();
        this._versionArray = [];
        this._versionMap = {};
        for (let i = 0; i < manifestData.versions.length; i++) {
            const ver = manifestData.versions[i];
            let index = manifestData.versions.length-i-1;
            this._versionArray[index] = ver;
            this._versionMap[ver.id] = ver;
            ver.index = index;
        }
        this._latest = this._versionMap[manifestData.latest.release];
        let packEditorData = await (await packEditorDataFetch).json();
        this._supportedVersions = {};
        for (let key of packEditorData.supportedVersions) {
            this._supportedVersions[key] = true;
        }
        for (let key of Object.keys(packEditorData.namedVersions)) {
            this._versionMap[key].name = packEditorData.namedVersions[key];
        }
        this._packVersions = packEditorData.packVersions;

        let versionRangeIndex = 0;
        let currentMajorVersion = null;
        let currentMajorRegex = null;
        let packVerIndex = 0;
        let majorVersions = [];
        let releaseIndices = [];
        let releases = [];
        for (let i = 0; i < this._versionArray.length; i++) {
            const element = this._versionArray[i];
            if (this._packVersions.length-1 > packVerIndex && this._packVersions[packVerIndex+1].firstVersion == element.id) {
                packVerIndex++;
            }
            element.packVersion = this._packVersions[packVerIndex].version;

            if (packEditorData.versionRanges.length-1 > versionRangeIndex && packEditorData.versionRanges[versionRangeIndex+1].firstVersion == element.id) {
                versionRangeIndex++;
                currentMajorVersion = null;
                currentMajorRegex = new RegExp(packEditorData.versionRanges[versionRangeIndex].dynamicMajorVersions);
            }
            element.versionRange = packEditorData.versionRanges[versionRangeIndex];
            if (element.versionRange.dynamicMajorVersions != null) {
                if (currentMajorRegex.test(element.id)) {
                    currentMajorVersion = element.id;
                    majorVersions.push(element.id);
                }
            }
            element.majorVersion = currentMajorVersion;
            if (element.type == "release") {
                releaseIndices.push(i);
                releases.push(element.id);
            }
        }
        let nextReleaseIndex = 0;
        majorVersions.push("Next Major Release");
        for (let i = 0; i < this._versionArray.length; i++) {
            const element = this._versionArray[i];
            if (element.type == "snapshot") {
                if (i > releaseIndices[nextReleaseIndex]) nextReleaseIndex++;
                if (majorVersions.indexOf(releases[nextReleaseIndex]) > -1) {
                    // next release is a major release, lets move the snapshots around
                    let oldMajor = element.majorVersion;
                    element.majorVersion = majorVersions[majorVersions.indexOf(element.majorVersion)+1];
                }
            }
        }
    },
    async loadVersions() {
        console.log("Loading Minecraft Version data...");
        let promise = this._loadVersionsImpl();
        this._versionsLoading = promise;
        promise.then(()=>{
            console.log("Minecraft Version data has been loaded.");
            this._versionsLoading = null;
        });
        return promise;
    },
    async awaitVersionLoad() {
        return this._versionsLoading != null ? this._versionsLoading : Promise.resolve();
    },
    async getVersionArray() {
        return this.awaitVersionLoad().then(()=>this._versionArray);
    },
    async loadDataOf(version) {
        if (version.type != "release") return {error: "invalid version type (" + version.type + ")"}
        console.log("Loading client json for " + version.id + "...");
        let clientJson = await (await fetch(version.url)).json();
        console.log("Downloading client jar for " + version.id + "...");
        let clientJarBlob = await (await fetch(clientJson.downloads.client.url)).blob();

        console.log("Extracting client jar for " + version.id + "...");
        let zipReader = new zip.ZipReader(new zip.BlobReader(clientJarBlob));
        let zipEntriesArray = await zipReader.getEntries();
        console.log("Finding version data for " + version.id + "...");
        let versionJsonFile = zipEntriesArray.find((o)=>{return o.filename == "version.json"})
        let versionJson = JSON.parse(await versionJsonFile.getData(new zip.TextWriter()));
        console.log(versionJson); //aabb
        return versionJson;
    },
    async loadJar(version) {
        console.log("Loading client json for " + version.id + "...");
        let clientJson = await (await fetch(version.url)).json();
        console.log("Downloading client jar for " + version.id + "...");
        let clientJarBlob = await (await fetch(clientJson.downloads.client.url, {credentials: 'omit'})).blob();
        console.log("Extracting client jar for " + version.id + "...");
        return new zip.ZipReader(new zip.BlobReader(clientJarBlob));
    },
    getLatest() {
        return this._versions[this._latest];
    },
    async getPackVersions() {
        return this.awaitVersionLoad().then(()=>this._packVersions);
    },
    async getMinecraftIconUrl() {
        if (this._minecraftIconUrl != null) return this._minecraftIconUrl;
        console.log("Loading Minecraft icon...");

        let reject;
        let resolve;

        let promise = new Promise((res, rej)=>{
            reject = rej;
            resolve = res;
        });

        let xhr = new XMLHttpRequest();
        xhr.open("POST", "https://storeedgefd.dsx.mp.microsoft.com/v8.0/sdk/products?market=US&locale=en-US&deviceFamily=Windows.Desktop");

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let json = JSON.parse(xhr.responseText);
                let images = json.Products[0].LocalizedProperties[0].Images;
                let chosen = images[0];
                for (let image of images) {
                    if (image.ImagePurpose == "Logo") {
                        chosen = image;
                        break;
                    }
                }
                console.log("Minecraft icon loaded!");
                MinecraftVersions._minecraftIconUrl = "https:" + chosen.Uri;
                resolve(MinecraftVersions._minecraftIconUrl);
            }
        };

        xhr.onerror = reject;

        xhr.send('{"productIds": "9PGW18NPBZV5"}'); // Minecraft Launcher Product ID
        return promise;
    }
};
MinecraftVersions._init();
var loadedVersions = {};
var loadAllVersions = async function(){
    await MinecraftVersions._init();
    for (let key of Object.keys(MinecraftVersions._versions)) {
        MinecraftVersions.loadDataOf(MinecraftVersions._versions[key]).then((versionJson)=>{
            loadedVersions[key] = versionJson;
        }).catch((error)=>{
            loadedVersions[key] = {error: error};
        });
    }
};
class ZipReaderWrapper {
    _url;
    _zipReader;
    _entries;
    constructor(url) {
        this._url = url;
    }
    async _getReader() {
        if (this._zipReader == null) {
            return new zip.ZipReader(new zip.BlobReader(await (await fetch(this._url)).blob()));
        }
        return this._zipReader;
    }
    async getEntries() {
        if (this._entries == null) {
            this._entries = await this._getReader().getEntries();
        }
        return this._entries;
    }
    close() {
        this._zipReader.close();
        this._zipReader = null;
        this._entries = null;
    }
}

class RPEVersionData {
    /**
     * @type {{id: string, type: string, url: string, time: string, releaseTime: string, sha1: string, complianceLevel: number}}
     */
    _versionData;
    _packVersion;
    _files;
    _zipWrapper;
    constructor(versionData) {
        this._versionData = versionData;
        
    }
    async _init() {
        this._files = {};
        
    }
}

class MCObjectType {
    _id;
    constructor(id) {
        this._id = id;
    }
}

class MCFeature {
    validate() {

    }
}

async function testVersionTree() {
    let tree = {};
    let currentRange = null;
    let currentMajorVer = null;
    for (let ver of await MinecraftVersions.getVersionArray()) {
        if (currentRange != ver.versionRange) {
            currentRange = ver.versionRange;
            tree[currentRange.id] = ver.majorVersion == null ? [] : {};
            currentMajorVer = null;
        }
        if (currentMajorVer != ver.majorVersion) {
            currentMajorVer = ver.majorVersion;
            tree[currentRange.id][currentMajorVer] = [];
        }
        (currentMajorVer == null ? tree[currentRange.id] : tree[currentRange.id][currentMajorVer]).push(ver);
    }
    return tree;
}