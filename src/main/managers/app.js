/* eslint-disable no-undef */
import { app, crashReporter, ipcMain, nativeImage, Tray, webContents, BrowserWindow } from 'electron';

import EventManager from './event';
import WindowManager from './window';
import MenuManager from './menu';
import StoreManager from './store';
import DeviceControlManager from '@/main/DeviceControl/DeviceControlManager';
import ResourcesManager from '@/main/managers/resources';
import httpExpress from '@/main/managers/httpExpress';

const path = require('path');

class AppManager {
    constructor(needFullLoad) {
        if (!needFullLoad) return;

        this.storeManager = new StoreManager();
        this.eventManager = new EventManager(this);
        this.httpExpressManager = new httpExpress(this.storeManager);

        this.windowManager = new WindowManager(this);
        this.menuManager = new MenuManager(this);
        this.resourcesManager = new ResourcesManager(this.storeManager);
        this.deviceControlManager = new DeviceControlManager(this);

        console.log('AppManager Started. LastCrashReport: ', crashReporter.getLastCrashReport());

        const that = this;
        ipcMain.on('RestartApp', async (event, args) => {
            console.log('AppManager received: RestartApp');
            that.quitApp(true);
        })

        ipcMain.on('QuitApp', (event, args) => {
            console.log('MainWindow received: QuitApp');
            that.quitApp(false);
        })

        // 监听remote进程的异常
        process.on('uncaughtException', (error) => {
            console.error('AppManager: Uncaught exception:', error);
            // Handle the error, e.g., log it, show an error message, etc.
        });
    }

    /* 初始化app，创建窗口及托盘
    Initialize the app, create windows and tray */
    initApp() {
        console.log('AppManager: InitApp');
        this.windowManager.createAllWindows();
        this.createAppTray();
    }

    /* Create app tray
    创建托盘 */
    createAppTray() {
        try {
            const iconPath = path.join(__static, 'app.ico');
            const trayIcon = nativeImage.createFromPath(iconPath);
            this.tray = new Tray(trayIcon);
            this.setAppTrayMenu();
        } catch (err) {
            console.error('Failed to create app tray, error:', err);
        }
    }

    /* Create tray menu
    创建托盘菜单 */
    setAppTrayMenu() {
        const menu = this.menuManager.AppTrayMenu();
        // this.tray.setToolTip('运行中！Still Working!')
        this.tray.setToolTip('DecoKeeAI');
        this.tray.setContextMenu(menu);

        this.tray.on('double-click', () => {
            if (!this.windowManager.mainWindow.win) {
                this.windowManager.mainWindow.createWindow();
            }

            /* 执行electron窗口对象方法
             Execute electron window method */
            this.windowManager.mainWindow.win.show();
            this.windowManager.mainWindow.win.moveTop();
        });
    }

    async quitApp(restart = false) {
        const forceExitTask = setTimeout(() => {
            console.log('MainApp: quitApp: Timout out on exit action. Force EXIT!');
            if (restart) {
                console.log('MainApp: quitApp: Timout set for relaunch');
                app.relaunch();
            }

            console.log('MainApp: quitApp: Timout do quit');
            setTimeout(() => {
                process.kill(process.pid, 'SIGINT');
            }, 300);
        }, 5000);

        const appPid = process.pid;
        console.log('APPManager: quitApp: !!! PID: ' + appPid + ' hasSingleInstanceLock: ', app.hasSingleInstanceLock());
        globalShortcut.unregisterAll();

        if (app.hasSingleInstanceLock()) {
            app.releaseSingleInstanceLock();
        }

        ipcMain.removeAllListeners();
        ipcMain.on('REMOTE_BROWSER_FUNCTION_CALL', (event, args) => {
            const openedTitle = event.sender.getTitle();
            const processId = event.processId;
            console.log('MainApp: quitApp: received: REMOTE_BROWSER_FUNCTION_CALL: event.processId: ', processId, ' Title: ', openedTitle, args);
            event.sender.on('destroyed', () => {
                console.log('MainApp: quitApp: received: event.sender: destroyed: ', openedTitle, ' processId: ', processId, ' args: ', args);
            })
            event.sender.close();
        });

        if (this.windowManager.windowList) {
            this.windowManager.windowList.forEach(browserWindow => {
                console.log('MainApp: quitApp: destroying window: ', browserWindow.win.getTitle());
                browserWindow.win.removeAllListeners();
                browserWindow.win.close();
            })
        }

        await this.deviceControlManager.destroy();

        if (this.httpExpressManager) {
            await this.httpExpressManager.destroy();
        }

        clearTimeout(forceExitTask);
        console.log('MainApp: quitApp: all listeners removed');
        if (restart) {
            console.log('MainApp: quitApp: set for relaunch');
            app.relaunch();
        }

        console.log('MainApp: quitApp: do quit');
        setTimeout(() => {
            process.kill(process.pid, 'SIGINT');
        }, 300);
        console.log('MainApp: quitApp: DONE!');
    }
}

export default AppManager;
