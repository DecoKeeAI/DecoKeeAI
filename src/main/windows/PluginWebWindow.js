import { BrowserWindow } from 'electron'

export default class PluginWebWindow {
    constructor(appManager, pluginDetail) {
        /* win代表electron窗口实例
         win is this electron window instance */
        this.storeManager = appManager.storeManager;
        this.pluginDetail = pluginDetail;
        let platform = 'windows';
        if (process.platform === 'darwin') {
            platform = 'mac';
        }

        this.inInfoParam = {
            application: {
                font: "sans-serif",
                    language: "zh_CN",
                    platform: platform,
                    platformVersion: "11.4.0",
                    version: "5.0.0.14247"
            },
            plugin: {
                uuid: pluginDetail.pluginId,
                    Version: pluginDetail.pluginVersion
            },
            devicePixelRatio: 2,
                colors: {
                buttonPressedBackgroundColor: "#303030FF",
                    buttonPressedBorderColor: "#646464FF",
                    buttonPressedTextColor: "#969696FF",
                    disabledColor: "#F7821B59",
                    highlightColor: "#F7821BFF",
                    mouseDownColor: "#CF6304FF"
            },
            devices: []
        }

        if (process.platform === 'win32') {
            this.inInfoParam.application.platform = 'windows';
        } else if (process.platform === 'darwin') {
            this.inInfoParam.application.platform = 'mac';
        }

        const currentLanguage = this.storeManager.storeGet('system.locale');

        if (currentLanguage === 'zh') {
            this.inInfoParam.application.language = 'zh_CN';
        } else {
            this.inInfoParam.application.language = 'en';
        }

        this._createWindow();
    }

    _initBrowserPage() {

        const that = this;

        setTimeout(() => {
            this._loadPluginWeb();
        }, 1000);

        this.win.on('closed', () => {
            that.win = null
            console.log('PluginWebWindow windows closed')
        })

        this.win.once('ready-to-show', () => {
            console.log('PluginWebWindow: ready-to-show ID: ', this.win.webContents.id);
            // if (process.env.WEBPACK_DEV_SERVER_URL) {
                /* 开发环境下自启动开发者工具
                  start developer tools in the development environment */
                // this.win.webContents.openDevTools({ mode: 'detach' })
            // }
            const that = this;
            setTimeout(() => {
                const pluginWSServerPort = this.storeManager.storeGet('serverPorts.pluginWSServerPort');

                this.win.webContents.executeJavaScript(`connectElgatoStreamDeckSocket(${pluginWSServerPort}, '${that.pluginDetail.pluginId}', 'registerPluginHandler', '${JSON.stringify(that.inInfoParam)}', '')`)
                    .then((result) => {
                        console.log('PluginWebWindow: ' + that.pluginDetail.pluginName + ' executeJavaScript result: ' + JSON.stringify(result));
                    })
                    .catch(err => {
                        console.log('PluginWebWindow: ' + that.pluginDetail.pluginName + ' executeJavaScript Error: ' + JSON.stringify(err));
                    })
            }, 1000);
        });
    }

    _loadPluginWeb() {
        const pluginServerPort = this.storeManager.storeGet('serverPorts.pluginWebPageServerPort');

        if (!pluginServerPort) {
            setTimeout(() => {
                this._loadPluginWeb();
            }, 1000);
            return;
        }

        const webPageUrl = 'http://localhost:' + pluginServerPort + '/' + this.pluginDetail.pluginId + '/' + this.pluginDetail.manifestInfo.CodePath;

        console.log('PluginWebWindow: PluginName: ' + this.pluginDetail.pluginName + ' LoadUrl: ' + webPageUrl);
        this.win.loadURL(webPageUrl);
    }

    _createWindow() {
        console.log('PluginWebWindow: createWindow');

        let win = null

        if (process.platform === 'win32') {
            win = new BrowserWindow({
                title: this.pluginDetail.pluginName,
                minWidth: 450,
                minHeight: 660,
                width: 450,
                height: 660,
                center: true,
                resizable: false,
                webPreferences: {
                    accessibleTitle: this.pluginDetail.pluginName,
                    contextIsolation: true,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
                      Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: true, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: false, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: true, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                    webviewTag: true
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.png`,
                frame: false,
                show: false,
                alwaysOnTop: false
            })
        } else {
            win = new BrowserWindow({
                title: this.pluginDetail.pluginName,
                minWidth: 450,
                minHeight: 660,
                width: 450,
                height: 660,
                center: true,
                resizable: false,
                webPreferences: {
                    accessibleTitle: this.pluginDetail.pluginName,
                    contextIsolation: true,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
                      Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: true, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: false, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: true, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                    webviewTag: true
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.png`,
                show: false,
                alwaysOnTop: false
            })
        }

        this.win = win

        this._initBrowserPage()

        const remote = require('@electron/remote/main');

        remote.enable(this.win.webContents)
    }

    destroy() {
        if (!this.win) {
            return;
        }
        this.win.destroy();
    }

}
