import {Menu, clipboard} from 'electron';
import {uIOhook, UiohookKey} from 'uiohook-napi';
import {i18nRender} from "@/plugins/i18n";

const activeWindow = require('active-win');
const { nativeImage } = require('electron');
const path = require('path');

const SHOW_AI_MENU_THRESHOLD = 500; // 500 ms 内的点击算作双击
const CLIPBOARD_CONTENT_TYPE = {
    TEXT: 'text',
    FILE: 'file',
    INVALID: 'invalid'
}

const AI_MENU_ITEMS = {
    CUSTOM_FUNCTION: -1,
    CHAT: 0,
    COPY: 1,
    EXPLAIN: 2,
    SUMMARIZE: 3,
    TRANSLATE: 4,
    DEBUG_CODE: 5,
    DISABLE_CURRENT: 6,
    DISABLE_ALL: 7,
}

class MenuManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.windowManager = appManager.windowManager;
    }

    AppTrayMenu() {
        const that = this;
        // Menu template
        const template = [
            {
                key: '1',
                label: i18nRender('trayMenu.resume'),
                click: () => {
                    if (!that.windowManager.mainWindow.win) {
                        that.windowManager.mainWindow.createWindow();
                    }

                    /* 执行electron窗口对象方法
                     Execute electron window method */
                    that.windowManager.mainWindow.win.show();
                    that.windowManager.mainWindow.win.moveTop();
                },
            },
            {
                key: '2',
                label: i18nRender('trayMenu.exit'),
                click: () => {
                    that.appManager.quitApp();
                },
            },
        ];

        this.enableMouseAIChecking = undefined;
        this.initAIHelperDone = false;

        setTimeout(() => {
            this.startMouseAIHelperMenu();
        }, 3000);
        return Menu.buildFromTemplate(template);
    }

    async startMouseAIHelperMenu() {
        this.disabledCheckingApps = this.appManager.storeManager.storeGet('aiConfig.textSelection.disabledApps', []);

        const storedEnableMouseAIChecking = this.appManager.storeManager.storeGet('aiConfig.textSelection.enabled', true);
        if (storedEnableMouseAIChecking === this.enableMouseAIChecking) return;
        this.enableMouseAIChecking = storedEnableMouseAIChecking
        if (!this.enableMouseAIChecking) {
            return;
        }

        this.isDragging = false;
        this.dragStart = null;

        this.shouldShowAIMenu = false;
        this.aiMenuShown = false;
        this.aiMenuShowProcessStart = false;

        if (this.initAIHelperDone) return;

        this._initAIHelperMenu();
    }

    stopMouseAIHelperMenu() {
        this.enableMouseAIChecking = false;

        this.mouseAIMenu.closePopup();

        this.isDragging = false;
        this.dragStart = null;

        this.shouldShowAIMenu = false;
        this.aiMenuShown = false;
        this.aiMenuShowProcessStart = false;
    }

    getSupportedAIHelperMenuOptions() {
        return this.appManager.storeManager.storeGet('aiConfig.textSelection.menuOption', [
            {
                label: 'i18n-aiHelperMenu.chat',
                iconPath: path.join(__static, 'app.png'),
                editable: false,
                showInMenu: true,
                itemAction: AI_MENU_ITEMS.CHAT,
            },
            {
                label: 'i18n-aiHelperMenu.copy',
                iconPath: path.join(__static, 'icon', 'copy.png'),
                editable: true,
                showInMenu: true,
                itemAction: AI_MENU_ITEMS.COPY,
            },
            {
                label: 'i18n-aiHelperMenu.explain',
                iconPath: path.join(__static, 'icon', 'explain.png'),
                editable: true,
                showInMenu: true,
                itemAction: AI_MENU_ITEMS.EXPLAIN,
            },
            {
                label: 'i18n-aiHelperMenu.summarize',
                iconPath: path.join(__static, 'icon', 'summarize.png'),
                editable: true,
                showInMenu: true,
                itemAction: AI_MENU_ITEMS.SUMMARIZE,
            },
            {
                label: 'i18n-aiHelperMenu.translate',
                iconPath: path.join(__static, 'icon', 'translate.png'),
                editable: true,
                showInMenu: true,
                itemAction: AI_MENU_ITEMS.TRANSLATE,
            },
            {
                label: 'i18n-aiHelperMenu.codeOptimize',
                iconPath: path.join(__static, 'icon', 'code_optimize.png'),
                editable: true,
                showInMenu: false,
                itemAction: AI_MENU_ITEMS.DEBUG_CODE,
            },
        ]);
    }

    updateAIHelperMenuOptions(menuOptions) {
        this.appManager.storeManager.storeSet('aiConfig.textSelection.menuOption', menuOptions);

        setTimeout(() => {
            this._createAIHelperMenu();
        }, 100);
    }

    _initAIHelperMenu() {
        this.mouseAIRobot = require('robotjs');
        const that = this;

        this._createAIHelperMenu();

        // 监听鼠标右键点击事件
        uIOhook.on('mousedown', async event => {
            clearTimeout(that.dismissAIHelperMenuTimer);
            if (!that.enableMouseAIChecking) return;
            if (event.button === 1) {
                that.dismissAIHelperMenuTimer = setTimeout(() => {
                    that.shouldShowAIMenu = false;
                    that.aiMenuShown = false;
                    that.aiMenuShowProcessStart = false;
                    that.mouseAIMenu.closePopup();
                    that.clipboardContent = {}
                }, 200);

                // 记录拖动开始位置
                if (!that.isDragging) {
                    that.isDragging = true;
                    that.dragStart = {x: event.x, y: event.y};

                    const activeWindowInfo = await activeWindow();
                    if (activeWindowInfo === null || activeWindowInfo === undefined) return;

                    if (that._isDisabledCheckingApp(activeWindowInfo.owner)) {
                        that.dragStartApplication = undefined;
                        return;
                    }

                    that.dragStartApplication = activeWindowInfo;
                }
            }
        });

        uIOhook.on('keydown', event => {
            if (!that.enableMouseAIChecking) return;
            const triggeredSelectAll = event.keycode === UiohookKey.A && event.ctrlKey;
            if (!that.aiMenuShowProcessStart && !triggeredSelectAll) {
                that.shouldShowAIMenu = false;
            } else if (that.aiMenuShown) {
                that.shouldShowAIMenu = false;
                that.aiMenuShown = false;
                that.aiMenuShowProcessStart = false;
                that.clipboardContent = {}
                that.mouseAIMenu.closePopup();
            } else if (triggeredSelectAll) {
                console.log('keycode', event.keycode, ' : ', event.ctrlKey);
                that.shouldShowAIMenu = true;
                setTimeout(() => {
                    that._showAIHelperMenu();
                }, SHOW_AI_MENU_THRESHOLD);
            }
        });

        // 监听鼠标抬起事件
        uIOhook.on('mouseup', async event => {
            if (!that.enableMouseAIChecking) return;
            if (event.button === 1) {
                // 左键
                if (that.isDragging) {
                    that.isDragging = false;
                    if (that.dragStartApplication === undefined || that.dragStartApplication === null) return;

                    const dragEndApplication = await activeWindow();

                    if (that.dragStartApplication.bounds.x !== dragEndApplication.bounds.x
                        || that.dragStartApplication.bounds.y !== dragEndApplication.bounds.y
                        || that.dragStartApplication.bounds.width !== dragEndApplication.bounds.width
                        || that.dragStartApplication.bounds.height !== dragEndApplication.bounds.height) {
                        return;
                    }

                    const dragEnd = {x: event.x, y: event.y};

                    if (Math.abs(that.dragStart.x - dragEnd.x) >= 10 || Math.abs(that.dragStart.y - dragEnd.y) >= 10) {
                        that.shouldShowAIMenu = true;
                        setTimeout(() => {
                            that._showAIHelperMenu();
                        }, SHOW_AI_MENU_THRESHOLD);
                    }

                    that.dragStartApplication = undefined;
                }
            }
        });

        // 启动 uiohook 监听
        uIOhook.start();

        this.initAIHelperDone = true;
    }

    _createAIHelperMenu() {
        const that = this;
        const disableIcon = nativeImage.createFromPath(path.join(__static, 'icon', 'disable.png')).resize({ width: 20, height: 20 });

        const configedMenuOptions = this.getSupportedAIHelperMenuOptions();

        const menuOptions = [];

        configedMenuOptions.forEach(item => {
            if (!item.showInMenu) return;

            menuOptions.push({
                label: item.label.startsWith('i18n-') ? i18nRender(item.label.substring(5).trim()) : item.label,
                icon: nativeImage.createFromPath(item.iconPath).resize({ width: 20, height: 20 }),
                click: () => {
                    that._handleAIMenuClicked(item.itemAction);
                }
            });
        });

        menuOptions.push(
            {
                type: 'separator'
            });

        menuOptions.push({
            label: i18nRender('aiHelperMenu.disable'),
            icon: disableIcon,
            submenu: [
                {
                    label: i18nRender('aiHelperMenu.currentApp'),
                    click: () => {
                        that._handleAIMenuClicked(AI_MENU_ITEMS.DISABLE_CURRENT);
                    },
                },
                {
                    label: i18nRender('aiHelperMenu.allApp'),
                    click: () => {
                        that._handleAIMenuClicked(AI_MENU_ITEMS.DISABLE_ALL);
                    },
                }
            ]
        });

        this.mouseAIMenu = Menu.buildFromTemplate(menuOptions);
    }

    _isDisabledCheckingApp(ownerInfo) {
        return this.disabledCheckingApps.findIndex(checkInfo => checkInfo.owner.path === ownerInfo.path) >= 0;
    }

    _showAIHelperMenu() {
        if (!this.shouldShowAIMenu) return;

        this.aiMenuShowProcessStart = true;
        const oldClipboardData = clipboard.readText();
        clipboard.clear();
        this.mouseAIRobot.keyTap('c', 10, ['control']);

        setTimeout(() => {
            if (!this.shouldShowAIMenu) {
                clipboard.clear();
                clipboard.writeText(oldClipboardData);
                return;
            }

            this.clipboardContent = this._getClipboardContentType();
            clipboard.clear();
            clipboard.writeText(oldClipboardData);
            if (this.clipboardContent.type !== CLIPBOARD_CONTENT_TYPE.TEXT) {
                this.shouldShowAIMenu = false;
                this.aiMenuShown = false;
                this.aiMenuShowProcessStart = false;
                return;
            }
            this.aiMenuShown = true;
            this.mouseAIMenu.popup();
        }, 50);
    }

    _getClipboardContentType() {
        const availableFormats = clipboard.availableFormats();
        if (availableFormats.includes('text/uri-list')) {
            const uris = clipboard.read('text/uri-list');
            return {
                type: CLIPBOARD_CONTENT_TYPE.FILE,
                data: uris
            };
        } else if (availableFormats.includes('text/plain')) {
            const text = clipboard.readText().trim();
            if (text.length > 0) {
                return {
                    type: CLIPBOARD_CONTENT_TYPE.TEXT,
                    data: text
                };
            } else {
                return {
                    type: CLIPBOARD_CONTENT_TYPE.INVALID
                };
            }
        } else {
            return {
                type: CLIPBOARD_CONTENT_TYPE.INVALID
            };
        }
    }

    _handleAIMenuClicked(item) {
        console.log('_handleAIMenuClicked: ', item);

        const currentLanguage = this.appManager.storeManager.storeGet('system.locale');

        let languagePrefix = '';
        switch (currentLanguage) {
            default:
            case 'zh':
                languagePrefix = '使用中文';
                break;
            case 'en':
                languagePrefix = '使用英文';
                break;
        }

        const that = this;
        let requestMsg = '';
        switch (item) {
            default:
            case AI_MENU_ITEMS.CHAT:
                requestMsg = this.clipboardContent.data;
                break;
            case AI_MENU_ITEMS.COPY:
                clipboard.writeText(this.clipboardContent.data);
                return;
            case AI_MENU_ITEMS.EXPLAIN:
                requestMsg = languagePrefix + '解释以下信息: ' + this.clipboardContent.data;
                break;
            case AI_MENU_ITEMS.SUMMARIZE:
                requestMsg = languagePrefix + '总结以下信息: ' + this.clipboardContent.data;
                break;
            case AI_MENU_ITEMS.TRANSLATE:
                requestMsg = '翻译以下信息: ' + this.clipboardContent.data;
                break;
            case AI_MENU_ITEMS.DEBUG_CODE:
                requestMsg = '检查以下代码，指出存在的问题并给出修改后的完整代码。我的代码: \n' + this.clipboardContent.data;
                break;
            case AI_MENU_ITEMS.DISABLE_CURRENT:
                activeWindow().then(result => {
                    that.disabledCheckingApps.push({
                        owner: result.owner
                    });
                    that.appManager.storeManager.storeSet('aiConfig.textSelection.disabledApps', that.disabledCheckingApps);
                });
                return;
            case AI_MENU_ITEMS.DISABLE_ALL:
                this.appManager.storeManager.storeSet('aiConfig.textSelection.enabled', false);
                this.stopMouseAIHelperMenu();
                return;
        }

        this.windowManager.aiAssistantWindow.show();
        this.windowManager.aiAssistantWindow.win.webContents.send('AIHelperMessage', {
            requestMsg: requestMsg
        });
    }
}

export default MenuManager;
