<template>
    <div>
        <div class="main">
            <div class="main-screen" :style="{width: (mainscreenWidth - 300) + 'px', height: windowHeight + 'px' }">
                <!-- 按键功能 -->
                <!-- 格子 -->
                <div id="box-main" class="box-content">
                    <template v-if="!knobFun">
                        <template>
                            <div v-if="showVIA" class="app-action-button button-red" @click="showVIA = false">
                                <svg-icon color="white" name="close" style="font-size: 24px; position: absolute; top: 10px; right: 10px; z-index: 1001" />
                            </div>
                            <webview v-if="showVIA" id="viaView" ref="viaView" :style="{
                                    position: 'absolute',
                                    top: '0',
                                    left: 0,
                                    width: '100%',
                                    height: windowHeight + 'px',
                                    zIndex: 1000,
                                }" :src="viaServerUrl" webpreferences="webSecurity=no,nodeIntegration=yes">
                            </webview>
                        </template>

                        <template v-if="!isMultiActions">

                            <div class="box-profile">
                                <div style="margin-bottom: 15px">
                                    <!-- 选择设备 -->
                                    <el-dropdown trigger="click" @command="handDeviceSelected">
                                        <span class="el-dropdown-link">
                                            {{ deviceName }}
                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                        </span>
                                        <el-dropdown-menu>
                                            <el-scrollbar :style="{
                                                    height:
                                                        (deviceArr.length * 37 > 300 ? 300 : deviceArr.length * 37) +
                                                        'px',
                                                }">
                                                <el-dropdown-item v-for="item in deviceArr" :key="item.serialNumber" :command="item.serialNumber + '@' + item.connectionType" style="border-bottom: 1px solid #505050">
                                                    {{ item.label }}
                                                </el-dropdown-item>
                                            </el-scrollbar>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>

                                <!-- 配置文件 -->
                                <div>
                                    <el-dropdown trigger="click" @command="handleProfileSelected">
                                        <span class="el-dropdown-link">
                                            {{ selectedConfigProfile }}
                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                        </span>
                                        <el-dropdown-menu>
                                            <el-scrollbar :style="{
                                                    height:
                                                        (dropdownMenu.length * 36 > 300
                                                            ? 300
                                                            : dropdownMenu.length * 36) + 'px',
                                                }">
                                                <el-dropdown-item v-for="item in dropdownMenu" :key="item.value" :command="item.label">
                                                    <i v-if="selectedConfigProfile === item.label" class="el-icon-check"></i>
                                                    {{ item.label }}
                                                </el-dropdown-item>
                                            </el-scrollbar>

                                            <el-dropdown-item command="add" divided>{{ $t('newProfile') }}
                                            </el-dropdown-item>
                                            <el-dropdown-item command="edit">{{ $t('editProfile') }}</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                            </div>

                            <div class="box-key">

                                <!-- 按键 -->
                                <el-scrollbar :style="{
                                    height: (deviceRowCount * 120 > squareHeight ? squareHeight : deviceRowCount * 120) + 'px',
                                    width: (deviceColCount * 106 > squareWidth ? squareWidth : deviceColCount * 106) + 'px',
                                }">
                                    <div class="box-square" :style="{ height: (deviceRowCount * 120 > squareHeight ? squareHeight : deviceRowCount * 120) + 'px'}">
                                        <div v-for="i in deviceColCount" :key="i">
                                            <div v-for="j in deviceRowCount" :key="j" :class="{
                                            'highlight-box': selectedCell === `${j + ',' + i}`,
                                            'draggable-box': draggableCell === `${j + ',' + i}`,
                                        }" class="square" @click="cellBtn(currentConfigArray[j - 1][i - 1], i, j)" @dblclick="handleDoubleClick(currentConfigArray[j - 1][i - 1])" @mouseenter="mouseEnter(i, j)" @mouseleave="mouseLeave(i, j)">
                                                <draggable v-model="currentConfigArray" :sort="false" forceFallback="true" @end="handleEnd(currentConfigArray[j - 1][i - 1], i, j)" @start="handleStart(currentConfigArray[j - 1][i - 1])" :disabled="currentConfigArray[j - 1][i - 1]?.config?.type === 'back'">
                                                    <UnitControl :icon="currentConfigArray[j - 1][i - 1]?.config.icon" :item-data="currentConfigArray[j - 1][i - 1]" style="margin-top: 0px"></UnitControl>
                                                </draggable>
                                            </div>
                                        </div>
                                    </div>
                                </el-scrollbar>
                                <!-- 旋钮 -->
                                <div class="box-round" @dblclick="boxRoundBtn">
                                    <UnitControl v-if="ceneterData?.config" :icon="ceneterData.config.icon" :itemData="ceneterData" style="padding: 30%"></UnitControl>
                                </div>
                            </div>

                            <div class="box-setting">
                                <!-- 设置 -->
                                <el-button type="text" @click="showSettings()">
                                    <svg-icon color="darkgray" name="settings" style="font-size: 48px" />
                                </el-button>

                                <!-- 页码 -->
                                <div v-if="isPagination === 1" class="pagination">
                                    <el-button :disabled="totalPageNumber === 1" class="plusBtn" icon="el-icon-minus" type="primary" @click="handleDeletePage"></el-button>

                                    <el-pagination ref="pagination" :current-page="currentPage" :page-size="1" :total="totalPageNumber" background layout="pager" small @current-change="handleCurrentPageChanged"></el-pagination>

                                    <el-button :disabled="totalPageNumber >= 10" class="plusBtn" icon="el-icon-plus" type="primary" @click="handleAddPage"></el-button>
                                </div>

                                <!-- 保存 -->
                                <div class="box-save">
                                    <el-button type="text" @click="() => saveBtn(false)">
                                        {{ $t('save') }}
                                    </el-button>
                                </div>

                            </div>
                        </template>

                        <!-- 多项操作 -->
                        <template v-else>
                            <div id="multi-action-container" style="padding: 60px">
                                <el-page-header :content="$t('multiActions')" class="multiActions-title" @back="goBack"></el-page-header>
                                <div>
                                    <div class="box-multiActions" @mouseenter="multMouseEnter" @mouseleave="multMouseLeave">
                                        <div class="el-container">
                                            <el-scrollbar>
                                                <draggable>
                                                    <div v-for="(item, index) in multiActionsArr" :key="index" :class="{ highlight: isHighlighted(index) }" class="multiActions-config" @click="multiActionsClick(item, index)">
                                                        <IconHolder :icon-size="multiActionsIconSize" :icon-src="item.config.icon" />
                                                        <div class="multiActions-name">
                                                            <span>{{
                                                            item.isPlugin ? item.childrenName : $t(item.childrenName)
                                                        }}</span>
                                                            <span>{{ item.config.title.text }}</span>
                                                        </div>
                                                    </div>
                                                </draggable>
                                            </el-scrollbar>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </template>

                    <!-- 旋钮功能  -->
                    <KnobFunction v-else :ceneterData="ceneterData" :clickPos="clickPos" :dragPos="dragPos" :isknobDraggable="isknobDraggable" :leftData="leftData" :rightData="rightData" @changeClickPos="changeClickPos" @changeDragPos="changeDragPos" @currentKnob="currentKnob" @knobValue="knobValue" @outKnobBtn="outKnobBtn"></KnobFunction>
                </div>

                <!-- 操作配置 -->
                <el-scrollbar v-if="operationData.config" :style="{ height: Number(operationHeight) + 'px' }">
                    <OperationConfiguration :style="{ height: Number(operationHeight)+ 'px' }" v-if="operationData.config" ref="operationConfig" id="operationConfiguration" :isMultiActions="isMultiActions" :operationData="operationData" :resourceId="resourceId" @deleteOperation="deleteOperation" @enterMultiActions="enterMultiActions" @updateOperationData="updateOperationData"></OperationConfiguration>
                </el-scrollbar>
                <div v-else-if="!isMultiActions" class="prompt">
                    {{ $t('dragMessage') }}
                </div>
            </div>

            <!-- 侧边栏 -->
            <div v-if="!showVIA" :style="{ height: windowHeight + 'px' }" class="sidebar">
                <div class="box-side">
                    <el-input v-model="searchIpt" class="searchIpt" clearable placeholder="请输入内容" prefix-icon="el-icon-search" @input="handleSearchInput" />
                </div>

                <div id="scrollBarContainer" :style="{ maxHeight: maxScrollHeight + 'px' }" class="el-container">
                    <el-scrollbar>
                        <el-menu v-if="!knobFun">
                            <el-submenu v-for="item in displayMenuKeyConfiguration" :key="item.subMenu" :index="item.subMenu">
                                <template slot="title">
                                    {{ item.isPlugin ? item.subMenu : $t(item.subMenu) }}
                                </template>

                                <el-menu-item-group v-for="children in item.children" :key="children.childrenName">
                                    <draggable dragClass="dragClass" forceFallback="true" @end="onEnd(children)" @start="onStart()">
                                        <el-menu-item :index="children.childrenName">
                                            <div class="sideMenu">
                                                <IconHolder :icon-size="iconSize" :icon-src="
                                                        item.isPlugin ? children.config.menuIcon : children.config.icon
                                                    " />
                                                <span class="sideMenu-text">{{
                                                    item.isPlugin ? children.childrenName : $t(children.childrenName)
                                                }}</span>
                                            </div>
                                        </el-menu-item>
                                    </draggable>
                                </el-menu-item-group>
                            </el-submenu>
                        </el-menu>

                        <!-- 旋钮侧边栏 -->
                        <el-menu v-else-if="knobFun">
                            <el-submenu v-for="item in KNOB_MENU_SIDEBAR" :key="item.subMenu" :index="item.subMenu">
                                <template slot="title">
                                    {{ $t(item.subMenu) }}
                                </template>
                                <el-menu-item-group v-for="children in item.children" :key="children.childrenName">
                                    <!--  v-bind='{ group: "children" }' -->
                                    <draggable dragClass="dragClass" forceFallback="true" v-bind="{ group: 'children' }" @end="knobEnd(children)" @start="knobStart(children)">
                                        <el-menu-item :index="children.childrenName">
                                            <div class="sideMenu">
                                                <IconHolder :icon-size="iconSize" :icon-src="children.config.icon"></IconHolder>
                                                <span class="sideMenu-text">
                                                    {{ item.isPlugin ? children.childrenName : $t(children.childrenName) }}
                                                </span>
                                            </div>
                                        </el-menu-item>
                                    </draggable>
                                </el-menu-item-group>
                            </el-submenu>
                        </el-menu>
                    </el-scrollbar>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from '@/utils/Constants';
