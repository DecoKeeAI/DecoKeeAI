<template>
    <div style="height: 100%">
        <el-row v-if="isDevBuild" :gutter="24" class="setting-item-row">
            <el-col :span="24" style="text-align: center">
                <el-button
                    size="mini"
                    style="margin-left: 10px"
                    type="danger"
                    @click="handleClearAllData"
                    >{{ $t('settings.clearAllData') }}
                </el-button>
            </el-col>
        </el-row>
        <el-row :gutter="24" class="setting-item-row">
            <el-col :span="10" class="setting-item-label">{{ $t('settings.version') }}</el-col>
            <el-col :span="12">
                <span>{{ currentVersion }}</span>
                <el-button size="mini" style="margin-left: 10px" @click="checkForUpdates"
                    >{{ $t('settings.checkUpdate') }}
                </el-button>
            </el-col>
        </el-row>
        <el-row :gutter="24" class="setting-item-row">
            <el-col :span="10" class="setting-item-label">{{ $t('settings.language') }}</el-col>
            <el-col :span="12">
                <el-dropdown size="mini" @command="handleLocaleChange">
                    <el-button size="mini">
                        {{ currentLanguage }}
                        <svg-icon color="black" name="arrow_down" style="font-size: 14px" />
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="zh">中文</el-dropdown-item>
                        <el-dropdown-item command="en">English</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>
        <el-row :gutter="24" class="setting-item-row">
            <el-col :span="10" class="setting-item-label">{{ $t('settings.startOnBoot') }}</el-col>
            <el-col :span="12">
                <el-switch v-model="enableStartOnBoot" @change="enableStartOnBootChange" />
            </el-col>
        </el-row>
        <el-row :gutter="24" class="setting-item-row">
            <el-col :span="10" class="setting-item-label">{{ $t('settings.openAsHidden') }}</el-col>
            <el-col :span="12">
                <el-switch v-model="openAsHidden" @change="openAsHiddenChange" />
            </el-col>
        </el-row>
        <el-row :gutter="24" class="setting-item-row">
            <el-col :span="10" class="setting-item-label">{{ $t('settings.monitorAppViewMaster') }}</el-col>
            <el-col :span="12">
                <el-switch v-model="monitorAppViewMaster" @change="handleMonitorAppViewChanged" />
            </el-col>
        </el-row>
        <div v-if="monitorAppViewMaster" style="margin-bottom: 12px">
            <el-row v-if="monitorAppViewMaster" :gutter="24" class="setting-item-row">
                <el-col :span="10" class="setting-item-label">{{ $t('settings.monitorAppViewMethod') }}</el-col>
                <el-col :span="12">
                    <el-radio-group v-model="monitorAppViewMethod" size="small" @change="handleMonitorAppViewMethodChanged">
                        <el-tooltip placement="top">
                            <span slot="content" style="white-space: pre-wrap; line-height: 20px">
                                {{ $t('settings.monitorAppViewMethodDefaultHint') }}
                            </span>
                            <el-radio label="default" style="color: white" >{{ $t('settings.monitorAppViewMethodDefault') }}</el-radio>
                        </el-tooltip>
                        <el-tooltip placement="top">
                            <span slot="content" style="white-space: pre-wrap; line-height: 20px">
                                {{ $t('settings.monitorAppViewMethodStreamHint') }}
                            </span>
                            <el-radio label="stream" style="color: white" >{{ $t('settings.monitorAppViewMethodStream') }}</el-radio>
                        </el-tooltip>
                    </el-radio-group>
                </el-col>
            </el-row>
            <el-row v-if="monitorAppViewMaster && monitorAppViewMethod === 'stream'" :gutter="24" class="setting-item-row">
                <el-col :span="10" class="setting-item-label">{{ $t('settings.monitorAppViewFrameRate') }}</el-col>
                <el-col :span="12">
                    <el-slider v-model="monitorAppViewFrameRate" :max="15" :min="1" style="width: 150px; margin-top: -8px;" class="block" @change="handleAppMonitorFrameRateChange"></el-slider>
                </el-col>
            </el-row>
        </div>

        <UpgradeInfoDialog ref="upgradeInfoDialog" />
    </div>
</template>

<script>
import config from '../../../package.json';
import UpgradeInfoDialog from '@/views/Components/UpgradeInfoDialog';
import { setI18nLanguage } from '@/plugins/i18n';
import { ipcRenderer } from 'electron';

