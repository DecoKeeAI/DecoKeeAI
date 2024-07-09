import {app, globalShortcut, ipcMain} from 'electron'
import {setLogSavePath} from "@/plugins/logOutput";
import { uIOhook, UiohookKey } from 'uiohook-napi'

class AppEvents {
    create(appManager) {
        this.appManager = appManager
        this.windowManager = appManager.windowManager
        app.allowRendererProcessReuse = false
        // app.disableHardwareAcceleration()

        const gotTheLock = app.requestSingleInstanceLock()
        if (!gotTheLock) {
            this.appManager.quitApp();
        } else {
            app.on('second-instance', (event, argv) => {
                if (process.platform === 'win32') {
                    if (appManager.windowManager.mainWindow.win) {
                        if (appManager.windowManager.mainWindow.win.isMinimized()) {
                            appManager.windowManager.mainWindow.win.restore()
                        }
                        if (appManager.windowManager.mainWindow.win.isVisible()) {
                            appManager.windowManager.mainWindow.win.focus()
                        } else {
                            appManager.windowManager.mainWindow.win.show()
                        }
                    }
                }
            })
        }
        app.on('activate', () => {
            if (appManager.windowManager.mainWindow.win === null) {
                console.log('Main window is null!')
            }
        })

        /* 在Electron加载前需要进行初始化
        Before electron app is ready, we should initial */
        app.on('ready', async () => {
            console.log('EventApp: APP ready');
            appManager.initApp()

            let globalAIWakeKey = appManager.storeManager.storeGet('aiConfig.globalAIWakeKey');
            if (globalAIWakeKey === undefined || globalAIWakeKey === '') {
                globalAIWakeKey = 'CommandOrControl+Shift+D';
            }

            if (globalAIWakeKey.includes('control+')) {
                globalAIWakeKey = globalAIWakeKey.replace('control+', 'CommandOrControl+');
            }

            globalShortcut.register(globalAIWakeKey, () => {
                appManager.windowManager.aiAssistantWindow.changeVisibility();
            });
        })

        /* app退出之前执行
        Do something before we quit */
        app.on('before-quit', () => {
            console.log('EventApp: before-quit.')
            appManager.tray.destroy()
        })

        // 所有窗口都被关闭
        app.on('window-all-closed', () => {

            console.log('EventApp: window-all-closed.')

            if (process.platform === 'darwin') {
                return
            }
            // 设置app托盘菜单 / Set the app tray
            appManager.tray.setToolTip('DecoKeeAI')
            // appManager.tray.displayBalloon({
            //   title: '嗨~',
            //   content: '我在这里哦，并没有退出',
            //   noSound: true
            // })
        })

        const reverseDnsRegex = /^([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)*$/;

        app.on("web-contents-created", (e, webContents) => {

            console.log('EventAPP New WebContentCreate: ', e);

            webContents.on('page-title-updated', (e, title, explicitSet) => {
                console.log('EventAPP page-title-updated: title: ', title, ' explicitSet: ', explicitSet);

                if (!reverseDnsRegex.test(title)) return;

                const currentPluginList = appManager.storeManager.storeGet("plugin.streamDeck");
                if (!currentPluginList || currentPluginList.length === 0) return;

                const openPluginInfo = currentPluginList.find(item => {
                    if (title.startsWith(item.pluginId)) return true;

                    const pluginIdInfo = item.pluginId.split('.');
                    const titleIdInfo = title.split('.');
                    const commonPrefix = [];

                    for (let i = 0; i < Math.min(pluginIdInfo.length, titleIdInfo.length); i++) {
                        if (pluginIdInfo[i] === titleIdInfo[i]) {
                            commonPrefix.push(pluginIdInfo[i]);
                        } else {
                            break;
                        }
                    }

                    const parentDNS = commonPrefix.join('.');

                    return parentDNS !== '';
                });

                if (!openPluginInfo) return;

                e.preventDefault();
                // 修改标题
                const newTitle = `${openPluginInfo.pluginName} - DecoKeeAI`;

                // 设置新的标题
                webContents.executeJavaScript(`document.title = "${newTitle}"`);
            });

            webContents.setWindowOpenHandler((details) => {

                const urlInfos = details.url.split('/');
                console.log('Main APP: Received newwindow: details: ', details);

                const openPluginId = urlInfos[3];

                if (!openPluginId || openPluginId === '') {
                    return {
                        action: 'deny'
                    }
                }

                const currentPluginList = appManager.storeManager.storeGet("plugin.streamDeck");
                if (!currentPluginList || currentPluginList.length === 0) {
                    return {
                        action: 'deny'
                    }
                }

                const openPluginInfo = currentPluginList.find(item => item.pluginId === openPluginId);

                if (!openPluginInfo) {
                    return { action: 'deny' };
                }

                const openWindowOptions = {
                    width: 500,
                    height: 650,
                    title: openPluginInfo.pluginName,
                    modal: true,
                    webPreferences: {
                        accessibleTitle: openPluginInfo.pluginName,
                        contextIsolation: true,
                        /* 注意，这些设置有关程序的安全性，请谨慎使用！
                          Note: these settings are related to the security of the program, please use it with caution! */
                        enableRemoteModule: true, // Electron 10.x起需要主动启用才可在渲染进程中使用remote / Electron 10.x and above need to be actively enabled in order to use remote in the rendering process
                        webSecurity: false, // 设为false允许跨域 / Set to false to allow cross-domain requests
                        nodeIntegration: true, // 允许渲染进程使用node.js / node integration, allow renderer process use node.js!
                        webviewTag: true
                    }
                }


                if (openPluginInfo.manifestInfo.DefaultWindowSize) {
                    openWindowOptions.width = openPluginInfo.manifestInfo.DefaultWindowSize[0] + 50;
                    openWindowOptions.height = openPluginInfo.manifestInfo.DefaultWindowSize[1] + 50;
                }

                console.log('EventAPP: Received newwindow: openPluginInfo.DefaultWindowSize: ', openPluginInfo.manifestInfo.DefaultWindowSize, ' openWindowOptions: ', openWindowOptions);


                // 在这里处理新窗口的控制，如阻止或自定义操作
                return {
                    action: 'allow',
                    overrideBrowserWindowOptions: openWindowOptions
                };
            });
        });

        const logSavePath = app.getPath('userData');
        setLogSavePath(logSavePath);
        console.log('LogSavePath: ', logSavePath);

        const installPath = app.getPath('exe');
        console.log('installPath: ', installPath);

        app.on('before-quit', () => {
           uIOhook.stop();
        });
    }

    getStartOnBoot() {
        return app.getLoginItemSettings().openAtLogin
    }

    setStartOnBoot(enable) {
        app.setLoginItemSettings({
            openAtLogin: enable,
            path: process.execPath
        })
    }
}

export default new AppEvents()
