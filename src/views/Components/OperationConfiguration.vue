<template>
    <div>
        <div class="operation">
            <div class="title">
                <span class="headLine">{{
                    optionData.isPlugin ? optionData.childrenName : $t(optionData.childrenName)
                }}</span>
                <span style="float: right">
                    <!-- 延时 -->
                    <el-dropdown v-if="optionData.config.gap || optionData.config.pressTime" :hide-on-click="false" trigger="click">
                        <span class="operationFont">
                            <i class="el-icon-timer"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown" style="padding: 10px">
                            <div class="dropdownMenu">
                                <IconHolder :icon-size="iconSize" :title="$t('betweenTime')" img-src="@/icon/pressTime.png" />
                                <el-slider v-model="pressTime" :max="100" :min="1" class="block" style="width: 150px; margin: 0 10px" @change="pressTimeChange"></el-slider>
                                <el-input-number v-model="pressTime" :max="100" :min="1" controls-position="right" size="mini" @change="pressTimeChange"></el-input-number>
                            </div>
                            <div class="dropdownMenu">
                                <IconHolder :icon-size="iconSize" :title="$t('nextTime')" img-src="@/icon/gap.png" />
                                <el-slider v-model="gap" :max="100" :min="1" class="block" style="width: 150px; margin: 0 10px" @change="gapChange"></el-slider>
                                <el-input-number v-model="gap" :max="100" :min="1" controls-position="right" size="mini" @change="gapChange"></el-input-number>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <!-- 删除 -->
                    <i v-if="optionData.childrenName !== 'back'" class="el-icon-delete" @click="deleteOperation"></i>
                </span>
            </div>

            <div class="footer">
                <div>
                    <div class="operationIcon">
                        <!-- 自定义上传图片 -->
                        <el-button v-if="!isMultiActions" circle class="selectIcon" icon="el-icon-plus" @click="handleCommand('selectDecoKeeIcon')"></el-button>
                        <div v-if="!isMultiActions" class="changeIcon">
                            <el-dropdown placement="bottom-start" trigger="click" @command="handleCommand">
                                <el-button circle class="changeIconBtn" icon="el-icon-arrow-down"></el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="selectPicture">{{ $t('selectPicture') }}
                                    </el-dropdown-item>
                                    <el-dropdown-item command="selectDecoKeeIcon">{{ $t('selectDecoKeeIcon') }}
                                    </el-dropdown-item>
                                    <el-dropdown-item command="reset">
                                        {{ $t('resetDefault') }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        <UnitControl :icon="icon" :itemData="optionData" style="margin-top: -9px"></UnitControl>
                    </div>
                    <!-- 热键切换 -->
                    <div v-if="optionData.childrenName === 'hotkeySwitch' || optionData.config.haveAlterAction" class="switchIcon">
                        <el-radio-group v-model="switchIcon" @change="handleAlterActionSwitch">
                            <el-radio :label="null"></el-radio>
                            <el-radio label=""></el-radio>
                        </el-radio-group>
                    </div>
                </div>

                <el-form label-width="180px">
                    <el-row type="flex">
                        <el-col>
                            <el-form-item :label="$t('title')">
                                <el-input v-model="headLine" clearable size="mini" style="width: 260px" />
                            </el-form-item>
                        </el-col>
                        <el-col>
                            <el-dropdown :hide-on-click="false" trigger="click">
                                <span class="operationFont">
                                    <IconHolder :icon-size="iconSize" img-src="@/icon/font.png" />
                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                </span>
                                <el-dropdown-menu slot="dropdown" style="padding: 5px">
                                    <div class="dropdownMenu">
                                        <el-dropdown-item>
                                            <el-checkbox v-model="showTitle" @change="headleCheckbox">{{ $t('showHeading') }}
                                            </el-checkbox>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <el-radio-group v-model="align" @change="headleAlign">
                                                <el-radio label="bot">{{ $t('alignBottom') }} </el-radio>
                                                <el-radio label="mid">{{ $t('alignCenter') }} </el-radio>
                                                <el-radio label="top">{{ $t('alignTop') }} </el-radio>
                                            </el-radio-group>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <el-button icon="el-icon-refresh" plain size="mini" type="primary" @click="resetBtn"></el-button>
                                        </el-dropdown-item>
                                    </div>
                                    <div>
                                        <el-dropdown-item class="dropdownMenu">
                                            <el-input-number v-model="fontSize" :max="18" :min="6" controls-position="right" size="mini">
                                            </el-input-number>
                                            <el-checkbox-group v-model="fontPattern" class="fontPattern" size="mini" @change="changeFontPattern">
                                                <el-checkbox-button label="bold">
                                                    <IconHolder :icon-size="fontStyleSize" img-src="@/icon/bold.png" />
                                                </el-checkbox-button>
                                                <el-checkbox-button label="italic">
                                                    <IconHolder :icon-size="fontStyleSize" img-src="@/icon/italic.png" />
                                                </el-checkbox-button>
                                                <el-checkbox-button label="underline">
                                                    <IconHolder :icon-size="fontStyleSize" img-src="@/icon/underline.png" />
                                                </el-checkbox-button>
                                            </el-checkbox-group>
                                            <el-color-picker v-model="fontColor" size="mini"></el-color-picker>
                                        </el-dropdown-item>
                                    </div>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </el-col>
                    </el-row>

                    <OperationConfig :optionData="optionData" @updateOptionData="updateOptionData"></OperationConfig>

                    <!-- 亮度 -->

                    <el-form-item v-if="optionData.childrenName === 'brightness'" :label="$t('operation')">
                        <el-select v-model="briSelect" :placeholder="$t('pleaseSelect')" clearable size="mini" @change="handleBrightness">
                            <el-option v-for="item in brightnessOption" :key="item.value" :label="$t(item.type)" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 打开功能 -->
                    <template v-else-if="optionData.childrenName === 'open'">
                        <el-form-item :label="$t('app/file') + ':'">
                            <el-input v-model="fullPath" style="width: 240px" :readonly="true" />
                            <el-button class="btn-folder" icon="el-icon-folder-opened" plain size="mini" type="primary" @click="btnOpened"></el-button>
                            <el-button icon="el-icon-folder" plain size="mini" type="primary" @click="btnFolder"></el-button>
                        </el-form-item>

                        <el-form-item :label="$t('selectApp') + ':'" v-if="appOption.length > 0">
                            <el-select v-model="appLaunchPath" :placeholder="$t('pleaseSelect')" style="width: 300px" filterable size="mini" @change="handleAppPath">
                                <el-option style="border-bottom: 1px solid #fff"  value="Not Monitor">
                                    <div style="display: flex; align-items: center; justify-content:space-between;">
                                        <span>{{ $t('settings.none') }}</span>
                                        <i v-if="appLaunchPath === ''" class="el-icon-check" style="color: white;"></i>
                                    </div>
                                </el-option>

                                <el-option v-for="item in appOption" :key="item.appLaunchPath" :label="item.appName" :value="item.appName">
                                    <div style="display: flex; align-items: center; justify-content:space-between;">
                                        <div style="display: flex; align-items: center;">
                                            <IconHolder :icon-size="{ width: '20px', height: '20px', verticalAlign: 'text-bottom'}" :icon-src="item.displayIcon" />
                                            <span style="margin-left: 10px;">{{ item.appName }}</span>
                                        </div>
                                        <i v-if="appLaunchPath === item.appName" class="el-icon-check" style="color: white;"></i>
                                    </div>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </template>

                    <!-- 关闭 -->
                    <template v-else-if="optionData.childrenName === 'close'">
                        <el-form-item :label="$t('app/file') + ':'">
                            <el-input v-model="closePath" size="mini" style="width: 260px" />
                            <el-button class="btn-folder" icon="el-icon-folder" plain size="mini" type="primary" @click="exitBtn"></el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-checkbox v-model="exitChecked" @change="handleExit">{{ $t('forcedExit') }}
                            </el-checkbox>
                        </el-form-item>
                    </template>
                    <!-- 前往页面 -->
                    <el-form-item v-else-if="optionData.childrenName === 'goToPage'" :label="$t('pageNumber') + ':'">
                        <el-select v-model="goToPage" clearable size="mini" style="width: 260px" @change="handlePageNumber">
                            <el-option v-for="item in setPageArr" :key="item.item" :label="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>

                    <!-- 音频 -->
                    <template v-else-if="optionData.childrenName === 'playAudio'">
                        <el-form-item :label="$t('file') + ':'">
                            <el-input v-model="soundPath" clearable style="width: 260px" />
                            <el-button class="btn-folder" icon="el-icon-folder-opened" plain size="mini" type="primary" @click="btnSound"></el-button>
                        </el-form-item>

                        <el-form-item :label="$t('operation')">
                            <el-select v-model="audioAction" :placeholder="$t('pleaseSelect')" clearable size="mini" style="width: 115px" @change="handleAudioAction">
                                <el-option v-for="item in audioOperation" :key="item.value" :label="$t(item.type)" :value="item.value"></el-option>
                            </el-select>
                            <el-select v-model="audioFade" :placeholder="$t('pleaseSelect')" clearable size="mini" style="width: 110px; margin: 0 5px" @change="handleAudioFade">
                                <el-option v-for="item in audioFadeOptions" :key="item.value" :label="$t(item.type)" :value="item.value"></el-option>
                            </el-select>
                            <el-select v-if="audioFade !== 0" v-model="fadeTime" :placeholder="$t('pleaseSelect')" clearable size="mini" style="width: 80px" @change="handleFadeTime">
                                <el-option v-for="item in audioFadeTime" :key="item.value" :label="item.type" :value="item.value * 1000"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('volume')">
                            <div class="audio-volume">
                                <el-slider v-model="volume" :max="100" :min="0" class="block" style="width: 100%" @change="volumeChange"></el-slider>
                            </div>
                        </el-form-item>
                    </template>

                    <PluginOptionView v-else-if="optionData.isPlugin" ref="pluginOptionView" :plugin-details="operationData" style="margin: 12px 0 0 78px" />

                    <!-- 多项操作 -->
                    <el-form-item v-else-if="optionData.childrenName === 'multiActions'" :label="$t('contain')">
                        <span class="folder">
                            {{ optionData.config.subActions.length }} {{ $t('project') }}
                            <el-button v-if="!isMultiActions" circle class="changeIconBtn" icon="el-icon-right" @click="enterMultiActions"></el-button>
                        </span>
                    </el-form-item>

                    <AIConfigSettings
                        :ai-model-config-data="optionData.config.actions[0].value"
                        v-else-if="optionData.childrenName === 'assistant' || optionData.config.type === 'assistant'"
                        @aiConfigUpdated="handleAIConfigUpdated"
                    />

                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import UnitControl from '@/views/Components/UnitControl.vue';
import PluginOptionView from '@/views/AIAssistant/PluginOptionView';
import IconHolder from './IconHolder';
import { deepCopy } from '@/utils/ObjectUtil';
import Constants from '@/utils/Constants';
import OperationConfig from '@/views/Components/config/OperationConfig';
import { dialog } from '@electron/remote';
import { audioFadeOptions, audioFadeTime, audioOperation, brightnessOption } from '@/plugins/KeyConfiguration.js';
import defaultResourcesMap from '@/assets/resources.js';
import { ipcRenderer } from 'electron';
import AIConfigSettings from "@/views/Setting/AIConfigSettings.vue";

export default {
    components: {
        UnitControl,
        IconHolder,
        OperationConfig,
        PluginOptionView,
        AIConfigSettings
    },
    props: {
        operationData: {
            type: Object,
        },
        resourceId: {
            type: String,
        },
        isMultiActions: {
            type: Boolean,
        },
    },
    data() {
        return {
            headLine: '',
            icon: '',
            iconSize: {
                width: 22 + 'px',
                height: 22 + 'px',
                marginTop: 3 + 'px',
            },
            fontStyleSize: {
                height: 15 + 'px',
            },
            showTitle: null,
            align: 'bot',
            fontColor: null, // 字体颜色
            fontPattern: null, // 字体样式
            fontSize: null, // 字体大小
            optionData: {},
            switchIcon: null,
            // 亮度
            brightnessOption,
            briSelect: 0,
            briAction: {
                type: 'lighten',
                value: 0,
            },
            // 打开功能
            fullPath: '',
            appLaunchPath: '',
            appOption: [],
            // 关闭功能
            closePath: '',
            exitChecked: false,
            // 前往页面
            allResource: window.appManager.resourcesManager.getInstalledApps() || [],
            goToPage: 1,
            setPageArr: [], //页码去重
            pressTime: null,
            gap: null,

            // 音频
            soundPath: '',
            audioOperation,
            audioFadeOptions,
            audioFadeTime,
            audioAction: 0,
            audioFade: 0,
            fadeTime: 1 * 1000,
            volume: 100,

            // 自定义更改图片
            defaultResourcesMap,
        };
    },
    created() {
        this.optionData = deepCopy(this.operationData);
        this.icon = this.optionData.config.icon;
        if (this.optionData.childrenName === 'hotkeySwitch' || this.optionData.config.haveAlterAction) {
            this.icon = this.switchIcon === null ? this.optionData.config.icon : this.optionData.config.alterIcon;
        }
        this.align = this.optionData.config.title.pos;
        this.fontColor = this.optionData.config.title.color;
        this.fontSize = this.optionData.config.title.size;
        this.fontPattern = this.optionData.config.title.style.split('|');
        this.headLine = this.optionData.config.title.text;
        this.showTitle = this.optionData.config.title.display;
        // 操作延迟
        this.pressTime = this.optionData.config.pressTime;
        this.gap = this.optionData.config.gap;
        // 全部应用
        this.appOption = window.appManager.resourcesManager.getInstalledApps()
        console.log('OperationConfiguration: APP: ', this.appOption);

        switch (this.optionData.childrenName) {
            case 'brightness':
                this.briSelect = this.optionData.config.actions[0].value;
                break;
            case 'open':
                this.fullPath = this.optionData.config.actions[0].value;
                // eslint-disable-next-line no-case-declarations
                const filterName = this.appOption.filter(item => item.appLaunchPath === this.fullPath)[0]
                this.appLaunchPath = filterName ? filterName.appName : ''
                break;
            case 'close':
                this.closePath = this.optionData.config.actions[0].value;
                if (this.optionData.config.actions[1].type) {
                    return (this.exitChecked = true);
                }
                this.exitChecked = false;
                break;
            case 'goToPage':
                this.goToPage = this.optionData.config.actions[0].value;
                break;
            case 'playAudio':
                this.soundPath = this.optionData.config.actions[0].value;
                this.audioAction = this.optionData.config.actions[1].value;
                // eslint-disable-next-line no-case-declarations
                const fadeArr = this.optionData.config.actions[2].value.split('-');
                this.audioFade = Number(fadeArr[0]);
                if (Number(fadeArr[1]) !== 0) this.fadeTime = Number(fadeArr[1]);
                this.volume = this.optionData.config.actions[3].value;
                break;
        }

        ipcRenderer.on('ChangeTitle', (event, args) => {
            if (this.optionData.keyCode !== args.keyCode || this.resourceId !== args.resourceId) {
                return;
            }

            if (String(this.headLine) === String(args.title)) {
                return;
            }
            console.log('OperationConfiguration: Received ChangeTitle: ', args);

            this.optionData.config.title.text = String(args.title);
            this.headLine = String(args.title);
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData(false);
            this.notifyTitleChanged();
        });

        ipcRenderer.on('change-icon', (event, args) => {
            console.log('OperationConfiguration: Received change-icon: ', args);

            if (args.resourceId !== this.resourceId) return;

            this.icon = args.selectedIcon.id;
            this.optionData.config.icon = args.selectedIcon.id;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData(true);
        });

        console.log('OperationConfiguration: Current : optionData', this.optionData);

        window.addEventListener('keyup', this.processKeyEvent);
    },
    destroyed() {
        window.removeEventListener('keyup', this.processKeyEvent);

        ipcRenderer.removeAllListeners('ChangeTitle');
        ipcRenderer.removeAllListeners('change-icon');
    },
    mounted() {
        this.commonTotal();

    },
    watch: {
        headLine(newValue) {
            this.headLine = newValue;
            this.optionData.config.title.text = newValue;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },
        fontColor(newValue) {
            this.fontColor = newValue;
            this.optionData.config.title.color = newValue;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },
        fontSize(newValue) {
            this.fontSize = newValue;
            this.optionData.config.title.size = newValue;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },

        operationData(optionData) {
            console.log('更新optionData', optionData.config.actions);

            this.optionData = deepCopy(optionData);
            this.icon = optionData.config.icon;
            if (optionData.childrenName === 'hotkeySwitch' || this.optionData.config.haveAlterAction) {
                this.icon = this.switchIcon === null ? this.optionData.config.icon : this.optionData.config.alterIcon;
            }
            this.headLine = optionData.config.title.text;
            this.align = optionData.config.title.pos;
            this.fontColor = optionData.config.title.color;
            this.fontSize = optionData.config.title.size;
            this.fontPattern = this.optionData.config.title.style.split('|');
            this.showTitle = optionData.config.title.display;
            // 操作延迟
            this.pressTime = optionData.config.pressTime;
            this.gap = optionData.config.gap;

            switch (optionData.childrenName) {
                case 'brightness':
                    this.briSelect = optionData.config.actions[0].value;
                    break;
                case 'open':
                    this.fullPath = optionData.config.actions[0].value;
                    // eslint-disable-next-line no-case-declarations
                    const filterName = this.appOption.filter(item => item.appLaunchPath === this.fullPath)[0]
                    this.appLaunchPath = filterName ? filterName.appName : ''
                    break;
                case 'close':
                    this.closePath = optionData.config.actions[0].value;
                    if (optionData.config.actions[1].type) {
                        return (this.exitChecked = true);
                    }
                    this.exitChecked = false;
                    break;
                case 'goToPage':
                    this.goToPage = this.optionData.config.actions[0].value;
                    break;
                case 'playAudio':
                    this.soundPath = this.optionData.config.actions[0].value;
                    this.audioAction = this.optionData.config.actions[1].value;
                    // eslint-disable-next-line no-case-declarations
                    const fadeArr = this.optionData.config.actions[2].value.split('-');
                    this.audioFade = Number(fadeArr[0]);
                    if (Number(fadeArr[1]) !== 0) this.fadeTime = Number(fadeArr[1]);
                    this.volume = this.optionData.config.actions[3].value;
                    break;
            }
        },
    },

    methods: {
        processKeyEvent(e) {
            // console.log('OperationConfiguration: processKeyEvent: KeyDown Delete: isMultiActions: ', this.isMultiActions)
            if (e.key === 'Delete' && this.optionData.childrenName !== 'back') {
                if (
                    this.optionData.keyCode ||
                    (this.operationData.isMultiAction && this.operationData.multiActionsKeyCode)
                ) {
                    this.deleteOperation();
                }
            }
        },
        deleteOperation() {
            this.$emit('deleteOperation', this.optionData);
        },
        notifyPluginDeleteAction() {
            if (this.optionData.isPlugin) {
                this.$refs.pluginOptionView.deleteCurrentOption();
            }
        },
        updateOperationData(doSaveAction = false) {
            this.$emit('updateOperationData', this.optionData, doSaveAction);
        },
        notifyTitleChanged() {
            if (!this.optionData.isPlugin || !this.$refs.pluginOptionView) return;
            this.$refs.pluginOptionView.notifyTitleChanged();
        },
        headleAlign(position) {
            this.align = position;
            this.optionData.config.title.pos = position;
            // console.log('align', this.align);
            // console.log('position', position);
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },
        // 是否显示标题
        headleCheckbox(val) {
            console.log(val);
            this.showTitle = val;
            this.optionData.config.title.display = this.showTitle;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },
        // 重置文字位置
        resetBtn() {
            this.showTitle = true;
            this.align = 'bot';
            this.optionData.config.title.display = true;
            this.optionData.config.title.pos = 'bot';
            this.optionData.config.title.size = 8;
            this.optionData.config.title.color = '#FFFFFF';
            this.optionData.config.title.style = 'bold|italic|underline';
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },
        changeFontPattern(val) {
            this.fontPattern = val;
            let tempFontStyle = this.fontPattern.join('|');
            if (tempFontStyle.startsWith('|')) {
                tempFontStyle = tempFontStyle.substring(1);
            }
            this.optionData.config.title.style = tempFontStyle;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            this.notifyTitleChanged();
        },
        // 新配置
        updateOptionData(optionData) {
            this.optionData = deepCopy(optionData);
            console.log('更改后的配置optionData', this.optionData.config);
            this.updateOperationData();
        },
        // 热键切换
        handleAlterActionSwitch(val) {
            // console.log('热键切换', val);
            this.switchIcon = val;

            this.icon = this.optionData.config.icon;
            if (val === '') {
                this.icon = this.optionData.config.alterIcon;
            }
        },
        // 选择图片
        handleCommand(command) {
            switch (command) {
                case 'selectDecoKeeIcon':
                    if (window.windowManager.iconSelectWindow.isVisible()) {
                        window.windowManager.iconSelectWindow.checkForTop();
                    } else {
                        window.windowManager.iconSelectWindow.show(this.resourceId, this.optionData.keyCode);
                    }
                    break;
                case 'selectPicture':
                    dialog
                        .showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                {
                                    name: 'Executable Files',
                                    extensions: ['png', 'jpeg', 'jpg', 'gif', 'webp'],
                                },
                            ],
                        })
                        .then(result => {
                            const IconName = result.filePaths[0].split('\\');
                            const resourceName = IconName[IconName.length - 1];
                            console.log('resourceName', resourceName);
                            const resourcePath = result.filePaths[0];
                            console.log(resourcePath);
                            const maxSize = 5 * 1024 * 1024; // 5MB
                            const stats = window.fs.statSync(resourcePath);
                            const fileSizeInBytes = stats.size;

                            if (fileSizeInBytes > maxSize) {
                                this.$message.error(this.$t('exceedMess'));
                            } else {
                                // console.log(`符合最大限制`);
                                const iconId = window.resourcesManager.addResource(resourcePath, resourceName);

                                // console.log(iconId);
                                if (
                                    this.optionData.childrenName === 'hotkeySwitch' ||
                                    this.optionData.config.haveAlterAction
                                ) {
                                    this.icon = iconId;
                                    if (this.switchIcon === null) {
                                        this.optionData.config.icon = iconId;
                                    } else {
                                        this.optionData.config.alterIcon = iconId;
                                    }
                                    this.optionData = deepCopy(this.optionData);
                                    this.updateOperationData();
                                    return;
                                }
                                this.icon = iconId;
                                this.optionData.config.icon = iconId;
                                this.optionData = deepCopy(this.optionData);
                                this.updateOperationData();
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    break;

                // 重置为默认
                case 'reset':
                    if (this.optionData.childrenName === 'brightness') {
                        this.icon = '0-18';
                        this.optionData.config.icon = '0-18';
                        this.optionData = deepCopy(this.optionData);
                        this.updateOperationData();
                        return;
                    }

                    if (this.optionData.isPlugin) {
                        this.icon = this.optionData.config.defaultIcon;
                        this.optionData.config.icon = this.optionData.config.defaultIcon;

                        if (this.optionData.config.haveAlterAction) {
                            this.optionData.config.alterIcon = this.optionData.config.defaultAlterIcon;
                        }

                        this.optionData = deepCopy(this.optionData);
                        this.updateOperationData();
                        return;
                    }

                    defaultResourcesMap.data.forEach(item => {
                        if (item.name !== this.optionData.config.type) {
                            return;
                        }
                        // 热键切换
                        if (this.optionData.childrenName === 'hotkeySwitch') {
                            this.icon = item.id;
                            if (this.switchIcon === null) {
                                this.optionData.config.icon = item.id;
                            } else {
                                this.optionData.config.alterIcon = '0-26';
                            }
                            this.optionData = deepCopy(this.optionData);
                            this.updateOperationData();
                            return;
                        }

                        this.icon = item.id;
                        this.optionData.config.icon = item.id;
                        this.optionData = deepCopy(this.optionData);
                        this.updateOperationData();
                    });
                    break;
            }
        },
        // 亮度
        handleBrightness(val) {
            if (val !== '') {
                switch (this.briSelect) {
                    case 0:
                        this.briAction.type = '变亮';
                        this.briAction.value = 0;
                        this.icon = '0-18';
                        this.optionData.config.icon = '0-18';
                        break;
                    case 1:
                        this.briAction.type = '变暗';
                        this.briAction.value = 1;
                        this.icon = '0-19';
                        this.optionData.config.icon = '0-19';

                        break;
                    case 2:
                        this.briAction.type = '最亮';
                        this.briAction.value = 2;
                        this.icon = '0-20';
                        this.optionData.config.icon = '0-20';

                        break;
                    case 3:
                        this.briAction.type = '较亮';
                        this.briAction.value = 3;
                        this.icon = '0-21';
                        this.optionData.config.icon = '0-21';

                        break;
                    case 4:
                        this.briAction.type = '中等';
                        this.briAction.value = 4;
                        this.icon = '0-22';
                        this.optionData.config.icon = '0-22';

                        break;
                    case 5:
                        this.briAction.type = '较暗';
                        this.briAction.value = 5;
                        this.icon = '0-23';
                        this.optionData.config.icon = '0-23';

                        break;
                    case 6:
                        this.briAction.type = '最暗';
                        this.briAction.value = 6;
                        this.icon = '0-24';
                        this.optionData.config.icon = '0-24';
                        break;
                }
                // console.log(this.briAction);
                this.optionData.config.actions[0] = deepCopy(this.briAction);
                console.log('修改后的亮度数据', this.optionData.config);
                this.optionData = deepCopy(this.optionData);
                this.updateOperationData();
            }
        },
        // 打开文件夹
        btnOpened() {
            dialog
                .showOpenDialog({ properties: ['openDirectory'] })
                .then(result => {
                    this.appLaunchPath = ''
                    console.log('打开文件夹', result);
                    if (result.filePaths.length === 0) return;
                    const fileName = result.filePaths[0].split('\\');
                    console.log(fileName[fileName.length - 1]);
                    this.icon = '0-14';
                    this.optionData.config.icon = '0-14';
                    this.headLine = fileName[fileName.length - 1];
                    this.fullPath = result.filePaths[0];
                    this.optionData.config.title.text = fileName[fileName.length - 1];
                    this.optionData.config.actions[0].value = result.filePaths[0];
                    this.optionData = deepCopy(this.optionData);
                    this.updateOperationData();
                    this.notifyTitleChanged();
                })
                .catch(error => {
                    console.log(error);
                });
        },
        // 打开应用
        btnFolder() {
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
            dialog
                .showOpenDialog({ properties: ['openFile'], filters: filters })
                .then(result => {
                    console.log('打开应用', result);
                    if (result.filePaths.length === 0) return;
                    const filePath = result.filePaths[0];

                    const fileNameWithExt = window.path.basename(filePath);
                    const fileNameWithoutExt = window.path.parse(fileNameWithExt).name;

                    console.log('Selected Application: fileNameWithExt: ', fileNameWithExt, ' fileNameWithoutExt: ', fileNameWithoutExt);

                    window.resourcesManager.getAppIconInfo(result.filePaths[0])
                        .then(resourceInfo => {
                            this.icon = resourceInfo.id;
                            this.optionData.config.icon = resourceInfo.id;
                            this.optionData.config.title.text = fileNameWithoutExt;
                            this.headLine = fileNameWithoutExt;
                            this.optionData.config.actions[0].value = result.filePaths[0];
                            this.fullPath = result.filePaths[0];
                            this.optionData = deepCopy(this.optionData);
                            this.notifyTitleChanged();
                            this.updateOperationData(true);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                })
                .catch(error => {
                    console.log('取消选择', error);
                });
        },

        // 选择全部应用
        handleAppPath(name) {
            if (name === 'Not Monitor') {
                this.fullPath = ''
                this.headLine = ''
                this.icon = '0-14'
                this.optionData.config.icon = '0-14';
                this.optionData.config.title.text = '';
                this.optionData.config.actions[0].value = '';
            } else {
                const filterApp = this.appOption.filter(item => item.appName === name)[0]
                console.log('选择全部应用：', filterApp);
                this.fullPath = filterApp.appLaunchPath
                this.headLine = filterApp.appName;
                this.icon = filterApp.displayIcon;
                this.optionData.config.icon = filterApp.displayIcon;
                this.optionData.config.title.text = filterApp.appName;
                this.optionData.config.actions[0].value = filterApp.appLaunchPath;
            }
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData(true);
        },
        // 关闭
        exitBtn() {
            dialog
                .showOpenDialog({
                    properties: ['openFile'],
                    filters: [{ name: 'Executable Files', extensions: ['exe'] }],
                })
                .then(result => {
                    console.log('关闭', result);
                    if (result.filePaths.length === 0) return;
                    const fileList = result.filePaths[0].split('\\');
                    const fileName = fileList[fileList.length - 1].split('.exe');
                    console.log(fileName[0]);
                    window.app
                        .getFileIcon(result.filePaths[0], { size: "large" })
                        .then(icon => {
                            const outputPath = window.path.join(window.userDataPath, `${fileName[0]}.png`);
                            console.log('临时文件', outputPath);
                            window.fs.writeFile(outputPath, icon.toPNG(), err => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                const iconId = window.resourcesManager.addResource(outputPath, `${fileName[0]}.png`);
                                console.log('关闭获取iconId', iconId);
                                this.icon = iconId;
                                this.optionData.config.icon = iconId;
                                this.optionData.config.title.text = fileName[0];
                                this.headLine = fileName[0];
                                this.optionData.config.actions[0].value = result.filePaths[0];
                                this.closePath = result.filePaths[0];
                                this.optionData = deepCopy(this.optionData);
                                this.updateOperationData();
                                this.notifyTitleChanged();
                                window.fs.unlinkSync(outputPath);
                            });
                        })
                        .catch(error => {
                            console.log(error);
                        });
                })
                .catch(error => {
                    console.log(error);
                });
        },

        handleExit(val) {
            console.log(val);
            if (!val) {
                this.optionData.config.actions[1] = {};
                this.exitChecked = false;
            } else {
                this.optionData.config.actions[1] = {
                    type: 'force',
                    value: 0,
                };
                this.exitChecked = true;
            }
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },
        // 前往页面
        getAllResource() {
            this.allResource = window.resourcesManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_DEVICE_CONFIG);
            console.log('OperationConfiguration: getAllResource: 全部资源列表', this.allResource);
        },
        commonTotal() {
            const pageArr = [];
            this.getAllResource();
            const [configId, page, folder] = this.allResource.find(item => item.id === this.resourceId).name.split(',');
            this.configId = configId;
            this.page = page;
            this.folderId = folder;
            this.allResource.forEach(item => {
                if (item.name.split(',')[0] === configId) {
                    pageArr.push(item.name.split(',')[1]);
                }
            });
            this.setPageArr = Array.from(new Set(pageArr));
            console.log('OperationConfiguration: commonTotal: 当前资源的页数', this.setPageArr);
        },
        handlePageNumber(page) {
            this.optionData.config.actions[0].value = page;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
            console.log(this.optionData.config);
        },
        // 延时
        pressTimeChange(pressNum) {
            console.log(pressNum);
            this.pressTime = pressNum;
            this.optionData.config.pressTime = pressNum;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },
        gapChange(gapNum) {
            this.gap = gapNum;
            this.optionData.config.gap = gapNum;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },
        // 选择音频
        btnSound() {
            dialog
                .showOpenDialog({
                    properties: ['openFile'],
                    filters: [
                        {
                            name: 'Custom File Type',
                            extensions: [
                                'mp3',
                                'wav',
                                'm4a',
                                'm4b',
                                'm4p',
                                'mov',
                                'mp4',
                                'aiff',
                                'flac',
                                'streamDeckAudio',
                            ],
                        },
                    ],
                })
                .then(result => {
                    console.log('播放音频', result);
                    if (result.filePaths.length === 0) return;
                    this.soundPath = result.filePaths[0];
                    const fileList = result.filePaths[0].split('\\');
                    this.headLine = fileList[fileList.length - 1].split('.')[0];
                    this.optionData.config.title.text = this.headLine;
                    this.optionData.config.actions[0].value = result.filePaths[0];
                    this.optionData = deepCopy(this.optionData);
                    this.updateOperationData();
                    this.notifyTitleChanged();
                })
                .catch(error => {
                    console.log(error);
                });
        },
        handleAudioAction(action) {
            // console.log(action);
            this.audioAction = action;
            this.optionData.config.actions[1].value = action;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },
        handleAudioFade(fade) {
            console.log(fade);
            this.audioFade = fade;
            this.fadeTime = 1 * 1000;
            if (fade === 0) {
                this.optionData.config.actions[2].value = `${fade}-0`;
            } else {
                this.optionData.config.actions[2].value = `${fade}-${this.fadeTime}`;
            }
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },
        handleFadeTime(fadeTime) {
            this.fadeTime = fadeTime;
            this.optionData.config.actions[2].value = `${this.audioFade}-${fadeTime}`;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },
        volumeChange(volume) {
            console.log(volume);
            this.volume = volume;
            this.optionData.config.actions[3].value = volume;
            this.optionData = deepCopy(this.optionData);
            this.updateOperationData();
        },

        // 多项操作
        enterMultiActions() {
            this.$emit('enterMultiActions', true);
        },

        handleAIConfigUpdated(newAIConfigData) {
            console.log('OperationConfiguration: handleAIConfigUpdated: ', newAIConfigData);
            this.optionData.config.actions[0].value = JSON.stringify(newAIConfigData);
            this.updateOperationData(true);
        }
    },
};
</script>

<style lang="less" scoped>
.el-form-item {
    margin-bottom: 0px;
}

.el-button--mini,
.el-button--mini.is-round {
    padding: 0px;
}

// 下拉菜单样式
.el-dropdown-menu {
    margin-top: 10px;
    padding: 0px;
    background: #3c3c3c;
    border: none;
}

.el-popper[x-placement^='bottom'] /deep/ .popper__arrow {
    border-bottom-color: #3c3c3c !important;
}

.el-popper[x-placement^='bottom'] /deep/ .popper__arrow::after {
    border-bottom-color: #3c3c3c !important;
}

.el-dropdown-menu__item {
    padding: 0 5px;
    color: #fff;
}

.el-dropdown-menu__item:focus {
    background: transparent;
}

.el-dropdown-menu__item:not(.is-disabled):hover {
    background: transparent;
}

.el-select-dropdown {
    background: transparent;
}

.el-checkbox,
.el-radio {
    color: #fff;
}

.el-radio {
    margin-right: 15px;
}

.dropdownMenu {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

// 计数器样式
/deep/ .el-input-number--mini {
    width: 88px;
    height: 30px;
}

/deep/ .el-input__inner {
    border: 1px solid #474747;
}

/deep/ .el-input__inner:hover {
    border: 1px solid #474747;
}

/deep/ .el-input__inner:focus {
    border: 1px solid #474747 !important;
}

/deep/ .el-input-number__decrease:hover:not(.is-disabled) ~ .el-input .el-input__inner:not(.is-disabled) {
    border: 1px solid #474747 !important;
}

/deep/ .el-input-number__increase:hover:not(.is-disabled) ~ .el-input .el-input__inner:not(.is-disabled) {
    border: 1px solid #474747 !important;
}

// 字体样式
.fontPattern {
    margin: 0 10px;
}

/deep/ .el-radio-button:first-child .el-radio-button__inner {
    border: 1px solid #474747;
}

/deep/ .el-radio-button__inner {
    background: transparent;
    color: #fff;
    border: 1px solid #474747;
}

/deep/ .el-radio-button--mini .el-radio-button__inner {
    padding: 0 10px;
}

.operation {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .title {
        width: 550px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #454545;
        margin-bottom: 10px;
        color: #606266;

        .pressTime-menu {
            display: flex;
        }
    }

    .el-icon-timer {
        margin: 0 10px;
        font-size: 18px;

        &:hover {
            color: #fff;
        }
    }

    .el-icon-delete {
        font-size: 18px;

        &:hover {
            color: #fff;
        }
    }

    .changeIconBtn {
        padding: 3px 2px 2px 3px;
        background: #1f1f1f;
        border: none;
    }

    .footer {
        display: flex;

        .operationIcon {
            position: relative;
            overflow: hidden;
            width: 90px;
            height: 90px;
            background: #000;
            border: 2px solid #454545;
        }

        .selectIcon {
            padding: 3px 2px 2px 3px;
            background: #1f1f1f;
            border: none;
            position: absolute;
            z-index: 2;
            left: 3px;
            top: 2px;
        }

        .changeIcon {
            position: absolute;
            z-index: 2;
            right: 3px;
            top: 2px;
        }

        // 热键切换
        .switchIcon {
            text-align: center;
            margin-left: 10px;

            .el-radio {
                margin: 0;
            }
        }

        .operationFont {
            display: flex;
            align-items: center;
            color: #fff;
            margin: 8px 0 0 10px;

            .el-icon-arrow-down {
                margin: 3px 0 0 -3px;
            }
        }
    }

    // 打开
    .btn-folder {
        margin-left: 15px;
    }

    // 音频
    .audio-volume {
        display: flex;
        align-items: center;
        margin-top: 5px;
    }
}
</style>
