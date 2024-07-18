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
                        <el-link
                            slot="content"
                            href="https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/regions"
                            style="line-height: 20px"
                        >
                            {{ $t('settings.azureServiceRegionHint') }}
                        </el-link>
                        <i class="el-icon-question" style="margin-left: 24px"></i>
                    </el-tooltip>
                </el-form-item>
            </template>

            <el-form-item :label="$t('settings.aiEngineType')">
                <div style="width: 100%; display: flex">
                    <el-input
                        ref="editModelLabelBox"
                        v-if="editNameModel !== undefined"
                        id="renameInput"
                        v-model="editNameModel.label"
                        clearable
                        maxlength="30"
                        style="width: 191px"
                        @blur="onEditBlur()"
                    />
                    <div v-else @contextmenu.prevent="onRightClickMenu($event)">
                        <el-cascader
                            v-model="selectedModelType"
                            :options="supportedAIModels"
                            :props="{ expandTrigger: 'hover', children: 'models' }"
                            :show-all-levels="false"
                            @change="handleAIEngineChanged"
                        >
                            <template slot-scope="{ node, data }">
                                <template v-if="!node.isLeaf">
                                    <span>{{ data.label }}</span>
                                    <span> ({{ data.models.filter(item => !item.isAddAction).length }}) </span>
                                </template>
                                <template v-else>
                                    <el-button
                                        v-if="data.isAddAction"
                                        class="btn-folder"
                                        icon="el-icon-plus"
                                        plain
                                        size="mini"
                                        style="font-size: 14px"
                                        type="primary"
                                        @click="handleAddCustomModel(data.label)"
                                        >{{ $t('settings.add') }}
                                    </el-button>
                                    <span v-else>{{ data.label }}</span>
                                </template>
                            </template>
                        </el-cascader>
                    </div>
                    <el-tooltip v-if="aiModelType.startsWith('Custom-')" placement="top" style="margin-top: 8px">
                        <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                            {{ $t('settings.customEngineHint') }}
                        </div>
                        <i class="el-icon-question" style="margin-left: 24px"></i>
                    </el-tooltip>
                </div>

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
                    aiModelType.startsWith('Custom-') ||
                    aiModelType.startsWith('HuoShan-')
                "
            >
                <el-form-item label="API Key">
                    <el-input v-model="openAIAPIKey" clearable style="width: 191px"></el-input>
                </el-form-item>
                <template v-if="aiModelType.startsWith('Custom-')">
                    <el-form-item label="Base URL">
                        <el-input v-model="customUrlAddr" clearable style="width: 191px"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('settings.modelName')">
                        <el-input v-model="customModelName" clearable style="width: 191px"></el-input>
                    </el-form-item>
                </template>
                <template v-else-if="aiModelType.startsWith('HuoShan-')">
                    <el-form-item :label="$t('settings.entryMethod')">
                        <el-radio-group v-model="customModelConfigData.huoshanType">
                            <el-radio label="inference">{{ $t('settings.houshanInference') }} </el-radio>
                            <el-radio label="chatBot">{{ $t('settings.huoshanAgent') }} </el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('settings.useDekiePrompt')">
                        <el-switch v-model="useDekiePrompt" />

                        <el-tooltip placement="top" style="margin-top: 8px">
                            <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                                {{ $t('settings.useDekiePromptHint') }}
                            </div>
                            <i class="el-icon-question" style="margin-left: 24px"></i>
                        </el-tooltip>
                    </el-form-item>
                    <el-form-item label="Endpoint/Bot ID">
                        <el-input v-model="customModelName" clearable style="width: 191px"></el-input>

                        <el-tooltip placement="top" style="margin-top: 8px">
                            <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                                <el-link href="https://www.volcengine.com/docs/82379/1267885">{{ $t('settings.huoShanModelHint') }}</el-link>
                            </div>
                            <i class="el-icon-question" style="margin-left: 24px"></i>
                        </el-tooltip>
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
                <el-switch v-model="enableWebSearch" />
            </el-form-item>
        </el-form>

        <el-button size="mini" style="margin-left: 50%" type="primary" @click="updateAIConfig"
            >{{ $t('save') }}
        </el-button>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { SPEECH_ENGINE_TYPE } from '@/main/ai/AIManager';
