import { axios } from './request'
import config from "../../package.json";

const UPDATE_CONFIG = [
    {
        versionCheckUrl: "https://raw.github.com/DecoKeeAI/DecoKeeAI/main/ota/latest.json",
        downloadUrlPrefix: "https://github.com/DecoKeeAI/DecoKeeAI/releases/download/V",
    },
    {
        versionCheckUrl: "https://gitee.com/decokeeai/decokee-ai/raw/main/ota/latest.json",
        downloadUrlPrefix: "https://gitee.com/decokeeai/decokee-ai/releases/download/V"
    }
]

export function checkUpdate(checkUpdateUriIdx = 0) {
    return new Promise((resolve) => {
        const currentVersion = config.version;

        const checkUpdateUrl = UPDATE_CONFIG[checkUpdateUriIdx].versionCheckUrl;
        console.log("checkUpdate: checkUpdateUrl: ", checkUpdateUrl);
        return axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            url: checkUpdateUrl,
            method: "GET"
        }).then(async res => {
            console.log("checkUpdate: ", res);

            if (!res || !res.version) {
                if (checkUpdateUriIdx >= UPDATE_CONFIG.length) {
                    resolve({
                        haveUpdate: false,
                        version: currentVersion
                    });
                    return;
                }

                resolve(await checkUpdate(checkUpdateUriIdx + 1));
                return;
            }

            const latestVersion = res.version;

            if (latestVersion === currentVersion) {
                resolve({
                    haveUpdate: false,
                    version: currentVersion
                });
                return;
            }

            const latestVersionInfo = latestVersion.trim().split('.');
            if (latestVersionInfo.length !== 3) {
                console.log("checkUpdate: Version info not correct. Ignore version check.");
                resolve({
                    haveUpdate: false,
                    version: currentVersion
                });
                return;
            }

            const currentVersionInfo = currentVersion.trim().split('.');

            let cmpResult;
            console.log("checkUpdate: Check for updates: latest: ", latestVersionInfo, " Current: ", currentVersionInfo);
            for (let i = 0; i < 3; i++) {
                cmpResult = parseInt(latestVersionInfo[i]) - parseInt(currentVersionInfo[i]);
                if (cmpResult > 0) {
                    resolve({
                        haveUpdate: true,
                        version: latestVersion,
                        downloadUrlPrefix: UPDATE_CONFIG[checkUpdateUriIdx].downloadUrlPrefix
                    });
                    return;
                } else if (cmpResult < 0) {
                    resolve({
                        haveUpdate: false,
                        version: currentVersion
                    });
                    return;
                }
            }

            resolve({
                haveUpdate: false,
                version: currentVersion
            });
        }).catch(async err=> {
            console.log('checkUpdate: Detected error', err);
            if (checkUpdateUriIdx >= UPDATE_CONFIG.length) {
                resolve({
                    haveUpdate: false,
                    version: currentVersion
                });
                return;
            }

            resolve(await checkUpdate(checkUpdateUriIdx + 1));
        });
    });
}
