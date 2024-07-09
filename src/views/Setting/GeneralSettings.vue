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

        <UpgradeInfoDialog ref="upgradeInfoDialog" />
    </div>
</template>

<script>
import config from '../../../package.json';
import { checkUpdate } from '@/plugins/VersionHelper';
import UpgradeInfoDialog from '@/views/Components/UpgradeInfoDialog';
import { setI18nLanguage } from '@/plugins/i18n';
import { ipcRenderer } from 'electron';

const remote = require('@electron/remote');

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
        };
    },
    mounted() {
        this.$nextTick(() => {
            window.setTimeout(() => {
                this.currentVersion = config.version;
                this.appManager = remote.getGlobal('appManager');
                this.enableStartOnBoot = this.appManager.eventManager.getStartOnBoot();
                this.openAsHidden = window.store.storeGet('system.openAsHidden');
                const selectedLocale = window.store.storeGet('system.locale');
                this.currentLanguage = this.covertLocaleToString(selectedLocale);
                console.log('Open At Login: ', this.enableStartOnBoot);
                console.log('Open As Hidden: ', this.openAsHidden);
                console.log('Current language: ', selectedLocale);
            }, 100);

            this.isDevBuild = process.env.NODE_ENV !== 'production';
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
            this.appManager.eventManager.setStartOnBoot(enable);
            console.log('开机自启动变更后:', this.appManager.eventManager.getStartOnBoot());
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
            checkUpdate()
                .then(res => {
                    console.log('checkForUpdates: HaveUpdates: ', res);
                    if (!res.haveUpdate) {
                        this.$message({
                            message: that.$t('isLatestVersion'),
                            type: 'success',
                        });
                        return;
                    }

                    this.$refs.upgradeInfoDialog.show(res.version);
                })
                .catch(err => {
                    console.log('checkForUpdates: Failed to get latest version: ', err);
                    this.$message({
                        message: that.$t('isLatestVersion'),
                        type: 'success',
                    });
                });
        },
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