import { EventType } from 'uiohook-napi';
import { commonBlur, commonFocus, handleKeyUserInput, transferKeyName } from '@/plugins/hotKeyFun.js';
import { deepCopy } from '@/utils/ObjectUtil';

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
            selectedModelType: ['Groq', 'llama3-70b-8192'],
            speechEngineType: SPEECH_ENGINE_TYPE.XYF,
            speechEngineTypeList: [
                { label: '科大讯飞', value: SPEECH_ENGINE_TYPE.XYF },
                { label: 'Microsoft Azure', value: SPEECH_ENGINE_TYPE.AZURE },
            ],
            speechLanguages: [],
            speechLanguageSelectedItem: [],
            speechLanguageSelected: '',
            azureSpeechLanguages: [
                {
                    label: '英语',
                    value: 'en-US',
                    children: [
                        { label: 'JennyNeural (女)', value: 'en-US-JennyNeural' },
                        { label: 'GuyNeural (男)', value: 'en-US-GuyNeural' },
                        { label: 'AriaNeural (女)', value: 'en-US-AriaNeural' },
                        { label: 'DavisNeural (男)', value: 'en-US-DavisNeural' },
                    ],
                },
                {
                    label: '中文 (简体)',
                    value: 'zh-CN',
                    children: [
                        { label: 'XiaoxiaoNeural (女)', value: 'zh-CN-XiaoxiaoNeural' },
                        { label: 'YunyangNeural (男)', value: 'zh-CN-YunyangNeural' },
                        { label: 'YunxiNeural (男)', value: 'zh-CN-YunxiNeural' },
                        { label: 'YunjianNeural (男)', value: 'zh-CN-YunjianNeural' },
                        { label: 'HuihuiNeural (男)', value: 'zh-CN-HuihuiNeural' },
                        { label: 'XiaoyiNeural (女)', value: 'zh-CN-XiaoyiNeural' },
                        { label: 'XiaochenNeural (女)', value: 'zh-CN-XiaochenNeural' },
                        { label: 'XiaomengNeural (女)', value: 'zh-CN-XiaomengNeural' },
                        { label: 'XiaomoNeural (女)', value: 'zh-CN-XiaomoNeural' },
                    ],
                },
                {
                    label: '中文 (繁体)',
                    value: 'zh-TW',
                    children: [
                        { label: 'HsiaoChenNeural (女)', value: 'zh-TW-HsiaoChenNeural' },
                        { label: 'YunJheNeural (男)', value: 'zh-TW-YunJheNeural' },
                        { label: 'HsiaoYuNeural (女)', value: 'zh-TW-HsiaoYuNeural' },
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
            supportedAIModels: [],
            editNameModel: undefined,
            rightClickMenu: [
                {
                    label: this.$t('settings.rename'),
                    onClick: e => {
                        this.renameClicked(e);
                    },
                },
                {
                    label: this.$t('settings.copy'),
                    onClick: () => {
                        this.copyClicked();
                    },
                },
                {
                    label: this.$t('settings.delete'),
                    onClick: () => {
                        this.deleteClicked();
                    },
                },
            ],
            customModelConfigData: {},
            useDekiePrompt: true
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

        this.supportedAIModels = window.aiManager.getAllSupportedModels();

        this.supportedAIModels = this.supportedAIModels.map(modelGroup => {
            const newObj = deepCopy(modelGroup);
            if (newObj.label === 'Custom' || newObj.label === 'HuoShan') {
                newObj.models.push({
                    label: newObj.label,
                    isAddAction: true,
                });
            }

            return newObj;
        });

        console.log('AISettings: Created load modelType: ', modelType);

        this.supportedAIModels.forEach(modelGroup => {
            const modelInfo = modelGroup.models.find((aiModel) => aiModel.value === modelType);

            if (!modelInfo) return;

            this.selectedModelType = [modelGroup.value, modelType];

            console.log('AISettings: Created Find Selected ModelInfo: ', this.selectedModelType);
        });

        console.log('AISettings: All supported AIModels: ' + JSON.stringify(this.supportedAIModels));
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
            console.log('handleAIEngineChanged: ', this.selectedModelType);
            if (this.selectedModelType.length < 2 || !this.selectedModelType[1]) return;
            this.aiModelType = this.selectedModelType[1];
            this.loadRelatedAIConfigs();
        },
        saveRelatedAIConfigs() {
            switch (this.aiModelType) {
                default: {
                    const aiConfigKeyPrefix = 'aiConfig.' + this.aiModelType;
                    console.log('AISettings: saveRelatedAIConfigs: aiConfigKeyPrefix: ', aiConfigKeyPrefix);
                    if (!this.openAIAPIKey) {
                        this.openAIAPIKey = '';
                    }
                    window.store.storeSet(aiConfigKeyPrefix +'.apiKey', this.openAIAPIKey);
                    if (!this.customUrlAddr) {
                        this.customUrlAddr = '';
                    }

                    if (this.aiModelType.startsWith('HuoShan-')) {
                        if (this.customModelConfigData.huoshanType === 'chatBot') {
                            this.customUrlAddr = 'https://ark.cn-beijing.volces.com/api/v3/bots/';
                        } else {
                            this.customUrlAddr = 'https://ark.cn-beijing.volces.com/api/v3/';
                        }
                        if (this.useDekiePrompt === undefined) {
                            this.useDekiePrompt = true;
                        }
                        window.store.storeSet(aiConfigKeyPrefix + '.useDekiePrompt', this.useDekiePrompt);

                    }

                    window.store.storeSet(aiConfigKeyPrefix + '.baseUrl', this.customUrlAddr);
                    if (!this.customModelName) {
                        this.customModelName = '';
                    }
                    window.store.storeSet(aiConfigKeyPrefix + '.modelName', this.customModelName);
                    break;
                    }
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
                case 'glm-4-0520':
                case 'glm-4-air':
                case 'glm-4-airx':
                case 'glm-4-flash':
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
            }
            this.$message.success(this.$t('save') + ' ' + this.$t('success'));
        },
        loadRelatedAIConfigs() {
            this.customModelConfigData = {}
            this.customUrlAddr = '';
            switch (this.aiModelType) {
                default: {

                    const aiConfigKeyPrefix = 'aiConfig.' + this.aiModelType;
                    this.customUrlAddr = window.store.storeGet(aiConfigKeyPrefix + '.baseUrl');

                    if (this.aiModelType.startsWith('HuoShan-')) {
                        if (this.customUrlAddr && this.customUrlAddr.endsWith('/bots/')) {
                            this.customModelConfigData.huoshanType = 'chatBot';
                        } else  {
                            this.customModelConfigData.huoshanType = 'inference';
                        }
                        this.useDekiePrompt = window.store.storeGet(aiConfigKeyPrefix + '.useDekiePrompt');
                        if (this.useDekiePrompt === undefined) {
                            this.useDekiePrompt = true;
                        }
                    }
                    this.openAIAPIKey = window.store.storeGet(aiConfigKeyPrefix + '.apiKey');
                    this.customModelName = window.store.storeGet(aiConfigKeyPrefix + '.modelName');
                    break;
                }
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
                case 'glm-4-0520':
                case 'glm-4-air':
                case 'glm-4-airx':
                case 'glm-4-flash':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.zhipu.apiKey');
                    break;
                case 'gpt-4o':
                case 'gpt-4-turbo':
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    this.openAIAPIKey = window.store.storeGet('aiConfig.openAi.apiKey');
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
        handleAddCustomModel(modelLabel) {
            console.log('AISettings: handleAddCustomModel: ', modelLabel);
            this.supportedAIModels = this.supportedAIModels.map(modelGroup => {
                const newGroupObj = deepCopy(modelGroup);
                if (newGroupObj.label === modelLabel) {
                    const addBtnObj = newGroupObj.models.pop();

                    let maxId = 0;
                    newGroupObj.models.forEach((aiModel) => {
                        if (aiModel.isAddAction) return;

                        if (!aiModel.value.includes('-')) return;

                        const modelId = Number(aiModel.value.split('-')[1]);

                        if (modelId > maxId) {
                            maxId = modelId;
                        }
                    });

                    const newModelType = newGroupObj.value + '-' + (maxId + 1);

                    newGroupObj.models.push({
                        label: newModelType,
                        value: newModelType,
                        canModify: true,
                        supportedFunctions: 'chat',
                    });

                    this.selectedModelType[1] = newModelType;

                    newGroupObj.models.push(addBtnObj);
                }

                return newGroupObj;
            });

            console.log('AISettings: handleAddCustomModel: After Update: ' + JSON.stringify(this.supportedAIModels));

            window.aiManager.updateSupportedModels(this.supportedAIModels);
            this.$message.success(this.$t('settings.add') + ' ' + this.$t('success'));
        },
        handleUpdateModelName(modelValue, modelName) {
            console.log('AISettings: handleUpdateModelName: modelValue: ', modelValue, ' ModelName: ', modelName);
            console.log('AISettings: handleUpdateModelName: supportedAIModels: ', this.supportedAIModels);

            // window.aiManager.updateSupportedModels(this.supportedAIModels);
        },
        renameClicked() {

            this.supportedAIModels.forEach(modelGroup => {
                if (this.editNameModel !== undefined) return;

                if (modelGroup.value !== this.selectedModelType[0]) {
                    return;
                }

                const modifyItem = modelGroup.models.find(aiModel => aiModel.value === this.selectedModelType[1]);

                if (modifyItem === undefined) return;

                this.editNameModel = deepCopy(modifyItem);
            });

            console.log('AISettings: renameClicked: ', this.editNameModel);

            this.$nextTick(() => {
                this.$refs.editModelLabelBox.focus();
            });

        },
        copyClicked() {

            const copyModelType = this.selectedModelType[1];

            console.log('AISettings: copyClicked: ', copyModelType);

            let newModelType = '';

            this.supportedAIModels = this.supportedAIModels.map(modelGroup => {
                if (modelGroup.value !== this.selectedModelType[0]) return modelGroup;

                const newGroupObj = deepCopy(modelGroup);

                let maxId = 0;
                newGroupObj.models.forEach((aiModel) => {
                    if (aiModel.isAddAction) return;

                    const modelId = Number(aiModel.value.split('-')[1]);

                    if (modelId > maxId) {
                        maxId = modelId;
                    }
                });

                const addBtnObj = newGroupObj.models.pop();

                newModelType = modelGroup.value + '-' + (maxId + 1);

                newGroupObj.models.push({
                    label: newModelType,
                    value: newModelType,
                    canModify: true,
                    supportedFunctions: 'chat',
                });

                newGroupObj.models.push(addBtnObj);

                return newGroupObj;
            });


            const copyAIConfigKeyPrefix = 'aiConfig.' + copyModelType;
            const newAIConfigKeyPrefix = 'aiConfig.' + newModelType;
            console.log('AISettings: saveRelatedAIConfigs: copyAIConfigKeyPrefix: ', copyAIConfigKeyPrefix);

            this.openAIAPIKey = window.store.storeGet(copyAIConfigKeyPrefix + '.apiKey');
            this.customUrlAddr = window.store.storeGet(copyAIConfigKeyPrefix + '.baseUrl');
            this.customModelName = window.store.storeGet(copyAIConfigKeyPrefix + '.modelName');

            if (!this.openAIAPIKey) {
                this.openAIAPIKey = '';
            }
            window.store.storeSet(newAIConfigKeyPrefix +'.apiKey', this.openAIAPIKey);
            if (!this.customUrlAddr) {
                this.customUrlAddr = '';
            }
            window.store.storeSet(newAIConfigKeyPrefix + '.baseUrl', this.customUrlAddr);
            if (!this.customModelName) {
                this.customModelName = '';
            }
            window.store.storeSet(newAIConfigKeyPrefix + '.modelName', this.customModelName);

            this.selectedModelType[1] = newModelType;
            window.aiManager.updateSupportedModels(this.supportedAIModels);
            this.$message.success(this.$t('settings.copy') + ' ' + this.$t('success'));
        },
        deleteClicked() {
            const deleteModelType = this.selectedModelType[1];

            console.log('AISettings: deleteClicked: deleteModelType: ', deleteModelType);

            const that = this;

            let modelName = '';
            this.supportedAIModels.forEach(modelGroup => {
                if (modelGroup.value !== this.selectedModelType[0]) return;

                const modelInfo = modelGroup.models.find((aiModel) => aiModel.value === deleteModelType);

                if (!modelInfo) return;

                modelName = modelInfo.label;
            });

            this.$confirm(that.$t('settings.deleteAIModelConfirm').replace('{{modelName}}', modelName), '', {
                confirmButtonText: that.$t('confirm'),
                cancelButtonText: that.$t('cancel'),
                type: 'warning',
            }).then(() => {
                let nextModelType = undefined;
                this.supportedAIModels = that.supportedAIModels.map(modelGroup => {
                    if (modelGroup.value !== that.selectedModelType[0]) return modelGroup;

                    const newGroupObj = deepCopy(modelGroup);

                    newGroupObj.models = newGroupObj.models.filter((aiModel) => aiModel.value !== deleteModelType);

                    if (newGroupObj.models.length > 1) {
                        nextModelType = newGroupObj.models[0].value;
                    }

                    return newGroupObj;
                });

                if (nextModelType !== undefined) {
                    that.selectedModelType[1] = nextModelType;
                } else {
                    that.selectedModelType = ['Groq', 'llama3-70b-8192'];
                }
                const deleteAIConfigKeyPrefix = 'aiConfig.' + deleteModelType;

                window.store.storeDelete(deleteAIConfigKeyPrefix);

                window.aiManager.updateSupportedModels(that.supportedAIModels);

                that.$message.success(that.$t('settings.delete') + ' ' + that.$t('success'));
            }).catch(err => {
                console.log('AISettings: deleteClicked: err: ', err);
                that.$message.error(that.$t('settings.delete') + ' ' + that.$t('failed'));
            });
        },
        onRightClickMenu(event) {
            let canModify = false;
            this.supportedAIModels.forEach(modelGroup => {
                if (canModify) return;

                if (modelGroup.value !== this.selectedModelType[0]) {
                    return;
                }

                const modifyItem = modelGroup.models.find(aiModel => aiModel.value === this.selectedModelType[1] && aiModel.canModify);

                if (modifyItem === undefined) return;

                canModify = true;
            });
            this.$contextmenu({
                items: canModify ? this.rightClickMenu : [this.rightClickMenu[0]],
                event, // 鼠标事件信息
                customClass: 'right-click-menu', // 自定义菜单 class
                zIndex: 5000, // 菜单样式 z-index
                minWidth: 140, // 主菜单最小宽度
            });
            return false;
        },
        onEditBlur() {
            console.log('AISettings: onEditBlur: newLabel', this.editNameModel);

            if (this.editNameModel.label === '') {
                this.editNameModel = undefined;
                return;
            }

            this.supportedAIModels = this.supportedAIModels.map(modelGroup => {
                if (modelGroup.value !== this.selectedModelType[0]) return modelGroup;

                const newGroupInfo = deepCopy(modelGroup);

                newGroupInfo.models = newGroupInfo.models.map(aiModel => {
                   if (aiModel.value !== this.editNameModel.value) {
                       return aiModel;
                   }
                    const newAIModel = deepCopy(aiModel);

                    newAIModel.label = this.editNameModel.label;

                    return newAIModel;
                });

                return newGroupInfo;
            });
            console.log('AISettings: onEditBlur: After Rename: ' + JSON.stringify(this.supportedAIModels));

            window.aiManager.updateSupportedModels(this.supportedAIModels);

            this.editNameModel = undefined;
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
</style>