import draggable from 'vuedraggable';
// import VueDragResize from 'vue-drag-resize'
import OperationConfiguration from '@/views/Components/OperationConfiguration';
import { ALL_MENU_SIDEBAR, MULTIACTIONS_SIDEBAR, KNOB_MENU_SIDEBAR } from '@/plugins/KeyConfiguration.js';
import UnitControl from '@/views/Components/UnitControl.vue';
import IconHolder from './IconHolder';
import KnobFunction from './config/KnobFunction.vue';
import { deepCopy } from '@/utils/ObjectUtil';
import { ipcRenderer } from 'electron';
import { setI18nLanguage } from '@/plugins/i18n';

export default {
    name: 'MainScreen',
    components: {
        draggable,
        // eslint-disable-next-line vue/no-unused-components
        // VueDragResize,
        IconHolder,
        OperationConfiguration,
        // 单元控件
        // eslint-disable-next-line vue/no-unused-components
        UnitControl,
        KnobFunction,
    },
    computed: {
        // 多项操作高亮
        isHighlighted() {
            return index => index === this.selectedIndex;
        },
    },
    data() {
        return {
            viaServerUrl: '',
            deviceConfigTimer: null,
            deviceArr: [], // 设备列表
            serialNumber: '',
            deviceName: this.$t('selectDevice'),
            configIdx: '',

            isWin32: true,
            mainscreenWidth: window.innerWidth,
            windowHeight: window.innerHeight - 32, // 初始窗口高度
            searchIpt: '',
            selectedCell: null, // box选中状态
            isDraggable: false, //是否拖拽
            draggableCell: '',
            currentConfigArray: [
                [null, null, null],
                [null, null, null],
            ],
            standardKeyConfiguration: [],
            displayMenuKeyConfiguration: [],
            multiActionsKeyConfiguration: [],
            coordinate: '', //坐标点
            operationData: {},
            iconSize: {
                width: 20 + 'px',
                height: 20 + 'px',
            },

            selectedConfigProfile: null,
            dropdownMenu: [],
            allResource: [], // 全部资源列表
            defaultResource: [], // 默认资源列表
            resourceId: null, //资源id,
            maxScrollHeight: (window.innerHeight - 32) * 0.85,
            totalPageNumber: 1, // 分页
            currentPage: 1,
            filterPage: [],
            configId: null,
            page: null,
            folder: null,
            isPagination: 1, // 是否显示页码
            showVIA: false,

            // 多项操作
            isMultiActions: false, // 是否显示多项操作
            selectedIndex: null, // 多项操作选中状态
            multiActionsArr: [],
            multiActionsKeyCode: [],
            multiActionsIconSize: {
                width: 25 + 'px',
                height: 25 + 'px',
                marginTop: 15 + 'px',
            },
            multBox: null,

            // 旋钮
            KNOB_MENU_SIDEBAR,
            knobFun: false,
            isHover: false,
            pos: '', // 位置
            leftData: {},
            ceneterData: {},
            rightData: {},
            // 存储旋钮数据
            knobData: {},
            // 旋钮高亮
            isknobDraggable: false,
            dragPos: '',
            clickPos: '',
            currentKnobMenu: {},
            deviceRowCount: 2,
            deviceColCount: 3,

            //   高度
            mainHeight: null,
            operationHeight: null,

            squareHeight: 350,
            squareWidth: 440
        };
    },

    created() {

        const tempDeviceArr = window.appManager.deviceControlManager.getConnectedDevices();

        console.log('CurrentConnected Device: tempArr: ', tempDeviceArr);

        if (tempDeviceArr && tempDeviceArr.length > 0) {
            tempDeviceArr.forEach(deviceInfo => {
                this.processDeviceConnection(deviceInfo.serialNumber, true, deviceInfo.connectionType);
            });
        }

        ipcRenderer.on('DeviceConnection', (event, args) => {
            this.processDeviceConnection(args.serialNumber, args.connected, args.connectionType);
        });

        ipcRenderer.on('ProfileConfigChanged', (event, args) => {
            console.log('MainScreen: ProfileConfigChanged: ', args);
            if (this.resourceId !== args.resourceId) return;
            this.getAllResource();
            this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
        });

        ipcRenderer.on('DeviceProfileChange', (event, args) => {
            console.log('MainScreen:   设备发生变化', args);
            if (
                this.deviceName === this.$t('selectDevice') ||
                this.serialNumber !== args.serialNumber
            ) {
                return;
            }
            this.resourceId = args.resourceId;

            console.log('MainScreen: 设备发生变化的 resourceId', this.resourceId);

            this.configIdx = args.configIdx;
            this.resourceId = this.allResource.find(item => item.name === this.configIdx).id;
            this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
            // 初始化页码
            this.calculateTotalPage(false);
        });

        this.$nextTick(() => {
            const scrollTop = document.getElementById('scrollBarContainer').offsetTop;
            this.maxScrollHeight = this.windowHeight - scrollTop;
        });

        // 初始化配置文件
        if (window.store.storeGet('mainscreen.dropdownMenu')) {
            this.dropdownMenu = window.store.storeGet('mainscreen.dropdownMenu');
        }
        this.getAllResource();
        this.getDefaultResource();
        if (this.allResource.length === 0 && this.defaultResource.length === 0) {
            console.log('MainScreen: ----------------------------------- 步骤1');
            this.addNewConfigInfo(1, 1, 1);
            this.getAllResource();
            if (this.dropdownMenu.length === 0) {
                this.dropdownMenu.push({
                    label: this.$t('defaultProfile'),
                    value: this.resourceId,
                });
                window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
                this.selectedConfigProfile = this.$t('defaultProfile');
            }
        }

        if (this.dropdownMenu.length !== 0) {
            console.log('MainScreen: ----------------------------------- 步骤2');
            const allIds = new Set(this.allResource.map(item => item.id));
            const filteredMenu = this.dropdownMenu.filter(menuItem => allIds.has(menuItem.value));
            this.dropdownMenu = filteredMenu;
            // console.log("MainScreen:  步骤2 filteredMenu", filteredMenu);
            window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
            this.selectedConfigProfile = this.dropdownMenu[this.dropdownMenu.length - 1].label;
            this.resourceId = this.dropdownMenu[this.dropdownMenu.length - 1].value;
        }

        // 是否有选中的默认文件夹
        if (this.defaultResource.length !== 0) {
            this.dropdownMenu.forEach(item => {
                if (item.value === this.defaultResource[0].id) {
                    this.selectedConfigProfile = item.label;
                    this.resourceId = item.value;
                }
            });
        }
        console.log('MainScreen:  -------------------------------------------------  步骤3');
        this.getConfigInfo(this.deviceRowCount, this.deviceColCount);

        console.log('MainScreen:   当前资源id', this.resourceId);

        // 初始化页码
        this.calculateNextResourceId();
        this.calculateTotalPage(true);

        setTimeout(() => {
            const viaServerPort = window.store.storeGet('serverPorts.viaPluginPort');

            this.viaServerUrl = 'http://localhost:' + viaServerPort;

            console.log('MainScreen: VIA server url: ', this.viaServerUrl);
        }, 1000);
    },
    mounted() {
        this.isWin32 = window.platform === 'win32';
        this.windowHeight = window.innerHeight - (this.isWin32 ? 32 : 0);
        this.maxScrollHeight = this.windowHeight * 0.85;

        ipcRenderer.on('mainpage-newDeviceMenu', (event, data, isadd) => {
            // 处理接收到的数据
            this.dropdownMenu = deepCopy(data);
            this.dropdownMenu.forEach(item => {
                if (item.label !== this.selectedConfigProfile && !isadd) {
                    this.selectedConfigProfile = this.dropdownMenu[this.dropdownMenu.length - 1].label;
                    this.resourceId = this.dropdownMenu[this.dropdownMenu.length - 1].value;
                    this.getAllResource();
                    this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                    this.calculateTotalPage(true);
                    this.calculateNextResourceId();
                }
            });
        });

        // 修改语言
        ipcRenderer.on('change-locale', (event, newLocale) => {
            // console.log('MainScreen: 接受主窗口的数据', newLocale);
            setI18nLanguage(newLocale);
            this.deviceName = this.$t('selectDevice');
        });

        // 插件列表变更
        ipcRenderer.on('plugin-list-change', (event, args) => {
            console.log('MainScreen: Received: plugin-list-change ', args);
            this.loadStandardSideMenu();
            this.loadMultiKeyActionsMenu();
            this.updateMenuDisplay();
            let haveUpdate = false;
            this.currentConfigArray.forEach(row => {
                if (haveUpdate) return;
                row.forEach(col => {
                    if (haveUpdate) return;
                    if (!col.isPlugin || col.pluginId !== args.pluginId) {
                        return;
                    }
                    haveUpdate = true;
                });
            });

            if (!haveUpdate) return;
            this.currentConfigArray = new Array(this.deviceRowCount);
            for (let row = 0; row < this.deviceRowCount; row++) {
                this.currentConfigArray[row] = new Array(this.deviceColCount);
            }


            setTimeout(() => {
                this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                this.deviceSend();
            }, 100);
        });

        // 高度
        this.mainHeight = document.getElementById('box-main').offsetHeight;
        this.operationHeight = this.windowHeight - this.mainHeight;

        this.$nextTick(() => {
            window.addEventListener('resize', this.handleResize);
            this.loadStandardSideMenu();
            this.loadMultiKeyActionsMenu();
            this.updateMenuDisplay();

        });
    },
    methods: {
        loadStandardSideMenu() {
            this.standardKeyConfiguration = deepCopy(ALL_MENU_SIDEBAR);
            const streamDeckPlugins = window.store.storeGet('plugin.streamDeck');
            // console.log('MainScreen: loadStandardSideMenu: this.standardKeyConfiguration: ', this.standardKeyConfiguration, ' ALL_MENU_SIDEBAR: ', ALL_MENU_SIDEBAR, ' streamDeckPlugins: ', streamDeckPlugins)
            if (!streamDeckPlugins || streamDeckPlugins.length === 0) return;

            streamDeckPlugins.forEach(pluginInfo => {
                let pluginSupportCurrentPlatform = false;
                if (window.platform === 'win32') {
                    const filteredOSList = pluginInfo.manifestInfo.OS.filter(osInfo => osInfo.Platform === 'windows');
                    if (!filteredOSList || filteredOSList.length === 0) return;
                    pluginSupportCurrentPlatform = true;
                } else if (window.platform === 'darwin') {
                    const filteredOSList = pluginInfo.manifestInfo.OS.filter(osInfo => osInfo.Platform === 'mac');
                    if (!filteredOSList || filteredOSList.length === 0) return;
                    pluginSupportCurrentPlatform = true;
                }

                if (!pluginSupportCurrentPlatform) return;

                const pluginChildrenAction = [];
                pluginInfo.manifestInfo.Actions.forEach(pluginAction => {

                    const pluginConfigInfo = this.convertPluginConfigSetting(pluginInfo, pluginAction);

                    pluginChildrenAction.push(pluginConfigInfo);
                });
                this.standardKeyConfiguration.push({
                    isPlugin: true,
                    subMenu: pluginInfo.pluginName,
                    children: pluginChildrenAction,
                });
            });
        },
        loadMultiKeyActionsMenu() {
            this.multiActionsKeyConfiguration = deepCopy(MULTIACTIONS_SIDEBAR);
            const streamDeckPlugins = window.store.storeGet('plugin.streamDeck');
            if (!streamDeckPlugins || streamDeckPlugins.length === 0) return;

            streamDeckPlugins.forEach(pluginInfo => {
                let pluginSupportCurrentPlatform = false;
                if (window.platform === 'win32') {
                    const filteredOSList = pluginInfo.manifestInfo.OS.filter(osInfo => osInfo.Platform === 'windows');
                    if (!filteredOSList || filteredOSList.length === 0) return;
                    pluginSupportCurrentPlatform = true;
                } else if (window.platform === 'darwin') {
                    const filteredOSList = pluginInfo.manifestInfo.OS.filter(osInfo => osInfo.Platform === 'mac');
                    if (!filteredOSList || filteredOSList.length === 0) return;
                    pluginSupportCurrentPlatform = true;
                }

                if (!pluginSupportCurrentPlatform) return;

                const pluginChildrenAction = [];
                pluginInfo.manifestInfo.Actions.forEach(pluginAction => {
                    if (
                        pluginAction.SupportedInMultiActions !== undefined &&
                        pluginAction.SupportedInMultiActions === false
                    )
                        return;

                    const pluginConfigInfo = this.convertPluginConfigSetting(pluginInfo, pluginAction);

                    pluginChildrenAction.push(pluginConfigInfo);
                });

                if (pluginChildrenAction.length === 0) return;

                this.multiActionsKeyConfiguration.push({
                    isPlugin: true,
                    subMenu: pluginInfo.pluginName,
                    children: pluginChildrenAction,
                });
            });

            console.log(
                'MainScreen: loadMultiKeyActionsMenu: this.multiActionsKeyConfiguration: ',
                this.multiActionsKeyConfiguration,
                ' MULTIACTIONS_SIDEBAR: ',
                MULTIACTIONS_SIDEBAR,
                ' streamDeckPlugins: ',
                streamDeckPlugins
            );
        },
        convertPluginConfigSetting(pluginInfo, pluginAction) {
            let titlePos = 'bot';
            let titleFontSize = 8;
            let titleFontStyle = 'bold|italic|underline';
            let titleText = '';
            let showTitle = true;
            let titleColor = '#FFFFFF';

            if (pluginAction.States[0].TitleAlignment) {
                switch (pluginAction.States[0].TitleAlignment) {
                    case 'top':
                        titlePos = 'top';
                        break;
                    case 'middle':
                        titlePos = 'mid';
                        break;
                    default:
                    case 'bottom':
                        titlePos = 'bot';
                        break;
                }
            }
            if (pluginAction.States[0].Title) {
                titleText = pluginAction.States[0].Title;
            }

            if (pluginAction.States[0].ShowTitle) {
                showTitle = pluginAction.States[0].ShowTitle;
            }

            if (pluginAction.States[0].FontSize) {
                titleFontSize = pluginAction.States[0].FontSize;
            }

            if (pluginAction.States[0].TitleColor) {
                titleColor = pluginAction.States[0].TitleColor;
            }

            if (!titleColor.startsWith('#')) {
                titleColor = '#FFFFFF';
            }

            if (pluginAction.States[0].FontStyle) {
                switch (pluginAction.States[0].FontStyle) {
                    case 'Regular':
                        titleFontStyle = '';
                        break;
                    case 'Bold':
                        titleFontStyle = 'bold';
                        break;
                    case 'Italic':
                        titleFontStyle = 'italic';
                        break;
                    case 'Bold Italic':
                        titleFontStyle = 'bold|italic';
                        break;
                }
            }

            if (pluginAction.States[0].FontUnderline) {
                titleFontStyle += '|underline';

                if (titleFontStyle.startsWith('|')) {
                    titleFontStyle = titleFontStyle.substring(1);
                }
            }


            const pluginConfigInfo = {
                childrenName: pluginAction.Name,
                isPlugin: true,
                pluginId: pluginInfo.pluginId,
                pluginVersion: pluginInfo.manifestInfo.Version,
                pluginName: pluginInfo.pluginName,
                config: {
                    haveAlterAction: false,
                    type: pluginAction.UUID,
                    title: {
                        text: titleText,
                        pos: titlePos,
                        size: titleFontSize,
                        color: titleColor,
                        display: showTitle,
                        style: titleFontStyle,
                        resourceId: 0,
                    },
                    gap: 100,
                    pressTime: 100,
                    menuIcon: pluginAction.iconLargeId,
                    icon: pluginAction.States[0].imageLargeId,
                    defaultIcon: pluginAction.States[0].imageLargeId,
                    actions: [
                        {
                            type: 'pluginAction',
                            value: JSON.stringify(pluginAction),
                        },
                        {
                            type: 'pluginSettings',
                            value: '',
                        },
                    ],
                },
            };

            if (pluginAction.States.length === 2) {
                pluginConfigInfo.config.haveAlterAction = true;
                pluginConfigInfo.config.alterIcon = pluginAction.States[1].imageLargeId;
                pluginConfigInfo.config.defaultAlterIcon = pluginAction.States[1].imageLargeId;

                pluginConfigInfo.config.alterTitle = pluginConfigInfo.config.title;
            }

            return pluginConfigInfo;
        },
        deviceSend() {
            ipcRenderer.send('ChangeDeviceProfile', {
                serialNumber: this.serialNumber,
                resourceId: this.resourceId,
            });
        },
        sendMenu(newMenu, rowCount = 2, colCount = 3) {
            // 向子窗口发送消息
            ipcRenderer.send('subpage-sendMenu', newMenu, rowCount, colCount);
        },

        // 选择设备
        handDeviceSelected(deviceInfo) {
            console.log('MainScreen:   handDeviceSelected: ', deviceInfo);
            const deviceInfoArry = deviceInfo.split('@');
            const device = deviceInfoArry[0];
            if (deviceInfoArry.length === 2 && deviceInfoArry[1] === 'QMK') {
                this.showVIA = !this.showVIA;
                return;
            }
            this.showVIA = false;
            this.deviceName = this.deviceArr.find(item => item.serialNumber === device).label;
            this.serialNumber = device;

            window.store.storeSet('currentSelectedDevice', {
                serialNumber: this.serialNumber,
                deviceName: this.deviceName,
            });

            clearTimeout(this.deviceConfigTimer);

            const deviceLayoutInfo = window.appManager.deviceControlManager.getDeviceBasicConfig(this.serialNumber);
            console.log('MainScreen: handDeviceSelected:  Get deviceLayoutInfo: ', deviceLayoutInfo);

            this.deviceRowCount = deviceLayoutInfo.keyMatrix.row;
            this.deviceColCount = deviceLayoutInfo.keyMatrix.col;

            console.log('MainScreen handDeviceSelected: deviceLayoutInfo.keyConfig', deviceLayoutInfo.keyConfig);

            this.$nextTick(() => {
                this.mainHeight = document.getElementById('box-main').offsetHeight;
                this.operationHeight = this.windowHeight - this.mainHeight;
            });

            const activeProfileInfo = window.appManager.deviceControlManager.getDeviceActiveProfile(this.serialNumber);
            this.getAllResource();

            if (activeProfileInfo) {
                this.resourceId = activeProfileInfo.resourceId;
                this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                this.dropdownMenu.forEach(item => {
                    if (item.value === this.resourceId) {
                        this.selectedConfigProfile = item.label;
                    }
                });
                return;
            }

            this.resourceId = this.allResource.find(item => item.name === this.configIdx).id;
            this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
            this.deviceSend();
        },
        getAllResource() {
            this.allResource = window.resourcesManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_DEVICE_CONFIG);
            console.log('MainScreen:   全部资源列表', this.allResource);
        },
        getDefaultResource() {
            this.defaultResource = window.resourcesManager.getDefaultResourceInfo(
                Constants.RESOURCE_TYPE_DEVICE_CONFIG
            );
            if (this.defaultResource.length === 0) {
                if (this.allResource.length !== 0) {
                    this.resourceId = this.allResource[0].id;
                }
            } else {
                this.resourceId = this.defaultResource[0].id;
                this.dropdownMenu.find(item => {
                    if (item.value === this.defaultResource[0].id) {
                        this.selectedConfigProfile = item.label;
                    }
                });
            }
        },
        addNewConfigInfo(configId, page, folder, sourceFolderId = undefined, onlyAdd = false) {
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
                            actions: [],
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

            if (folder > 1) {
                configArr[0] = {
                    keyCode: '1,1',
                    childrenName: 'back',
                    config: {
                        type: 'back',
                        title: {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: 0,
                        },
                        icon: '0-5',
                        actions: [
                            {
                                type: 'parentFolder',
                                value: `${configId},${page},${sourceFolderId}`,
                            },
                        ],
                    },
                };
            }

            const newResId = window.resourcesManager.addConfigInfo(configId, page, folder, configArr);
            if (onlyAdd) return;
            this.resourceId = newResId;
            console.log('MainScreen:   添加按键配置', this.resourceId);
        },

        getConfigInfo(rowCount = 2, colCount = 3) {
            const resourceConfig = window.resourcesManager.getConfigInfo(this.resourceId, rowCount, colCount);
            window.store.storeSet('mainscreen.activeProfileId', this.resourceId);
            console.log('MainScreen:   resourceConfig: ' + JSON.stringify(resourceConfig));
            if (!resourceConfig) return;

            this.currentConfigArray = [[]];

            const tempArry = new Array(rowCount);
            for (let row = 0; row < rowCount; row++) {
                tempArry[row] = new Array(colCount);
            }

            resourceConfig.forEach(resource => {
                if (resource.keyCode === '0,1') {
                    this.knobData = deepCopy(resource);
                    this.ceneterData = this.knobData.config.subActions[0];
                } else {
                    const [row, col] = resource.keyCode.split(',');
                    // console.log('MainScreen```````````````````````````````:  row,col', row, col);
                    if (row > rowCount || col > colCount) return;
                    tempArry[row - 1][col - 1] = resource;
                    if (resource.config.type === 'pageNo') {
                        resource.config.icon = resource.config.animations[this.currentPage - 1];
                    }
                }
            });

            // eslint-disable-next-line no-unused-vars
            const [configId, page, folder] = this.allResource.find(item => item.id === this.resourceId).name.split(',');
            this.currentPage = Number(page);

            const pageArr = [];
            let loadedResourceId = '';

            this.allResource.forEach(item => {
                if (item.name.split(',')[0] === configId) {
                    pageArr.push(item.name.split(',')[1]);
                }

                if (item.name === `${configId},1,1`) {
                    loadedResourceId = item.id;
                }
            });

            this.isPagination = Number(folder);

            this.totalPageNumber = Number(Math.max(...pageArr));
            console.log('MainScreen:   当前资源的页数', pageArr);

            this.dropdownMenu.forEach(item => {
                if (item.value === loadedResourceId) {
                    this.selectedConfigProfile = item.label;
                }
            });

            this.currentConfigArray = deepCopy(tempArry);
            console.log('MainScreen:   转换后的arr' + JSON.stringify(this.currentConfigArray));
            console.log('MainScreen:   初始化this.knobData' + JSON.stringify(this.knobData));
        },

        handleResize() {
            this.$nextTick(() => {
                this.windowHeight = window.innerHeight - (this.isWin32 ? 32 : 0); // 更新窗口高度
                const scrollTop = document.getElementById('scrollBarContainer').offsetTop;
                this.maxScrollHeight = this.windowHeight - scrollTop;

                this.$nextTick(() => {
                    if (this.isMultiActions) {
                        const multiActionMain = document.getElementById('multi-action-container');
                        if (multiActionMain) {
                            this.mainHeight = multiActionMain.offsetHeight;
                            this.operationHeight = this.windowHeight - this.mainHeight;
                        }
                    } else {
                        // console.log('box-main: ', document.getElementById('box-main').offsetHeight);

                        const boxMain = document.getElementById('box-main');

                        if (boxMain) {
                            this.mainHeight = boxMain.offsetHeight;
                            this.operationHeight = this.windowHeight - this.mainHeight;
                        }
                    }
                })


                this.mainscreenWidth = window.innerWidth
                this.squareHeight = 350
                this.squareHeight += window.innerHeight - 700

                this.squareWidth = 440
                this.squareWidth += window.innerWidth - 1024

            });
        },


        handleStart() {
            this.selectedCell = null;
            this.isDraggable = !this.isDraggable;
            this.operationData = {};
        },
        handleEnd(movedKeyConfig) {
            // 拖拽时的高亮



            this.isDraggable = !this.isDraggable;
            this.draggableCell = '';

            if (this.coordinate === '') {
                return;
            }

            if (movedKeyConfig.keyCode === this.coordinate) return;

            let oldXY = movedKeyConfig.keyCode.split(',');
            const oldX = Number.parseInt(oldXY[0]) - 1;
            const oldY = Number.parseInt(oldXY[1]) - 1;

            const newXY = this.coordinate.split(',');
            const newX = Number.parseInt(newXY[0]) - 1;
            const newY = Number.parseInt(newXY[1]) - 1;

            // box高亮
            this.selectedCell = `${newX + 1},${newY + 1}`;

            if (this.currentConfigArray[newX][newY] === null) {
                movedKeyConfig.keyCode = this.coordinate;
                this.currentConfigArray[newX][newY] = movedKeyConfig;
                this.currentConfigArray[oldX][oldY] = null;
            } else {
                const oldObj = this.currentConfigArray[oldX][oldY];
                const newObj = this.currentConfigArray[newX][newY];
                console.log('MainScreen:   oldObj' + JSON.stringify(oldObj));
                console.log('MainScreen:   newObj' + JSON.stringify(newObj));
                this.currentConfigArray[oldX][oldY] = newObj;
                this.currentConfigArray[newX][newY] = oldObj;

                this.currentConfigArray[oldX][oldY].keyCode = [oldX + 1] + ',' + [oldY + 1];
                this.currentConfigArray[newX][newY].keyCode = [newX + 1] + ',' + [newY + 1];
            }
            this.currentConfigArray = deepCopy(this.currentConfigArray);
            this.saveBtn();
            console.log('MainScreen:   替换后的arr', this.currentConfigArray);
            this.operationData = deepCopy(movedKeyConfig);
        },
        // 列表开始拖拽
        onStart() {
            this.selectedCell = null;
            this.isDraggable = !this.isDraggable;
            this.operationData = {};
            this.selectedIndex = null; // 多项操作选中状态
        },
        // 列表取消拖拽
        onEnd(currentDraggable) {
            this.isDraggable = !this.isDraggable;
            this.draggableCell = '';
            const configSubItem = deepCopy(currentDraggable);

            console.log(
                'onEnd: Check Coordinate: this.coordinate: ',
                this.coordinate,
                ' this.isMultiActions: ',
                this.isMultiActions,
                ' this.multiActionsKeyCode: ',
                this.multiActionsKeyCode
            );

            if (this.isMultiActions && (!this.coordinate || this.coordinate === '')) {
                configSubItem.keyCode = `${this.multiActionsKeyCode[0]},${this.multiActionsKeyCode[1]}`;
            } else {
                configSubItem.keyCode = this.coordinate;
            }
            let keyCode = configSubItem.keyCode.split(',');
            // 当前格子
            console.log('MainScreen:   取消拖拽: ', currentDraggable, ' keyCode: ', keyCode);

            this.selectedIndex = null;

            // 处理多项操作控制
            if (this.multBox === 1 && currentDraggable.childrenName !== 'multiActions') {
                this.operationData = deepCopy(currentDraggable);
                this.operationData.isMultiAction = true;
                this.operationData.multiActionsKeyCode = configSubItem.keyCode;
                this.operationData.multiActionIndex = this.multiActionsArr.length;

                this.multiActionsArr.push(this.operationData);
                if (keyCode.length === 0) return;
                // 更改坐标对应的subActions
                this.currentConfigArray[keyCode[0] - 1][keyCode[1] - 1].config.subActions = deepCopy(this.multiActionsArr);
                this.selectedIndex = this.multiActionsArr.length - 1;
                this.currentConfigArray = deepCopy(this.currentConfigArray);
                this.saveBtn();
                return;
            }

            if (this.coordinate === '') return;

            // 格子
            let currentConfigType = this.currentConfigArray[keyCode[0] - 1][keyCode[1] - 1].config.type;
            // 更改亮度icon
            if (configSubItem.childrenName === 'brightness') {
                configSubItem.config.icon = '0-18';
            } else if (configSubItem.childrenName === 'pageNo') {
                configSubItem.config.icon = configSubItem.config.animations[this.currentPage - 1];
            } else if (configSubItem.childrenName === 'createFolder') {
                const currentResource = window.resourcesManager.getResourceInfo(this.resourceId);

                const configIdxInfo = currentResource.name.split(',');
                let maxFolderId = Number.parseInt(configIdxInfo[2]);
                this.allResource.forEach(resourceInfo => {
                    if (!resourceInfo.name.startsWith(`${configIdxInfo[0]},${configIdxInfo[1]}`)) return;
                    const nexConfigIdxInfo = resourceInfo.name.split(',');

                    const nextFolderId = Number.parseInt(nexConfigIdxInfo[2]);
                    if (nextFolderId <= maxFolderId) return;

                    maxFolderId = nextFolderId;
                });

                configSubItem.config.actions[0].value = `${configIdxInfo[0]},${configIdxInfo[1]},${maxFolderId + 1}`;

                this.addNewConfigInfo(
                    Number.parseInt(configIdxInfo[0]),
                    Number.parseInt(configIdxInfo[1]),
                    maxFolderId + 1,
                    configIdxInfo[2],
                    true
                );
            } else if (configSubItem.childrenName === 'multiActions' && currentConfigType === '') {
                this.multiActionsKeyCode = this.coordinate.split(',');
                this.operationData = deepCopy(configSubItem);
                this.multiActionsArr = deepCopy(this.operationData.config.subActions);
                this.currentConfigArray[keyCode[0] - 1][keyCode[1] - 1] = deepCopy(configSubItem);

                this.isMultiActions = true;
                this.updateMenuDisplay();
                this.currentConfigArray = deepCopy(this.currentConfigArray);
                this.saveBtn();
                this.handleResize();
                return;
            }
            console.log('MainScreen:   currentConfigType', currentConfigType);
            if (currentConfigType === 'back') return;

            if (currentConfigType === '') {
                this.currentConfigArray[keyCode[0] - 1][keyCode[1] - 1] = configSubItem;
                this.operationData = deepCopy(configSubItem);
                this.currentConfigArray = deepCopy(this.currentConfigArray);
            } else if (!this.isMultiActions) {
                this.operationData = {};
                this.$confirm(this.$t('replaceConfigPrompt'), this.$t('hint'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    type: 'warning',
                    closeOnClickModal: false,
                })
                    .then(() => {
                        if (configSubItem.childrenName === 'multiActions') {
                            this.isMultiActions = true; // 多项操作
                            this.updateMenuDisplay();
                            this.handleResize();
                        }
                        const oldConfigData = this.currentConfigArray[keyCode[0] - 1][keyCode[1] - 1];

                        console.log('MainScreen: oldConfigData: ' + JSON.stringify(oldConfigData));

                        this.multiActionsKeyCode = keyCode;
                        this.currentConfigArray[keyCode[0] - 1][keyCode[1] - 1] = configSubItem;
                        this.operationData = deepCopy(configSubItem);
                        this.currentConfigArray = deepCopy(this.currentConfigArray);
                        this.saveBtn();
                    })
                    .catch(() => { });
            }
            this.selectedCell = `${keyCode[0]},${keyCode[1]}`;
            console.log(
                'MainScreen:   After Release: configSubItem: ' +
                JSON.stringify(configSubItem) +
                ' this.operationData: ' +
                JSON.stringify(this.operationData) +
                ' this.selectedCell: ' +
                this.selectedCell +
                ' keyCode: ' +
                keyCode
            );
            this.saveBtn();
        },
        mouseEnter(i, j) {
            this.coordinate = `${j + ',' + i}`;
            // console.log("MainScreen:   mouseEnter: ", this.coordinate);
            if (this.isDraggable) {
                this.draggableCell = `${j + ',' + i}`;
            }
        },
        mouseLeave() {
            this.coordinate = '';
            // console.log('MainScreen:  mouseLeave: ', this.coordinate)
        },

        cellBtn(item, i, j) {
            // 旋钮取消高亮
            console.log('MainScreen:   点击的当前元素', item);
            if (this.selectedCell === `${j + ',' + i}`) {
                this.selectedCell = null; // 取消选中状态
                this.operationData = {};
            } else {
                this.selectedCell = `${j + ',' + i}`; // 更新选中的索引
                this.operationData = item;
            }

            if (item.config.type === '') {
                this.operationData = {};
            }

            if (item.childrenName === 'multiActions') {
                if (item.config.subActions?.length === 0) {
                    this.multiActionsArr = [];
                } else {
                    this.multiActionsArr = deepCopy(item.config.subActions);
                }
            }


        },
        // 双击
        handleDoubleClick(doubleItem) {
            this.operationData = {};
            this.getAllResource();

            let actionValue, nextFilterResource;
            if (doubleItem.config.actions && doubleItem.config.actions.length > 0) {
                actionValue = doubleItem.config.actions[0].value;
                nextFilterResource = this.allResource.filter(item => item.name === actionValue);
            }

            // 多项操作
            console.log('MainScreen:   双击的', doubleItem);
            switch (doubleItem.childrenName) {
                case 'createFolder':
                    this.saveBtn(true);
                    console.log('MainScreen:   下一个资源', actionValue);
                    this.isPagination = Number(actionValue.split(',')[2]);
                    this.resourceId = nextFilterResource[0].id;
                    this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                    this.currentConfigArray = deepCopy(this.currentConfigArray);

                    this.saveBtn();
                    break;
                case 'back':
                    this.saveBtn(true);
                    console.log('MainScreen:   返回的资源', actionValue);
                    console.log('MainScreen:   返回的资源列表', nextFilterResource);

                    this.isPagination = Number(actionValue.split(',')[2]); // 是否显示页码
                    this.resourceId = nextFilterResource[0].id;
                    this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                    this.currentConfigArray = deepCopy(this.currentConfigArray);
                    this.saveBtn();
                    this.selectedCell = null;
                    break;
                case 'nextPage':
                    this.saveBtn(true);
                    this.currentPage++;
                    if (this.currentPage > this.totalPageNumber) {
                        this.currentPage = 1;
                    }
                    this.calculateNextResourceId();
                    this.filterPage.find(item => Number(item.name.split(',')[1]) === this.currentPage).id;
                    this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                    this.currentConfigArray = deepCopy(this.currentConfigArray);
                    this.saveBtn();

                    break;
                case 'previousPage':
                    this.saveBtn(true);
                    this.currentPage--;
                    if (this.currentPage < 1) {
                        this.currentPage = this.totalPageNumber;
                    }
                    this.calculateNextResourceId();
                    this.filterPage.find(item => Number(item.name.split(',')[1]) === this.currentPage).id;
                    this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                    this.currentConfigArray = deepCopy(this.currentConfigArray);
                    this.saveBtn();
                    break;
                case 'multiActions':
                    this.isMultiActions = true;
                    this.updateMenuDisplay();
                    this.multiActionsKeyCode = doubleItem.keyCode.split(',');
                    this.multiActionsArr = deepCopy(doubleItem.config.subActions);
                    this.handleResize();
                    break;
            }
        },
        // 保存
        saveBtn(skipSend = false) {
            if (this.knobData.config.subActions[0]) {
                this.knobData.config.title = deepCopy(this.knobData.config.subActions[0].config.title);
                this.knobData.config.icon = this.knobData.config.subActions[0].config.icon;
                this.knobData = deepCopy(this.knobData);
            }
            const newArr = [...this.currentConfigArray.flat(), this.knobData];
            window.resourcesManager.updateConfigInfo(this.resourceId, newArr);
            if (!skipSend) {
                this.deviceSend();
            }
        },

        deleteOperation(deleteItem) {
            console.log('MainScreen: deleteItem', deleteItem);
            this.$confirm(this.$t('deleteKeyConfigHint'), this.$t('hint'), {
                confirmButtonText: this.$t('confirm'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning',
                closeOnClickModal: true,
            })
                .then(() => {
                    if (deleteItem.isPlugin) {
                        this.$refs.operationConfig.notifyPluginDeleteAction();
                    }
                    this.doDeleteOperation(deleteItem);
                })
                .catch(err => console.log(err));
        },
        // 删除
        doDeleteOperation(deleteItem) {
            if (deleteItem.keyCode && !this.knobFun) {
                const [ItemX, ItemY] = deleteItem.keyCode.split(',');
                // 初始化
                const initConfig = {
                    keyCode: `${ItemX},${ItemY}`,
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
                };
                this.currentConfigArray[ItemX - 1][ItemY - 1] = initConfig;
                this.currentConfigArray = deepCopy(this.currentConfigArray);
                this.operationData = {};
                this.multiActionsArr = [];
                // 删除创建文件
                if (deleteItem.childrenName === 'createFolder') {
                    console.log('MainScreen:   删除之前的资源id', this.resourceId);
                    this.getAllResource();

                    let nextFolderIdx = deleteItem.config.actions[0].value;
                    console.log('MainScreen:  删除文件夹： ', nextFolderIdx);

                    this.deleteRelatedSubFolders(nextFolderIdx);
                }

                this.saveBtn();
                return;
            }
            // 删除多项操作中的配置
            if (this.selectedIndex !== null) {
                // 确保元素存在于数组中
                this.multiActionsArr.splice(this.selectedIndex, 1); // 删除元素
                this.multiActionsArr = deepCopy(this.multiActionsArr);
                // 更改坐标对应的subActions
                const deleteItemX = this.multiActionsKeyCode[0] - 1;
                const deleteItemY = this.multiActionsKeyCode[1] - 1;
                this.currentConfigArray[deleteItemX][deleteItemY].config.subActions = deepCopy(this.multiActionsArr);
                this.currentConfigArray = deepCopy(this.currentConfigArray);
                this.operationData = {};
                this.selectedIndex = null;

                this.saveBtn();
                return;
            }
            // 删除旋钮中的配置
            if (this.knobFun) {
                console.log('MainScreen:   删除', this.operationData);
                this.operationData = {};
                switch (this.clickPos) {
                    case 'left':
                        this.leftData = deepCopy({});
                        this.knobData.config.subActions[1] = null;
                        this.knobData = deepCopy(this.knobData);
                        break;

                    case 'center':
                        this.ceneterData = deepCopy({});
                        this.knobData.config.subActions[0] = null;
                        this.knobData = deepCopy(this.knobData);
                        break;
                    case 'right':
                        this.rightData = deepCopy({});
                        this.knobData.config.subActions[2] = null;
                        this.knobData = deepCopy(this.knobData);
                        break;
                }

                this.saveBtn();
            }
        },
        deleteRelatedSubFolders(nextFolderIdx) {
            const nextConfigInfo = this.allResource.find(item => item.name === nextFolderIdx);

            const nextConfigDetail = window.resourcesManager.getConfigInfo(nextConfigInfo.id);

            if (nextConfigDetail === null) return;

            nextConfigDetail.forEach(configDetail => {
                if (configDetail.childrenName !== 'createFolder') return;

                const subFolderIdx = configDetail.config.actions[0].value;
                this.deleteRelatedSubFolders(subFolderIdx);
            });

            window.resourcesManager.deleteResource(nextConfigInfo.id);
        },
        // 更新
        updateOperationData(updateItem, doSaveAction) {
            console.log(
                'MainScreen:   updateOperationData',
                JSON.stringify(updateItem),
                ' this.selectedIndex: ',
                this.selectedIndex,
                ' doSaveAction: ',
                doSaveAction
            );
            this.operationData = deepCopy(updateItem);

            // 更新坐标对应的操作
            if (updateItem.keyCode && !this.knobFun) {
                const updateXY = updateItem.keyCode.split(',');
                const updateX = updateXY[0] - 1;
                const updateY = updateXY[1] - 1;
                this.currentConfigArray[updateX][updateY] = updateItem;
                this.currentConfigArray = deepCopy(this.currentConfigArray);
            }
            // 更新多项操作中的配置
            if (this.selectedIndex !== null) {
                // 确保元素存在于数组中
                this.multiActionsArr.splice(this.selectedIndex, 1, updateItem); // 替换元素
                this.multiActionsArr = deepCopy(this.multiActionsArr);
                // 更改坐标对应的subActions
                const deleteItemX = this.multiActionsKeyCode[0] - 1;
                const deleteItemY = this.multiActionsKeyCode[1] - 1;
                this.currentConfigArray[deleteItemX][deleteItemY].config.subActions = deepCopy(this.multiActionsArr);
                this.currentConfigArray = deepCopy(this.currentConfigArray);
            }
            // 更新knob的配置
            if (this.knobFun) {
                switch (this.pos) {
                    case 'left':
                        this.leftData = deepCopy(updateItem);
                        this.knobData.config.subActions[1] = deepCopy(this.leftData);
                        this.knobData = deepCopy(this.knobData);
                        break;

                    case 'center':
                        this.ceneterData = deepCopy(updateItem);
                        this.knobData.config.subActions[0] = deepCopy(this.ceneterData);
                        this.knobData = deepCopy(this.knobData);
                        break;
                    case 'right':
                        this.rightData = deepCopy(updateItem);
                        this.knobData.config.subActions[2] = deepCopy(this.rightData);
                        this.knobData = deepCopy(this.knobData);
                        break;
                }
            }

            if (!doSaveAction) {
                return;
            }

            this.saveBtn();
        },

        // 配置文件
        handleProfileSelected(command) {
            this.operationData = {};
            this.selectedCell = null;
            this.isPagination = 1;
            const label = this.$t('profile');
            let maxIndex = 0;
            this.dropdownMenu.forEach(item => {
                if (item.label.startsWith(label)) {
                    const num = item.label.substring(label.length);
                    maxIndex = Math.max(maxIndex, Number(num)) || 0;
                }
            });
            this.getAllResource();

            // 新建配置文件
            if (command === 'add') {
                this.totalPageNumber = 1;

                const configIdArr = [];
                this.allResource.forEach(item => {
                    // eslint-disable-next-line no-unused-vars
                    const [configId, page, folder] = item.name.split(',');
                    configIdArr.push(configId);
                });
                const nextConfigId = Math.max(...configIdArr) + 1;
                console.log('MainScreen:   最大配置文件', nextConfigId);
                this.addNewConfigInfo(nextConfigId, 1, 1);

                this.dropdownMenu.unshift({
                    label: `${label}${maxIndex + 1}`,
                    value: this.resourceId,
                    // command: `${label}${maxIndex + 1}`,
                });
                window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
                this.sendMenu(this.dropdownMenu, this.deviceRowCount, this.deviceColCount);
                console.log('MainScreen:   当前资源id', this.resourceId);
                // 根据资源id读取资源列表
                this.getAllResource();
                this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                this.currentConfigArray = deepCopy(this.currentConfigArray);
                this.selectedConfigProfile = `${label}${maxIndex + 1}`;
                this.saveBtn();
                return;
            }
            if (command === 'edit') {
                this.showSettings(3);
                return;
            }

            this.selectedConfigProfile = command;
            this.resourceId = this.dropdownMenu.find(item => item.label === command).value;
            this.configIdx = this.allResource.find(item => item.id === this.resourceId).name;
            console.log('this.configIdx', this.configIdx);
            // 根据资源id读取资源列表
            this.getConfigInfo(this.deviceRowCount, this.deviceColCount);

            const tempArr = deepCopy(this.currentConfigArray);
            this.currentConfigArray = tempArr;

            // 页码
            this.calculateTotalPage(true);

            this.saveBtn();
        },
        showSettings(showTab) {
            if (window.windowManager.settingWindow.isVisible()) return;
            window.windowManager.settingWindow.changeVisibility(showTab);
        },
        // 页码
        calculateTotalPage(needReset = true) {
            const pageArr = [];
            if (needReset) {
                this.totalPageNumber = 1;
                this.currentPage = 1;
            }
            console.log('MainScreen:   this.resourceId', this.resourceId);
            const [configId, page, folder] = this.allResource.find(item => item.id === this.resourceId).name.split(',');
            this.configId = configId;
            this.page = page;
            this.folder = folder;
            this.allResource.forEach(item => {
                if (item.name.split(',')[0] === configId) {
                    pageArr.push(item.name.split(',')[1]);
                }
            });
            this.totalPageNumber = Number(Math.max(...pageArr));
            console.log('MainScreen:   当前资源的页数', pageArr);
        },
        calculateNextResourceId() {
            // 当前资源id对应得资源列表
            // eslint-disable-next-line no-unused-vars
            const [configId, pageId, folder] = this.allResource
                .find(item => item.id === this.resourceId)
                .name.split(',');
            // 在所有资源列表中筛选出资源
            this.filterPage = this.allResource.filter(item => item.name.split(',')[0] === configId);
            // 根据当前页码筛选出对应得资源id
            const resourceInfo = this.filterPage.find(item => Number(item.name.split(',')[1]) === this.currentPage);
            if (!resourceInfo) {
                console.log('MainScreen: calculateNextResourceId: not find resource info for currentPage: ', this.currentPage, ' in filterPage: with ConfigId: ', configId, this.filterPage);
                return;
            }
            this.resourceId = this.filterPage.find(item => Number(item.name.split(',')[1]) === this.currentPage).id;
            console.log('MainScreen:   切换时的资源id', this.resourceId);
        },
        // 添加页码
        handleAddPage() {
            this.selectedCell = null;
            this.saveBtn(true);
            this.operationData = {};
            this.totalPageNumber += 1;
            this.currentPage = this.totalPageNumber;
            this.addNewConfigInfo(this.configId, this.totalPageNumber, this.folder);

            this.getAllResource();
            this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
            console.log('MainScreen: 页码 行 ：', this.deviceRowCount);
            console.log('MainScreen: 页码 列 ：', this.deviceColCount);
            this.currentConfigArray = deepCopy(this.currentConfigArray);
            this.saveBtn();
        },
        // 页码减
        handleDeletePage() {
            this.$confirm(this.$t('deletePage'), `${this.$t('hint')}`, {
                confirmButtonText: this.$t('confirm'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning',
            })
                .then(() => {
                    this.selectedCell = null;
                    if (this.currentPage === 1) {
                        this.totalPageNumber -= 1;
                        this.currentPage += 1;

                        const nextResourceId = this.filterPage.find(item => Number(item.name.split(',')[1]) === this.currentPage).id;

                        this.dropdownMenu.forEach(item => {
                            if (item.label === this.selectedConfigProfile) {
                                item.value = nextResourceId;
                                console.log('MainScreen:   当前配置文件的资源id', item);
                            }
                        });
                        window.store.storeSet('mainscreen.dropdownMenu', this.dropdownMenu);
                    } else {
                        this.totalPageNumber -= 1;
                        this.currentPage -= 1;
                    }

                    // Delete user selected page
                    window.resourcesManager.deleteConfig(this.resourceId);

                    this.calculateNextResourceId();
                    console.log('MainScreen: handleDeletePage: find next resourceId', this.resourceId);

                    this.getAllResource();
                    this.getConfigInfo(this.deviceRowCount, this.deviceColCount);
                })
                .catch((err) => {
                    console.log('MainScreen: handleDeletePage: Detected error: ', err);
                });
        },
        // 切换页码
        handleCurrentPageChanged(page) {
            this.selectedCell = null;
            this.saveBtn(true);
            this.operationData = {};
            console.log('MainScreen: Change page from: ', this.currentPage + ' TO: ', page);
            this.currentPage = page;
            this.calculateNextResourceId();
            this.getConfigInfo(this.deviceRowCount, this.deviceColCount);

            this.currentConfigArray = deepCopy(this.currentConfigArray);
            this.saveBtn();
        },

        // 多项操作
        goBack() {
            this.operationData = {};
            this.isMultiActions = !this.isMultiActions;
            this.updateMenuDisplay();
            this.selectedIndex = null; // 多项操作选中状态
            this.selectedCell = null;
            this.saveBtn();
            this.handleResize();
        },
        multMouseEnter() {
            this.multBox = 1;
        },
        multMouseLeave() {
            this.multBox = 0;
        },
        multiActionsClick(itemConfig, index) {
            console.log('MainScreen:   点击多项操作中的功能', itemConfig);
            this.operationData = deepCopy(itemConfig);
            // const Index = this.multiActionsArr.indexOf(itemConfig); // 获取点击项的索引
            console.log('MainScreen:   获取点击项的索引', index);

            if (this.selectedIndex === index) {
                this.selectedIndex = null; // 取消选中状态
                this.operationData = {};
            } else {
                this.selectedIndex = index; // 更新选中的索引
            }
        },
        enterMultiActions(boolean) {
            this.multiActionsKeyCode = this.selectedCell.split(',');
            this.multiActionsArr = deepCopy(this.operationData.config.subActions);

            this.isMultiActions = boolean;
            this.updateMenuDisplay();
            console.log(
                'MainScreen: enterMultiActions: ',
                boolean,
                ' this.operationData: ',
                this.operationData,
                ' this.multiActionsArr: ',
                this.multiActionsArr,
                ' this.multiActionsKeyCode: ',
                this.multiActionsKeyCode,
                ' this.currentConfigArray: ',
                this.currentConfigArray
            );
            this.operationData = {};
            this.handleResize();
        },
        // 旋钮
        boxRoundBtn() {

            this.knobFun = true;
            this.operationData = {};
            const knobInfo = window.resourcesManager.getConfigInfo(this.resourceId);
            if (knobInfo[knobInfo.length - 1].keyCode === '0,1') {
                const newKnobData = knobInfo[knobInfo.length - 1].config.subActions;
                this.leftData = deepCopy(newKnobData[1] || {});
                this.ceneterData = deepCopy(newKnobData[0] || {});
                this.rightData = deepCopy(newKnobData[2] || {});
                this.knobData = deepCopy(knobInfo[knobInfo.length - 1]);
            }

            this.$nextTick(() => {
                this.operationHeight = this.windowHeight - document.getElementById('box-main').offsetHeight;
            })
        },

        // 退出旋钮
        outKnobBtn(val) {
            this.knobFun = val;
            this.selectedCell = null;
            this.operationData = {};
            this.$nextTick(() => {
                this.operationHeight = this.windowHeight - document.getElementById('box-main').offsetHeight;
            })
        },
        knobValue(val, isHover) {
            this.pos = val;
            this.isHover = isHover;
        },
        currentKnob(pos, value) {
            switch (pos) {
                case 'left':
                    this.operationData = deepCopy(value);
                    break;

                case 'center':
                    this.operationData = deepCopy(value);
                    break;
                case 'right':
                    this.operationData = deepCopy(value);
                    break;
            }
        },
        // 拖拽高亮
        changeDragPos(pos) {
            if (this.isknobDraggable) {
                this.dragPos = pos;
            }
            if (this.currentKnobMenu.childrenName === 'assistant') {
                if (this.isknobDraggable) {
                    this.dragPos = 'center';
                }
            }
        },
        // 点击高亮
        changeClickPos(pos) {
            this.clickPos = pos;
        },
        // 旋钮开始拖拽
        knobStart(knobMenu) {
            this.isknobDraggable = true;
            this.clickPos = '';
            this.currentKnobMenu = knobMenu;
        },
        // 旋钮结束拖拽
        knobEnd(knobMenu) {
            console.log('MainScreen:   当前拖拽的旋钮', knobMenu);
            this.isknobDraggable = false;
            this.dragPos = '';

            this.clickPos = this.pos;
            switch (this.pos) {
                case 'left':
                    if (this.isHover && knobMenu.childrenName !== 'assistant') {
                        this.leftData.childrenName = knobMenu.childrenName;
                        this.leftData.config = deepCopy(knobMenu.config.subActions[0].config);

                        this.leftData = deepCopy(this.leftData);
                        this.operationData = deepCopy(this.leftData);
                        this.knobData.config.subActions[1] = deepCopy(this.leftData);
                        this.knobData = deepCopy(this.knobData);
                    } else {
                        this.clickPos = '';
                    }
                    break;

                case 'center':
                    if (this.isHover) {
                        this.ceneterData.childrenName = knobMenu.childrenName;
                        this.ceneterData.config = deepCopy(knobMenu.config.subActions[0].config);
                        this.ceneterData = deepCopy(this.ceneterData);
                        this.operationData = deepCopy(this.ceneterData);

                        this.knobData.config.subActions[0] = deepCopy(this.ceneterData);
                        this.knobData = deepCopy(this.knobData);
                    } else {
                        this.clickPos = '';
                    }
                    break;
                case 'right':
                    if (this.isHover && knobMenu.childrenName !== 'assistant') {
                        this.rightData.childrenName = knobMenu.childrenName;
                        this.rightData.config = deepCopy(knobMenu.config.subActions[0].config);
                        this.rightData = deepCopy(this.rightData);
                        this.operationData = deepCopy(this.rightData);

                        this.knobData.config.subActions[2] = deepCopy(this.rightData);
                        this.knobData = deepCopy(this.knobData);
                    } else {
                        this.clickPos = '';
                    }
                    break;
            }
        },
        updateMenuDisplay() {
            if (this.isMultiActions) {
                this.displayMenuKeyConfiguration = deepCopy(this.multiActionsKeyConfiguration);
            } else {
                this.displayMenuKeyConfiguration = deepCopy(this.standardKeyConfiguration);
            }
        },
        handleSearchInput(searchName) {
            console.log('MainScreen: handleSearchChange: ', searchName);

            clearTimeout(this.searchConfigTimer);

            if (!searchName || searchName === '') {
                this.updateMenuDisplay();
                return;
            }

            const that = this;
            this.searchConfigTimer = setTimeout(() => {
                let tempFilterList = [];
                if (this.isMultiActions) {
                    tempFilterList = deepCopy(this.multiActionsKeyConfiguration);
                } else {
                    tempFilterList = deepCopy(this.standardKeyConfiguration);
                }
                const finalMenuConfigs = [];
                tempFilterList.forEach(configItem => {
                    const filteredConfigs = configItem.children.filter(
                        childrenInfo => childrenInfo.childrenName.toLowerCase().includes(searchName.toLowerCase()) || (!configItem.isPlugin && that.$t(childrenInfo.childrenName).toLowerCase().includes(searchName.toLowerCase()))
                    );
                    if (!filteredConfigs || filteredConfigs.length === 0) {
                        return;
                    }

                    configItem.children = filteredConfigs;

                    finalMenuConfigs.push(configItem);
                });

                that.displayMenuKeyConfiguration = deepCopy(finalMenuConfigs);
            }, 500);
        },
        processDeviceConnection(serialNumber, connected, connectionType) {
            const that = this;
            console.log('MainScreen:  监听', serialNumber, ' Connected: ', connected, ' Type: ', connectionType);
            if (serialNumber.length < 4) {
                console.log('MainScreen:   无效字符串');
                return;
            }
            const serial = serialNumber.substr(serialNumber.length - 4, 4);
            this.operationData = {};
            this.selectedCell = null;
            // 设备连接
            if (connected) {
                if (that.deviceArr.filter(item => item.serialNumber === serialNumber).length > 0) return;
                if (connectionType && connectionType === 'QMK') {
                    that.deviceArr.push({
                        label: `QMK Device ${serial}`,
                        serialNumber: serialNumber,
                        connectionType: connectionType,
                    });
                } else {
                    that.deviceArr.push({
                        label: `DecoKee ${serial}`,
                        serialNumber: serialNumber,
                        connectionType: connectionType,
                    });
                }
                console.log('MainScreen:   连接的设备', that.deviceArr);

                if (
                    that.deviceName === undefined ||
                    that.deviceName === '' ||
                    that.deviceName === that.$t('selectDevice')
                ) {
                    if (connectionType === 'QMK') {
                        that.showVIA = !that.showVIA;
                        return;
                    }
                    that.showVIA = false;
                    that.deviceName = that.deviceArr.find(item => item.serialNumber === serialNumber).label;
                    that.serialNumber = serialNumber;

                    window.store.storeSet('mainscreen.deviceName', that.deviceName);

                    window.store.storeSet('currentSelectedDevice', {
                        serialNumber: this.serialNumber,
                        deviceName: this.deviceName,
                    });

                    that.deviceConfigTimer = setTimeout(() => {
                        const deviceLayoutInfo = window.appManager.deviceControlManager.getDeviceBasicConfig(
                            that.serialNumber
                        );
                        console.log('MainScreen:  Get deviceLayoutInfo: ', deviceLayoutInfo);

                        if (deviceLayoutInfo === undefined || deviceLayoutInfo.keyMatrix === undefined) return;
                        that.getConfigInfo(deviceLayoutInfo.keyMatrix.row, deviceLayoutInfo.keyMatrix.col);

                        that.deviceRowCount = deviceLayoutInfo.keyMatrix.row;
                        that.deviceColCount = deviceLayoutInfo.keyMatrix.col;

                        console.log('MainScreen deviceLayoutInfo.keyConfig', deviceLayoutInfo.keyConfig);

                        this.$nextTick(() => {
                            that.mainHeight = document.getElementById('box-main').offsetHeight;
                            that.operationHeight = that.windowHeight - that.mainHeight;
                        });
                    }, 1000);
                }
            } else {
                clearTimeout(that.deviceConfigTimer);

                that.deviceArr = that.deviceArr.filter(item => item.serialNumber !== serialNumber);
                if (that.serialNumber === serialNumber) {
                    that.deviceName = that.$t('selectDevice');
                    window.store.storeSet('mainscreen.deviceName', that.deviceName);

                    window.store.storeSet('currentSelectedDevice', '');
                }
            }
        },
    },
};
</script>

<style lang="less" scoped>
// 下拉菜单样式
.el-popper[x-placement^='bottom'] /deep/ .popper__arrow::after {
    border-bottom-color: transparent !important;
}

.el-popper[x-placement^='bottom'] /deep/ .popper__arrow {
    border-bottom-color: transparent !important;
}

.el-popper[x-placement^='bottom'] {
    margin-top: 6px;
    border-radius: 0;
    background: #3c3c3c;
    border: none;
    text-align: center;
}

.el-dropdown-menu__item:not(.is-disabled):hover {
    color: #fff;
    background: #2d2d2d;
}

.el-dropdown-menu {
    padding: 0;
}

.el-dropdown-menu__item {
    color: #fff;
    padding: 0 15px;
}

.el-dropdown-menu__item--divided {
    margin-top: 0;
    border-top: 1px solid #505050;
}

.el-dropdown-menu__item--divided:before {
    height: 0;
}

.box-content {
    position: relative;
    border-bottom: 2px solid #222;
}

.box-profile {
    display: flex;
    flex-direction: column;
    align-items: end;
    padding: 10px 15px;
}

.box-square {
    display: flex;
}

// 圆钮
.box-round {
    margin-left: 10px;
    width: 165px;
    height: 165px;
    border-radius: 165px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('../../../public/bj-round.png') no-repeat;
    background-size: contain;
}

.square {
    overflow: hidden;
    background-color: #222;
    margin: 3px;
    width: 100px;
    height: 110px;
    border: 2px solid #474747;
    box-shadow: -1px 1px 3px #000;
}

// 点击高亮box
.highlight-box {
    border: 2px solid #0078ff;
}

// 拖拽高亮box
.draggable-box {
    border: 2px solid #909399;
}
.box-setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
}
// 分页
.pagination {
    display: flex;
    align-items: center;

    .plusBtn {
        width: 22px;
        height: 22px;
        padding: 0;
        border-radius: 2px;
        border-color: #fff;
        background: #fff;
        color: #606266;
    }
}

