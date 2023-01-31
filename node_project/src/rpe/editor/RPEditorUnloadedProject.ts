/**
 * Represents an unloaded project.
 */
export default class RPEditorUnloadedProject {
    /** */
    gameId: string;
    gameVersionString: string;
    projectId: string;
    projectName: string;
    projectType: string;
    data: any;
    /**
     * Creates a new unloaded project instance.
     * @param serialized the serialized data
     */
    constructor(serialized: any) {

    }
}