import {BrowserWindow, ipcMain, Menu, shell} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { checkUpdate } from '@/plugins/VersionHelper';

class MainWindow {
    constructor(win, appManager) {
        /* win代表electron窗口实例
 win is this electron window instance */
        this.win = win;
        this.storeManager = appManager.storeManager;
        this.appManager = appManager;
    }

    initBrowserPage() {
        const that = this;
        this.win.webContents.session.on('select-hid-device', (event, details, callback) => {
            // Add events to handle devices being added or removed before the callback on
            // `select-hid-device` is called.
            that.win.webContents.session.on('hid-device-added', (event, device) => {
                console.log('initBrowserPage: hid-device-added FIRED WITH', device);
                // Optionally update details.deviceList
            });

            this.win.webContents.session.on('hid-device-removed', (event, device) => {
                console.log('initBrowserPage: hid-device-removed FIRED WITH', device);
                // Optionally update details.deviceList
            });

            console.log('initBrowserPage: select-hid-device: details.deviceList: ', details.deviceList);
            event.preventDefault();
            if (details.deviceList && details.deviceList.length > 0) {
                callback(details.deviceList[0].deviceId);
            }
        });

        this.pluginWebPageServerPort = undefined;

        this.win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
            if (permission === 'hid' && details.securityOrigin === 'file:///') {
                return true;
            }
            if (permission === 'media') {
                return true;
            }
            if (permission === 'geolocation' && details.isMainFrame) {
                return true;
            }

            if (!this.pluginWebPageServerPort) {
                this.pluginWebPageServerPort = this.storeManager.storeGet('serverPorts.pluginWebPageServerPort');
            }

            if (
                permission === 'accessibility-events' &&
                details.embeddingOrigin.startsWith('http://localhost:' + this.pluginWebPageServerPort)
            ) {
                return true;
            }

            console.log('initBrowserPage: onPermissionCheckHandler: ', permission, ' details: ', details);
        });

        this.win.webContents.session.setDevicePermissionHandler(details => {
            console.log('select-hid-device: setDevicePermissionHandler: ', details);

            const viaServerPort = that.storeManager.storeGet('serverPorts.viaPluginPort');

            if (details.deviceType === 'hid' && details.origin === 'http://localhost:' + viaServerPort) {
                return true;
            }
        });

        // Dev or not
        if (process.env.WEBPACK_DEV_SERVER_URL) {
            this.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        } else {
            createProtocol('app');
            this.win.loadURL('app://./index.html');
        }

        this.win.on('closed', () => {
            that.win = null;
            console.log('Main windows closed');
            that.appManager.deviceControlManager.destroy();
        });

        this.win.once('ready-to-show', () => {
            console.log('MainWindow: ready-to-show ID: ', this.win.webContents.id);
            if (!this.storeManager.storeGet('system.openAsHidden')) {
                that.win.show();
            }
            if (process.env.WEBPACK_DEV_SERVER_URL) {
                /* 开发环境下自启动开发者工具
  start developer tools in the development environment */
                that.win.webContents.openDevTools({ mode: 'detach' });
            }
        });
        let directory;
        ipcMain.on('download', (event, args) => {
            console.log('MainWindow get download request: ', args);
            directory = args.directory;
            that.win.webContents.downloadURL(args.url);
        });

        // eslint-disable-next-line no-unused-vars
        this.win.webContents.session.on('will-download', (event, item, webContents) => {
            console.log('MainWindow: will-download: path: ', directory);
            item.setSavePath(directory);
            item.on('updated', (event, state) => {
                // 下载的事件
                if (state === 'progressing') {
                    const progress = (item.getReceivedBytes() * 100) / item.getTotalBytes();
                    console.log('MainWindow: download progress: ', progress);
                    if (!item.isPaused()) {
                        //下载完成后传回进度
                        that.appManager.windowManager.sendUpgradeProgress(progress);
                    }
                }
            });
            item.once('done', (event, state) => {
                // 下载完成的事件
                if (state === 'completed') {
                    console.log('MainWindow: download completed');
                    //下载完成后传回进度
                    that.appManager.windowManager.sendUpgradeComplete();
                }

                item.removeAllListeners();
            });
        });

        this.win.on('resize', () => {
            clearTimeout(that.storeNewWindowSizeTask);
            that.storeNewWindowSizeTask = setTimeout(() => {
                const newWindowSize = that.win.getSize();
                that.storeManager.storeSet('mainWindowSize', newWindowSize);
            }, 500);
        });

        this.win.webContents.on('will-navigate', (event, url) => {
            // 拦截跳转 URL 的请求
            console.log(`MainWindow Will navigate to: ${url}`);
            // 可以在这里取消跳转或修改 URL
            event.preventDefault();

            shell.openExternal(url);
        });
    }

    createWindow() {
        console.log('MainWindow: createWindow');

        if (this.win) {
            console.warn('window is already exists!');
            return;
        }

        const remote = require('@electron/remote/main');

        remote.initialize();

        let win = null;

        const mainWindowSize = this.storeManager.storeGet('mainWindowSize', [1024, 700]);

        if (process.platform === 'win32') {
            win = new BrowserWindow({
                title: 'DecoKeeAI',
                minWidth: 1024,
                minHeight: 700,
                width: mainWindowSize[0],
                height: mainWindowSize[1],
                center: true,
                webPreferences: {
                    accessibleTitle: 'MainView',
                    contextIsolation: false,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
  Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: true, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: false, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: true, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                    webviewTag: true,
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.png`,
                frame: false,
                show: false,
                backgroundColor: '#2d2d2d',
            });
        } else {
            win = new BrowserWindow({
                title: 'DecoKeeAI',
                minWidth: 1280,
                minHeight: 720,
                width: mainWindowSize[0],
                height: mainWindowSize[1],
                center: true,
                webPreferences: {
                    contextIsolation: false,
                    /* 注意，这些设置有关程序的安全性，请谨慎使用！
  Note: these settings are related to the security of the program, please use it with caution! */
                    enableRemoteModule: true, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                    webSecurity: false, // 设为false允许跨域 / Set to false to allow cross-domain requests
                    nodeIntegration: true, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                    webviewTag: true,
                },
                // eslint-disable-next-line no-undef
                icon: `${__static}/app.png`,
                backgroundColor: '#2d2d2d',
            });
        }

        this.win = win;
        this.initBrowserPage();
        this.setWindowMenu();
        remote.enable(this.win.webContents);

        ipcMain.on('mainpage-sendMenu', (event, arg, isadd) => {
            console.log('MainWindow: Received mainpage-sendMenu: ', arg, isadd);
            this.win.webContents.send('mainpage-newDeviceMenu', arg, isadd);
        });

        ipcMain.on('PluginListChange', (event, arg) => {
            console.log('MainWindow: Received PluginListChange', arg);
            this.win.webContents.send('plugin-list-change', arg);
        });

        ipcMain.on('handleLocale', (event, locale) => {
            console.log('MainWindow: Received handleLocale:', locale);
            this.win.webContents.send('change-locale', locale);
        });

        ipcMain.on('icon-selected', (event, arg) => {
            console.log('MainWindow Received: icon-selected', arg);

            this.win.webContents.send('change-icon', arg);
        });

        ipcMain.handle('check-update', async event => {

            try {
                const res = await checkUpdate();
                console.log('MainWindow: check-update: res', res);
                return res;
            } catch (error) {
              console.log('MainWindow: check-update: Detect error', error);
            }

            return {
              haveUpdate: false,
              version: ''
            };
        });
    }

    setWindowMenu() {
        if (process.platform === 'darwin') {
            const template = [
                {
                    label: 'DecoKeeAI',
                    submenu: [
                        {
                            role: 'quit',
                        },
                    ],
                },
            ];
            const menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
            return;
        }

        Menu.setApplicationMenu(null);
    }

    isVisible() {
        return this.win.isVisible();
    }

    moveTop() {
        if (!this.win) return;

        if (this.win.isVisible()) {
            this.win.moveTop();
        }
    }

    sendUpgradeProgress(progress) {
        this.win.webContents.send('downloading', progress);
    }

    sendUpgradeComplete() {
        this.win.webContents.send('downloaded');
    }
}

export default MainWindow
