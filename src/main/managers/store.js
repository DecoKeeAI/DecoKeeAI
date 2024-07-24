import {setI18nLanguage} from "@/plugins/i18n";
import {globalShortcut, app} from "electron";

const Store = require('electron-store')

class StoreManager {
    constructor() {
        this.store = new Store();

        this.chatHistoryStore = new Store({name: 'ChatHistory'});

        this.pluginConfigStore = new Store({name: 'PluginConfigs'});

        if (!this.store.has('system.openAsHidden')) {
            this.store.set('system.openAsHidden', false)
        }
        const that = this;
        app.on('ready', () => {
            const systemLocale = app.getLocale();
            const userConfigLocale = that.store.get('system.locale');
            console.log('StoreManager: constructor: systemLocale: ', systemLocale, ' userConfigLocale: ', userConfigLocale);
            if (!userConfigLocale) {
                if (systemLocale === 'zh-CN') {
                    that.store.set('system.locale', 'zh')
                } else {
                    that.store.set('system.locale', 'en')
                }
            }

            const locale = that.storeGet('system.locale');
            setI18nLanguage(locale);
        });
        if (!this.store.has('aiConfig.globalAIWakeKey')) {
            this.store.set('aiConfig.globalAIWakeKey', 'CommandOrControl+Shift+D')
        }

        if (!this.store.has('aiConfig.modelType')) {
            this.store.set('aiConfig.modelType', 'llama-3.1-70b-versatile')
        }

        if (!this.store.has('aiConfig.speechEngineType')) {
            this.store.set('aiConfig.speechEngineType', 'XFY')
        }

        if (!this.store.has('aiConfig.azure.speechLanguage')) {
            this.store.set('aiConfig.azure.speechLanguage', 'zh-CN')
        }

        if (!this.store.has('aiConfig.azure.speechLanguageVoice')) {
            this.store.set('aiConfig.azure.speechLanguageVoice', 'zh-CN-XiaoxiaoNeural')
        }

        this.store.delete('currentSelectedDevice');
        this.store.delete('mainscreen.deviceName');
        this.store.delete('serverPorts.pluginWSServerPort');
        this.store.delete('serverPorts.viaPluginPort');
        this.store.delete('serverPorts.pluginWebPageServerPort');
    }

    hasValue(key) {
        return this.store.has(key)
    }

    storeSet(key, value) {
        console.log('StoreSet for key: ', key, ' Value: ', value);
        if (key === 'system.locale') {
            setI18nLanguage(value);

            try {
                if (!global.appManager || !global.appManager.windowManager || !global.appManager.windowManager.mainWindow
                    || !global.appManager.windowManager.mainWindow.win) {
                    return;
                }
                global.appManager.windowManager.mainWindow.win.webContents.send('LocaleChanged', value);
            } catch (err) {
                console.log(err)
            }
        } else if (key === 'aiConfig.globalAIWakeKey') {

            let oldGlobalConfigKey = this.store.get('aiConfig.globalAIWakeKey');

            if (oldGlobalConfigKey.indexOf('+') > 1) {
                if (oldGlobalConfigKey.includes('control+')) {
                    oldGlobalConfigKey = oldGlobalConfigKey.replace('control+', 'CommandOrControl+');
                }
                globalShortcut.unregister(oldGlobalConfigKey);
            }

            if (value !== undefined && value.indexOf('+') > 1) {
                if (value.includes('control+')) {
                    value = value.replace('control+', 'CommandOrControl+');
                }
                globalShortcut.register(value, () => {
                    global.appManager.windowManager.aiAssistantWindow.changeVisibility();
                });
            }
        }

        this.store.set(key, value);
    }

    storeSetObject(object) {
        this.store.set(object)
    }

    storeGet(key) {
        return this.store.get(key)
    }

    storeDelete(key) {
        this.store.delete(key)
    }

    hasChatHistory(key) {
        return this.chatHistoryStore.has(key)
    }

    chatHistorySet(key, value) {

        this.chatHistoryStore.set(key, value);
    }

    chatHistoryGet(key) {
        return this.chatHistoryStore.get(key)
    }

    chatHistoryDelete(key) {
        this.chatHistoryStore.delete(key)
    }

    pluginStoreSet(key, value) {
        this.pluginConfigStore.set(key, value)
    }

    pluginStoreGet(key) {
        return this.pluginConfigStore.get(key)
    }

    pluginStoreHas(key) {
        return this.pluginConfigStore.has(key)
    }

    pluginStoreDelete(key) {
        this.pluginConfigStore.delete(key)
    }
}

export default StoreManager
