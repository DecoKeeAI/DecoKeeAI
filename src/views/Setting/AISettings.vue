<template>
    <div>
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
            <el-form-item :label="$t('settings.speechEngineType')">
                <el-select
                    v-model="speechEngineType"
                    :placeholder="$t('pleaseSelect')"
                    @change="handleSpeechEngineSelected"
                >
                    <el-option
                        v-for="item in speechEngineTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="speechLanguages.length > 0" :label="$t('settings.speechVoiceName')">
                <div style="width: 100%; display: flex">
                    <el-cascader
                        v-model="speechLanguageSelectedItem"
                        :options="speechLanguages"
                        :props="{ expandTrigger: 'hover' }"
                        @change="handleSpeechLanguageChanged"
                    >
                    </el-cascader>
                </div>
            </el-form-item>

            <template v-if="speechEngineType === 'Azure'">
                <el-form-item :label="$t('settings.speechServiceKey')">
                    <el-input v-model="speechServiceAPIKey" clearable style="width: 191px"></el-input>
                </el-form-item>
                <el-form-item :label="$t('settings.azureServiceRegion')">
                    <el-input v-model="azureServiceRegion" clearable style="width: 191px"></el-input>

                    <el-tooltip placement="top">
                        <el-link style="line-height: 20px" slot="content" href="https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/regions" >{{ $t('settings.azureServiceRegionHint') }}</el-link>
                        <i style="margin-left: 24px" class="el-icon-question"></i>
                    </el-tooltip>
                </el-form-item>
            </template>

            <el-form-item :label="$t('settings.aiEngineType')">
                <el-select v-model="aiModelType" :placeholder="$t('pleaseSelect')" @change="handleAIEngineChanged">
                    <el-option
                        v-for="item in aiModelTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>

                <el-tooltip v-if="aiModelType === 'custom-engine'" placement="top">
                    <div style="white-space: pre-wrap; line-height: 20px" slot="content">
                        {{ $t('settings.customEngineHint') }}
                    </div>
                    <i style="margin-left: 24px" class="el-icon-question"></i>
                </el-tooltip>
            </el-form-item>
            <template v-if="aiModelType.startsWith('spark') || speechEngineType === 'XFY'">
                <el-form-item label="Spark APPID">
                    <el-input v-model="sparkAIConfig.appId" clearable style="width: 191px"></el-input>
                </el-form-item>
                <el-form-item label="Spark API Secret">
                    <el-input v-model="sparkAIConfig.apiSecret" clearable style="width: 191px"></el-input>
                </el-form-item>
                <el-form-item label="Spark API Key">
                    <el-input v-model="sparkAIConfig.apiKey" clearable style="width: 191px"></el-input>
                </el-form-item>
            </template>
            <template
                v-if="
                    aiModelType === 'gpt-4o' ||
                    aiModelType === 'gpt-4-turbo' ||
                    aiModelType === 'gpt-4' ||
                    aiModelType === 'gpt-3.5-turbo' ||
                    aiModelType === 'llama3-70b-8192' ||
                    aiModelType === 'gemma-7b-it' ||
                    aiModelType.startsWith('qwen-') ||
                    aiModelType.startsWith('qwen1.5-') ||
                    aiModelType.startsWith('qwen2-') ||
                    aiModelType.startsWith('glm-') ||
                    aiModelType === 'custom-engine'
                "
            >
                <el-form-item label="API Key">
                    <el-input v-model="openAIAPIKey" clearable style="width: 191px"></el-input>
                </el-form-item>
                <template v-if="aiModelType === 'custom-engine'">
                    <el-form-item label="Base URL">
                        <el-input v-model="customUrlAddr" clearable style="width: 191px"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('settings.modelName')">
                        <el-input v-model="customModelName" clearable style="width: 191px"></el-input>
                    </el-form-item>
                </template>
            </template>
            <el-form-item
                v-if="
                    aiModelType.startsWith('qwen-') ||
                    aiModelType.startsWith('qwen1.5-') ||
                    aiModelType.startsWith('qwen2-') ||
                    aiModelType.startsWith('glm-')
                "
                :label="$t('settings.webSearch')"
            >
                <el-switch v-model="enableWebSearch"/>
            </el-form-item>
        </el-form>

        <el-button size="mini" style="margin-left: 50%" type="primary" @click="updateAIConfig"
        >{{ $t('save') }}
        </el-button>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron';
import {SPEECH_ENGINE_TYPE} from '@/main/ai/AIManager';
import {EventType} from 'uiohook-napi';
import {commonBlur, commonFocus, handleKeyUserInput, transferKeyName} from '@/plugins/hotKeyFun.js';

