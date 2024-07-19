<template>
    <div>
        <el-dialog
            :before-close="handleClose"
            :destroy-on-close="true"
            :title="$t('upgradeAvailable')"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            width="60%"
        >
            <div v-if="showDownloading">
                <el-progress
                    :percentage="downloadedProgress"
                    :stroke-width="24"
                    :text-inside="true"
                    status="success"
                ></el-progress>
            </div>
            <div v-else>
                <span>{{ this.$t('upgradeAvailable') + ' ' + newVersionNum + ' ' + this.$t('confirmUpgrade') }}</span>
            </div>
            <span v-if="!showDownloading" slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialogVisible = false">{{ $t('installLater') }}</el-button>
                <el-button size="small" type="primary" @click="doUpgrade">{{ $t('installUpgrade') }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';

const remote = require('@electron/remote');
const DecompressZip = require('decompress-zip');

export default {
    name: 'UpgradeInfoDialog',
    data() {
        return {
            dialogVisible: false,
            newVersionNum: '',
            showDownloading: false,
            downloadedProgress: 0,
            downloadFilePath: '',
            downloadUrlPrefix: ''
        };
    },
    methods: {
        hide() {
            this.showDownloading = false;
        },
        show(newVersion, downloadUrlPrefix) {
            console.log('Have new version: ', newVersion);
            this.newVersionNum = newVersion;
            this.dialogVisible = true;
            this.showDownloading = false;
            this.downloadUrlPrefix = downloadUrlPrefix;

            console.log('UpgradeInfoDialog show');
            ipcRenderer.on('downloading', (event, args) => this.handleUpgradeProgress(event, args));
            ipcRenderer.on('downloaded', () => {
                setTimeout(() => {
                    this.handleUpgradeComplete();
                }, 3000);
            });
        },
        handleUpgradeProgress(event, args) {
            console.log('handleUpgradeProgress: download progress: ', args);
            this.downloadedProgress = parseInt(args);
        },
        handleUpgradeComplete() {
            ipcRenderer.send('ExtractStart');

            console.log('handleUpgradeComplete: download complete.');
            this.downloadedProgress = 100;

            const installPath = remote.app.getPath('exe');
            const extractPath = remote
                .getGlobal('path')
                .resolve(installPath, '..', 'resources', 'app-new');
            console.log('handleUpgradeComplete: extractPath: ' + extractPath);

            const unzipper = new DecompressZip(this.downloadFilePath);

            const that = this;
            unzipper.on('error', function (err) {
                console.log('Caught an error', err);
            });

            unzipper.on('extract', function () {
                console.log('Finished extracting');
                that.$alert(that.$t('installSuccess'), '', {
                    confirmButtonText: that.$t('restart'),
                    showClose: false,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    callback: async () => {
                        console.log('Do Restart Program');
                        setTimeout(() => {
                            ipcRenderer.send('RestartApp', {});
                        }, 1000);
                    },
                });
            });

            unzipper.on('progress', function (fileIndex, fileCount) {
                console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
            });

            unzipper.extract({
                path: extractPath,
                filter: function (file) {
                    return file.type !== 'SymbolicLink';
                },
            });
        },
        doUpgrade() {
            this.showDownloading = true;
            const installPath = remote.app.getPath('exe');
            this.downloadFilePath = remote
                .getGlobal('path')
                .resolve(installPath, '..', 'resources', 'app.zip');
            console.log('checkForUpdates: rootDir: ', this.downloadFilePath);

            let downloadUrl = this.downloadUrlPrefix + this.newVersionNum;

            let platInfo;
            platInfo = remote.getGlobal('platform');
            if (platInfo.startsWith('win')) {
                const currentArch = remote.getGlobal('arch');
                platInfo = 'win-' + currentArch;
            }

            downloadUrl += '/DecoKeeAI_OTA_' + platInfo + '.zip';

            console.log('checkForUpdates: final download URL: ', downloadUrl);

            ipcRenderer.send('download', {
                url: downloadUrl,
                directory: this.downloadFilePath,
            });
        },
        handleClose(done) {
            this.dialogVisible = false;
            this.downloadFilePath = '';
            this.showDownloading = false;
            this.downloadedProgress = 0;
            this.newVersionNum = '';
            ipcRenderer.removeListener('downloading', (event, args) =>
                this.handleUpgradeProgress(event, args)
            );
            ipcRenderer.removeListener('downloaded', () => this.handleUpgradeComplete());

            done();
        },
    },
};
</script>

<style lang="less"></style>
