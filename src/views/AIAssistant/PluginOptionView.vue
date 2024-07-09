<template>
    <div id="plugin-container" :style="{ height: requiredWindowHeight + 'px', minHeight: '100px' }">
        <webview
            id="plugin-view"
            :src="pluginUrl"
            allowpopups
            style="width: 100%; height: 100%"
            webpreferences="webSecurity=no,nodeIntegration=yes"
        >
        </webview>
    </div>
</template>

<script>
import {deepCopy} from '@/utils/ObjectUtil';
import {ipcRenderer} from 'electron';

export default {
    name: 'PluginOptionView',
    props: {
        pluginDetails: {
            type: Object,
            require: true,
        },
    },
    watch: {
        pluginDetails(newVal) {
            console.log('PluginOptionView: pluginDetails changed: ' + JSON.stringify(newVal));
            const currentPluginDetail = this.framePluginDetail;
            const pluginActionDetail = JSON.parse(currentPluginDetail.config.actions[0].value);
            const newPluginActionDetail = JSON.parse(newVal.config.actions[0].value);

            const isNew =
                newVal.pluginId !== currentPluginDetail.pluginId ||
                pluginActionDetail.UUID !== newPluginActionDetail.UUID ||
                (newVal.isMultiAction
                    ? newVal.multiActionsKeyCode !== currentPluginDetail.multiActionsKeyCode ||
                    newVal.multiActionIndex !== currentPluginDetail.multiActionIndex
                    : newVal.keyCode !== currentPluginDetail.keyCode);

            console.log('PluginOptionView: pluginDetails changed: isNew: ' + isNew);
            if (!isNew) return;

            this.notifyPluginVisibilityChanged(false);

            setTimeout(() => {
                this.framePluginDetail = deepCopy(newVal);

                this.setFrameSrc();
            }, 300);
        },
    },
    data() {
        return {
            framePluginDetail: {},
            inInfoParam: {
                application: {
                    font: 'sans-serif',
                    language: 'zh_CN',
                    platform: 'windows',
                    platformVersion: '11.4.0',
                    version: '5.0.0.14247',
                },
                plugin: {
                    uuid: this.pluginDetails.pluginId,
                    version: this.pluginDetails.pluginVersion,
                },
                devicePixelRatio: 2,
                colors: {
                    buttonPressedBackgroundColor: '#303030FF',
                    buttonPressedBorderColor: '#646464FF',
                    buttonPressedTextColor: '#969696FF',
                    disabledColor: '#F7821B59',
                    highlightColor: '#F7821BFF',
                    mouseDownColor: '#CF6304FF',
                },
                devices: [
                    {
                        id: '55F16B35884A859CCE4FFA1FC8D3DE5B',
                        name: 'ABC',
                        size: {
                            columns: 4,
                            rows: 3,
                        },
                        type: 0,
                    },
                ],
            },
            actionInfo: {
                action: 'com.elgato.philips-hue.power',
                context: 'com.elgato.philips-hue.sdPlugin',
                device: '55F16B35884A859CCE4FFA1FC8D3DE5B',
                payload: {
                    settings: {},
                    coordinates: {
                        column: 0,
                        row: 0,
                    },
                },
            },
            requiredWindowHeight: 0,
            pluginUrl: '',
        };
    },
    created() {
        this.framePluginDetail = this.pluginDetails;
        if (window.platform === 'win32') {
            this.inInfoParam.application.platform = 'windows';
        } else if (window.platform === 'darwin') {
            this.inInfoParam.application.platform = 'mac';
        }

        const currentLanguage = window.store.storeGet('system.locale');

        if (currentLanguage === 'zh') {
            this.inInfoParam.application.language = 'zh_CN';
        } else {
            this.inInfoParam.application.language = 'en';
        }

        if (
            !this.framePluginDetail.config.actions ||
            !JSON.parse(this.framePluginDetail.config.actions[0].value).PropertyInspectorPath
        ) {
            return;
        }

        window.addEventListener('resize', this.calculatePluginViewHeight);

        const that = this;

        this.$nextTick(() => {
            const pluginView = document.querySelector('webview');

            pluginView.addEventListener('dom-ready', () => {
                // pluginView.openDevTools({ mode: 'detach' })

                console.log('PluginOptionView Finished Load: ');

                that.calculatePluginViewHeight();

                setTimeout(() => {
                    that.calculatePluginViewHeight();
                }, 500);
                this.setUpPluginDetail();
            });

            this.setFrameSrc();
        });
    },
    methods: {
        calculatePluginViewHeight() {
            const that = this;
            const pluginView = document.querySelector('webview');

            if (!pluginView) return;
            pluginView.executeJavaScript('document.body.offsetHeight').then(offsetHeight => {
                // console.log(`WebView offsetHeight: ${offsetHeight}`);
                that.requiredWindowHeight = offsetHeight + 30;
            });
        },
        notifyPluginVisibilityChanged(visible) {
            const pluginActionDetail = JSON.parse(this.framePluginDetail.config.actions[0].value);
            const activeProfileId = window.store.storeGet('mainscreen.activeProfileId');

            ipcRenderer.send('PluginVisibilityChanged', {
                activeProfileId: activeProfileId,
                pluginId: this.framePluginDetail.pluginId,
                action: pluginActionDetail.UUID,
                keyCode: this.framePluginDetail.isMultiAction
                    ? this.framePluginDetail.multiActionsKeyCode
                    : this.framePluginDetail.keyCode,
                visible: visible,
                multiActionIndex: this.framePluginDetail.isMultiAction ? this.framePluginDetail.multiActionIndex : 0,
                isInMultiAction: this.framePluginDetail.isMultiAction,
            });
        },
        deleteCurrentOption() {
            this.notifyPluginVisibilityChanged(false);
            console.log('PluginOptionView: deleteCurrentOption for: ', this.framePluginDetail.pluginId);
        },

        notifyTitleChanged() {
            const activeProfileId = window.store.storeGet('mainscreen.activeProfileId');
            const pluginActionDetail = JSON.parse(this.framePluginDetail.config.actions[0].value);
            ipcRenderer.send('TitleChanged', {
                activeProfileId: activeProfileId,
                pluginId: this.framePluginDetail.pluginId,
                action: pluginActionDetail.UUID,
                keyCode: this.framePluginDetail.isMultiAction
                    ? this.framePluginDetail.multiActionsKeyCode
                    : this.framePluginDetail.keyCode,
                titleData: this.framePluginDetail.config.title,
                multiActionIndex: this.framePluginDetail.isMultiAction ? this.framePluginDetail.multiActionIndex : 0,
            });
        },
        setFrameSrc() {
            this.requiredWindowHeight = 1;
            console.log(
                'PluginOptionView: setFrameSrc: this.framePluginDetail: ',
                JSON.stringify(this.framePluginDetail)
            );

            const pluginActionDetail = JSON.parse(this.framePluginDetail.config.actions[0].value);
            const pluginServerPort = window.store.storeGet('serverPorts.pluginWebPageServerPort');

            this.pluginUrl =
                'http://localhost:' + pluginServerPort + '/' +
                this.framePluginDetail.pluginId +
                '/' +
                pluginActionDetail.PropertyInspectorPath;

            const pluginView = document.querySelector('webview');
            if (pluginView) {
                setTimeout(() => {
                    pluginView.reloadIgnoringCache();
                }, 100);
            }
        },
        setUpPluginDetail() {
            const pluginActionDetail = JSON.parse(this.framePluginDetail.config.actions[0].value);

            const currentSelectedDevice = window.store.storeGet('currentSelectedDevice');

            let deviceSN = '';

            if (currentSelectedDevice && currentSelectedDevice !== '') {
                const deviceLayoutInfo = window.appManager.deviceControlManager.getDeviceBasicConfig(
                    currentSelectedDevice.serialNumber
                );

                deviceSN = currentSelectedDevice.serialNumber;

                this.inInfoParam.devices = {
                    id: currentSelectedDevice.serialNumber,
                    name: currentSelectedDevice.deviceName,
                    size: {
                        columns: deviceLayoutInfo.keyMatrix.col,
                        rows: deviceLayoutInfo.keyMatrix.row,
                    },
                    type: 0,
                };
            } else {
                this.inInfoParam.devices = [];
            }

            const coordinatesInfo = (
                this.framePluginDetail.isMultiAction
                    ? this.framePluginDetail.multiActionsKeyCode
                    : this.framePluginDetail.keyCode
            ).split(',');

            const activeProfileId = window.store.storeGet('mainscreen.activeProfileId');

            const pluginSettings = window.resourcesManager.getPluginSettings(
                activeProfileId,
                this.framePluginDetail.isMultiAction
                    ? this.framePluginDetail.multiActionsKeyCode
                    : this.framePluginDetail.keyCode,
                this.framePluginDetail.isMultiAction ? this.framePluginDetail.multiActionIndex : 0
            );

            this.actionInfo = {
                action: pluginActionDetail.UUID,
                context: this.framePluginDetail.pluginId,
                device: deviceSN,
                payload: {
                    settings: {},
                    coordinates: {
                        column: coordinatesInfo[1],
                        row: coordinatesInfo[0],
                    },
                },
            };

            if (pluginSettings) {
                this.actionInfo.payload.settings = pluginSettings;
            }

            const pluginView = document.querySelector('webview');
            if (!pluginView) return;

            console.log('PluginOptionView: final actionInfo: ' + JSON.stringify(this.actionInfo));

            const pluginWSServerPort = window.store.storeGet('serverPorts.pluginWSServerPort');

            let executeCmd =
                "connectElgatoStreamDeckSocket(" + pluginWSServerPort + ", '" +
                activeProfileId +
                ':' +
                this.framePluginDetail.pluginId +
                ':' +
                pluginActionDetail.UUID +
                ':' +
                (this.framePluginDetail.isMultiAction
                    ? this.framePluginDetail.multiActionsKeyCode
                    : this.framePluginDetail.keyCode) +
                ':' +
                (this.framePluginDetail.isMultiAction ? this.framePluginDetail.multiActionIndex : 0) +
                "'" +
                ", 'registerPropertyInspector'" +
                ", '" +
                JSON.stringify(this.inInfoParam) +
                "'" +
                ", '" +
                JSON.stringify(this.actionInfo).replaceAll('\\"', '\\\\"') +
                "')";

            const that = this;

            pluginView
                .executeJavaScript(executeCmd)
                .then(result => {
                    console.log(
                        'PluginOptionView: connectElgatoStreamDeckSocket ' +
                        that.framePluginDetail.pluginName +
                        ' executeJavaScript result: ' +
                        JSON.stringify(result)
                    );
                })
                .catch(err => {
                    console.log(
                        'PluginOptionView: connectElgatoStreamDeckSocket ' +
                        that.framePluginDetail.pluginName +
                        ' executeJavaScript Error: ' +
                        JSON.stringify(err)
                    );
                });

            setTimeout(() => {
                this.notifyPluginVisibilityChanged(true);
            }, 1000);
        },
    },
};
</script>

<style lang="less"></style>