export default {
    name: 'AISettings',
    components: {},
    data() {
        return {
            sparkAIConfig: {
                appId: '',
                apiSecret: '',
                apiKey: '',
            },
            enableWebSearch: true,
            customUrlAddr: '',
            customModelName: '',
            defaultSelectedMic: '',
            micSelectList: [],
            aiModelType: 'llama3-70b-8192',
            speechEngineType: SPEECH_ENGINE_TYPE.XYF,
            aiModelTypeList: [
                {label: 'Groq llama 70B', value: 'llama3-70b-8192'},
                {label: 'GPT 4o', value: 'gpt-4o'},
                {label: 'GPT 4 Turbo', value: 'gpt-4-turbo'},
                {label: 'GPT 4', value: 'gpt-4'},
                {label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo'},
                {label: 'Spark 3.5 MAX', value: 'spark3.5-max'},
                {label: 'Spark 4 Ultra', value: 'spark4-ultra'},
                {label: '通义千问 turbo', value: 'qwen-turbo'},
                {label: '通义千问 Plus', value: 'qwen-plus'},
                {label: '通义千问 Max', value: 'qwen-max'},
                {label: '通义千问 72b-chat', value: 'qwen-72b-chat'},
                {label: '通义千问1.5 32b-chat', value: 'qwen1.5-32b-chat'},
                {label: '通义千问1.5 72b-chat', value: 'qwen1.5-72b-chat'},
                {label: '通义千问1.5 110b-chat', value: 'qwen1.5-110b-chat'},
                {label: '通义千问2 1.5b-instruct', value: 'qwen2-1.5b-instruct'},
                {label: '通义千问2 7b-instruct', value: 'qwen2-7b-instruct'},
                {label: '通义千问2 72b-instruct', value: 'qwen2-72b-instruct'},
                {label: '智谱 GLM 3 Turbo', value: 'glm-3-turbo'},
                {label: '智谱 GLM 4', value: 'glm-4'},
                {label: '自定义', value: 'custom-engine'},
            ],
            speechEngineTypeList: [
                {label: '科大讯飞', value: SPEECH_ENGINE_TYPE.XYF},
                {label: 'Microsoft Azure', value: SPEECH_ENGINE_TYPE.AZURE},
            ],
            speechLanguages: [],
            speechLanguageSelectedItem: [],
            speechLanguageSelected: '',
            azureSpeechLanguages: [
                {
                    label: '英语',
                    value: 'en-US',
                    children: [
                        {label: 'JennyNeural (女)', value: 'en-US-JennyNeural'},
                        {label: 'GuyNeural (男)', value: 'en-US-GuyNeural'},
                        {label: 'AriaNeural (女)', value: 'en-US-AriaNeural'},
                        {label: 'DavisNeural (男)', value: 'en-US-DavisNeural'},
                    ],
                },
                {
                    label: '中文 (简体)',
                    value: 'zh-CN',
                    children: [
                        {label: 'XiaoxiaoNeural (女)', value: 'zh-CN-XiaoxiaoNeural'},
                        {label: 'YunyangNeural (男)', value: 'zh-CN-YunyangNeural'},
                        {label: 'YunxiNeural (男)', value: 'zh-CN-YunxiNeural'},
                        {label: 'YunjianNeural (男)', value: 'zh-CN-YunjianNeural'},
                        {label: 'HuihuiNeural (男)', value: 'zh-CN-HuihuiNeural'},
                        {label: 'XiaoyiNeural (女)', value: 'zh-CN-XiaoyiNeural'},
                        {label: 'XiaochenNeural (女)', value: 'zh-CN-XiaochenNeural'},
                        {label: 'XiaomengNeural (女)', value: 'zh-CN-XiaomengNeural'},
                        {label: 'XiaomoNeural (女)', value: 'zh-CN-XiaomoNeural'},
                    ],
                },
                {
                    label: '中文 (繁体)',
                    value: 'zh-TW',
                    children: [
                        {label: 'HsiaoChenNeural (女)', value: 'zh-TW-HsiaoChenNeural'},
                        {label: 'YunJheNeural (男)', value: 'zh-TW-YunJheNeural'},
                        {label: 'HsiaoYuNeural (女)', value: 'zh-TW-HsiaoYuNeural'},
                    ],
                },
            ],
            speechVoiceSelected: '',
            openAIAPIKey: '',
            speechServiceAPIKey: '',
            azureServiceRegion: 'eastasia',
            assistantHotKey: '',
            keyStatusMap: {},
            enableGlobalHotKey: false,
        };
    },
    created() {
        this.defaultSelectedMic = window.store.storeGet('aiConfig.defaultMic');
        if (this.defaultSelectedMic === undefined || this.defaultSelectedMic === this.$t('settings.selectMic')) {
            this.defaultSelectedMic = '';
        }

        this.enableWebSearch = window.store.storeGet('aiConfig.webSearch');

        if (this.enableWebSearch === undefined) {
            this.enableWebSearch = true;
        }

        const modelType = window.store.storeGet('aiConfig.modelType');
        if (modelType === undefined) {
            window.store.storeSet('aiConfig.modelType', 'llama3-70b-8192');
        } else {
            this.aiModelType = modelType;
        }

        this.loadRelatedAIConfigs();

        const speechEngineType = window.store.storeGet('aiConfig.speechEngineType');
        if (speechEngineType === undefined) {
            window.store.storeSet('aiConfig.speechEngineType', SPEECH_ENGINE_TYPE.XYF);
        } else {
            this.speechEngineType = speechEngineType;
        }

        switch (speechEngineType) {
            default:
                break;
            case SPEECH_ENGINE_TYPE.AZURE:
                this.speechServiceAPIKey = window.store.storeGet('aiConfig.azure.speechServiceKey');
                this.speechLanguageSelected = window.store.storeGet('aiConfig.azure.speechLanguage');
                this.speechVoiceSelected = window.store.storeGet('aiConfig.azure.speechLanguageVoice');
                this.azureServiceRegion = window.store.storeGet('aiConfig.azure.serviceRegion');
                if (!this.azureServiceRegion) {
                    this.azureServiceRegion = 'eastasia';
                }
                this.speechLanguages = this.azureSpeechLanguages;

                this.speechVoiceNames = this.speechLanguages.find(
                    languageInfo => languageInfo.value === this.speechLanguageSelected
                ).children;

                if (this.speechVoiceSelected === undefined) {
                    this.speechVoiceSelected = this.speechVoiceNames[0].value;

                    window.store.storeSet('aiConfig.azure.speechLanguageVoice', this.speechVoiceSelected);
                }

                this.speechLanguageSelectedItem = [this.speechLanguageSelected, this.speechVoiceSelected];

                break;
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
    },
    activated() {
        console.log('activated');
    },
    deactivated() {
        console.log('deactivated');
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
            if (this.aiModelType !== undefined) {
                window.store.storeSet('aiConfig.modelType', this.aiModelType);
            }

            if (this.enableWebSearch !== undefined) {
                window.store.storeSet('aiConfig.webSearch', this.enableWebSearch);
            }

            if (this.defaultSelectedMic !== this.$t('settings.selectMic')) {
                window.store.storeSet('aiConfig.defaultMic', this.defaultSelectedMic);
            } else {
                window.store.storeSet('aiConfig.defaultMic', '');
            }

            this.saveRelatedAIConfigs();

            if (this.speechEngineType !== undefined) {
                window.store.storeSet('aiConfig.speechEngineType', this.speechEngineType);
            }

            if (this.speechServiceAPIKey !== undefined) {
                switch (this.speechEngineType) {
                    default:
                        break;
                    case SPEECH_ENGINE_TYPE.AZURE:
                        window.store.storeSet('aiConfig.azure.speechServiceKey', this.speechServiceAPIKey);
                        window.store.storeSet('aiConfig.azure.speechLanguage', this.speechLanguageSelected);
                        window.store.storeSet('aiConfig.azure.speechLanguageVoice', this.speechVoiceSelected);
                        window.store.storeSet('aiConfig.azure.serviceRegion', this.azureServiceRegion);
                        break;
                }
            }

            window.store.storeSet('aiConfig.globalAIWakeKey', this.assistantHotKey);

            setTimeout(() => {
                ipcRenderer.send('EngineTypeChange');
            }, 500);
        },
        handleAIEngineChanged() {
            console.log('handleAIEngineChanged: ', this.aiModelType);
            this.loadRelatedAIConfigs();
        },
        saveRelatedAIConfigs() {
            switch (this.aiModelType) {
                default:
                    break;
                case 'spark3.5-max':
                case 'spark4-ultra':
                    window.store.storeSet('aiConfig.xfy.apiAuth', this.sparkAIConfig);
                    break;
                case 'llama3-70b-8192':
                case 'gemma-7b-it':
                    if (this.openAIAPIKey !== undefined && this.openAIAPIKey !== '') {
                        window.store.storeSet('aiConfig.groq.apiKey', this.openAIAPIKey);
                    }

                    break;
                case 'qwen-plus':
                case 'qwen-turbo':
                case 'qwen-max':
                case 'qwen-72b-chat':
                case 'qwen1.5-32b-chat':
                case 'qwen1.5-72b-chat':
                case 'qwen1.5-110b-chat':
                case 'qwen2-1.5b-instruct':
                case 'qwen2-7b-instruct':
                case 'qwen2-72b-instruct':
                    if (this.openAIAPIKey !== undefined && this.openAIAPIKey !== '') {
                        window.store.storeSet('aiConfig.qwen.apiKey', this.openAIAPIKey);
                    }
                    break;
                case 'glm-3-turbo':
                case 'glm-4':
                    if (this.openAIAPIKey !== undefined && this.openAIAPIKey !== '') {
                        window.store.storeSet('aiConfig.zhipu.apiKey', this.openAIAPIKey);
                    }
                    break;
                case 'gpt-4o':
                case 'gpt-4-turbo':
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    if (this.openAIAPIKey !== undefined && this.openAIAPIKey !== '') {
                        window.store.storeSet('aiConfig.openAi.apiKey', this.openAIAPIKey);
                    }
                    break;
                case 'custom-engine':
                    if (this.openAIAPIKey !== undefined && this.openAIAPIKey !== '') {
                        window.store.storeSet('aiConfig.customEngine.apiKey', this.openAIAPIKey);
                    }
                    window.store.storeSet('aiConfig.customEngine.baseUrl', this.customUrlAddr);
                    window.store.storeSet('aiConfig.customEngine.modelName', this.customModelName);
                    break;
            }
        },
        loadRelatedAIConfigs() {
            this.customUrlAddr = '';
            switch (this.aiModelType) {
                default:
                    this.openAIAPIKey = '';
                    break;
                case 'spark3.5-max':
                case 'spark4-ultra':
                    this.sparkAIConfig = window.store.storeGet('aiConfig.xfy.apiAuth');
                    if (!this.sparkAIConfig) {
                        this.sparkAIConfig = {
                            appId: '',
                            apiSecret: '',
                            apiKey: '',
                        };
                    }
                    break;
                case 'llama3-70b-8192':
                case 'gemma-7b-it':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.groq.apiKey');
                    break;
                case 'qwen-plus':
                case 'qwen-turbo':
                case 'qwen-max':
                case 'qwen-72b-chat':
                case 'qwen1.5-32b-chat':
                case 'qwen1.5-72b-chat':
                case 'qwen1.5-110b-chat':
                case 'qwen2-1.5b-instruct':
                case 'qwen2-7b-instruct':
                case 'qwen2-72b-instruct':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.qwen.apiKey');
                    break;
                case 'glm-3-turbo':
                case 'glm-4':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.zhipu.apiKey');
                    break;
                case 'gpt-4o':
                case 'gpt-4-turbo':
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.openAi.apiKey');
                    break;
                case 'custom-engine':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.customEngine.apiKey');
                    this.customUrlAddr = window.store.storeGet('aiConfig.customEngine.baseUrl');
                    this.customModelName = window.store.storeGet('aiConfig.customEngine.modelName');
                    break;
            }
        },
        handleSpeechEngineSelected() {
            this.speechLanguages = [];
            this.speechVoiceNames = undefined;
            this.speechLanguageSelectedItem = [];
            this.speechServiceAPIKey = '';
            this.speechLanguageSelected = '';
            this.speechVoiceSelected = '';
            switch (this.speechEngineType) {
                default:
                    break;
                case SPEECH_ENGINE_TYPE.AZURE:
                    this.speechServiceAPIKey = window.store.storeGet('aiConfig.azure.speechServiceKey');
                    this.speechLanguageSelected = window.store.storeGet('aiConfig.azure.speechLanguage');
                    this.speechVoiceSelected = window.store.storeGet('aiConfig.azure.speechLanguageVoice');
                    this.azureServiceRegion = window.store.storeGet('aiConfig.azure.serviceRegion');
                    if (!this.azureServiceRegion) {
                        this.azureServiceRegion = 'eastasia';
                    }
                    this.speechLanguages = this.azureSpeechLanguages;

                    this.speechVoiceNames = this.speechLanguages.find(
                        languageInfo => languageInfo.value === this.speechLanguageSelected
                    ).children;

                    if (this.speechVoiceSelected === undefined) {
                        this.speechVoiceSelected = this.speechVoiceNames[0].value;

                        window.store.storeSet('aiConfig.azure.speechLanguageVoice', this.speechVoiceSelected);
                    }

                    this.speechLanguageSelectedItem = [this.speechLanguageSelected, this.speechVoiceSelected];
                    break;
            }
        },
        handleSpeechLanguageChanged() {
            console.log('AISettings: selected speech language: ', this.speechLanguageSelectedItem);

            this.speechLanguageSelected = this.speechLanguageSelectedItem[0];
            this.speechVoiceSelected = this.speechLanguageSelectedItem[1];
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
</style>