.box-save {
    margin-right: 15px;
}

// 多项操作样式
.el-container {
    height: 300px;
    /* 添加 max-height 属性 */
    max-height: 100%;

    .el-scrollbar {
        width: 100%;
        height: 100%;
    }
}

.multiActions-title {
    margin: -35px 0 15px 0;

    /deep/ .el-page-header__content {
        color: #fff;
    }
}

.box-multiActions {
    width: 100%;
    height: 300px;
    background: #393939;
    border-radius: 5px;
}

.highlight {
    background: #0078ff;
}

.multiActions-config {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 40px;
    padding: 5px;

    .multiActions-name {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-left: 5px;
        line-height: 20px;
    }
}

.prompt {
    display: flex;
    justify-content: center;
    margin: 60px;
    color: #fff;
}
</style>

<style lang="less" scoped>
.main {
    position: relative;
    .main-screen {
        background: #2d2d2d;
        border: 1px solid #222;
    }

    .sidebar {
        position: fixed;
        right: 0;
        top: 32px;
        width: 300px;
        background-color: #2d2d2d;
        color: #fff;

        .box-side {
            padding: 10px 10px 0;
            display: flex;
            align-items: center;
            .el-input /deep/ .el-input__suffix {
                top: -5px;
            }
        }

        .searchIpt {
            flex: 1;
            margin-right: 10px;
        }

        .el-icon-s-operation {
            font-size: 20px;
        }

        .box-tab {
            padding: 0 10px;
            border-bottom: 1px solid #222;
        }
    }

    .el-container {
        height: 100vh;

        .el-scrollbar {
            width: 100%;
            height: 100%;
        }
    }
}
</style>

