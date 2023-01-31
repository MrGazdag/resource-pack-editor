/**
 * Represents different levels of support
 * that is available on a given version/feature.
 */
enum SupportLevel {
    /**
     * The version is currently not supported.
     */
    NO_SUPPORT,
    /**
     * The version is partially supported, not all features work/are enabled, or support is experimental.
     */
    PARTIAL_SUPPORT,
    /**
     * The version is fully supported, and all features are enabled.
     */
    FULL_SUPPORT,
    /**
     * It is unknown whether this version is supported.
     */
    UNKNOWN_SUPPORT,
}
export default SupportLevel;