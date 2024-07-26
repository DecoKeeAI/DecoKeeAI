/*
* Copyright 2024 DecoKee
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Additional Terms for DecoKee:
*
* 1. Communication Protocol Usage
*    DecoKee is provided subject to a commercial license and subscription
*    as described in the Terms of Use (http://www.decokee.com/about/terms.html).
*
*    The components of this project related to the communication protocol
*    (including but not limited to protocol specifications, implementation code, etc.)
*    are restricted from commercial use, as such use would violate the project's usage policies.
*    There are no restrictions for non-commercial uses.
*
*    (a) Evaluation Use
*        An evaluation license is offered that provides a limited,
*        evaluation license for internal and non-commercial use.
*
*        With a paid-up subscription you can incorporate new releases,
*        updates and patches for the software into your products.
*        If you do not have an active subscription, you cannot apply patches
*        from the software to your products.
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

<template>
    <div>
        <el-form label-width="200px" size="mini" style="height: 100%">
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
                v-if="customModelConfigData.supportOpenAICustomConfig"
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
                <template v-else-if="aiModelType.startsWith('Coze-')">
                    <el-form-item :label="$t('settings.useDekiePrompt')">
                        <el-switch v-model="useDekiePrompt" />

                        <el-tooltip placement="top" style="margin-top: 8px">
                            <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                                {{ $t('settings.useDekiePromptHint') }}
                            </div>
                            <i class="el-icon-question" style="margin-left: 24px"></i>
                        </el-tooltip>
                    </el-form-item>
                    <el-form-item label="Bot ID">
                        <el-input v-model="customModelName" clearable style="width: 191px"></el-input>

                        <el-tooltip placement="top" style="margin-top: 8px">
                            <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                                <el-link href="https://www.coze.cn/docs/developer_guides/preparation">{{ $t('settings.cozeModelHint') }}</el-link>
                            </div>
                            <i class="el-icon-question" style="margin-left: 24px"></i>
                        </el-tooltip>
                    </el-form-item>
                </template>
            </template>
            <template v-if="finalConfigData !== undefined && customModelConfigData.supportCustomPrompt">
                <el-form-item :label="$t('settings.useDekiePrompt')">
                    <el-switch v-model="useDekiePrompt" />

                    <el-tooltip placement="top" style="margin-top: 8px">
                        <div slot="content" style="white-space: pre-wrap; line-height: 20px">
                            {{ $t('settings.useDekiePromptHintCustom') }}
                        </div>
                        <i class="el-icon-question" style="margin-left: 24px"></i>
                    </el-tooltip>
                </el-form-item>
                <el-form-item :label="$t('settings.customAIPromptRole')" class="selectRole">
                    <el-switch v-model="useCustomPrompt" @change="handleUseCustomPromptChanged" />
                </el-form-item>
                <el-form-item :label="$t('settings.aiPromptRole')" class="selectRole">
                    <el-input v-if="useCustomPrompt" v-model="selectedSystemPrompt" type="textarea" resize="none" rows="5" maxlength="3000" show-word-limit />
                    <el-select v-else :disabled="useCustomPrompt" filterable v-model="selectedSystemRoleIdx" @change="aiSystemRoleChanged">
                        <el-option v-for="(item, index) in supportedSystemRoles" :key="index" :label="item.act" :value="index" />
                    </el-select>
                </el-form-item>

                <el-form-item :label="$t('settings.rolePersonality')">
                    <el-slider  style="width: 191px" v-model="roleTopP" :min="0" :max="1" :step="0.05" :marks="{ 0: $t('settings.personalityPrecise'), 1: $t('settings.personalityFlexible') }"></el-slider>
                </el-form-item>
                <el-form-item :label="$t('settings.responseQuality')">
                    <el-slider  style="width: 191px" v-model="roleTemperature" :min="0" :max="2" :step="0.05" :marks="{ 0: $t('settings.qualityConservative'), 2: $t('settings.qualityGibberish') }"></el-slider>
                </el-form-item>
                <el-form-item :label="$t('settings.chatPendingTimeout')">
                    <el-slider  style="width: 191px" v-model="chatPendingTimeout" :min="5" :max="30" :step="5"></el-slider>
                </el-form-item>
            </template>
            <el-form-item
                v-if="customModelConfigData.supportWebSearch"
                :label="$t('settings.webSearch')"
            >
                <el-switch v-model="enableWebSearch" />
            </el-form-item>
        </el-form>
        <el-button v-if="finalConfigData !== undefined" size="mini" style="margin-left: 68%; margin-bottom: 12px" type="primary" @click="updateAIConfig">
            {{ $t('save') }}
        </el-button>
    </div>
</template>

<script>
import { SPEECH_ENGINE_TYPE } from '@/main/ai/AIManager';
import { deepCopy } from '@/utils/ObjectUtil';

export default {
    name: 'AIConfigSettings',
    components: {},
    props: {
        aiModelConfigData: {
            type: String,
            required: false,
            default: undefined
        }
    },
    data() {
        return {
            sparkAIConfig: undefined,
            enableWebSearch: undefined,
            customUrlAddr: undefined,
            customModelName: undefined,
            aiModelType: undefined,
            selectedModelType: undefined,
            speechEngineType: undefined,
            speechEngineTypeList: [
                { label: '科大讯飞', value: SPEECH_ENGINE_TYPE.XYF },
                { label: 'Microsoft Azure', value: SPEECH_ENGINE_TYPE.AZURE },
            ],
            speechLanguages: [],
            speechLanguageSelectedItem: [],
            speechLanguageSelected: undefined,
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
            speechVoiceSelected: undefined,
            openAIAPIKey: undefined,
            speechServiceAPIKey: undefined,
            azureServiceRegion: undefined,
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
            useDekiePrompt: undefined,
            finalConfigData: undefined,

            //  系统角色
            supportedSystemRoles: [],
            selectedSystemRoleIdx: 0,
            selectedSystemPrompt: '',
            useCustomPrompt: false,
            roleTopP: 0.7,
            roleTemperature: 1.0,
            chatPendingTimeout: 5
        };
    },
    created() {

        console.log('AIConfigSettings: Created aiModelConfigData is null: ', (this.aiModelConfigData === undefined));

        if (this.aiModelConfigData !== undefined) {
            try {
                this.finalConfigData = JSON.parse(this.aiModelConfigData);
            } catch (err) {
                console.log('AIConfigSettings: Created Invalid aiModelConfigData: ', this.aiModelConfigData, err);
                this.finalConfigData = {}
            }
        }

        console.log('AIConfigSettings: Created finalConfigData is null: ', this.finalConfigData);

        if (this.finalConfigData !== undefined) {
            this.enableWebSearch = this.finalConfigData.enableWebSearch;
            this.aiModelType = this.finalConfigData.aiModelType;
            this.speechEngineType = this.finalConfigData.speechEngineType;
            this.speechServiceAPIKey = this.finalConfigData.speechServiceAPIKey;
            this.speechLanguageSelected = this.finalConfigData.speechLanguageSelected;
            this.speechVoiceSelected = this.finalConfigData.speechVoiceSelected;
            this.azureServiceRegion = this.finalConfigData.azureServiceRegion;
        }

        if (this.enableWebSearch === undefined) {
            this.enableWebSearch = window.store.storeGet('aiConfig.webSearch', true);
        }

        if (this.aiModelType === undefined) {
            this.aiModelType = window.store.storeGet('aiConfig.modelType', 'llama-3.1-70b-versatile');
            window.store.storeSet('aiConfig.modelType', this.aiModelType);
        }

        if (this.finalConfigData !== undefined) {
            this.supportedSystemRoles = window.generalAIManager.getSupportedSystemPrompts();
            console.log('AIConfigSettings: this.supportedSystemRoles: ', this.supportedSystemRoles)
        }

        this.loadRelatedAIConfigs(true);

        if (this.speechEngineType === undefined) {
            this.speechEngineType = window.store.storeGet('aiConfig.speechEngineType', SPEECH_ENGINE_TYPE.XYF);
            window.store.storeSet('aiConfig.speechEngineType', this.speechEngineType);
        }

        switch (this.speechEngineType) {
            default:
            case SPEECH_ENGINE_TYPE.XYF:
                if (this.finalConfigData !== undefined) {
                    this.sparkAIConfig = this.finalConfigData.sparkAIConfig;
                }

                if (this.sparkAIConfig === undefined) {
                    this.sparkAIConfig = window.store.storeGet('aiConfig.xfy.apiAuth', {
                        appId: '',
                        apiSecret: '',
                        apiKey: '',
                    });
                }
                break;
            case SPEECH_ENGINE_TYPE.AZURE:
                if (this.finalConfigData !== undefined) {
                    this.speechServiceAPIKey = this.finalConfigData.speechServiceAPIKey;
                    this.speechLanguageSelected = this.finalConfigData.speechLanguageSelected;
                    this.speechVoiceSelected = this.finalConfigData.speechVoiceSelected;
                    this.azureServiceRegion = this.finalConfigData.azureServiceRegion;
                }
                if (this.speechServiceAPIKey === undefined) {
                    this.speechServiceAPIKey = window.store.storeGet('aiConfig.azure.speechServiceKey');
                }
                if (this.speechLanguageSelected === undefined) {
                    this.speechLanguageSelected = window.store.storeGet('aiConfig.azure.speechLanguage');
                }
                if (this.speechVoiceSelected === undefined) {
                    this.speechVoiceSelected = window.store.storeGet('aiConfig.azure.speechLanguageVoice');
                }
                if (this.azureServiceRegion === undefined) {
                    this.azureServiceRegion = window.store.storeGet('aiConfig.azure.serviceRegion', 'eastasia');
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

        this.supportedAIModels = window.generalAIManager.getAllSupportedModels();

        this.supportedAIModels = this.supportedAIModels.map(modelGroup => {
            const newGroupObj = deepCopy(modelGroup);
            if (newGroupObj.label === 'Custom' || newGroupObj.label === 'HuoShan' || newGroupObj.label === 'Coze') {
                newGroupObj.models.push({
                    label: newGroupObj.label,
                    isAddAction: true,
                });
            }

            return newGroupObj;
        });


        this.supportedAIModels.forEach(modelGroup => {
            const modelInfo = modelGroup.models.find((aiModel) => aiModel.value === this.aiModelType);

            if (!modelInfo) return;

            this.selectedModelType = [modelGroup.value, this.aiModelType];

            console.log('AIConfigSettings: Created Find Selected ModelInfo: ', this.selectedModelType);
        });

        console.log('AIConfigSettings: All supported AIModels: ' + JSON.stringify(this.supportedAIModels));
    },
    methods: {
        updateAIConfig() {
            if (this.finalConfigData !== undefined) {

                if (this.aiModelType !== undefined) {
                    this.finalConfigData.aiModelType = this.aiModelType;
                }

                if (this.enableWebSearch !== undefined) {
                    this.finalConfigData.enableWebSearch = this.enableWebSearch;
                }

                if (this.speechEngineType !== undefined) {
                    this.finalConfigData.speechEngineType = this.speechEngineType;
                }

                if (this.speechServiceAPIKey !== undefined && this.speechEngineType === SPEECH_ENGINE_TYPE.AZURE) {
                    this.finalConfigData.speechServiceAPIKey = this.speechServiceAPIKey;
                    this.finalConfigData.speechLanguageSelected = this.speechLanguageSelected;
                    this.finalConfigData.speechVoiceSelected = this.speechVoiceSelected;
                    this.finalConfigData.azureServiceRegion = this.azureServiceRegion;
                } else if (this.speechEngineType === SPEECH_ENGINE_TYPE.XYF) {
                    this.finalConfigData.sparkAIConfig = this.sparkAIConfig;
                }
                this.saveRelatedAIConfigs();

                this.$emit('aiConfigUpdated', this.finalConfigData);
                return;
            }

            if (this.aiModelType !== undefined) {
                window.store.storeSet('aiConfig.modelType', this.aiModelType);
            }

            if (this.enableWebSearch !== undefined) {
                window.store.storeSet('aiConfig.webSearch', this.enableWebSearch);
            }

            this.saveRelatedAIConfigs();

            if (this.speechEngineType !== undefined) {
                window.store.storeSet('aiConfig.speechEngineType', this.speechEngineType);
            }

            if (this.speechServiceAPIKey !== undefined && this.speechEngineType === SPEECH_ENGINE_TYPE.AZURE) {
                window.store.storeSet('aiConfig.azure.speechServiceKey', this.speechServiceAPIKey);
                window.store.storeSet('aiConfig.azure.speechLanguage', this.speechLanguageSelected);
                window.store.storeSet('aiConfig.azure.speechLanguageVoice', this.speechVoiceSelected);
                window.store.storeSet('aiConfig.azure.serviceRegion', this.azureServiceRegion);
            } else if (this.speechEngineType === SPEECH_ENGINE_TYPE.XYF) {
                window.store.storeSet('aiConfig.xfy.apiAuth', this.sparkAIConfig);
            }
        },
        handleAIEngineChanged() {
            console.log('handleAIEngineChanged: ', this.selectedModelType);
            if (this.selectedModelType.length < 2 || !this.selectedModelType[1]) return;
            this.aiModelType = this.selectedModelType[1];
            this.loadRelatedAIConfigs(false);
        },
        saveRelatedAIConfigs() {
            if (!this.openAIAPIKey) {
                this.openAIAPIKey = '';
            }
            switch (this.aiModelType) {
                default: {
                    const aiConfigKeyPrefix = 'aiConfig.' + this.aiModelType;
                    console.log('AIConfigSettings: saveRelatedAIConfigs: aiConfigKeyPrefix: ', aiConfigKeyPrefix);

                    if (this.finalConfigData !== undefined) {
                        this.finalConfigData.apiKey = this.openAIAPIKey;
                    } else {
                        window.store.storeSet(aiConfigKeyPrefix + '.apiKey', this.openAIAPIKey);
                    }
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

                        if (this.finalConfigData !== undefined) {
                            this.finalConfigData.useDekiePrompt = this.useDekiePrompt;
                        } else {
                            window.store.storeSet(aiConfigKeyPrefix + '.useDekiePrompt', this.useDekiePrompt);
                        }
                    } else if (this.aiModelType.startsWith('Coze-')) {
                        if (this.useDekiePrompt === undefined) {
                            this.useDekiePrompt = true;
                        }

                        if (this.finalConfigData !== undefined) {
                            this.finalConfigData.useDekiePrompt = this.useDekiePrompt;
                        } else {
                            window.store.storeSet(aiConfigKeyPrefix + '.useDekiePrompt', this.useDekiePrompt);
                        }
                    } else if (this.aiModelType.startsWith('Custom-')) {
                        this.updateKeyItemData();
                    }

                    if (this.finalConfigData !== undefined) {
                        this.finalConfigData.customUrlAddr = this.customUrlAddr;
                    } else {
                        window.store.storeSet(aiConfigKeyPrefix + '.baseUrl', this.customUrlAddr);
                    }

                    if (!this.customModelName) {
                        this.customModelName = '';
                    }

                    if (this.finalConfigData !== undefined) {
                        this.finalConfigData.customModelName = this.customModelName;
                    } else {
                        window.store.storeSet(aiConfigKeyPrefix + '.modelName', this.customModelName);
                    }
                    break;
                }
                case 'spark3.5-max':
                case 'spark4-ultra':
                    if (this.finalConfigData !== undefined) {
                        this.updateKeyItemData();
                    } else {
                        window.store.storeSet('aiConfig.xfy.apiAuth', this.sparkAIConfig);
                    }
                    break;
                case 'llama3-70b-8192':
                case 'llama3-8b-8192':
                case 'llama3-groq-70b-8192-tool-use-preview':
                case 'llama3-groq-8b-8192-tool-use-preview':
                case 'llama-3.1-8b-instant':
                case 'llama-3.1-70b-versatile':
                case 'llama-3.1-405b-reasoning':
                case 'gemma-7b-it':
                case 'gemma2-9b-it':
                case 'mixtral-8x7b-32768':
                    if (this.finalConfigData !== undefined) {
                        this.updateKeyItemData();
                    } else {
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
                    if (this.finalConfigData !== undefined) {
                        this.updateKeyItemData();
                    } else {
                        window.store.storeSet('aiConfig.qwen.apiKey', this.openAIAPIKey);
                    }
                    break;
                case 'glm-3-turbo':
                case 'glm-4':
                case 'glm-4-0520':
                case 'glm-4-air':
                case 'glm-4-airx':
                case 'glm-4-flash':
                    if (this.finalConfigData !== undefined) {
                        this.updateKeyItemData();
                    } else {
                        window.store.storeSet('aiConfig.zhipu.apiKey', this.openAIAPIKey);
                    }
                    break;
                case 'gpt-4o':
                case 'gpt-4o-mini':
                case 'gpt-4-turbo':
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    if (this.finalConfigData !== undefined) {
                        this.updateKeyItemData();
                    } else {
                        window.store.storeSet('aiConfig.openAi.apiKey', this.openAIAPIKey);
                    }
                    break;
            }

            if (this.finalConfigData === undefined) {
                this.$message.success(this.$t('save') + ' ' + this.$t('success'));
            }
        },
        updateKeyItemData() {
            if (this.useDekiePrompt === undefined) {
                this.useDekiePrompt = true;
            }
            this.finalConfigData.apiKey = this.openAIAPIKey;
            this.finalConfigData.useDekiePrompt = this.useDekiePrompt;
            this.finalConfigData.useCustomPrompt = this.useCustomPrompt;
            this.finalConfigData.systemPrompt = this.selectedSystemPrompt;
            this.finalConfigData.systemRoleIdx = this.selectedSystemRoleIdx;
            this.finalConfigData.roleTopP = this.roleTopP;
            this.finalConfigData.roleTemperature = this.roleTemperature;
            this.finalConfigData.chatPendingTimeout = this.chatPendingTimeout;
        },
        loadRelatedAIConfigs(useCache) {
            this.customModelConfigData = {}

            this.customModelConfigData.supportOpenAICustomConfig = true;
            this.customModelConfigData.supportWebSearch = false;
            this.customModelConfigData.supportCustomPrompt = true;

            this.openAIAPIKey = undefined;
            this.customUrlAddr = undefined;
            this.customModelName = undefined;
            this.useDekiePrompt = undefined;

            if (this.finalConfigData !== undefined && this.aiModelType === this.finalConfigData.aiModelType) {
                useCache = true;
            }

            console.log('loadRelatedAIConfigs: useCache: ', useCache, ' this.aiModelType: ', this.aiModelType, ' this.finalConfigData: ', this.finalConfigData)

            if (useCache && this.finalConfigData !== undefined) {
                this.openAIAPIKey = this.finalConfigData.apiKey;
                this.useDekiePrompt = this.finalConfigData.useDekiePrompt;
                this.useCustomPrompt = this.finalConfigData.useCustomPrompt;
                this.selectedSystemPrompt = this.finalConfigData.systemPrompt;
                this.selectedSystemRoleIdx = this.finalConfigData.systemRoleIdx;
                this.roleTemperature = this.finalConfigData.roleTemperature;
                this.roleTopP = this.finalConfigData.roleTopP;
                this.chatPendingTimeout = this.finalConfigData.chatPendingTimeout;

                if (this.selectedSystemPrompt === undefined) {
                    this.selectedSystemPrompt = '';
                }

                if (this.useCustomPrompt === undefined) {
                    this.useCustomPrompt = false;
                }

                if (this.roleTemperature === undefined) {
                    this.roleTemperature = 1.0;
                }

                if (this.roleTopP === undefined) {
                    this.roleTopP = 0.7;
                }

                if (this.chatPendingTimeout === undefined) {
                    this.chatPendingTimeout = 5;
                }

                console.log('loadRelatedAIConfigs: selectedSystemPrompt: ', this.selectedSystemPrompt, ' this.useCustomPrompt: ', this.useCustomPrompt);
                if (!this.useCustomPrompt) {
                    this.selectedSystemRoleIdx = this.supportedSystemRoles.findIndex(roleInfo => roleInfo.prompt === this.selectedSystemPrompt);
                }
            }


            switch (this.aiModelType) {
                default: {
                    this.customModelConfigData.supportCustomPrompt = this.aiModelType.startsWith('Custom-');

                    const aiConfigKeyPrefix = 'aiConfig.' + this.aiModelType;

                    if (useCache && this.finalConfigData !== undefined) {
                        this.customUrlAddr = this.finalConfigData.customUrlAddr;
                        this.customModelName = this.finalConfigData.customModelName;
                    }
                    if (this.customUrlAddr === undefined) {
                        this.customUrlAddr = window.store.storeGet(aiConfigKeyPrefix + '.baseUrl', '');
                    }

                    if (this.aiModelType.startsWith('HuoShan-')) {
                        if (this.customUrlAddr && this.customUrlAddr.endsWith('/bots/')) {
                            this.customModelConfigData.huoshanType = 'chatBot';
                        } else  {
                            this.customModelConfigData.huoshanType = 'inference';
                        }
                    }

                    if (this.useDekiePrompt === undefined) {
                        this.useDekiePrompt = window.store.storeGet(aiConfigKeyPrefix + '.useDekiePrompt', true);
                    }

                    if (this.openAIAPIKey === undefined) {
                        this.openAIAPIKey = window.store.storeGet(aiConfigKeyPrefix + '.apiKey', '');
                    }

                    if (this.customModelName === undefined) {
                        this.customModelName = window.store.storeGet(aiConfigKeyPrefix + '.modelName', '');
                    }
                    break;
                }
                case 'spark3.5-max':
                case 'spark4-ultra':

                    this.sparkAIConfig = undefined;
                    this.customModelConfigData.supportOpenAICustomConfig = false;
                    if (useCache && this.finalConfigData !== undefined) {
                        this.sparkAIConfig = this.finalConfigData.sparkAIConfig;
                    }

                    if (this.sparkAIConfig === undefined) {
                        this.sparkAIConfig = window.store.storeGet('aiConfig.xfy.apiAuth', {
                            appId: '',
                            apiSecret: '',
                            apiKey: '',
                        });
                    }
                    break;
                case 'llama3-70b-8192':
                case 'llama3-8b-8192':
                case 'llama3-groq-70b-8192-tool-use-preview':
                case 'llama3-groq-8b-8192-tool-use-preview':
                case 'llama-3.1-8b-instant':
                case 'llama-3.1-70b-versatile':
                case 'llama-3.1-405b-reasoning':
                case 'gemma-7b-it':
                case 'gemma2-9b-it':
                case 'mixtral-8x7b-32768':
                    if (this.openAIAPIKey === undefined) {
                        this.openAIAPIKey = window.store.storeGet('aiConfig.groq.apiKey', '');
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
                    this.customModelConfigData.supportWebSearch = true;
                    if (this.openAIAPIKey === undefined) {
                        this.openAIAPIKey = window.store.storeGet('aiConfig.qwen.apiKey', '');
                    }
                    break;
                case 'glm-3-turbo':
                case 'glm-4':
                case 'glm-4-0520':
                case 'glm-4-air':
                case 'glm-4-airx':
                case 'glm-4-flash':
                    this.customModelConfigData.supportWebSearch = true;
                    if (this.openAIAPIKey === undefined) {
                        this.openAIAPIKey = window.store.storeGet('aiConfig.zhipu.apiKey', '');
                    }
                    break;
                case 'gpt-4o':
                case 'gpt-4o-mini':
                case 'gpt-4-turbo':
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    if (this.openAIAPIKey === undefined) {
                        this.openAIAPIKey = window.store.storeGet('aiConfig.openAi.apiKey', '');
                    }
                    break;
            }
        },
        handleSpeechEngineSelected() {
            this.speechLanguages = [];
            this.speechVoiceNames = undefined;
            this.speechLanguageSelectedItem = [];
            this.speechServiceAPIKey = undefined;
            this.speechLanguageSelected = undefined;
            this.speechVoiceSelected = undefined;
            switch (this.speechEngineType) {
                default:
                    break;
                case SPEECH_ENGINE_TYPE.XYF:
                    if (this.finalConfigData !== undefined) {
                        this.sparkAIConfig = this.finalConfigData.sparkAIConfig;
                    }

                    if (this.sparkAIConfig === undefined) {
                        this.sparkAIConfig = window.store.storeGet('aiConfig.xfy.apiAuth', {
                            appId: '',
                            apiSecret: '',
                            apiKey: '',
                        });
                    }
                    break;
                case SPEECH_ENGINE_TYPE.AZURE:
                    if (this.finalConfigData !== undefined) {
                        this.speechServiceAPIKey = this.finalConfigData.speechServiceAPIKey;
                        this.speechLanguageSelected = this.finalConfigData.speechLanguageSelected;
                        this.speechVoiceSelected = this.finalConfigData.speechVoiceSelected;
                        this.azureServiceRegion = this.finalConfigData.azureServiceRegion;
                    }

                    if (this.speechServiceAPIKey === undefined) {
                        this.speechServiceAPIKey = window.store.storeGet('aiConfig.azure.speechServiceKey', '');
                    }

                    if (this.speechLanguageSelected === undefined) {
                        this.speechLanguageSelected = window.store.storeGet('aiConfig.azure.speechLanguage', '');
                    }

                    if (this.speechVoiceSelected === undefined) {
                        this.speechVoiceSelected = window.store.storeGet('aiConfig.azure.speechLanguageVoice', '');
                    }

                    if (this.azureServiceRegion === undefined) {
                        this.azureServiceRegion = window.store.storeGet('aiConfig.azure.serviceRegion', 'eastasia');
                    }
                    this.speechLanguages = this.azureSpeechLanguages;

                    this.speechVoiceNames = this.speechLanguages.find(
                        languageInfo => languageInfo.value === this.speechLanguageSelected
                    ).children;

                    if (this.speechVoiceSelected === undefined) {
                        this.speechVoiceSelected = this.speechVoiceNames[0].value;

                        if (this.finalConfigData !== undefined) {
                            this.finalConfigData.speechVoiceSelected = this.speechVoiceSelected;
                        } else {
                            window.store.storeSet('aiConfig.azure.speechLanguageVoice', this.speechVoiceSelected);
                        }
                    }

                    this.speechLanguageSelectedItem = [this.speechLanguageSelected, this.speechVoiceSelected];
                    break;
            }
        },
        handleSpeechLanguageChanged() {
            console.log('AIConfigSettings: selected speech language: ', this.speechLanguageSelectedItem);

            this.speechLanguageSelected = this.speechLanguageSelectedItem[0];
            this.speechVoiceSelected = this.speechLanguageSelectedItem[1];
        },
        handleAddCustomModel(modelLabel) {
            console.log('AIConfigSettings: handleAddCustomModel: ', modelLabel);
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

                    this.aiModelType = newModelType;

                    this.handleAIEngineChanged();

                    newGroupObj.models.push(addBtnObj);
                }

                return newGroupObj;
            });

            console.log('AIConfigSettings: handleAddCustomModel: After Update: ' + JSON.stringify(this.supportedAIModels));

            window.generalAIManager.updateSupportedModels(this.supportedAIModels);
            this.$message.success(this.$t('settings.add') + ' ' + this.$t('success'));
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

            console.log('AIConfigSettings: renameClicked: ', this.editNameModel);

            this.$nextTick(() => {
                this.$refs.editModelLabelBox.focus();
            });

        },
        copyClicked() {

            const copyModelType = this.selectedModelType[1];

            console.log('AIConfigSettings: copyClicked: ', copyModelType);

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
            console.log('AIConfigSettings: saveRelatedAIConfigs: copyAIConfigKeyPrefix: ', copyAIConfigKeyPrefix);

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
            this.aiModelType = newModelType;
            window.generalAIManager.updateSupportedModels(this.supportedAIModels);
            this.$message.success(this.$t('settings.copy') + ' ' + this.$t('success'));
        },
        deleteClicked() {
            const deleteModelType = this.selectedModelType[1];

            console.log('AIConfigSettings: deleteClicked: deleteModelType: ', deleteModelType);

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
                    that.selectedModelType = ['Groq', 'llama-3.1-70b-versatile'];
                }

                const deleteAIConfigKeyPrefix = 'aiConfig.' + deleteModelType;

                window.store.storeDelete(deleteAIConfigKeyPrefix);

                window.generalAIManager.updateSupportedModels(that.supportedAIModels);

                that.aiModelType = that.selectedModelType[1];

                that.handleAIEngineChanged();

                that.$message.success(that.$t('settings.delete') + ' ' + that.$t('success'));
            }).catch(err => {
                console.log('AIConfigSettings: deleteClicked: err: ', err);
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
            let finalRightClickMenu = this.rightClickMenu;

            if (!canModify) {
                finalRightClickMenu = [this.rightClickMenu[0]];
            } else if (this.finalConfigData !== undefined) {
                finalRightClickMenu = this.rightClickMenu.slice(0, 2);
            }

            this.$contextmenu({
                items: finalRightClickMenu,
                event, // 鼠标事件信息
                customClass: 'right-click-menu', // 自定义菜单 class
                zIndex: 5000, // 菜单样式 z-index
                minWidth: 140, // 主菜单最小宽度
            });
            return false;
        },
        onEditBlur() {
            console.log('AIConfigSettings: onEditBlur: newLabel', this.editNameModel);

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
            console.log('AIConfigSettings: onEditBlur: After Rename: ' + JSON.stringify(this.supportedAIModels));

            window.generalAIManager.updateSupportedModels(this.supportedAIModels);

            this.editNameModel = undefined;
        },
        aiSystemRoleChanged(val) {
            this.selectedSystemPrompt = this.supportedSystemRoles[val].prompt;
            console.log('AIConfigSettings: aiSystemRoleChanged: ', this.selectedSystemPrompt);
        },
        handleUseCustomPromptChanged(val) {
            this.useCustomPrompt = val;
            if (this.useCustomPrompt) {
                this.selectedSystemPrompt = '';
            } else {
                this.selectedSystemPrompt = this.supportedSystemRoles[this.selectedSystemRoleIdx].prompt;
            }
        }
    }
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
    background: transparent;
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

/deep/ .el-slider__marks-text {
    transform: none;
    margin-top: 5px;
}

/deep/ .el-slider__marks-text:last-child {
    left: unset !important;
    right: 0 !important;

}
</style>
