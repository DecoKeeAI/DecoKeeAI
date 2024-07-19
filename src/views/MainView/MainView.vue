<template>
    <div>
        <TitleBar
            v-if="isWin32"
            :custom-action="titleBarCustomAction"
            :title="$t('appTitle') + currentVersion"
            @customActionClick="showSettings"
        />
        <div
            id="content"
            :style="{
                position: 'relative',
                top: isWin32 ? '32px' : '0',
                width: '100%',
                maxHeight: maxWindowHeight + 'px',
            }"
        >
            <MainContent ref="bodyView" />
        </div>

        <el-dialog
            ref="adsDialog"
            :before-close="
                () => {
                    checkAndOpenAdsOnIdle();
                }
            "
            :center="true"
            :show-close="true"
            :visible.sync="showAdsView"
            width="60%"
        >
            <webview
                id="adv_detail_container"
                ref="adsWebview"
                :src="externalUrl"
                :style="{
                    display: 'inline-flex',
                    overflow: 'visible',
                    width: '100%',
                    height: adsHeight + 'px',
                }"
            >
            </webview>
        </el-dialog>

        <UpgradeInfoDialog ref="upgradeInfoDialog" />
        <AudioPlayer />
    </div>
</template>

<script>
import TitleBar from '@/views/Components/TitleBar';
import MainContent from '@/views/MainView/MainContent';
import UpgradeInfoDialog from '@/views/Components/UpgradeInfoDialog';
import config from '../../../package.json';
import AudioPlayer from '../Components/AudioPlayer';
import {ipcRenderer} from "electron";

export default {
    name: 'MainView',
    components: {
        TitleBar,
        MainContent,
        UpgradeInfoDialog,
        AudioPlayer,
    },
    data() {
        return {
            isWin32: true,
            currentVersion: '',
            localeValue: 0,
            externalUrl: 'https://h5.matrixz.cn',
            showAdsView: true,
            disableAds: true,
            adsHeight: 360,
            showAdsTimer: undefined,
            titleBarCustomAction: {
                show: false,
                icon: 'settings',
            },
            maxWindowHeight: window.innerHeight - 32,
        };
    },

    mounted() {
        console.log('Current Platform: ', window.platform);
        console.log('Current arch: ', window.arch);
        this.isWin32 = window.platform === 'win32';
        this.maxWindowHeight = window.innerHeight - (this.isWin32 ? 32 : 0);
        this.currentVersion = config.version;
        this.$nextTick(() => {
            // const webview = document.querySelector('webview');
            // webview.addEventListener('dom-ready', () => {
            //     webview.openDevTools();
            // });

            window.addEventListener('resize', () => {
                this.adsHeight = window.innerHeight * 0.6;
                this.maxWindowHeight = window.innerHeight - (this.isWin32 ? 32 : 0);
            });

            window.addEventListener('focus', () => {
                console.log('Window focus');
            });

            const that = this;
            // eslint-disable-next-line no-unused-vars
            document.onmousedown = function (event) {
                // 获取鼠标按下的按键
                // const button = event.button;

                // 在控制台打印按键的值
                // console.log('鼠标按键值：', button);
                that.resetShowAdsTimer();
            };
            // eslint-disable-next-line no-unused-vars
            document.onkeydown = function (event) {
                // 获取鼠标按下的按键
                // const keyCode = event.code;

                // 在控制台打印按键的值
                // console.log('按键值：', keyCode);
                that.resetShowAdsTimer();
            };
        });
    },
    created() {
        this.showAdsView = !this.disableAds;
        this.checkForUpdates();
    },
    methods: {
        showSettings() {
            window.windowManager.settingWindow.changeVisibility();
        },
        resetShowAdsTimer() {
            if (this.disableAds) {
                this.showAdsView = false;
                window.clearTimeout(this.showAdsTimer);
                return;
            }
            if (this.showAdsTimer) {
                console.log('Clear Old shot ADs timer');
                window.clearTimeout(this.showAdsTimer);
            }
            if (!this.showAdsView) {
                console.log('Set show ADs timeout 10 mins');
                this.showAdsTimer = window.setTimeout(() => {
                    if (!this.showAdsView) {
                        this.showAdsView = true;
                        // const webview = document.querySelector('webview');
                        // webview.loadURL(this.externalUrl);
                    }
                }, 600000);
            }
        },
        checkAndOpenAdsOnIdle() {
            if (this.disableAds) {
                this.showAdsView = false;
                return;
            }
            if (this.showAdsView) {
                const webview = document.querySelector('webview');
                webview.goToIndex(0);
                this.showAdsView = false;
            }
            this.resetShowAdsTimer();
        },
        checkForUpdates() {

            setTimeout(async () => {
                const res = await ipcRenderer.invoke('check-update', {});

                console.log('MainView: checkForUpdates: ', res);
                if (!res) return;

                if (!res.haveUpdate) {
                    return;
                }
                this.$refs.upgradeInfoDialog.show(res.version, res.downloadUrlPrefix);
            }, 3000);
        },
    },
};
</script>

<style lang="less"></style>
