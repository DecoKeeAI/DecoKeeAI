<template>
    <div>
        <div class="content" style="position: relative">
            <div class="dropdownMenu">
                <div class="el-container">
                    <el-scrollbar>
                        <div v-for="(item, index) in pluginLists" :key="item.pluginId" class="menu">
                            <div
                                :style="{
                                    padding: '3px',
                                    display: 'flex',
                                    width: '100%',
                                    background: index === selectedIndex ? '#0078ff' : '',
                                }"
                                @click="pluginClicked(item, index)"
                            >
                                <IconHolder
                                    slot="reference"
                                    :icon-size="{ width: '25px', height: '25px' }"
                                    :icon-src="item.categoryIconId ? item.categoryIconId : item.iconId"
                                />
                                <span style="margin-left: 5px">
                                    {{ item.pluginName }}
                                </span>
                            </div>
                        </div>
                    </el-scrollbar>

                    <div class="handleMenu">
                        <el-button
                            class="btn-folder"
                            icon="el-icon-plus"
                            plain
                            size="mini"
                            type="primary"
                            @click="addPlugin"
                        ></el-button>
                        <el-button
                            class="btn-folder"
                            icon="el-icon-minus"
                            plain
                            size="mini"
                            type="primary"
                            @click="deletePlugin"
                        ></el-button>

                        <el-tooltip placement="top">
                            <div style="white-space: pre-wrap; line-height: 20px" slot="content">
                                {{ $t('settings.pluginSupportType') }}
                            </div>
                            <i style="margin-left: 24px" class="el-icon-question"></i>
                        </el-tooltip>
                    </div>
                </div>
            </div>

            <div class="dropdownMenu-right">
                <div v-if="currentPluginSelected">
                    <div style="display: flex">
                        <IconHolder
                            :icon-size="{ width: '70px', height: '70px' }"
                            :icon-src="currentPluginSelected.iconId"
                        />
                        <div style="margin-left: 20px">
                            <h2>
                                {{ currentPluginSelected.pluginName }}
                            </h2>
                            <span style="color: lightgray; font-size: 12px">
                                {{ $t('settings.authorFrom') + ' ' + currentPluginSelected.manifestInfo.Author }}
                            </span>
                        </div>
                    </div>
                    <div style="margin-top: 12px; font-size: 14px">
                        {{ currentPluginSelected.manifestInfo.Description }}
                    </div>
                    <div style="color: lightgray; font-size: 12px; margin-top: 12px; width: 100%">
                        {{ $t('settings.version') + ': ' + currentPluginSelected.manifestInfo.Version }}
                    </div>
                    <div style="color: lightgray; font-size: 12px; margin-top: 12px; width: 100%">
                        {{ $t('settings.detailLink') }}:
                        <el-link @click="handleExternalLinkClicked">
                            {{ currentPluginSelected.manifestInfo.URL }}
                        </el-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { dialog } from '@electron/remote';
import IconHolder from '@/views/Components/IconHolder';
import { ipcRenderer, shell } from 'electron';

