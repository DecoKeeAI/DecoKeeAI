import { BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

class IconSelectWindow {
    constructor(win, appManager) {
        /* win代表electron窗口实例
         win is this electron window instance */
        this.win = win
        this.storeManager = appManager.storeManager
    }

    initBrowserPage() {
        const that = this;
        // Dev or not
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            this.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        } else {
            createProtocol('app')
            this.win.loadURL('app://./index.html')
        }

        this.win.on('closed', () => {
            that.win = null
            console.log('IconSelectWindow windows closed')
        })

        this.win.once('ready-to-show', () => {
            console.log('IconSelectWindow: ready-to-show ID: ', that.win.webContents.id);
            if (process.env.WEBPACK_DEV_SERVER_URL) {
                /* 开发环境下自启动开发者工具
                  start developer tools in the development environment */
                that.win.webContents.openDevTools({ mode: 'detach' })
            }
        })

    }

    createWindow(parentWindow) {
        console.log('IconSelectWindow: createWindow');

        if (this.win) {
            console.warn('window is already exists!')
            return
        }

        let win = null

        if (process.platform === 'win32') {
            win = new BrowserWindow({
                title: "IconSelect",
                minWidth: 600,
                minHeight: 550,
                width: 600,
                height: 550,
                center: true,
                resizable: true,
                webPreferences: {
                    accessibleTitle: 'IconSelect',
                    contextIsolation: false,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
                      Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: true, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: false, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: true, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                    webviewTag: true
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.ico`,
                frame: false,
                show: false,
                alwaysOnTop: false,
                parent: parentWindow,
                paintWhenInitiallyHidden: false,
                backgroundColor: '#2d2d2d'
            })
        } else {
            win = new BrowserWindow({
                title: "IconSelect",
                minWidth: 600,
                minHeight: 550,
                width: 600,
                height: 550,
                center: true,
                resizable: true,
                webPreferences: {
                    accessibleTitle: 'IconSelect',
                    contextIsolation: false,
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
                alwaysOnTop: false,
                parent: parentWindow,
                paintWhenInitiallyHidden: false,
                backgroundColor: '#2d2d2d'
            })
        }

        this.win = win

        this.initBrowserPage()

        const remote = require('@electron/remote/main');

        remote.enable(this.win.webContents);
    }

    changeVisibility() {
        if (!this.win) {
            this.createWindow();
        }

        if (this.win.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }

    checkForTop() {
        if (!this.win) {
            this.createWindow();
        }
        if (this.isVisible()) {
            this.win.moveTop();
        }
    }

    isVisible() {
        if (!this.win) {
            this.createWindow();
        }
        return this.win.isVisible();
    }

    show(resourceId, keyCode) {
        if (!this.win) {
            this.createWindow();
        }
        this.win.show();

        setTimeout(() => {
           this.win.webContents.send('select-for-key', {
               resourceId: resourceId,
               keyCode: keyCode
           });
        }, 1000);
    }

    hide() {
        if (!this.win) {
            this.createWindow();
        }
        this.win.hide();
    }

}

export default IconSelectWindow
