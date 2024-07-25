<template>
    <div>
        <div class="content" style="position: relative">
            <div class="dropdownMenu">
                <div class="el-container">
                    <el-scrollbar>
                        <div v-for="(item, index) in dropdownMenu" :key="item.value" :class="{ highlight: isHighlighted(index) }" class="menu" @click="menuBtn(item, index)">
                            <el-input v-if="index === renameIndex" id="renameInput" v-model="item.label" clearable maxlength="15" @blur="handleBlur(item.label, index)" @input="handleInput($event, index, item.value)" />
                            <div v-else @contextmenu.prevent="onContextmenu($event, index, item.value, item.label)">
                                {{ item.label }}
                            </div>
                        </div>
                    </el-scrollbar>

                    <div class="handleMenu">
                        <el-button class="btn-folder" icon="el-icon-plus" plain size="mini" type="primary" @click="addDropdownMenu"></el-button>
                        <el-button :disabled="!!(selectedIndex && dropdownMenu[selectedIndex].value === '1-0')" class="btn-folder" icon="el-icon-minus" plain size="mini" type="primary" @click="deleteDropdownMenu"></el-button>
                    </div>
                </div>
            </div>

            <div class="dropdownMenu-right">
                <div v-if="selectedIndex !== null && checkedProfileConfigs.length === 1">
                    <span>{{ $t('settings.monitorFrontApp') }}</span>

                    <el-form size="mini" style="padding: 20px">
                        <el-form-item :label="$t('settings.selectApplication')">
                            <el-select ref="selectApplicationDropdown" v-model="selectedApplication" :placeholder="$t('pleaseSelect')" size="mini" filterable clearable @change="handleApplicationSelected">
                                <el-option :label="$t('settings.none')" value="Not Monitor">
                                    <span style="float: left; width: 260px; overflow: hidden">
                                        {{ $t('settings.none') }}
                                    </span>
                                    <span v-if="selectedApplication === 'Not Monitor'" style="margin-left: 12px; float: right; color: #8492a6; font-size: 13px">
                                        <i class="el-icon-check" style="color: white"></i>
                                    </span>
                                </el-option>

                                <el-option v-if="showCustomApplication" :label="selectedApplication" value="Custom App">
                                    <div style="float: left; width: 260px; overflow: hidden; display: flex; height: 30px">
                                        <IconHolder style="
                                                height: 100%;
                                                justify-content: center;
                                                align-items: center;
                                                display: flex;
                                            " :icon-size="{ width: '20px', height: '20px' }" :icon-src="customAppIcon" />
                                        <span style="margin-left: 12px">{{ selectedApplication }}</span>
                                    </div>
                                    <span style="margin-left: 12px; float: right; color: #8492a6; font-size: 13px">
                                        <i class="el-icon-check" style="color: white"></i>
                                    </span>
                                </el-option>

                                <div style="height: 1px; width: 100%; background: lightgray"></div>
                                <el-option v-for="item in applicationList" :key="item.appIdentifier" :label="item.DisplayName" :value="item.appIdentifier">
                                    <div style="float: left; width: 260px; overflow: hidden; display: flex; height: 30px">
                                        <IconHolder style="
                                                height: 100%;
                                                justify-content: center;
                                                align-items: center;
                                                display: flex;
                                            " :icon-size="{ width: '20px', height: '20px' }" :icon-src="item.displayIcon" />
                                        <span style="margin-left: 12px">{{ item.DisplayName }}</span>
                                    </div>
                                    <span v-if="selectedApplication === item.appIdentifier" style="margin-left: 12px; float: right; color: #8492a6; font-size: 13px">
                                        <i class="el-icon-check" style="color: white"></i>
                                    </span>
                                </el-option>
                                <div style="height: 1px; width: 100%; background: lightgray"></div>
                                <el-option :label="$t('settings.other')" value="Select From File">
                                    <span style="float: left; width: 260px; overflow: hidden">
                                        {{ $t('settings.other') }}
                                    </span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('settings.selectDevice')">
                            <el-select ref="selectDeviceDropdown" v-model="selectedMonitorDevice" :placeholder="$t('pleaseSelect')" size="mini" filterable @change="handleDeviceSelected">
                                <el-option :label="$t('settings.allDevice')" value="All Device">
                                    <span style="float: left; width: 260px; overflow: hidden">{{
                                        $t('settings.allDevice')
                                    }}</span>
                                    <span v-if="selectedApplication === 'All Device'" style="margin-left: 12px; float: right; color: #8492a6; font-size: 13px">
                                        <i class="el-icon-check" style="color: white"></i>
                                    </span>
                                </el-option>

                                <el-option v-for="item in connectedDevices" :key="item.serialNumber" :label="'DecoKee ' + item.serialNumber.substring(item.serialNumber.length - 4)" :value="item.serialNumber"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <el-checkbox v-model="isDefault" @change="handleIsDefault">{{ $t('setDefault') }}</el-checkbox>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { deepCopy } from '@/utils/ObjectUtil';
