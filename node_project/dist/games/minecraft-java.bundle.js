"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkresourcepackeditor_browser"] = self["webpackChunkresourcepackeditor_browser"] || []).push([["games/minecraft-java"],{

/***/ "./src/games/minecraft-java/MinecraftJavaGame.ts":
/*!*******************************************************!*\
  !*** ./src/games/minecraft-java/MinecraftJavaGame.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MinecraftJavaGame)\n/* harmony export */ });\n/* harmony import */ var _rpe_game_RPEGame__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../rpe/game/RPEGame */ \"./src/rpe/game/RPEGame.ts\");\n/* harmony import */ var _rpe_util_Future__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../rpe/util/Future */ \"./src/rpe/util/Future.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\n\r\n\r\nclass MinecraftJavaGame extends _rpe_game_RPEGame__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\r\n    constructor() {\r\n        super(\"minecraft-java\");\r\n        this.multiVersion = true;\r\n    }\r\n    _loadAvailableGameVersions() {\r\n        return _rpe_util_Future__WEBPACK_IMPORTED_MODULE_1__[\"default\"].asyncFuture(() => __awaiter(this, void 0, void 0, function* () {\r\n            let array = [];\r\n            let map = new Map();\r\n            let knownVersionsFetch = this.loadResource(\"version_info.json\");\r\n            /**@type {{\r\n                latest: {\r\n                    release: string,\r\n                    snapshot: string\r\n                },\r\n                versions: {\r\n                    id: string,\r\n                    type: \"old_alpha\"|\"old_beta\"|\"release\"|\"snapshot\",\r\n                    url: string,\r\n                    time: string,\r\n                    releaseTime: string,\r\n                    sha1: string,\r\n                    complianceLevel: number\r\n                }[]\r\n            }}*/\r\n            let manifestData = yield (yield fetch(\"https://piston-meta.mojang.com/mc/game/version_manifest_v2.json\")).json();\r\n            for (let i = manifestData.versions.length - 1; i >= 0; i--) {\r\n                const element = manifestData.versions[i];\r\n                let ver = null;\r\n            }\r\n            let knownVersions = yield (yield knownVersionsFetch).json();\r\n            let unknownArray = [];\r\n            return array;\r\n        }));\r\n    }\r\n    getLatestSupportedVersion() {\r\n        throw new Error(\"Method not implemented.\");\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://resourcepackeditor-browser/./src/games/minecraft-java/MinecraftJavaGame.ts?");

/***/ }),

/***/ "./src/games/minecraft-java/index.ts":
/*!*******************************************!*\
  !*** ./src/games/minecraft-java/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _rpe_ResourcePackEditor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../rpe/ResourcePackEditor */ \"./src/rpe/ResourcePackEditor.ts\");\n/* harmony import */ var _MinecraftJavaGame__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MinecraftJavaGame */ \"./src/games/minecraft-java/MinecraftJavaGame.ts\");\n\r\n\r\n_rpe_ResourcePackEditor__WEBPACK_IMPORTED_MODULE_0__[\"default\"].registerGame(new _MinecraftJavaGame__WEBPACK_IMPORTED_MODULE_1__[\"default\"]());\r\n\n\n//# sourceURL=webpack://resourcepackeditor-browser/./src/games/minecraft-java/index.ts?");

/***/ }),

