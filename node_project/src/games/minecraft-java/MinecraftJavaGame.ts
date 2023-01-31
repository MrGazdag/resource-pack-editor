import RPEGame from "../../rpe/game/RPEGame";
import RPEGameVersion from "../../rpe/game/RPEGameVersion";
import Future from "../../rpe/util/Future";

export default class MinecraftJavaGame extends RPEGame {
    constructor() {
        super("minecraft-java");
        this.multiVersion = true;
    }

    _loadAvailableGameVersions() {
        return Future.asyncFuture(async ()=>{
            let array = [];
            let map = new Map();
            let knownVersionsFetch = this.loadResource("version_info.json");
            /**@type {{
                latest: {
                    release: string,
                    snapshot: string
                },
                versions: {
                    id: string,
                    type: "old_alpha"|"old_beta"|"release"|"snapshot",
                    url: string,
                    time: string,
                    releaseTime: string,
                    sha1: string,
                    complianceLevel: number
                }[]
            }}*/ 
            let manifestData = await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json();
            for (let i = manifestData.versions.length-1; i >= 0; i--) {
                const element = manifestData.versions[i];
                let ver = null;
            }
            
            let knownVersions = await (await knownVersionsFetch).json();
            let unknownArray = [];
            return array;
        });
    }
    getLatestSupportedVersion(): RPEGameVersion {
        throw new Error("Method not implemented.");
    }
}