export default {
    components: {
        IconHolder,
    },
    computed: {
        // 高亮
        isHighlighted() {
            return index => index === this.selectedIndex;
        },
    },
    data() {
        return {
            pluginLists: [],
            // 选择项
            selectedIndex: null,
            currentPluginSelected: undefined,
            isConfirmFlag: false
        };
    },
    created() {
        this.loadPluginInfo();
        window.addEventListener('keyup', this.processKeyEvent);
    },
    destroyed() {
        window.removeEventListener('keyup', this.processKeyEvent);
    },

    methods: {
        processKeyEvent(e) {
            // console.log('PluginConfig: processKeyEvent: ', e.key);

            if (e.key === 'Delete' && this.selectedIndex !== null) {
                this.deletePlugin();
            }
        },
        loadPluginInfo() {
            this.pluginLists = window.store.storeGet('plugin.streamDeck');
            if (!this.pluginLists) {
                this.pluginLists = [];
            }
            console.log('PluginConfig: loadPluginInfo: this.pluginLists', this.pluginLists);
        },
        pluginClicked(menu, index) {
            this.currentPluginSelected = this.pluginLists[index];
            if (this.selectedIndex === index) {
                this.selectedIndex = null; // 取消选中状态
            } else {
                this.selectedIndex = index; // 更新选中的索引
            }
        },
        addPlugin() {
            this.selectedIndex = null;
            this.renameIndex = null;
            const that = this;
            dialog
                .showOpenDialog({
                    properties: ['openFile'],
                    filters: [
                        {
                            name: 'Zip Files',
                            extensions: ['zip'],
                        },
                    ],
                })
                .then(result => {
                    console.log('PluginConfig: addPlugin: UserSelected File: ', result);

                    if (result.canceled || !result.filePaths || result.filePaths.length < 1) return;

                    window.appManager.resourcesManager
                        .addPlugin(result.filePaths[0])
                        .then(pluginInfo => {
                            that.$message({
                                message: that
                                    .$t('settings.installPluginSuccess')
                                    .replace('{{pluginName}}', pluginInfo.pluginName),
                                type: 'success',
                            });
                            this.loadPluginInfo();
                            ipcRenderer.send('PluginListChange', {
                                isDelete: false,
                                pluginId: pluginInfo.pluginId,
                            });
                        })
                        .catch(err => {
                            if (err === 'Plugin type not support') {
                                that.$message.error(that.$t('settings.pluginTypeNotSupport'));
                                return;
                            }
                            console.log(
                                'PluginConfig: addPlugin: Detected error when install plugin: ',
                                err
                            );
                            that.$message.error(that.$t('settings.installPluginFailed'));
                        });
                })
                .catch(error => {
                    console.log('PluginConfig: UserSelected File detected error: ', error);
                });
        },
        // 删除
        deletePlugin() {
            console.log('PluginConfig: deletePlugin: ', this.currentPluginSelected);
            if (!this.currentPluginSelected) return;
            if (this.isConfirmFlag) return
            this.isConfirmFlag = true;
            this.$confirm(
                this.$t('settings.deletePluginConfig').replace(
                    '{{pluginName}}',
                    this.currentPluginSelected.pluginName
                ),
                '',
                {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    type: 'warning',
                }
            )
                .then(() => {
                    window.appManager.resourcesManager.deletePlugin(
                        this.currentPluginSelected.pluginId
                    );
                    this.loadPluginInfo();

                    this.$message({
                        message: this.$t('settings.deletePluginSuccess'),
                        type: 'success',
                    });
                    ipcRenderer.send('PluginListChange', {
                        isDelete: true,
                        pluginId: this.currentPluginSelected.pluginId,
                    });
                    this.currentPluginSelected = undefined;
                })
                .catch(err => {
                    if (err === 'cancel') {
                        console.log('PluginConfig: deletePlugin: Cencel');
                    } else {
                        console.log('PluginConfig: deletePlugin: detected error: ', err);
                        this.$message.error(this.$t('settings.deletePluginFailed'));
                    }
                }).finally(() => {
                    this.isConfirmFlag = false;
                });
        },
        handleExternalLinkClicked() {
            shell.openExternal(this.currentPluginSelected.manifestInfo.URL);
        },
    },
};
</script>
<style lang="less" scoped>
.el-button--primary.is-plain {
    font-size: 14px;
}

.el-button--mini,
.el-button--mini.is-round {
    padding: 0px;
}

.el-container {
    display: flex;
    flex-direction: column;
    height: 380px;
    /* 添加 max-height 属性 */
    max-height: 100%;

    .el-scrollbar {
        width: 100%;
        height: 100%;
    }

    .handleMenu {
        height: 30px;
        line-height: 30px;
        background: #2f3a41;
        padding: 0 10px;
    }
}

.el-scrollbar /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
}

.scrollbar-menu:last-child {
    margin-bottom: 0 !important;
}

// 高亮
.highlight {
    /deep/ .el-link--inner {
        color: #4b9cfb;
    }
}

.content {
    display: flex;
    padding: 15px;
    height: 380px;
    font-size: 14px;
    color: #fff;

    // background: #303030;
    .dropdownMenu {
        width: 200px;
        background: #2e3a41;
        margin-right: 10px;

        .menu {
            display: flex;
            justify-content: space-between;
            height: 30px;
            line-height: 30px;
        }
    }

    .el-icon-s-operation {
        padding-right: 15px;
        font-size: 18px;
    }

    .dropdownMenu-right {
        flex: 1;
        background: #2e3a41;
        padding: 15px;
    }
}

.menu /deep/ .el-input__inner {
    height: 26px;
    width: 250px;
    background: #3b4a52;
    padding: 0 5px;
}

.el-link.el-link--default {
    color: #fff;
}

/deep/ .el-input__suffix {
    margin-top: -5px;
}
</style>
