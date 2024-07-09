<template>
    <div v-loading="loadingIconPacks" style="height: 100%; width: 100%; background: #2d2d2d">
        <div style="height: 50px">
            <el-input
                v-model="searchIconInput"
                :placeholder="$t('iconLib.searchHint')"
                clearable
                prefix-icon="el-icon-search"
                style="width: 200px; position: absolute; right: 10px; top: 10px"
                @input="handleSearchInput"
            />
        </div>
        <div
            id="iconSelectionHolder"
            :style="{
                maxHeight: iconSelectionContentHeight + 'px',
                height: iconSelectionContentHeight + 'px',
            }"
            class="icon-select-el-container"
        >
            <div style="width: 100%; height: 1px; background: #8c939d" />
            <el-scrollbar ref="scrollbar">
                <el-menu ref="menu" :unique-opened="true" @close="handleMenuClose" @open="handleMenuOpen">
                    <el-submenu
                        v-for="item in displayIconGroupSelectionList"
                        :key="item.iconGroupName"
                        :index="item.iconGroupName"
                    >
                        <template slot="title">
                            <div style="display: flex">
                                <IconHolder
                                    :icon-size="{ height: '20px', width: '20px' }"
                                    :img-src="item.iconGroupDisplay"
                                />
                                <span style="margin-left: 10px">{{ item.iconGroupName }}</span>
                            </div>

                            <div
                                v-if="item.canDelete"
                                style="position: absolute; right: 40px; height: 40px; bottom: 20px; z-index: 100"
                            >
                                <el-button
                                    :disabled="iconHolderSize === 150"
                                    icon="el-icon-delete"
                                    style="font-size: 23px"
                                    type="text"
                                    @click.stop="handleDeleteIconPack(item)"
                                ></el-button>
                            </div>
                        </template>

                        <div v-if="openedIconGroupName === item.iconGroupName">
                            <div
                                ref="iconHolders"
                                v-for="(iconItem, index) in displayIconList"
                                :key="index"
                                :style="{
                                    width: iconHolderSize + 'px',
                                    height: iconHolderSize + 'px',
                                    display: 'inline-block',
                                    backgroundColor: '#444',
                                    borderRadius: '5px',
                                    margin: '5px',
                                }"
                                style="display: inline"
                                @click="handleIconSelected(iconItem, index)"
                            >
                                <div
                                    style="
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        width: 100%;
                                        height: 100%;
                                    "
                                >
                                    <el-tooltip placement="top">
                                        <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                                            {{ iconItem.name }}
                                        </div>
                                        <IconHolder
                                            v-if="iconItem.id.startsWith('@mdi/')"
                                            ref="icon-display-holder"
                                            :icon-size="iconDisplaySize"
                                            :img-src="iconItem.id"
                                            :load-on-initial="false"
                                            :release-on-hide="true"
                                        />
                                        <IconHolder
                                            v-else
                                            ref="icon-display-holder"
                                            :icon-size="iconDisplaySize"
                                            :icon-src="iconItem.id"
                                            :load-on-initial="false"
                                            :release-on-hide="true"
                                        />
                                    </el-tooltip>
                                </div>
                            </div>
                        </div>
                    </el-submenu>
                </el-menu>
            </el-scrollbar>
        </div>
        <div style="height: 40px; position: absolute; bottom: 35px; width: 100%; background: #2d2d2d">
            <div style="width: 100%; height: 1px; background: #8c939d" />
            <div>
                <el-button
                    icon="el-icon-plus"
                    style="margin-left: 12px; height: 100%"
                    type="text"
                    @click="handleImportIcon"
                    >{{ $t('iconLib.importIcon') }}
                </el-button>
                <el-tooltip placement="top">
                    <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                        {{ $t('iconLib.iconPackSupportType') }}
                    </div>
                    <i class="el-icon-question" style="margin-left: 8px"></i>
                </el-tooltip>
                <div style="position: absolute; right: 20px; bottom: -8px;">
                    <el-button
                        :disabled="iconHolderSize === 150"
                        icon="el-icon-zoom-in"
                        style="font-size: 23px; margin-right: 10px"
                        type="text"
                        @click="handleZoomIn"
                    ></el-button>
                    <el-button
                        :disabled="iconHolderSize === 50"
                        icon="el-icon-zoom-out"
                        style="font-size: 23px"
                        type="text"
                        @click="handleZoomOut"
                    ></el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { dialog } from '@electron/remote';
import Constants from '@/utils/Constants';
import IconHolder from '@/views/Components/IconHolder';
import { deepCopy } from '@/utils/ObjectUtil';
import { ipcRenderer } from 'electron';

