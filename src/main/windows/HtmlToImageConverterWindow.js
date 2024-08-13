import {BrowserWindow, ipcMain, shell} from 'electron';

class HtmlToImageConverterWindow {
    constructor() {
        this.convertRequestQueue = [];
    }

    initBrowserPage() {
        const that = this;
        this.win.loadURL('data:text/html,<div id="content" style="color: white; font-size: 20px; overflow: hidden">Hello, world!</div>');

        this.win.on('closed', () => {
            console.log('HtmlToImageConverterWindow windows closed');
            // 保存当前窗口的位置
            that.win = null;
        });

        this.win.once('ready-to-show', () => {
            console.log('HtmlToImageConverterWindow: ready-to-show ID: ', that.win.webContents.id);
        });

        this.win.webContents.on('will-navigate', (event, url) => {
            // 拦截跳转 URL 的请求
            console.log(`HtmlToImageConverterWindow Will navigate to: ${url}`);
            // 可以在这里取消跳转或修改 URL
            event.preventDefault();

            shell.openExternal(url);
        });
    }

    createWindow() {
        console.log('HtmlToImageConverterWindow: createWindow');

        if (this.win) {
            console.warn('window is already exists!');
            return;
        }

        let win = null;

        if (process.platform === 'win32') {
            win = new BrowserWindow({
                title: 'CustomConfig',
                minWidth: 200,
                minHeight: 200,
                width: 200,
                height: 200,
                center: true,
                resizable: false,
                webPreferences: {
                    accessibleTitle: 'CustomConfigWindow',
                    contextIsolation: true,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
                      Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: false, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: true, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: false, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.png`,
                frame: false,
                show: false,
                paintWhenInitiallyHidden: true,
                backgroundColor: '#000000'
            });
        } else {
            win = new BrowserWindow({
                title: 'CustomConfig',
                minWidth: 200,
                minHeight: 200,
                width: 200,
                height: 200,
                center: true,
                resizable: false,
                webPreferences: {
                    accessibleTitle: 'CustomConfigWindow',
                    contextIsolation: true,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
                      Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: false, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: true, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: false, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.png`,
                show: false,
                paintWhenInitiallyHidden: true,
                backgroundColor: '#000000'
            });
        }

        this.win = win;

        this.initBrowserPage();
    }

    generateImage(htmlContent) {
        return new Promise((resolve) => {
            const shouldProcessOnce = this.convertRequestQueue.length === 0;
            this.convertRequestQueue.push({
                htmlContent: htmlContent,
                callback: resolve
            });
            if (shouldProcessOnce) {
                this._checkQueueAndProcess();
            }
        });
    }

    _checkQueueAndProcess() {
        const that = this;
        if (this.convertRequestQueue.length === 0) return;
        const requestInfo = this.convertRequestQueue[0];

        this.win.webContents.once('did-finish-load', () => {
            setTimeout(() => {
                that.win.webContents.capturePage().then(image => {
                    requestInfo.callback(image);
                    that.convertRequestQueue.shift();
                    if (that.convertRequestQueue.length > 0) {
                        that._checkQueueAndProcess();
                    }
                });
            }, 500);
        });
        this.win.loadURL(`data:text/html,${encodeURIComponent(requestInfo.htmlContent)}`);
    }
}

export default HtmlToImageConverterWindow;