<style lang="less" scoped>
.box-key {
    display: flex;
    justify-content: center;
    align-items: center;
    .el-scrollbar /deep/ .el-scrollbar__wrap {
        overflow-x: auto;
    }
}
.el-scrollbar /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
}

/deep/ .el-scrollbar__bar.is-horizontal {
    height: 0;
}

.el-menu-item-group /deep/ .el-menu-item-group__title {
    padding: 0px !important;
}

.el-menu {
    border-right: none;
    background: transparent !important;
}

.el-menu /deep/ .el-menu--inline {
    background: #222 !important;
}

.el-menu-item-group /deep/ .el-menu-item {
    color: #909399 !important;
}

.el-menu-item {
    border-bottom: 1px solid #909399;
}

.el-submenu {
    border-bottom: 1px solid #222;
}

.el-submenu /deep/ .el-submenu__title {
    color: #909399 !important;
}

.el-menu /deep/ .el-submenu__title:hover {
    background: transparent;
}

.el-menu-item:focus,
.el-menu-item:hover {
    background: transparent;
}

.sideMenu {
    display: flex;
    align-items: center;

    .sideMenu-text {
        margin-left: 10px;
    }
}

.menu-dragClass {
    opacity: 0;
}

// 拖拽时样式
.dragClass {
    border: none;
    border-radius: 8px;
    background: #2d2d2d;
}
</style>
