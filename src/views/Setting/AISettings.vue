<template>
    <div>
        <el-divider content-position="left">{{ $t('settings.aiGeneralSetting') }}</el-divider>
        <el-form label-width="200px" size="mini" style="height: 100%">
            <el-form-item :label="$t('settings.inputMic')">
                <el-select v-model="defaultSelectedMic" :placeholder="$t('pleaseSelect')">
                    <el-option
                        v-for="item in micSelectList"
                        :key="item.deviceId"
                        :label="item.label"
                        :value="item.deviceId"
                    >
                        <span style="float: left">{{ item.label }}</span>
                        <span
                            v-if="defaultSelectedMic === item.deviceId"
                            style="margin-left: 12px; float: right; color: #8492a6; font-size: 13px"
                        >
                            <i class="el-icon-check" style="color: white"></i>
                        </span>
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('settings.assistantHotKey')" class="assistantHotKey">
                <el-input
                    ref="assistantHotKey"
                    v-model="assistantHotKey"
                    :readonly="true"
                    style="width: 191px"
                    @blur="handleAssistantHotKeyBlur"
                    @focus="handleAssistantHotKeyFocus"
                ></el-input>
            </el-form-item>
            <el-form-item :label="$t('settings.aiTextSelection')">
                <el-switch v-model="aiTextSelection" @change="handleAITextSelectionChanged" />
            </el-form-item>
            <el-form-item v-if="aiTextSelection && disabledTextSelectionApps.length > 0" :label="$t('settings.disabledTextSelectionApp')">
                <el-tag
                    v-for="appInfo in disabledTextSelectionApps"
                    :key="appInfo.owner.path"
                    closable
                    size="medium"
                    type="warning"
                    @close="handleRemoveDisabledApps(appInfo.owner.path)">
                    {{appInfo.owner.name}}
                </el-tag>
            </el-form-item>
        </el-form>
        <el-divider content-position="left">{{ $t('settings.aiModelSetting') }}</el-divider>
        <AIConfigSettings ref="AIConfigSettings" />

        <el-button size="mini" style="margin-left: 50%; margin-bottom: 12px" type="primary" @click="updateAIConfig"
            >{{ $t('save') }}
        </el-button>
    </div>
</template>

<script>
import { EventType } from 'uiohook-napi';
import { commonBlur, commonFocus, handleKeyUserInput, transferKeyName } from '@/plugins/hotKeyFun.js';
import AIConfigSettings from '@/views/Setting/AIConfigSettings.vue';