import Constants from '@/utils/Constants';
import { ipcRenderer } from 'electron';
import { dialog } from '@electron/remote';
import IconHolder from '@/views/Components/IconHolder';

export default {
    components: {
        IconHolder,
    },
    computed: {
        // 高亮
        isHighlighted() {
            return index => index === this.selectedIndex || this.checkedProfileConfigs.includes(index);
        },
    },
    data() {
        return {
            top: 0,
            left: 0,
            rowCount: 2,
            colCount: 3,
            dropdownMenu: [],
            // 选择项
            selectedIndex: null,
            currentMenu: {},
            isDefault: false,
            // 默认资源
            defaultResource: [],
            filterMenu: {},

            // 资源id
            resourceId: null,
            allResource: [],
            renameIndex: null,

            isRightClick: false,
            labelName: '',
            checkedProfileConfigs: [],

            selectedMonitorDevice: 'All Device',
            connectedDevices: [],

            selectedApplication: 'Not Monitor',
            customAppIcon: undefined,
            applicationList: [],
            showCustomApplication: false,

            appMonitorConfigs: {},

            contextMenuData: [
                {
                    label: this.$t('settings.rename'),
                    // icon: "iconfont el-icon-edit-outline",
                    onClick: () => {
                        // this.EiditRowFun();
                        this.editLabelBtn();
                    },
                },
                {
                    label: this.$t('settings.copy'),
                    // icon: "icon el-icon-top",
                    onClick: () => {
                        this.copyMenuBtn();
                    },
                },
                {
                    label: this.$t('settings.delete'),
                    // icon: "icon el-icon-top",
                    onClick: () => {
                        this.deleteDropdownMenu();
                    },
                },
            ],
            copyId: '',
            copyLable: '',
            controlPressed: false,
        };
    },
    created() {
        if (window.store.storeGet('mainscreen.dropdownMenu')) {
            this.dropdownMenu = window.store.storeGet('mainscreen.dropdownMenu');
        }
        console.log('profileConfig  dropdownMenu', this.dropdownMenu);

        this.getDefaultResource();

        ipcRenderer.on('subpage-newDeviceMenu', (event, data, row, col) => {
            // 处理主窗口发送的数据
            this.dropdownMenu = deepCopy(data, row, col);
            this.rowCount = row;
            this.colCount = col;
        });

        window.addEventListener('keydown', this.processKeyEvent);
        window.addEventListener('keyup', this.processKeyEvent);

        this.getInstalledAppInfo();

        const savedMonitorConfig = window.store.storeGet('settings.appMonitorConfig');
        if (!savedMonitorConfig) {
            this.appMonitorConfigs = {};
        } else {
            this.appMonitorConfigs = JSON.parse(savedMonitorConfig);
        }

        this.connectedDevices = window.appManager.deviceControlManager.getConnectedDevices();
    },
    destroyed() {
        console.log('profileConfig: destroyed: ');
        window.removeEventListener('keydown', this.processKeyEvent);
        window.removeEventListener('keyup', this.processKeyEvent);
    },

    methods: {
        async getInstalledAppInfo() {
            const currentInstalledApps = window.appManager.resourcesManager.getInstalledApps();

            const seen = {};

            for (let i = 0; i < currentInstalledApps.length; i++) {
                const appInfo = currentInstalledApps[i];

                const { appIdentifier, appLaunchPath } = appInfo;

                // 如果appIdentifier已经存在, 或appLaunchPath以.lnk结尾，则剔除该项
                if (seen[appIdentifier] || appLaunchPath.endsWith('.lnk')) {
                    continue;
                }

                // 如果appIdentifier存在，则不再记录
                if (!seen[appIdentifier]) {
                    seen[appIdentifier] = true;
                }

                this.applicationList.push(appInfo);
            }
        },
        processKeyEvent(e) {
            // console.log('profileConfig: keydown: ', e.key, e.type);
            if (e.key === 'Delete' && e.type === 'keyup') {
                this.deleteDropdownMenu();
            } else if (e.key === 'Control') {
                this.controlPressed = e.type === 'keydown';
            }
        },
        // getConfigInfo,
        // 鼠标右键事件
        onContextmenu(event, index, resourceId, label) {
            this.copyId = resourceId;
            this.copyLable = label;
            this.selectedIndex = index;
            this.checkedProfileConfigs = [index];
            this.$contextmenu({
                items:
                    this.dropdownMenu[this.selectedIndex].value === '1-0'
                        ? this.contextMenuData.slice(0, this.contextMenuData.length - 1)
                        : this.contextMenuData,
                event, // 鼠标事件信息
                customClass: 'right-click-menu', // 自定义菜单 class
                zIndex: 1, // 菜单样式 z-index
                minWidth: 140, // 主菜单最小宽度
            });
            return false;
        },

        sendMenu(newMenu, isadd) {
            // 向主窗口发送消息
            ipcRenderer.send('mainpage-sendMenu', newMenu, isadd);
        },

        // 获取默认资源
        getDefaultResource() {
            this.defaultResource = window.resourcesManager.getDefaultResourceInfo(
                Constants.RESOURCE_TYPE_DEVICE_CONFIG
            );
            // console.log("profileConfig  默认配置文件", this.defaultResource);
            if (this.dropdownMenu.length !== 0 && this.defaultResource.length !== 0) {
                this.dropdownMenu.find(item => {
                    if (item.value === this.defaultResource[0].id) {
                        this.filterMenu = item;
                    }
                });
                // console.log("profileConfig  filterMenu", this.filterMenu);
            }
        },
        menuBtn(menu, index) {
            this.currentMenu = deepCopy(menu);
            this.selectedIndex = index; // 更新选中的索引
            this.isDefault = false;

            if (this.controlPressed) {
                this.checkedProfileConfigs.push(index);

                this.checkedProfileConfigs = this.checkedProfileConfigs.filter(
                    item => this.dropdownMenu[item].value !== '1-0'
                );
            } else {
                this.checkedProfileConfigs = [index];
            }

            if (!this.appMonitorConfigs[this.currentMenu.value]) {
                this.appMonitorConfigs[this.currentMenu.value] = {
                    deviceSN: 'All Device',
                    appPath: 'Not Monitor',
                    appIdentifier: 'Not Monitor',
                    resourceId: this.currentMenu.value,
                };
            }

            this.selectedApplication = this.appMonitorConfigs[this.currentMenu.value].appIdentifier;
            this.selectedMonitorDevice = this.appMonitorConfigs[this.currentMenu.value].deviceSN;

            if (this.currentMenu.value === this.filterMenu.value) {
                this.isDefault = true;
            }
        },
        handleIsDefault(val) {
            const result = window.resourcesManager.markConfigAsDefault(this.currentMenu.value, val);
            console.log('profileConfig  默认设置成功', result);
            this.getDefaultResource();
        },
        getAllResource() {
            this.allResource = window.resourcesManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_DEVICE_CONFIG);
            // console.log("profileConfig  全部资源列表", this.allResource);
        },
        getAddConfigInfo(configId, page, folder) {
            const configArr = [];
            for (let row = 1; row <= this.deviceRowCount; row++) {
                for (let col = 1; col <= this.deviceColCount; col++) {
                    configArr.push({
                        keyCode: `${row},${col}`,
                        config: {
                            type: '',
                            title: {
                                text: '',
                                pos: 'bot',
                                size: 8,
                                color: '#FFFFFF',
                                display: true,
                                style: 'bold|italic|underline',
                                resourceId: 0,
                            },
                            icon: '',
                            actions: [
                                {
                                    type: '',
                                    value: '',
                                },
                            ],
                        },
                    });
                }
            }
            configArr.push({
                keyCode: '0,1',
                config: {
                    type: 'knob',
                    title: {
                        text: '',
                        pos: 'bot',
                        size: 8,
                        color: '#FFFFFF',
                        display: true,
                        style: 'bold|italic|underline',
                        resourceId: 0,
                    },
                    icon: '0-50',
                    subActions: [
                        {
                            childrenName: 'assistant',
                            config: {
                                type: 'assistant',
                                title: {
                                    text: '',
                                    pos: 'bot',
                                    size: 8,
                                    color: '#FFFFFF',
                                    display: true,
                                    style: 'bold|italic|underline',
                                    resourceId: 0,
                                },
                                icon: '0-50',
                                animations: ['0-47', '0-48', '0-49', '0-51'],
                                actions: [
                                    {
                                        type: 'assistant',
                                        value: '',
                                    },
                                ],
                            },
                        },
                    ],
                },
            });
            this.resourceId = window.resourcesManager.addConfigInfo(configId, page, folder, configArr);
            console.log('profileConfig  添加按键配置', this.resourceId);
        },

        addDropdownMenu() {
            this.selectedIndex = null;
            this.checkedProfileConfigs = [];
            this.getAllResource();
            const label = this.$t('profile');
            let maxIndex = 0;
            this.dropdownMenu.forEach(item => {
                if (item.label.startsWith(label)) {
                    const num = item.label.substring(label.length);
                    maxIndex = Math.max(maxIndex, Number(num)) || 0;
                }
            });
            const configIdArr = [];
            this.allResource.forEach(item => {
                const [configId, page, folder] = item.name.split(',');
                configIdArr.push(configId);
                console.log(page, folder);
            });
            const nextConfigId = Math.max(...configIdArr) + 1;
            console.log('profileConfig  最大配置文件', nextConfigId);
            this.getAddConfigInfo(nextConfigId, 1, 1);

            this.dropdownMenu.unshift({
                label: `${label}${maxIndex + 1}`,
                value: this.resourceId,
                // command: `${label}${maxIndex + 1}`,
            });
            window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
            this.dropdownMenu = window.store.storeGet('mainscreen.dropdownMenu');

            this.sendMenu(this.dropdownMenu, true);
        },
        // 删除
        deleteDropdownMenu() {
            this.getAllResource();

            this.checkedProfileConfigs = this.checkedProfileConfigs.filter(
                item => this.dropdownMenu[item].value !== '1-0'
            );

            if (this.checkedProfileConfigs.length === 0) {
                return;
            }

            const needDeleteMenus = this.dropdownMenu.filter((item, index) => {
                console.log('ProfileConfig: Filtering item: ', item, ' index: ', index);
                return this.checkedProfileConfigs.includes(index);
            });
            console.log(
                'ProfileConfig: needDeleteMenus: ',
                needDeleteMenus,
                ' checkedProfileConfigs: ',
                this.checkedProfileConfigs
            );

            const includesArr = this.allResource.filter(
                item => needDeleteMenus.filter(menuItem => menuItem.value === item.id).length > 0
            );
            console.log('profileConfig  包含', includesArr);
            const firstNumbersSet = new Set(includesArr.map(item => item.name.split(',')[0]));
            // 使用filter筛选出name的第一个数在Set中的元素
            const filterArr = this.allResource.filter(newItem => {
                const firstNumber = newItem.name.split(',')[0];
                return firstNumbersSet.has(firstNumber);
            });

            console.log('ProfileConfig: filterArr: ', filterArr);
            this.$confirm(this.$t('settings.deleteConfig'), '', {
                confirmButtonText: this.$t('confirm'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning',
            })
                .then(() => {
                    filterArr.forEach(item => {
                        window.resourcesManager.deleteConfig(item.id);
                    });
                    // 删除菜单
                    const filteredMenu = this.dropdownMenu.filter(
                        (item, index) => !this.checkedProfileConfigs.includes(index)
                    );
                    console.log('profileConfig  删除菜单项', filteredMenu);

                    this.dropdownMenu = deepCopy(filteredMenu);
                    window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);

                    // 发送到主界面
                    this.sendMenu(this.dropdownMenu, false);

                    this.selectedIndex = null;
                    this.checkedProfileConfigs = [];
                })
                .catch(err => {
                    console.log('profileConfig  删除菜单项 err: ', err);
                });
        },

        handleInput(e, index) {
            this.$set(this.dropdownMenu[index], this.dropdownMenu[index].label, e);
        },
        handleBlur() {
            this.renameIndex = null;
            window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
            this.sendMenu(this.dropdownMenu);
        },
        editLabelBtn() {
            this.renameIndex = this.selectedIndex;
            this.checkedProfileConfigs = [this.selectedIndex];
            this.$nextTick(() => {
                document.getElementById('renameInput').focus();
            });
        },

        copyMenuBtn() {
            // eslint-disable-next-line no-unused-vars
            const [label, num] = this.copyLable.split('-');
            let newLabel = '';

            const filterCopyMenu = this.dropdownMenu.filter(item => {
                return item.label.startsWith(label) && item.label.includes('副本');
            });
            console.log('profileConfig  filterCopyMenu', filterCopyMenu);

            let copyNumber = 1;
            if (filterCopyMenu.length > 0) {
                const maxCopyNumber = Math.max(
                    ...filterCopyMenu.map(item => parseInt(item.label.match(/ - 副本(\d+)$/)[1]))
                );
                copyNumber = maxCopyNumber + 1;
                newLabel = `${label} - 副本${copyNumber}`;
                console.log('profileConfig  newLabel', newLabel);
            } else {
                newLabel = `${label} - 副本${copyNumber}`;
                console.log('profileConfig  newLabel', newLabel);
            }

            const newResourceId = window.resourcesManager.copyConfig(this.copyId);
            this.dropdownMenu.splice(this.selectedIndex, 0, {
                label: newLabel,
                value: newResourceId,
            });
            window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
            this.dropdownMenu = window.store.storeGet('mainscreen.dropdownMenu');

            this.sendMenu(this.dropdownMenu, true);
        },
        doSetMonitorInfo() {
            console.log('ProfileConfig: doSetMonitorInfo: SaveConfigInfo: ', JSON.stringify(this.appMonitorConfigs));

            window.store.storeSet('settings.appMonitorConfig', JSON.stringify(this.appMonitorConfigs));

            window.appManager.deviceControlManager.reloadAppMonitorConfigInfo();
        },
        handleDeviceSelected() {
            console.log('ProfileConfig: handleDeviceSelected: Select Device: ', this.selectedMonitorDevice);
            if (!this.appMonitorConfigs[this.currentMenu.value]) {
                this.appMonitorConfigs[this.currentMenu.value] = {};
            }
            this.appMonitorConfigs[this.currentMenu.value].deviceSN = this.selectedMonitorDevice;
            this.doSetMonitorInfo();
        },
        handleApplicationSelected() {
            if (!this.selectedApplication) {
                this.selectedApplication = 'Not Monitor';
            }
            if (this.selectedApplication === 'Select From File') {
                console.log('ProfileConfig: handleApplicationSelected: Select From File');

                let filters;

                switch (window.platform) {
                    case 'win32':
                        filters = [
                            {
                                name: 'Executable Files',
                                extensions: ['exe'],
                            },
                        ];
                        break;
                    case 'linux':
                        filters = [
                            {
                                name: 'Executable Files',
                                extensions: ['sh', 'bin'],
                            },
                        ];
                        break;
                    case 'darwin':
                        filters = [
                            {
                                name: 'Applications',
                                extensions: ['app'],
                            },
                        ];
                        break;
                    default:
                        filters = [];
                }
                const that = this;
                this.$refs.selectApplicationDropdown.blur();

                dialog
                    .showOpenDialog({
                        properties: ['openFile'],
                        filters: filters,
                    })
                    .then(async result => {
                        that.$refs.selectApplicationDropdown.blur();
                        that.showCustomApplication = false;
                        if (result.canceled) {
                            that.selectedApplication = 'Not Monitor';
                            delete that.appMonitorConfigs[that.currentMenu.value];
                            console.log('ProfileConfig Selected file: canceled');
                            return;
                        }
                        if (result.filePaths.length === 0) return;
                        const filePath = result.filePaths[0];
                        const fileNameWithExt = window.path.basename(filePath);
                        const fileNameWithoutExt = window.path.parse(fileNameWithExt).name;

                        const appIconInfo = await window.resourcesManager.getAppIconInfo(filePath);
                        if (appIconInfo) {
                            that.customAppIcon = appIconInfo.id;
                        }

                        that.selectedApplication = fileNameWithoutExt;

                        if (!that.appMonitorConfigs[that.currentMenu.value]) {
                            that.appMonitorConfigs[that.currentMenu.value] = {};
                        }

                        that.appMonitorConfigs[that.currentMenu.value].appPath = filePath;
                        that.appMonitorConfigs[that.currentMenu.value].appIdentifier = fileNameWithoutExt;

                        that.showCustomApplication = true;
                        console.log(
                            'ProfileConfig Selected file: ',
                            filePath,
                            ' fileNameWithExt',
                            fileNameWithExt,
                            ' fileNameWithoutExt: ',
                            fileNameWithoutExt
                        );
                    })
                    .catch(err => {
                        that.showCustomApplication = false;
                        that.selectedApplication = 'Not Monitor';
                        delete that.appMonitorConfigs[that.currentMenu.value];
                        that.customAppIcon = undefined;
                        that.$refs.selectApplicationDropdown.blur();
                        console.log('ProfileConfig handleApplicationSelected Error: ', err);
                    });
            } else if (this.selectedApplication === 'Not Monitor') {
                delete this.appMonitorConfigs[this.currentMenu.value];
                this.doSetMonitorInfo();
                this.showCustomApplication = false;
                console.log('ProfileConfig: handleApplicationSelected: Not Monitor');
            } else {
                const selectedAppInfo = this.applicationList.find(
                    item => item.appIdentifier === this.selectedApplication
                );
                if (!this.appMonitorConfigs[this.currentMenu.value]) {
                    this.appMonitorConfigs[this.currentMenu.value] = {};
                }
                this.appMonitorConfigs[this.currentMenu.value].appPath = selectedAppInfo.appLaunchPath;
                this.appMonitorConfigs[this.currentMenu.value].appIdentifier = selectedAppInfo.appIdentifier;

                this.doSetMonitorInfo();
                this.showCustomApplication = false;
                console.log('ProfileConfig: handleApplicationSelected: ', selectedAppInfo);
            }
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
    background: #000;
}

.content {
    display: flex;
    padding: 15px;
    height: 380px;
    font-size: 14px;
    color: #fff;

    // background: #303030;
    .dropdownMenu {
        width: 280px;
        background: #2e3a41;
        margin-right: 10px;
        width: 260px;

        .menu {
            height: 30px;
            padding: 0 5px;
            line-height: 30px;
        }
    }

    .dropdownMenu-right {
        flex: 1;
        background: #2e3a41;
        padding: 10px;
    }
}

.menu /deep/ .el-input__inner {
    background: #3b4a52;
}
.menu .el-input /deep/ .el-input__suffix {
    top: -5px;
}
</style>