export default {
    name: 'GeneralSettings',
    components: {
        UpgradeInfoDialog,
    },
    data() {
        return {
            openAsHidden: false,
            enableStartOnBoot: false,
            appManager: null,
            currentVersion: '',
            currentLanguage: '',
            isDevBuild: false,

            monitorAppViewMaster: true,
            monitorAppViewMethod: 'default',
            monitorAppViewFrameRate: 1,
            sendMonitorAppConfigChangeTask: undefined
        };
    },
    mounted() {
        this.$nextTick(() => {
            window.setTimeout(() => {
                this.currentVersion = config.version;
                this.enableStartOnBoot = window.appManager.eventManager.getStartOnBoot();
                this.openAsHidden = window.store.storeGet('system.openAsHidden');
                const selectedLocale = window.store.storeGet('system.locale');
                this.currentLanguage = this.covertLocaleToString(selectedLocale);
                console.log('Open At Login: ', this.enableStartOnBoot);
                console.log('Open As Hidden: ', this.openAsHidden);
                console.log('Current language: ', selectedLocale);
            }, 100);

            this.isDevBuild = process.env.NODE_ENV !== 'production';

            this.monitorAppViewMaster = window.store.storeGet('system.appMonitorMasterSwitch', true);
            this.monitorAppViewMethod = window.store.storeGet('system.appMonitorMethod', 'default');
            this.monitorAppViewFrameRate = window.store.storeGet('system.appMonitorFrameRate', 1);

        });
    },
    methods: {
        covertLocaleToString(locale) {
            switch (locale) {
                case 'zh':
                    return '中文';
                case 'en':
                    return 'English';
            }
        },
        openAsHiddenChange(enable) {
            window.store.storeSet('system.openAsHidden', enable);
            console.log('后台启动变更后:', window.store.storeGet('system.openAsHidden'));
        },
        enableStartOnBootChange(enable) {
            if (!enable) {
                this.openAsHidden = false;
                window.store.storeSet('system.openAsHidden', this.openAsHidden);
            }
            window.appManager.eventManager.setStartOnBoot(enable);
            console.log('开机自启动变更后:', window.appManager.eventManager.getStartOnBoot());
        },
        handleLocaleChange(command) {
            ipcRenderer.send('handleLocale', command);

            this.currentLanguage = this.covertLocaleToString(command);
            console.log('Locale change to ' + command);
            this.$i18n.locale = command;
            setI18nLanguage(command);
            window.store.storeSet('system.locale', command);
        },
        handleClearAllData() {
            const that = this;
            this.$confirm(this.$t('settings.clearAllData'), '', {
                confirmButtonText: that.$t('confirm'),
                cancelButtonText: that.$t('cancel'),
                type: 'warning',
            })
                .then(() => {
                    const cachePath = window.userDataPath;
                    const shelljs = window.require('shelljs');

                    shelljs.rm('-rf', window.path.join(cachePath, 'config.json'));
                    shelljs.rm('-rf', window.path.join(cachePath, 'PluginConfigs.json'));
                    shelljs.rm('-rf', window.path.join(cachePath, 'ChatHistory.json'));
                    shelljs.rm('-rf', window.path.join(cachePath, '/Plugins'));
                    shelljs.rm('-rf', window.path.join(cachePath, '/resources'));

                    ipcRenderer.send('QuitApp', {});
                })
                .catch(() => {});
        },
        checkForUpdates() {
            const that = this;

            setTimeout(async () => {
                const res = await ipcRenderer.invoke('check-update', {});
                console.log('GeneralSettings: checkForUpdates: ', res);

                if (!res || !res.haveUpdate) {
                    this.$message({
                        message: that.$t('isLatestVersion'),
                        type: 'success',
                    });
                    return;
                }

                this.$refs.upgradeInfoDialog.show(res.version, res.downloadUrlPrefix);
            }, 500);
        },
        handleMonitorAppViewChanged(val) {
            console.log('GeneralSettings: handleMonitorAppViewChanged: ', val);
            this.monitorAppViewMaster = val;
            this.notifyAppMonitorConfigChanged();
        },
        handleMonitorAppViewMethodChanged(val) {
            console.log('GeneralSettings: handleMonitorAppViewMethodChanged: ', val);
            this.monitorAppViewMethod = val;
            this.notifyAppMonitorConfigChanged();
        },
        handleAppMonitorFrameRateChange(val) {
            console.log('GeneralSettings: handleAppMonitorFrameRateChange: ', val);
            this.monitorAppViewFrameRate = val;
            this.notifyAppMonitorConfigChanged();
        },
        notifyAppMonitorConfigChanged() {
            clearTimeout(this.sendMonitorAppConfigChangeTask);

            this.sendMonitorAppConfigChangeTask = setTimeout(() => {

                window.store.storeSet('system.appMonitorMasterSwitch', this.monitorAppViewMaster);
                window.store.storeSet('system.appMonitorMethod', this.monitorAppViewMethod);
                window.store.storeSet('system.appMonitorFrameRate', this.monitorAppViewFrameRate);

                ipcRenderer.invoke('app-monitor-view-config-changed', {
                    masterSwitch: this.monitorAppViewMaster,
                    method: this.monitorAppViewMethod,
                    frameRate: this.monitorAppViewFrameRate,
                });
            }, 1000);
        }
    },
};
</script>

<style lang="less">
.setting-item-row {
    padding-top: 30px;
    color: white;
}

.setting-item-label {
    text-align: right;
}
</style>
