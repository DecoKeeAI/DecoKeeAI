import {app} from "electron";
import path from "path";
import {PLUGIN_INSTALL_PATH} from "@/main/managers/resources";
import {checkPortRange} from "@/utils/Utils";

export default class {
    constructor(storeManager) {
        const express = require('express');
        const expressApp = express();

        const pluginExpressApp = express();

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            expressApp.use(express.static(path.join(__dirname, '../public/plugin/VIA')));
        } else {
            expressApp.use(express.static(path.join(__dirname, 'plugin/VIA')));
        }

        const userDataPath = app.getPath("userData");
        pluginExpressApp.use(express.static(path.join(userDataPath, PLUGIN_INSTALL_PATH)));

        let viaPluginPort = undefined, pluginServerPort = undefined;

        const that = this;

        checkPortRange(20240, 20260).then(results => {
            for (let i = 0; i < results.length; i++) {
                if (viaPluginPort && pluginServerPort) return;
                const result = results[i];

                if (result.taken) {
                    continue;
                }

                if (!viaPluginPort) {
                    viaPluginPort = result.port;

                    storeManager.storeSet('serverPorts.viaPluginPort', viaPluginPort);

                    that.expressServer = expressApp.listen(viaPluginPort, () => {
                        console.log('HTTPExpress: via plugin server listen on ' + viaPluginPort);
                    });
                    continue;
                }

                pluginServerPort = result.port;

                storeManager.storeSet('serverPorts.pluginWebPageServerPort', pluginServerPort);

                that.pluginAppServer = pluginExpressApp.listen(pluginServerPort, () => {
                    console.log('HTTPExpress: pluginExpressApp listen on ' + pluginServerPort);
                });
            }
        }).catch(error => {
            console.error('HTTPExpress: Error checking ports:', error);
        });
    }

    destroy() {
        console.log('express Server: destroy');
        return new Promise((resolve) => {
            const destroyTimeoutTask = setTimeout(() => {
                console.log('express Server: destroy timeout');
                needFinishedCount = 0;
                resolve();
            }, 3000);

            let needFinishedCount = 2;

            if (this.expressServer) {
                console.log('express Server: destroy expressServer');
                this.expressServer.close((e) => {
                    console.log('express server: Stop. ', e)
                    this.expressServer = undefined;
                    needFinishedCount -= 1;
                    if (needFinishedCount <= 0) {
                        clearTimeout(destroyTimeoutTask);
                        resolve();
                    }
                });
            } else {
                needFinishedCount -= 1;
            }

            if (this.pluginAppServer) {
                console.log('express Server: destroy pluginAppServer');
                this.pluginAppServer.close((e) => {
                    console.log('pluginExpress server: Stop. ', e)
                    needFinishedCount -= 1;
                    this.pluginExpressApp = undefined;
                    if (needFinishedCount <= 0) {
                        clearTimeout(destroyTimeoutTask);
                        resolve();
                    }
                });
            } else {
                needFinishedCount -= 1;
            }

            if (needFinishedCount <= 0) {
                clearTimeout(destroyTimeoutTask);
                resolve();
            }
        });
    }
}