/***/ "./src/rpe/game/RPEGame.ts":
/*!*********************************!*\
  !*** ./src/rpe/game/RPEGame.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ RPEGame)\n/* harmony export */ });\n/* harmony import */ var _ResourcePackEditor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ResourcePackEditor */ \"./src/rpe/ResourcePackEditor.ts\");\n/* harmony import */ var _util_Future__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/Future */ \"./src/rpe/util/Future.ts\");\n\r\n\r\nclass RPEGame {\r\n    constructor(id) {\r\n        /**\r\n         * `true` if this game supports multiple\r\n         * versions, `false` if only the latest\r\n         * version is supported\r\n         */\r\n        this.multiVersion = false;\r\n        this.id = id;\r\n        this.entry = _ResourcePackEditor__WEBPACK_IMPORTED_MODULE_0__[\"default\"].availableGames.get(id);\r\n    }\r\n    /**\r\n     * Returns a Future which will be completed\r\n     * with the available game versions.\r\n     *\r\n     * After the first invocation, the Future will\r\n     * be cached.\r\n     * @returns a Future\r\n     */\r\n    getAvailableGameVersionsArray() {\r\n        if (this._availableVersionsArray)\r\n            return this._availableVersionsArray;\r\n        else\r\n            return this.reloadAvailableGameVersions().thenCompose((_) => {\r\n                return this._availableVersionsArray;\r\n            });\r\n    }\r\n    /**\r\n     * Returns a Future which will be completed\r\n     * with the available game versions.\r\n     *\r\n     * After the first invocation, the Future will\r\n     * be cached.\r\n     * @returns a Future\r\n     */\r\n    getAvailableGameVersionsMap() {\r\n        if (this._availableVersionsMap)\r\n            return this._availableVersionsMap;\r\n        else\r\n            return this.reloadAvailableGameVersions().thenCompose((_) => {\r\n                return this._availableVersionsMap;\r\n            });\r\n    }\r\n    /**\r\n     * Reloads the available game versions.\r\n     * @returns a Future\r\n     */\r\n    reloadAvailableGameVersions() {\r\n        if (this._availableVersionsMap && !this._availableVersionsMap.isDone())\r\n            return this._availableVersionsMap;\r\n        else {\r\n            this._availableVersionsArray = this._loadAvailableGameVersions();\r\n            this._availableVersionsMap = this._availableVersionsArray.thenApply(array => {\r\n                /**\r\n                 */\r\n                let map = new Map();\r\n                for (let version of array) {\r\n                    map.set(version.id, version);\r\n                }\r\n                return map;\r\n            });\r\n            return this._availableVersionsMap;\r\n        }\r\n    }\r\n    /**\r\n     * Returns a Future which will be completed\r\n     * with the specified version, or `null` if\r\n     * the specified version does not exist.\r\n     * @param version the version to search for\r\n     * @returns a Future\r\n     */\r\n    getGameVersion(version) {\r\n        return this.getAvailableGameVersionsMap().thenApply(map => {\r\n            return map.get(version);\r\n        });\r\n    }\r\n    /**\r\n     * Creates a RPEditorProject object for\r\n     * the specified RPEditor instance\r\n     * specialized for storing state data\r\n     * that is related to this game.\r\n     * @param editor the target editor\r\n     * @param options options for creating the project\r\n     * @returns a new RPEditorState\r\n     */\r\n    createProject(editor, options) {\r\n        return null; //TODO\r\n    }\r\n    /**\r\n     *\r\n     * @param editor the target editor\r\n     * @param projectData the serialized project data\r\n     * @returns\r\n     */\r\n    loadProject(editor, projectData) {\r\n        return null; // TODO\r\n    }\r\n    initializeEditor(editor, editorData, version) { }\r\n    /**\r\n     * Creates an RPEAssetSource object\r\n     * @param type the type of asset source to create\r\n     * @param data the existing data to load (or null if not present)\r\n     * @returns the created source, or null if it could not be created\r\n     */\r\n    createAssetSource(type, data) {\r\n        if (type == \"file\") {\r\n        }\r\n        return null; // TODO\r\n    }\r\n    /**\r\n     * Loads a resource for this game.\r\n     * @param path the path to the resource\r\n     * @returns a Future with the response\r\n     */\r\n    loadResource(path) {\r\n        return _util_Future__WEBPACK_IMPORTED_MODULE_1__[\"default\"].asyncFuture(fetch(\"assets/data/\" + this.id + \"/\" + path));\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://resourcepackeditor-browser/./src/rpe/game/RPEGame.ts?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/games/minecraft-java/index.ts"));
/******/ }
]);