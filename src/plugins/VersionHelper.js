import { axios } from './request'
import config from "../../package.json";

export const updateConfigs = {
    versionCheckUrl: "http://fota.matrixz.cn/decokee-ai/update/latest.json",
    downloadUrlPrefix: "http://fota.matrixz.cn/decokee-ai/update/"
}

export function checkUpdate() {
    return axios({
        url: updateConfigs.versionCheckUrl,
        method: "GET"
    }).then(res => {
        console.log("checkUpdate: ", res);
        const latestVersion = res.version;
        const currentVersion = config.version;

        if (latestVersion === currentVersion) {
            return {
                haveUpdate: false,
                version: currentVersion
            };
        }

        const latestVersionInfo = latestVersion.trim().split('.');
        if (latestVersionInfo.length !== 3) {
            console.log("checkUpdate: Version info not correct. Ignore version check.");
            return {
                haveUpdate: false,
                version: currentVersion
            };
        }

        const currentVersionInfo = currentVersion.trim().split('.');

        let cmpResult;
        console.log("checkUpdate: Check for updates: latest: ", latestVersionInfo, " Current: ", currentVersionInfo);
        for (let i = 0; i < 3; i++) {
            cmpResult = parseInt(latestVersionInfo[i]) - parseInt(currentVersionInfo[i]);
            if (cmpResult > 0) {
                return {
                    haveUpdate: true,
                    version: latestVersion
                };
            } else if (cmpResult < 0) {
                return {
                    haveUpdate: false,
                    version: currentVersion
                };
            }
        }

        return {
            haveUpdate: false,
            version: currentVersion
        };
    }).catch(err => {
        console.error('checkUpdate: Detected error', err);
    });
}
