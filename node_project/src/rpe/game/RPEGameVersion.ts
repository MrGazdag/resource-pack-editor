import SupportLevel from "./SupportLevel";

/**
 * Represents a version of the game. This does
 * not necessarily mean that the version is supported
 * by the editor.
 */
export default class RPEGameVersion {
    /**
     * The ID of this Game Version.
     */
    id: string;
    /**
     * The name of this Game Version.
     */
    name: string;
    /**
     * An array of version groups this
     * Game Version belongs in. This might be used
     * for denoting major/minor versions,
     * or development phases.
     * ```
     * ["Alpha", "0.3"] // Alpha version 0.3.4 would belong here
     * ["1", "4"] // Version 1.4.9 would belong here
     * ```
     * 
     * This can even be used to indicate multiple groups,
     * for example:
     * ```
     * ["Release/1.19.3", "Release/1.20"] // An intermediate development version could apply to both releases
     * ```
     * 
     * The usage of this field therefore is completely up to the game.
     */
    groups: string[];
    /**
     * The support level of this version.
     * This can be one of the following values:
     * 
     * - {@link SupportLevel.NO_SUPPORT NO_SUPPORT}: the version is currently not supported
     * - {@link SupportLevel.PARTIAL_SUPPORT PARTIAL_SUPPORT} the version is partially supported, not all features work/are enabled, or support is experimental
     * - {@link SupportLevel.FULL_SUPPORT FULL_SUPPORT}: the version is fully supported, and all features are enabled
     * - {@link SupportLevel.UNKNOWN_SUPPORT UNKNOWN_SUPPORT}: it is unknown whether this version is supported
     */
    supportLevel: SupportLevel;
    /**
     * Whether this version is a development/beta build of the game.
     */
    developmentVersion: boolean;
    /**
     * Contains information about the features this
     * version supports. The keys in this object denote
     * the feature's ID. The value can be a number, denoting 
     * the {@link SupportLevel support level} of the feature:
     * ```
     * {
     *   "images": SupportLevel.FULL_SUPPORT,
     *   "models": SupportLevel.PARTIAL_SUPPORT,
     *   "fonts": SupportLevel.NO_SUPPORT,
     *   "sounds": SupportLevel.UNKNOWN_SUPPORT
     * }
     * ```
     * If there is additional information present regarding the
     * support of a feature, then the value will be an object,
     * containing the `value` field (as described above), and an
     * `info` field:
     * ```
     * {
     *   "images": SupportLevel.FULL_SUPPORT,
     *   "models": {
     *     "value": SupportLevel.PARTIAL_SUPPORT,
     *     "info": "Player models are not supported."
     *   },
     *   "fonts": SupportLevel.NO_SUPPORT,
     *   "sounds": SupportLevel.UNKNOWN_SUPPORT
     * }
     * ```
     * If a feature is not present in this set, it's SupportLevel is
     * assumed to be {@link SupportLevel.UNKNOWN_SUPPORT unknown}.
     */
    featureSet: { [featureId: string]: SupportLevel | { value: SupportLevel; info: string; }; };
    /**
     * Creates an RPEGameVersion instance.
     * @param id the ID of this Game Version
     * @param name the name of this Game Version
     * @param groups a list of groups
     * @param supportLevel the support level of this version
     * @param developmentVersion whether this version is a development build
     * @param featureSet an object containing information about supported features
     */
    constructor(id: string, name: string, groups: string[], supportLevel: number, developmentVersion: boolean, featureSet: { [featureId: string]: SupportLevel | { value: SupportLevel; info: string; }; }) {
        this.id = id;
        this.name = name;
        this.groups = groups;
        this.supportLevel = supportLevel;
        this.developmentVersion = developmentVersion;
        this.featureSet = featureSet;
    }
}