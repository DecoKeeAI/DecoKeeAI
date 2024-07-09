<template>
    <div id="app" :style="{ height: (windowHeight + 'px'), maxHeight: (windowHeight + 'px') }">
        <div id="content">
            <MainView v-if="renderReady && windowTitle === 'DecoKeeAI'"/>
            <SettingsView v-else-if="renderReady && windowTitle === 'Settings'"/>
            <AIAssistantView v-else-if="renderReady && windowTitle === 'AIAssistant'"/>
            <IconSelectView v-else-if="renderReady && windowTitle === 'IconSelect'"/>
        </div>
    </div>
</template>

<script>
import MainView from '@/views/MainView/MainView'
import SettingsView from "@/views/Setting/SettingsView";
import AIAssistantView from "@/views/AIAssistant/AIAssistantView";
import IconSelectView from "@/views/IconSelect/IconSelectView";
import Vue from 'vue'
import {setI18nLanguage} from "@/plugins/i18n";

const remote = require('@electron/remote');

export default {
    name: 'app',
    components: {
        MainView,
        SettingsView,
        AIAssistantView,
        IconSelectView
    },
    data() {
        return {
            renderReady: false,
            windowTitle: '',
            windowHeight: window.innerHeight
        }
    },
    mounted() {
        this.genRenderer()
        window.addEventListener('resize', this.handleResize);
        console.log(this.windowTitle + ' process.version', process.version); // 该版本electron所对应的node版本
        console.log(this.windowTitle + ' process.versions.electron', process.versions.electron); // electron 版本
        console.log(this.windowTitle + ' process.versions.modules', process.versions.modules); // abi
    },
    methods: {
        genRenderer() {
            window.platform = remote.getGlobal('platform');
            window.arch = remote.getGlobal('arch');
            this.windowTitle = remote.getCurrentWindow().getTitle()
            window.appManager = remote.getGlobal('appManager');
            window.aiManager = remote.getGlobal('aiManager');
            window.store = remote.getGlobal('appManager').storeManager;
            window.windowManager = remote.getGlobal('appManager').windowManager;
            window.resourcesManager = remote.getGlobal('appManager').resourcesManager;
            window.electron.remote = remote;
            window.app = remote.app;

            window.installPath = remote.getGlobal('installPath');
            window.userDataPath = remote.getGlobal('userDataPath');

            window.shell = remote.getGlobal('shell');
            window.clipboard = remote.getGlobal('clipboard');
            window.fs = remote.getGlobal('fs');
            window.path = remote.getGlobal('path');
            const newSetTimeout = remote.getGlobal('setTimeout');
            const newSetInterval = remote.getGlobal('setInterval');
            const newClearTimeout = remote.getGlobal('clearTimeout');
            const newClearInterval = remote.getGlobal('clearInterval');
            const globalShortcut = remote.getGlobal('globalShortcut');
            window.currentNetworkRegIs5G = false;
            console.log = remote.getGlobal('log');
            Vue.setTimeout = newSetTimeout;
            Vue.setInterval = newSetInterval;
            Vue.clearInterval = newClearInterval;
            Vue.clearTimeout = newClearTimeout;
            Vue.remote = window.electron.remote;
            window.setTimeout = newSetTimeout;
            window.setInterval = newSetInterval;
            window.clearTimeout = newClearTimeout;
            window.clearInterval = newClearInterval;
            window.globalShortcut = globalShortcut;

            const savedLocale = window.store.storeGet('system.locale');
            this.localeValue = (savedLocale === 'zh') ? 0 : 1;
            this.$i18n.locale = savedLocale;

            setI18nLanguage(savedLocale);

            this.renderReady = true;
        },
        handleLocaleChange() {
            console.log('Locale change to ' + this.localeValue)
            const newLocale = (this.localeValue === 0) ? 'zh' : 'en';
            this.$i18n.locale = newLocale
            setI18nLanguage(newLocale);
            window.store.storeSet('system.locale', newLocale);
        },
        handleResize() {
            this.windowHeight = window.innerHeight; // 更新窗口高度
            // console.log('new window height: ', this.windowHeight);
        },

    }
}
</script>

<style lang="less">
body {
    margin: 0;
    user-select: none;
}

// 取消一些默认效果，使得应用看起来更加原生
// Cancel default effects to make apps look more native
input {
    outline: none;
}

a {
    outline: none;
    text-decoration: none;
    -webkit-user-drag: none;
    color: #B2CCD6;
}

img {
    -webkit-user-drag: none;
}

#app {
    height: 100%;
    width: 100vw;
    background-color: #2D3A41;
    color: #B2CCD6;
    // ok
    font-family: 'Microsoft YaHei', 'Avenir', 'Helvetica', 'Arial', 'sans-serif';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -moz-user-select: none;
    -webkit-user-select: none;
    // 如果你想让应用中的所有文字无法被选取，就设为none
    // If you want all text in the app to be unselectable, set it to none
    user-select: none;
    position: relative;
    top: 0;
    left: 0;
}


#footer {
    width: 100%;
    height: 9%;
    padding: 0 10px;
    align-items: center;
    bottom: 5px;
    position: absolute;
}

.dropdown-div {
    padding: 0 8px;
    line-height: 32px;
}

.dropdown-link {
    transition: .2s ease;
    color: #FFF;
    opacity: 0.7;
}

.dropdown-link:hover {
    color: #409EFF;
}

.icon-arrow-down {
    font-size: 12px;
}

/deep/ .adsDialogClass {
    padding: 0;
    margin: 0 auto;
}

</style>
