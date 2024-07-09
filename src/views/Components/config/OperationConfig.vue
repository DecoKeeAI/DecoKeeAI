<template>
    <div class="formItem">
        <!-- 定时器 -->
        <template v-if="newOptionData.childrenName === 'timer'">
            <el-form-item :label="$t('setTime')">
                <el-input v-model="timer" clearable size="mini" style="width: 100px"></el-input>
            </el-form-item>
            <el-form-item :label="$t('sound')">
                <el-select
                    v-model="soundSelect"
                    :placeholder="$t('pleaseSelect')"
                    clearable
                    size="mini"
                    @change="handleSelect"
                >
                    <el-option
                        v-for="item in soundOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                    <el-option :label="$t('selectFile')" value="file"></el-option>
                </el-select>
                <input ref="selectFile" hidden type="file" @change="selectFile" />
            </el-form-item>
        </template>
        <!-- 网站 -->
        <el-form-item v-else-if="newOptionData.childrenName === 'website'" label="URL:">
            <el-input v-model="url" clearable size="mini"></el-input>
        </el-form-item>
        <!-- 多媒体 -->
        <el-form-item v-else-if="newOptionData.childrenName === 'media'" :label="$t('operation')">
            <el-select
                v-model="media"
                :placeholder="$t('pleaseSelect')"
                clearable
                size="mini"
                @change="handleMedia"
            >
                <el-option
                    v-for="item in mediaOption"
                    :key="item.value"
                    :label="$t(item.type)"
                    :value="item.value"
                ></el-option>
            </el-select>
        </el-form-item>

        <!-- 热键 -->
        <el-form-item
            v-else-if="newOptionData.childrenName === 'hotkey'"
            :label="$t('hotKey')"
            class="hotkey"
        >
            <el-input
                ref="hotKey"
                v-model="hotKeyValue"
                :readonly="true"
                style="width: 260px"
                @blur="onBlur"
                @focus="onFocus"
            ></el-input>
            <el-popover placement="right" trigger="click">
                <el-button
                    slot="reference"
                    icon="el-icon-arrow-down"
                    plain
                    size="mini"
                    type="primary"
                ></el-button>
                <el-cascader-panel
                    :options="cascaderOptions"
                    :props="{ expandTrigger: 'hover' }"
                    @change="hotKeyChange"
                ></el-cascader-panel>
            </el-popover>
        </el-form-item>
        <!-- 热键切换 -->
        <template v-else-if="newOptionData.childrenName === 'hotkeySwitch'">
            <!-- 热键1 -->
            <el-form-item :label="$t('hotKey1')" class="hotkeySwitch1">
                <el-input
                    ref="hotkeySwitch1"
                    v-model="hotkeySwitch1"
                    :readonly="true"
                    style="width: 260px"
                    @blur="switchBlur1"
                    @focus="switchFocus1"
                ></el-input>
                <el-popover placement="right" trigger="click">
                    <el-button
                        slot="reference"
                        icon="el-icon-arrow-down"
                        plain
                        size="mini"
                        type="primary"
                    ></el-button>
                    <el-cascader-panel
                        :options="cascaderOptions"
                        :props="{ expandTrigger: 'hover' }"
                        @change="hotkeySwitch1Change"
                    ></el-cascader-panel>
                </el-popover>
            </el-form-item>
            <!-- 热键2 -->
            <el-form-item :label="$t('hotKey2')" class="hotkeySwitch2">
                <el-input
                    ref="hotkeySwitch2"
                    v-model="hotkeySwitch2"
                    :readonly="true"
                    style="width: 260px"
                    @blur="switchBlur2"
                    @focus="switchFocus2"
                ></el-input>
                <el-popover placement="right" trigger="click">
                    <el-button
                        slot="reference"
                        icon="el-icon-arrow-down"
                        plain
                        size="mini"
                        type="primary"
                    ></el-button>
                    <el-cascader-panel
                        :options="cascaderOptions"
                        :props="{ expandTrigger: 'hover' }"
                        @change="hotkeySwitch2Change"
                    ></el-cascader-panel>
                </el-popover>
            </el-form-item>
        </template>
        <!-- 文本 -->
        <el-form-item v-else-if="newOptionData.childrenName === 'text'" :label="$t('text') + ':'">
            <el-input
                v-model="textarea"
                :placeholder="$t('addText')"
                maxlength="500"
                resize="none"
                show-word-limit
                type="textarea"
            />
            <el-checkbox v-model="textchecked" @change="handleCheckbox"
                >{{ $t('sendingMessage') }}
            </el-checkbox>
        </el-form-item>
        <!-- 控制台命令 -->
        <el-form-item v-else-if="newOptionData.childrenName === 'cmd'" :label="$t('cmd') + ':'">
            <el-input
                v-model="textarea"
                :placeholder="$t('cmdLineEnterHint')"
                maxlength="500"
                resize="none"
                show-word-limit
                type="textarea"
            />
        </el-form-item>
        <!-- 切换配置文件 -->
        <template v-else-if="newOptionData.childrenName === 'switchProfile'">
            <el-form-item :label="$t('profile') + ':'">
                <el-select
                    v-model="switchProfile"
                    clearable
                    size="mini"
                    style="width: 260px"
                    @change="handleSwitchProfile"
                >
                    <el-option :label="$t('nextProfile')" value="-1"></el-option>
                    <el-option
                        v-for="item in dropdownMenu"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="switchProfile !== '-1'" :label="$t('pageNumber') + ':'">
                <el-select
                    v-model="pageNumber"
                    clearable
                    size="mini"
                    style="width: 260px"
                    @change="handlePageNumber"
                >
                    <el-option
                        v-for="item in setPageArr"
                        :key="item.item"
                        :label="item"
                        :value="item"
                    ></el-option>
                </el-select>
            </el-form-item>
        </template>
        <!-- 延时 -->
        <el-form-item
            v-else-if="newOptionData.childrenName === 'delayed'"
            :label="$t('delayed') + ':'"
        >
            <el-input v-model="delayedTime" style="width: 100px"></el-input>
            ms
        </el-form-item>
    </div>
