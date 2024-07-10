import { axios } from './request'
import config from "../../package.json";

export const updateConfigs = {
    versionCheckUrl: "https://raw.github.com/DecoKeeAI/DecoKeeAI/main/ota/latest.json",
    downloadUrlPrefix: "https://github.com/DecoKeeAI/DecoKeeAI/releases/download/V",
    cnVersionCheckUrl: "https://gitee.com/decokeeai/decokee-ai/raw/main/ota/latest.json",
    cnDownloadUrlPrefix: "https://gitee.com/decokeeai/decokee-ai/releases/download/V"
}

export function checkUpdate(country) {
    const checkUpdateUrl = country === 'CN' ? updateConfigs.cnVersionCheckUrl : updateConfigs.versionCheckUrl;
    console.log("checkUpdate: checkUpdateUrl: ", checkUpdateUrl);
    return axios({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        url: checkUpdateUrl,
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
        console.log('checkUpdate: Detected error', err);
    });
}
