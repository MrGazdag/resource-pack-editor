import RPEBrowserLocalSavedEntry from "./RPEBrowserLocalSavedEntry";

export default interface RPEBrowserLocalSavedProject {
    projectID: string,
    files: {[referenceID: string]: RPEBrowserLocalSavedEntry}
}