</template>

<script>
import { deepCopy } from '@/utils/ObjectUtil';
import { cascaderOptions, mediaOption } from '@/plugins/KeyConfiguration.js';
import Constants from '@/utils/Constants';
import {
    commonBlur,
    commonFocus,
    handleKeyUserInput,
    transferKeyName,
} from '@/plugins/hotKeyFun.js';
import {EventType} from "uiohook-napi";

export default {
    name: 'OperationConfig',

    props: {
        optionData: Object,
    },
    created() {
        this.newOptionData = deepCopy(this.optionData);
        console.log('newOptionData', this.newOptionData.config.actions);
        // 切换配置文件
        if (window.store.storeGet('mainscreen.dropdownMenu')) {
            this.dropdownMenu = window.store.storeGet('mainscreen.dropdownMenu');
        }
        switch (this.newOptionData.childrenName) {
            case 'timer':
                this.timer = this.newOptionData.config.actions[0].value / 1000;
                this.soundSelect = this.newOptionData.config.actions[1].value;
                break;
            case 'website':
                this.url = this.newOptionData.config.actions[0].value;
                break;
            case 'media':
                this.media = this.newOptionData.config.actions[0].value;
                break;
            case 'text':
                this.textarea = this.newOptionData.config.actions[0].value;
                if (this.newOptionData.config.actions[1].type) {
                    return (this.textchecked = true);
                }
                this.textchecked = false;
                break;
            case 'cmd':
                this.textarea = this.newOptionData.config.actions[0].value;
                break;
            case 'hotkey':
                if (this.newOptionData.config.actions[0].value === '') {
                    this.hotKeyValue = this.$t('hotkeyMatching');
                } else {
                    this.hotKeyValue = this.newOptionData.config.actions[0].value;
                }
                break;
            case 'hotkeySwitch':
                if (this.newOptionData.config.actions[0].value === '') {
                    this.hotkeySwitch1 = this.$t('hotkeyMatching');
                } else {
                    this.hotkeySwitch1 = this.newOptionData.config.actions[0].value;
                }
                if (this.newOptionData.config.actions[1].value === '') {
                    this.hotkeySwitch2 = this.$t('hotkeyMatching');
                } else {
                    this.hotkeySwitch2 = this.newOptionData.config.actions[1].value;
                }
                break;
            case 'switchProfile':
                this.switchProfile = this.newOptionData.config.actions[0].value;
                this.pageNumber = this.newOptionData.config.actions[1].value;
                break;
            case 'delayed':
                this.delayedTime = this.newOptionData.config.actions[0].value;
                break;
        }
    },
    watch: {
        optionData(newDate) {
            this.newOptionData = deepCopy(newDate);
            switch (this.newOptionData.childrenName) {
                case 'timer':
                    this.timer = this.newOptionData.config.actions[0].value / 1000;
                    this.soundSelect = this.newOptionData.config.actions[1].value;
                    break;
                case 'website':
                    this.url = this.newOptionData.config.actions[0].value;
                    break;
                case 'media':
                    this.media = this.newOptionData.config.actions[0].value;
                    break;
                case 'text':
                    this.textarea = this.newOptionData.config.actions[0].value;
                    if (this.newOptionData.config.actions[1].type) {
                        return (this.textchecked = true);
                    }
                    this.textchecked = false;
                    break;
                case 'cmd':
                    this.textarea = this.newOptionData.config.actions[0].value;
                    break;
                case 'open':
                    this.fullPath = this.newOptionData.config.actions[0].value;
                    break;
                case 'hotkey':
                    if (this.newOptionData.config.actions[0].value === '') {
                        this.hotKeyValue = this.$t('hotkeyMatching');
                    } else {
                        this.hotKeyValue = this.newOptionData.config.actions[0].value;
                    }
                    break;
                case 'hotkeySwitch':
                    if (this.newOptionData.config.actions[0].value === '') {
                        this.hotkeySwitch1 = this.$t('hotkeyMatching');
                    } else {
                        this.hotkeySwitch1 = this.newOptionData.config.actions[0].value;
                    }
                    if (this.newOptionData.config.actions[1].value === '') {
                        this.hotkeySwitch2 = this.$t('hotkeyMatching');
                    } else {
                        this.hotkeySwitch2 = this.newOptionData.config.actions[1].value;
                    }
                    break;
                case 'switchProfile':
                    this.switchProfile = this.newOptionData.config.actions[0].value;
                    this.pageNumber = this.newOptionData.config.actions[1].value;
                    break;
                case 'delayed':
                    this.delayedTime = this.newOptionData.config.actions[0].value;
                    break;
            }
            console.log('各项操作配置', this.newOptionData.config);
        },
        timer(newTimer) {
            this.newOptionData.config.actions[0].value = newTimer * 1000;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
        },
        url(newUrl) {
            this.newOptionData.config.actions[0].value = newUrl;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
        },
        textarea(newTextarea) {
            this.newOptionData.config.actions[0].value = newTextarea;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
        },
        delayedTime(newDelayedTime) {
            this.newOptionData.config.actions[0].value = newDelayedTime;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
        },
    },
    data() {
        return {
            newOptionData: {},
            // 定时器
            timer: null,
            soundSelect: null,
            soundOption: [
                {
                    value: 0,
                    label: '无',
                },
            ],
            // 网站
            url: '',
            // 多媒体
            media: '',
            mediaOption,

            // 创建文件夹
            folder: 0,
            // 热键切换
            hotKeyValue: this.$t('hotkeyMatching'),
            hotkeySwitch1: this.$t('hotkeyMatching'),
            hotkeySwitch2: this.$t('hotkeyMatching'),
            cascaderOptions,
            // 文本
            textarea: '',
            textchecked: false,
            // 切换配置文件
            pageNumber: 1,
            allResource: [], //全部资源列表

            setPageArr: [], //页码去重
            switchProfile: '-1',
            dropdownMenu: [],

            // 延时
            delayedTime: '',
            keyStatusMap: {}
        };
    },
    methods: {
        getAllResource() {
            this.allResource = window.resourcesManager.getAllResourceInfoByType(
                Constants.RESOURCE_TYPE_DEVICE_CONFIG
            );
            console.log('全部资源列表', this.allResource);
        },
        updateOptionData() {
            this.$emit('updateOptionData', this.newOptionData);
        },
        // 定时器
        handleSelect(select) {
            console.log(select);
            if (select === 'file') {
                this.soundSelect = null;
                this.$refs.selectFile.click();
            }
            this.newOptionData.config.actions[1].value = this.soundSelect;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
        },
        // 选择文件
        selectFile(e) {
            console.log(e.target.files[0].path);
            this.soundSelect = e.target.files[0].path;
            this.newOptionData.config.actions[1].value = this.soundSelect;
            this.newOptionData = deepCopy(this.newOptionData);
            console.log('定时器newOptionData', this.newOptionData.config);
            this.updateOptionData();
        },
        handleMedia(val) {
            console.log(val);
            this.newOptionData.config.actions[0].value = val;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
        },

        // 热键
        transferKeyName,
        handleKeyUserInput,
        commonFocus,
        commonBlur,
        processHotKeyChange(key, keyName, actionIndex) {
            if (key.length > 1) {
                keyName = key[key.length - 1]
            } else {
                keyName = key[0]
            }
            this.newOptionData.config.actions[actionIndex].value = keyName;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData()
            return keyName;
        },
        hotKeyChange(key) {
            this.hotKeyValue = this.processHotKeyChange(key, this.hotKeyValue, 0);
        },
        hotkeySwitch1Change(key) {
            this.hotkeySwitch1 = this.processHotKeyChange(key, this.hotkeySwitch1, 0);
        },
        hotkeySwitch2Change(key) {
            this.hotkeySwitch2 = this.processHotKeyChange(key, this.hotkeySwitch2, 1);
        },
        keyDownHandler(e) {
            if (this.keyStatusMap[e.keycode] && this.keyStatusMap[e.keycode].type === e.type) {
                return;
            }
            this.keyStatusMap[e.keycode] = e;

            if (e.type === EventType.EVENT_KEY_RELEASED) {
                delete this.keyStatusMap[e.keycode];
            }

            const key = this.transferKeyName(e);
            console.log('keyDownHandler: ' + key);
            const processResult = this.handleKeyUserInput(
                key,
                this.hotKeyValue,
                this.keyDownHandler
            );
            this.hotKeyValue = processResult.displayText;
            if (processResult.haveValidKeyInput) {
                this.newOptionData.config.actions[0].value = processResult.displayText;
                this.newOptionData = deepCopy(this.newOptionData);
                this.updateOptionData();

                this.$refs.hotKey.blur();
            }
        },
        onFocus() {
            this.hotKeyValue = this.commonFocus('--borderColor', this.keyDownHandler);
        },
        onBlur() {
            this.keyStatusMap = {}
            this.hotKeyValue = this.commonBlur('--borderColor', this.keyDownHandler);
        },
        switchKeyDown1(e) {
            if (this.keyStatusMap[e.keycode] && this.keyStatusMap[e.keycode].type === e.type) {
                return;
            }
            this.keyStatusMap[e.keycode] = e;

            if (e.type === EventType.EVENT_KEY_RELEASED) {
                delete this.keyStatusMap[e.keycode];
            }

            let key = this.transferKeyName(e);

            const processResult = this.handleKeyUserInput(
                key,
                this.hotkeySwitch1,
                this.switchKeyDown1
            );
            this.hotkeySwitch1 = processResult.displayText;
            if (processResult.haveValidKeyInput) {
                this.newOptionData.config.actions[0].value = processResult.displayText;
                this.newOptionData = deepCopy(this.newOptionData);
                this.updateOptionData();

                this.$refs.hotkeySwitch1.blur();
            }
        },
        switchFocus1() {
            this.hotkeySwitch1 = this.commonFocus('--border--hotkeySwitch1', this.switchKeyDown1);
        },
        switchBlur1() {
            this.keyStatusMap = {}
            this.hotkeySwitch1 = this.commonBlur('--border--hotkeySwitch1', this.switchKeyDown1);
        },
        switchKeyDown(e) {
            if (this.keyStatusMap[e.keycode] && this.keyStatusMap[e.keycode].type === e.type) {
                return;
            }
            this.keyStatusMap[e.keycode] = e;

            if (e.type === EventType.EVENT_KEY_RELEASED) {
                delete this.keyStatusMap[e.keycode];
            }

            let key = this.transferKeyName(e);

            const processResult = this.handleKeyUserInput(
                key,
                this.hotkeySwitch2,
                this.switchKeyDown
            );
            this.hotkeySwitch2 = processResult.displayText;
            if (processResult.haveValidKeyInput) {
                this.newOptionData.config.actions[1].value = processResult.displayText;
                this.newOptionData = deepCopy(this.newOptionData);
                this.updateOptionData();

                this.$refs.hotkeySwitch2.blur();
            }
        },
        switchFocus2() {
            this.hotkeySwitch2 = this.commonFocus('--border--hotkeySwitch2', this.switchKeyDown);
        },
        switchBlur2() {
            this.keyStatusMap = {}
            this.hotkeySwitch2 = this.commonBlur('--border--hotkeySwitch2', this.switchKeyDown);
        },
        // 文本
        handleCheckbox(val) {
            console.log(val);
            if (!val) {
                this.newOptionData.config.actions[1] = {};
                this.textchecked = false;
            } else {
                this.newOptionData.config.actions[1] = {
                    type: 'key',
                    value: 'enter',
                };
                this.textchecked = true;
            }
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
            console.log(this.newOptionData.config);
        },
        // 切换配置文件
        handleSwitchProfile(profile) {
            this.switchProfile = profile;
            console.log('切换配置文件的id', this.switchProfile);
            console.log(profile);
            this.pageArr = [];
            this.pageNumber = 1;
            if (profile !== '-1') {
                this.commonTotal();
            }
            this.newOptionData.config.actions[0].value = profile;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
            console.log(this.newOptionData.config);
        },
        handlePageNumber(page) {
            this.newOptionData.config.actions[1].value = page;
            this.newOptionData = deepCopy(this.newOptionData);
            this.updateOptionData();
            console.log(this.newOptionData.config);
        },

        // 页码
        commonTotal() {
            const pageArr = [];
            this.getAllResource();
            const [configId, page, folder] = this.allResource
                .find(item => item.id === this.switchProfile)
                .name.split(',');
            this.configId = configId;
            this.page = page;
            this.folderId = folder;
            this.allResource.forEach(item => {
                if (item.name.split(',')[0] === configId) {
                    pageArr.push(item.name.split(',')[1]);
                }
            });
            this.setPageArr = Array.from(new Set(pageArr));
            console.log('OperationConfig: commonTotal: 当前资源的页数', this.setPageArr);
        },
    },
};
</script>
<style lang="less" scoped>
.el-form-item {
    margin-bottom: 0px;
}

.el-textarea /deep/ .el-textarea__inner {
    background: transparent !important;
    border: 2px solid #3c3c3c;
    border-radius: 0;
    height: 100px;
}

.el-textarea /deep/ .el-input__count {
    background: transparent !important;
}

.hotkey {
    /deep/ .el-input__inner {
        border: var(--borderColor);
    }

    /deep/ .el-input__inner:hover {
        border: none;
    }

    /deep/ .el-input__inner:focus {
        border: var(--borderColor) !important;
    }
}

.hotkeySwitch2 {
    /deep/ .el-input__inner {
        border: var(--border--hotkeySwitch2);
    }

    /deep/ .el-input__inner:hover {
        border: none;
    }

    /deep/ .el-input__inner:focus {
        border: var(--border--hotkeySwitch2) !important;
    }
}

.hotkeySwitch1 {
    /deep/ .el-input__inner {
        border: var(--border--hotkeySwitch1) !important;
    }

    /deep/ .el-input__inner:hover {
        border: none;
    }

    /deep/ .el-input__inner:focus {
        border: var(--border--hotkeySwitch1) !important;
    }
}
</style>