export default {
    name: 'AISettings',
    components: {
        AIConfigSettings,
    },
    data() {
        return {
            defaultSelectedMic: '',
            micSelectList: [],
            assistantHotKey: '',
            keyStatusMap: {},
            enableGlobalHotKey: false,
            aiTextSelection: true,
            disabledTextSelectionApps: []
        };
    },
    created() {
        this.defaultSelectedMic = window.store.storeGet('aiConfig.defaultMic');
        if (this.defaultSelectedMic === undefined || this.defaultSelectedMic === this.$t('settings.selectMic')) {
            this.defaultSelectedMic = '';
        }

        // const that = this;
        this.$nextTick(() => {
            this.getInputDevices();
        });

        const savedHotKeyValue = window.store.storeGet('aiConfig.globalAIWakeKey');

        if (!savedHotKeyValue) {
            this.assistantHotKey = this.$t('hotkeyMatching');
        } else {
            this.assistantHotKey = savedHotKeyValue;
        }

        this.aiTextSelection = window.store.storeGet('aiConfig.textSelection.enabled', true);
        this.disabledTextSelectionApps = window.store.storeGet('aiConfig.textSelection.disabledApps', []);
    },
    methods: {
        getInputDevices() {
            const that = this;
            navigator.mediaDevices.enumerateDevices().then(devices => {
                that.micSelectList = devices.filter(function (device) {
                    if (device.kind === 'audioinput') {
                        console.log(
                            'Filter for input device: Kind: ' +
                                device.kind +
                                ' label: ' +
                                device.label +
                                ' id: ' +
                                device.deviceId
                        );
                    }
                    return device.kind === 'audioinput';
                });

                if (that.micSelectList.length === 0) {
                    that.defaultSelectedMic = that.$t('settings.selectMic');
                } else if (that.defaultSelectedMic === '') {
                    const defaultDeviceInfo = devices.filter(device => {
                        return device.deviceId === 'default';
                    });
                    if (defaultDeviceInfo === undefined || defaultDeviceInfo.length === 0) {
                        that.defaultSelectedMic = that.$t('settings.selectMic');
                    } else {
                        that.defaultSelectedMic = defaultDeviceInfo[0].deviceId;
                    }
                }
                console.log('Filter for input device: Total Devices: ' + that.micSelectList.length);
            });
        },
        updateAIConfig() {
            if (this.defaultSelectedMic !== this.$t('settings.selectMic')) {
                window.store.storeSet('aiConfig.defaultMic', this.defaultSelectedMic);
            } else {
                window.store.storeSet('aiConfig.defaultMic', '');
            }

            this.$refs.AIConfigSettings.updateAIConfig();

            window.store.storeSet('aiConfig.globalAIWakeKey', this.assistantHotKey);
        },
        handleKeyUserInput,
        commonFocus,
        commonBlur,
        handleAssistantHotKeyFocus() {
            this.assistantHotKey = this.commonFocus('--borderColor', this.processUserKeyInput);
        },
        handleAssistantHotKeyBlur() {
            this.keyStatusMap = {};
            const blurMsg = this.commonBlur('--borderColor', this.processUserKeyInput);

            if (this.assistantHotKey.indexOf('+') < 1) {
                this.assistantHotKey = blurMsg;
            }
        },
        processUserKeyInput(e) {
            if (this.keyStatusMap[e.keycode] && this.keyStatusMap[e.keycode].type === e.type) {
                return;
            }
            this.keyStatusMap[e.keycode] = e;

            if (e.type === EventType.EVENT_KEY_RELEASED) {
                delete this.keyStatusMap[e.keycode];
            }

            const key = transferKeyName(e);
            console.log('keyDownHandler: ' + key);
            const processResult = this.handleKeyUserInput(key, this.assistantHotKey, this.processUserKeyInput);
            this.assistantHotKey = processResult.displayText;

            if (processResult.haveValidKeyInput) {
                if (processResult.displayText.indexOf('+') < 1) {
                    this.assistantHotKey = this.$t('hotkeyMatching');
                }

                this.$refs.assistantHotKey.blur();
            }
        },
        handleAITextSelectionChanged() {
            window.store.storeSet('aiConfig.textSelection.enabled', this.aiTextSelection);
            if (this.aiTextSelection) {
                window.appManager.menuManager.startMouseAIHelperMenu();
            } else {
                window.appManager.menuManager.stopMouseAIHelperMenu();
            }
        },
        handleRemoveDisabledApps(removePath) {
            console.log('profileConfig: removeDisabledApps', removePath);
            this.disabledTextSelectionApps = this.disabledTextSelectionApps.filter(appInfo => appInfo.owner.path !== removePath);
            window.store.storeSet('aiConfig.textSelection.disabledApps', this.disabledTextSelectionApps);

            window.appManager.menuManager.startMouseAIHelperMenu();
        }
    },
};
</script>

<style lang="less" scoped>
.dark-el-cascader {
    .el-cascader {
        background-color: #2d2d2d;
    }

    /* text color */

    .el-cascader .el-cascader__label {
        color: white;
    }

    /* selected color */

    .el-cascader .el-cascader__label.is-selected {
        background-color: #409eff;
        color: #fff;
    }

    /* hover color */

    .el-cascader .el-cascader__label:hover {
        background-color: #ecf5ff;
        color: #409eff;
    }
}

/deep/ .el-form-item__label {
    color: #fff;
}

/deep/ .el-input__inner {
    background: #2e3a41;
}

.el-form {
    padding-top: 20px;
}

.brightness {
    display: flex;
    align-items: center;
}

.assistantHotKey {
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

.el-divider__text {
    background-color: #3a4a52;
    color: white;
    font-size: 16px;
}
</style>