export default {
    name: 'IconSelectContent',
    components: { IconHolder },
    data() {
        return {
            loadingIconPacks: true,
            searchIconInput: '',
            iconGroupSelectionList: [],
            displayIconGroupSelectionList: [],
            availableIconList: [],
            displayIconList: [],
            iconSelectionContentHeight: 1,
            windowHeight: 600,
            isWin32: true,
            iconHolderSize: 90,
            iconDisplaySize: {
                width: '54px',
                height: '54px',
            },
            searchConfigTimer: undefined,
            selectIconInfo: {},
            openedIconGroupName: '',
            currentPage: 1,
            iconsPerRow: 6,
            rowsPerPage: 10,
            lastPageParam: {
                start: 0,
                end: 0
            }
        };
    },
    computed: {},
    mounted() {
        this.isWin32 = window.platform === 'win32';
    },
    created() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.handleResize);

            this.handleResize();
            this.loadIconsList();

            const scrollContainer = this.$refs.scrollbar.$el.querySelector('.el-scrollbar__wrap');
            scrollContainer.addEventListener('scroll', this.handleScroll);

            this.iconsPerRow = window.innerWidth / (this.iconHolderSize + 10);
        });

        ipcRenderer.on('select-for-key', (event, args) => {
            console.log('IconSelectContent: Received: select-for-key: ', args);
            this.selectIconInfo = args;
        });
    },
    beforeDestroy() {
        const scrollContainer = this.$refs.scrollbar.$el.querySelector('.el-scrollbar__wrap');
        scrollContainer.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        filterDisplayIconList() {
            const limitPerPage = this.rowsPerPage * this.iconsPerRow;
            const start = (this.currentPage - 1) * limitPerPage;
            const end = start + limitPerPage;

            if (this.lastPageParam.start === start && this.lastPageParam.end === end) return;

            this.lastPageParam.start = start;
            this.lastPageParam.end = end;

            this.displayIconList = this.displayIconList.concat(this.availableIconList.slice(start, end));
        },
        handleScroll() {
            const iconHolders = this.$refs['iconHolders'];
            if (iconHolders.length === 0) return;

            const lastIconElement = iconHolders[this.displayIconList.length - 1];
            if (lastIconElement) {
                const lastIconRect = lastIconElement.getBoundingClientRect();
                // console.log('HandleScroll: lastIconPosition: ' + (lastIconRect.top + lastIconRect.height + 10) + ' window.innerHeight: ' + window.innerHeight);

                if (lastIconRect.top + lastIconRect.height + 10 <= window.innerHeight) {
                    this.currentPage += 1;
                    this.filterDisplayIconList();
                }
            }
        },
        handleMenuOpen(index) {
            this.openedIconGroupName = index;
            this.reloadIconGroupList(index, true);
            console.log('IconSelectContent: handleMenuOpen: index: ', index);
        },
        handleMenuClose(index) {
            this.availableIconList = [];
            this.displayIconList = [];
            this.openedIconGroupName = '';
            console.log('IconSelectContent: handleMenuClose: index: ', index);
        },
        async loadIconsList() {
            this.loadingIconPacks = true;
            this.iconGroupSelectionList = [];
            const buildInIconList = window.resourcesManager.getDefaultResourceInfo(Constants.RESOURCE_TYPE_ICON);
            console.log('IconSelectContent: loadIconsList: BuildInIconList: ', buildInIconList);

            const buildInIconInfo = {
                canDelete: false,
                iconGroupName: 'DecoKee',
                iconGroupDisplay: 'app.png',
                iconList: buildInIconList,
            };

            this.iconGroupSelectionList.push(buildInIconInfo);

            const userUploadIconList = window.resourcesManager.getAllExternalResourceInfoByType(
                Constants.RESOURCE_TYPE_ICON
            );
            console.log('IconSelectContent: loadIconsList: userUploadIconList: ', userUploadIconList);

            if (userUploadIconList.length > 0) {
                const userUploadIconInfo = {
                    canDelete: false,
                    iconGroupName: 'Custom',
                    iconGroupDisplay: 'app.png',
                    iconList: userUploadIconList,
                };

                this.iconGroupSelectionList.push(userUploadIconInfo);
            }

            const mdiIcons = require('@mdi/svg/meta.json');
            console.log('IconSelectContent: loadIconsList: midIcons.length: ', mdiIcons.length);

            if (mdiIcons.length > 0) {
                const mdiIconsList = mdiIcons.map(iconInfo => {
                    return {
                        id: '@mdi/svg/svg/' + iconInfo.name + '.svg',
                        name: iconInfo.name,
                        tags: iconInfo.tags,
                        resourceType: 'MDI_ICON',
                    };
                });

                const mdiIconsGroup = {
                    canDelete: false,
                    iconGroupName: 'Material Design Icons',
                    iconGroupDisplay: '@/icon/mdi.png',
                    iconList: mdiIconsList,
                };

                this.iconGroupSelectionList.push(mdiIconsGroup);
            }

            const externalIconPacks = window.resourcesManager.getExternalIconPackInfoList();

            if (externalIconPacks.length > 0) {
                externalIconPacks.forEach(iconPackInfo => {
                    console.log('IconSelectContent: loadIconsList: externalIconPacks: ', iconPackInfo.iconList);
                    iconPackInfo.canDelete = true;
                    this.iconGroupSelectionList.push(iconPackInfo);
                });
            }

            this.displayIconGroupSelectionList = deepCopy(this.iconGroupSelectionList);

            this.loadingIconPacks = false;
        },
        handleResize() {
            this.$nextTick(() => {
                this.windowHeight = window.innerHeight - (this.isWin32 ? 32 : 0); // 更新窗口高度
                const offsetTop = document.getElementById('iconSelectionHolder').offsetTop;
                this.iconSelectionContentHeight = this.windowHeight - offsetTop - 40;
                console.log(
                    'IconSelectContent: handleResize: windowHeight: ',
                    this.windowHeight,
                    ' innerHeight: ',
                    window.innerHeight,
                    ' offsetTop: ',
                    offsetTop,
                    ' iconSelectionContentHeight: ',
                    this.iconSelectionContentHeight
                );

                this.iconsPerRow = window.innerWidth / (this.iconHolderSize + 10);
                this.currentPage = 1;
                this.filterDisplayIconList();
            });
        },
        handleSearchInput(searchVal) {
            console.log('IconSelectContent: handleSearchInput: ', searchVal);
            clearTimeout(this.searchConfigTimer);

            if (!searchVal || searchVal === '') {
                this.displayIconGroupSelectionList = deepCopy(this.iconGroupSelectionList);
                this.reloadIconGroupList(this.openedIconGroupName, true);
                return;
            }

            this.searchConfigTimer = setTimeout(() => {
                const finalIconSelectionList = [];
                console.log(
                    'IconSelectContent: handleSearchInput: displayIconSelectionList: ' +
                        JSON.stringify(this.displayIconGroupSelectionList)
                );

                const tempFilterList = deepCopy(this.iconGroupSelectionList);

                let haveCurrentOpenGroup = false;
                tempFilterList.forEach(iconInfos => {
                    const filteredIcons = iconInfos.iconList.filter(iconDetail => {
                        try {
                            return (
                                iconDetail.name.toLowerCase().includes(searchVal.toLowerCase()) ||
                                (iconDetail.tags &&
                                    iconDetail.tags instanceof Array &&
                                    iconDetail.tags.filter(tagName =>
                                        tagName.toLowerCase().includes(searchVal.toLowerCase())
                                    ).length > 0) ||
                                (iconDetail.extraData &&
                                    iconDetail.extraData instanceof Array &&
                                    iconDetail.extraData.filter(tagName =>
                                        tagName.toLowerCase().includes(searchVal.toLowerCase())
                                    ).length > 0)
                            );
                        } catch (err) {
                            console.log(
                                'IconSelectContent: handleSearchInput: tags: ',
                                iconDetail.tags,
                                'Error: ',
                                err
                            );
                        }
                        return false;
                    });

                    if (!filteredIcons || filteredIcons.length === 0) return;

                    if (iconInfos.iconGroupName === this.openedIconGroupName) {
                        haveCurrentOpenGroup = true;
                    }

                    iconInfos.iconList = filteredIcons;

                    finalIconSelectionList.push(iconInfos);
                });
                this.displayIconGroupSelectionList = deepCopy(finalIconSelectionList);

                if (!haveCurrentOpenGroup) {
                    this.$refs.menu.close(this.openedIconGroupName);
                    this.openedIconGroupName = '';
                    return;
                }

                this.reloadIconGroupList(this.openedIconGroupName, false);
            }, 500);
        },
        reloadIconGroupList(iconGroupName, isInitial) {
            this.currentPage = 1;
            this.lastPageParam.start = -1;
            this.lastPageParam.end = -1;
            this.displayIconList = [];
            this.availableIconList = this.displayIconGroupSelectionList.find(
                iconGroupInfo => iconGroupInfo.iconGroupName === iconGroupName
            ).iconList;
            this.filterDisplayIconList();

            if (isInitial) return;

            setTimeout(() => {
                const iconDisplayHolders = this.$refs['icon-display-holder'];
                iconDisplayHolders.forEach(iconHolder => iconHolder.forceReload());
            }, 500);
        },
        handleImportIcon() {
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
                    console.log('IconSelectContent: handleImportIcon: UserSelected File: ', result);

                    if (result.canceled || !result.filePaths || result.filePaths.length < 1) return;

                    that.loadingIconPacks = true;

                    setTimeout(() => {
                        window.appManager.resourcesManager
                            .addIconPack(result.filePaths[0])
                            .then(iconPackInfo => {
                                that.$message({
                                    message: that
                                        .$t('iconLib.installIconPackSuccess')
                                        .replace('{{iconPackName}}', iconPackInfo.iconPackName),
                                    type: 'success',
                                });
                                that.loadIconsList();
                            })
                            .catch(err => {
                                that.loadingIconPacks = false;
                                if (err === 'Invalid icon pack') {
                                    that.$message.error(that.$t('iconLib.iconPackTypeNotSupport'));
                                    return;
                                }
                                console.log(
                                    'IconSelectContent: handleImportIcon: Detected error when install icon pack: ',
                                    err
                                );
                                that.$message.error(that.$t('iconLib.installIconPackFailed'));
                            });
                    }, 1000);
                })
                .catch(error => {
                    console.log('IconSelectContent: handleImportIcon File detected error: ', error);
                });
        },
        handleZoomIn() {
            if (this.iconHolderSize === 150) return;
            this.iconHolderSize += 10;
            this.iconDisplaySize = {
                width: this.iconHolderSize * 0.6 + 'px',
                height: this.iconHolderSize * 0.6 + 'px',
            };
        },
        handleZoomOut() {
            if (this.iconHolderSize === 50) return;
            this.iconHolderSize -= 10;
            this.iconDisplaySize = {
                width: this.iconHolderSize * 0.6 + 'px',
                height: this.iconHolderSize * 0.6 + 'px',
            };
        },
        handleIconSelected(selectedItem, index) {
            console.log('IconSelectContent: handleIconSelected: selectedItem: ', selectedItem, ' Index: ', index);
            this.selectIconInfo.selectedIcon = deepCopy(selectedItem);

            if (selectedItem.resourceType === 'MDI_ICON') {
                window.resourcesManager.getConvertedIconId(this.selectIconInfo.selectedIcon)
                    .then(resId => {
                        if (resId === '-1') {
                            return;
                        }
                        this.selectIconInfo.selectedIcon.id = resId;
                        ipcRenderer.send('icon-selected', this.selectIconInfo);
                    });
            } else {
                ipcRenderer.send('icon-selected', this.selectIconInfo);
            }

        },
        handleDeleteIconPack(deleteItem) {
            console.log('IconSelectContent: handleDeleteIconPack: deleteItem: ', deleteItem);
            this.$confirm(
                this.$t('iconLib.deleteIconPackConfirm').replace('{{iconPackName}}', deleteItem.iconGroupName),
                '',
                {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    type: 'warning',
                }
            )
                .then(() => {
                    this.loadingIconPacks = true;

                    setTimeout(() => {
                        window.appManager.resourcesManager.deleteExternalIconPack(deleteItem.iconPackType);
                        this.loadIconsList();

                        this.$message({
                            message: this.$t('iconLib.deleteIconPackSuccess').replace(
                                '{{iconPackName}}',
                                deleteItem.iconGroupName
                            ),
                            type: 'success',
                        });
                    }, 1000);
                })
                .catch(err => {
                    this.loadingIconPacks = false;
                    if (err === 'cancel') {
                        console.log('IconSelectContent: handleDeleteIconPack: Cencel');
                    } else {
                        console.log('IconSelectContent: handleDeleteIconPack: detected error: ', err);
                        this.$message.error(
                            this.$t('iconLib.deleteIconPackFailed').replace(
                                '{{iconPackName}}',
                                deleteItem.iconGroupName
                            )
                        );
                    }
                });
        },
    },
};
</script>

<style lang="less">
.icon-select-el-container {
    .el-scrollbar {
        width: 100%;
        height: 100%;
    }

    .el-scrollbar .el-scrollbar__wrap {
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .el-scrollbar__bar.is-horizontal {
        height: 0;
    }

    .el-menu-item-group .el-menu-item-group__title {
        padding: 0px !important;
    }

    .el-menu {
        border-right: none;
        background: transparent !important;
    }

    .el-menu .el-menu--inline {
        background: #222 !important;
    }

    .el-menu-item-group .el-menu-item .span {
        border: none;
        border-radius: 8px;
        background: #2d2d2d;
        color: #909399 !important;
    }

    .el-menu-item {
        border-bottom: 1px solid #8c939d;
    }

    .el-submenu {
        border-bottom: 1px solid #8c939d;
    }

    .el-submenu .el-submenu__title {
        color: #c7c3c3 !important;
        font-size: 18px;
        font-weight: 800;
    }

    .el-menu .el-submenu__title:hover {
        background: #606266;
    }

    .el-menu-item:focus,
    .el-menu-item:hover {
        background: transparent;
    }
}
</style>
