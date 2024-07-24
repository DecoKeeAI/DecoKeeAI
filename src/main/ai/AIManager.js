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
import XFYAdapter from '@/main/ai/Connector/XFYAdapter';
import OpenAIAdapter from '@/main/ai/Connector/OpenAIAdapter';
import Constants from '@/utils/Constants';
import {app, clipboard, ipcMain, shell} from 'electron';
import {
    AI_CONSTANT_CONFIG,
    AI_SUPPORT_FUNCTIONS,
    CHAT_TYPE, CHUNK_MSG_TYPE,
    getChatPrePromptMsg,
    getKeyConfigBotPrePrompt,
    getNormalChatPrePrompt,
    getPCOperationBotPrePrompt,
    KEY_CONFIG_OBJ,
} from '@/main/ai/ConstantData';
import {i18nRender} from '@/plugins/i18n';
import {KeyConfiguration} from '@/plugins/KeyConfiguration';

import {isURL, randomString} from '@/utils/Utils';
import WebSpeechAudioAdapter from '@/main/ai/Connector/WebSpeechAudioAdapter';
import {deepCopy} from '@/utils/ObjectUtil';
import CozeAdapter from "@/main/ai/Connector/CozeAdapter";

const { exec } = require('child_process');
const levenshtein = require('fast-levenshtein');
const path = require('path');
const fs = require('fs');


const htmlDocx = require('html-docx-js');
const showdown = require('showdown');

// eslint-disable-next-line
const BUILD_IN_AI_MODELS = [
    {
        label: 'Groq',
        value: 'Groq',
        models: [
            {label: 'Groq llama3 70B', value: 'llama3-70b-8192', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq llama3 8B', value: 'llama3-8b-8192', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq llama3 70B tool use preview', value: 'llama3-groq-70b-8192-tool-use-preview', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq llama3 8B tool use preview', value: 'llama3-groq-8b-8192-tool-use-preview', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq llama3 8b', value: 'llama-3.1-8b-instant', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq llama3.1 70b', value: 'llama-3.1-70b-versatile', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq llama3.1 405b', value: 'llama-3.1-405b-reasoning', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq gemma 7B', value: 'gemma-7b-it', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq gemma2 9B', value: 'gemma2-9b-it', canModify: false, supportedFunctions: 'chat'},
            {label: 'Groq mixtral 8x7b', value: 'mixtral-8x7b-32768', canModify: false, supportedFunctions: 'chat'}
        ]
    },
    {
        label: 'OpenAI',
        value: 'OpenAI',
        models: [
            {label: 'GPT 4o-mini', value: 'gpt-4o-mini', canModify: false, supportedFunctions: 'chat'},
            {label: 'GPT 4o', value: 'gpt-4o', canModify: false, supportedFunctions: 'chat'},
            {label: 'GPT 4 Turbo', value: 'gpt-4-turbo', canModify: false, supportedFunctions: 'chat'},
            {label: 'GPT 4', value: 'gpt-4', canModify:false, supportedFunctions: 'chat'},
            {label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo', canModify:false, supportedFunctions: 'chat'},
        ]
    },
    {
        label: 'Spark',
        value: 'Spark',
        models: [
            {label: 'Spark 3.5 MAX', value: 'spark3.5-max', canModify:false, supportedFunctions: 'chat'},
            {label: 'Spark 4 Ultra', value: 'spark4-ultra', canModify:false, supportedFunctions: 'chat'},
        ]
    },
    {
        label: 'Qwen',
        value: 'Qwen',
        models: [
            {label: '通义千问 turbo', value: 'qwen-turbo', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问 Plus', value: 'qwen-plus', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问 Max', value: 'qwen-max', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问 72b-chat', value: 'qwen-72b-chat', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问1.5 32b-chat', value: 'qwen1.5-32b-chat', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问1.5 72b-chat', value: 'qwen1.5-72b-chat', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问1.5 110b-chat', value: 'qwen1.5-110b-chat', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问2 1.5b-instruct', value: 'qwen2-1.5b-instruct', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问2 7b-instruct', value: 'qwen2-7b-instruct', canModify:false, supportedFunctions: 'chat'},
            {label: '通义千问2 72b-instruct', value: 'qwen2-72b-instruct', canModify:false, supportedFunctions: 'chat'},
        ]
    },
    {
        label: 'ZhiPu',
        value: 'ZhiPu',
        models: [
            {label: '智谱 GLM 4 0520', value: 'glm-4-0520', canModify:false, supportedFunctions: 'chat'},
            {label: '智谱 GLM 4', value: 'glm-4', canModify:false, supportedFunctions: 'chat'},
            {label: '智谱 GLM 4 ari', value: 'glm-4-air', canModify:false, supportedFunctions: 'chat'},
            {label: '智谱 GLM 4 arix', value: 'glm-4-airx', canModify:false, supportedFunctions: 'chat'},
            {label: '智谱 GLM 4 flash', value: 'glm-4-flash', canModify:false, supportedFunctions: 'chat'},
            {label: '智谱 GLM 3 Turbo', value: 'glm-3-turbo', canModify:false, supportedFunctions: 'chat'},
        ]
    },
    {
        label: 'HuoShan',
        value: 'HuoShan',
        models: []
    },
    {
        label: 'Coze',
        value: 'Coze',
        models: []
    },
    {
        label: 'Custom',
        value: 'Custom',
        models: []
    },
]

export const AI_ENGINE_TYPE = {
    XYF: 0,
    OpenAI: 1,
    ArixoChat: 2,
    GroqChat: 3,
    StandardChat: 4,
    QWenChat: 5,
    ZhiPuChat: 6,
    CustomEngine: 7,
    HuoShan: 8,
    Coze: 9
}

export const SPEECH_ENGINE_TYPE = {
    XYF: 'XFY',
    OpenAI: 'OpenAI',
    AZURE: 'Azure',
}


const AI_SESSION_STATE_EMPTY = 0, AI_SESSION_STATE_ONGOING = 1, AI_SESSION_STATE_PROCESSING = 2,
    AI_SESSION_STATE_IDLE = 3;

const tempAssistantObj = {
    keyCode: "0,1",
    config: {
        type: "knob",
        title: {
            text: "",
            pos: "top",
            size: 8,
            color: "#FFFFFF",
            style: "bold|italic|underline",
            resourceId: "0-0",
            display: true
        },
        icon: "0-50",
        subActions: [
            {
                config: {
                    type: "assistant",
                    title: {
                        text: "",
                        pos: "top",
                        size: 8,
                        color: "#FFFFFF",
                        style: "bold|italic|underline",
                        resourceId: "0-0",
                        display: true
                    },
                    icon: "0-50",
                    animations: ["0-47", "0-48", "0-49", "0-51"],
                    actions: [
                        {
                            type: "assistant",
                            value: ""
                        }
                    ]
                }
            }
        ]
    }
}

const OPERATION_STAGE = {
    STAGE_DECODE_END: 0,
    STAGE_DECODE_ACTION: 1,
    STAGE_DECODE_ACTION_DETAIL: 2,
    STAGE_DECODE_OUTPUT: 3
}

class AIManager {

    constructor(AppManager) {
        this.appManager = AppManager;
        console.log('AIManager constructor');

        this.ttsEngineAdapter = undefined;
        this.aiAssistantChatAdapter = undefined;
        this.standardAIChatAdapter = undefined;

        this.audioDataArray = [];
        this.lastProcessedAudioIdx = 0;
        this.audioDataFinished = true;
        this.currentRequestId = '';

        this.audioSendTimer = undefined;

        this.currentRecentApps = undefined;

        this.alterToneMap = new Map();

        this.assistantDeviceSN = '';
        this.assistantDeviceInfo = undefined;

        this.waitChatMsgTimeoutTask = undefined;
        this.chatResponseMsg = '';
        this.fullChatResponseMsg = '';
        this.isPendingChatFinish = false;
        this.firstChatFrameResponse = true;

        this.aiSessionState = AI_SESSION_STATE_EMPTY;

        this.aiSessionResourceMap = new Map();
        this.configToResIdMap = new Map();

        this.ttsResultListener = undefined;
        this.chatResponseListener = undefined;

        this.sttResultListener = undefined;

        this.assistantChatHistory = [];

        this.aiAssistantRequestId = undefined;

        this.aiAssistantModelType = '';
        this.speechModelType = '';
        this.aiChatModelType = '';

        this.outputRobot = undefined;

        this.markdownConverter = undefined;

        this.operatePCContext = {
            stage: OPERATION_STAGE.STAGE_DECODE_END,
            actionType: '',
            actionDetail: [],
            actionOutput: '',
            actionProcessDone: false
        }

        ipcMain.on('PlayerReady', (event, args) => {
            console.log('AIManager PlayerReady: for ', args)
            if (!args.requestId || !args.requestId.startsWith('Load+')) return;

            const requestIdInfo = args.requestId.split('+');
            if (requestIdInfo.length !== 2) {
                return;
            }
            console.log('AIManager PlayerReady: for ', args, ' RequestInfo: ', requestIdInfo);

            this.alterToneMap.set(requestIdInfo[1], {
                playerId: args.playerId
            });
        });

        ipcMain.on('RecorderStart', (event, args) => {
            console.log('AIManager RecorderStart: args ', args);
            this._playAlertTone(Constants.ASSISTANT_SESSION_START);
        });

        ipcMain.on('EngineTypeChange', () => {
            const newAIAssistantModelType = this.appManager.storeManager.storeGet('aiConfig.modelType');
            const newSpeechModelType = this.appManager.storeManager.storeGet('aiConfig.speechEngineType');
            console.log('AIManager EngineTypeChange: this.aiAssistantModelType: ' + newAIAssistantModelType + ' this.speechModelType: ' + newSpeechModelType);
            this.setSpeechEngineModel(newSpeechModelType);
            this.setAssistantEngineModel(newAIAssistantModelType);
        });

        ipcMain.on('ChatEngineTypeChange', () => {
            const newAiChatModelType = this.appManager.storeManager.storeGet('aiConfig.chat.modelType');
            console.log('AIManager Init with chat model type: ' + newAiChatModelType);
            this.setChatEngineModel(newAiChatModelType)
        });

        ipcMain.on('AIAudioHandlerReady', () => {
            const newAIAssistantModelType = this.appManager.storeManager.storeGet('aiConfig.modelType');
            const newSpeechModelType = this.appManager.storeManager.storeGet('aiConfig.speechEngineType');
            console.log('AIManager Init with model type this.aiAssistantModelType: ' + newAIAssistantModelType + ' this.speechModelType: ' + newSpeechModelType);
            this.setSpeechEngineModel(newSpeechModelType);
            this.setAssistantEngineModel(newAIAssistantModelType);

            let newAiChatModelType = this.appManager.storeManager.storeGet('aiConfig.chat.modelType');
            if (newAiChatModelType === undefined) {
                newAiChatModelType = 'llama-3.1-70b-versatile';
            }

            console.log('AIManager Init with chat model type: ' + newAiChatModelType);
            this.setChatEngineModel(newAiChatModelType)

            const resourceManager = this.appManager.resourcesManager;

            const gifAnimations = resourceManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_GIF);
            if (gifAnimations !== undefined && gifAnimations.length > 0) {
                gifAnimations.forEach(resourceInfo => {
                    if (resourceInfo.name === Constants.ASSISTANT_ANIMATION_IDLE || resourceInfo.name === Constants.ASSISTANT_ANIMATION_ONGOING || resourceInfo.name === Constants.ASSISTANT_ANIMATION_PROCESSING) {
                        this.aiSessionResourceMap.set(resourceInfo.name, resourceInfo);
                    }
                });
            }
            this.aiSessionResourceMap.set(Constants.ASSISTANT_TYPE_CHAT, resourceManager.getResourceInfo('0-49'))
            this.aiSessionResourceMap.set(Constants.ASSISTANT_TYPE_KEY_CONFIG, resourceManager.getResourceInfo('0-50'))

            const alertTones = resourceManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_TONE);

            if (alertTones !== undefined && alertTones.length > 0) {
                const assistantTones = alertTones.filter(tone => {
                    return tone.name === Constants.ASSISTANT_SESSION_START || tone.name === Constants.ASSISTANT_SESSION_END
                        || tone.name === Constants.ASSISTANT_SESSION_ERROR
                });

                if (!assistantTones || assistantTones.length === 0) return;

                console.log('AIManager: getAssistantTones: ', assistantTones);

                assistantTones.forEach(toneInfo => {
                    this.appManager.windowManager.mainWindow.win.webContents.send('LoadAudio', {
                        requestId: 'Load+' + toneInfo.name,
                        soundPath: toneInfo.path,
                        volume: 100
                    });
                });
            }
        });

        ipcMain.on('TTSPlayEnded', (event, args) => {
            console.log('AIManager: Received: TTSPlayEnded: for ', args);
            this.setAssistantProcessDone();
        });

        KeyConfiguration.forEach(menuConfig => {
            menuConfig.children.forEach(configData => {
                this.configToResIdMap.set(configData.config.type, configData.config.icon);
                if (configData.config.alterIcon !== undefined) {
                    this.configToResIdMap.set(configData.config.type + 'Alter', configData.config.alterIcon);
                }
            });
        });

        setTimeout(() => {
            this._checkRecentApps();
        }, 5000);

        this.supportedModels = this.appManager.storeManager.storeGet('aiConfig.supportedModels');

        if (!this.supportedModels) {
            this.supportedModels = [];
        }

        BUILD_IN_AI_MODELS.forEach(modelGroupInfo => {
            const modelGroupIdx = this.supportedModels.findIndex(tempModelGroupInfo => tempModelGroupInfo.label === modelGroupInfo.label);
            if (modelGroupIdx === -1) {
                this.supportedModels.push(modelGroupInfo);
                return;
            }

            if (!this.supportedModels[modelGroupIdx].models) {
                this.supportedModels[modelGroupIdx].models = [];
            }

            modelGroupInfo.models.forEach(modelInfo => {
                if (this.supportedModels[modelGroupIdx].models.findIndex(tempModelInfo => tempModelInfo.name === modelInfo.name && tempModelInfo.value === modelInfo.value) > -1) {
                    return;
                }
                this.supportedModels[modelGroupIdx].models.push(modelInfo);
            })

        });

        this.appManager.storeManager.storeSet('aiConfig.supportedModels', this.supportedModels);
    }

    getAllSupportedModels() {
        return this.supportedModels;
    }

    updateSupportedModels(supportedAIModels) {
        const finalSupportedAIModels = [];
        supportedAIModels.forEach(modelGroup => {
            const newObj = Object.assign({}, modelGroup);
            const finalGroupModels = [];
            newObj.models.forEach(aiModel => {
                if (aiModel.isAddAction) {
                    return;
                }

                finalGroupModels.push({
                    label: aiModel.label,
                    value: aiModel.value,
                    canModify: aiModel.canModify,
                    supportedFunctions: aiModel.supportedFunctions
                });

            });

            newObj.models = finalGroupModels;

            finalSupportedAIModels.push(newObj);
        });

        this.appManager.storeManager.storeSet('aiConfig.supportedModels', finalSupportedAIModels);

        this.supportedModels = finalSupportedAIModels;
    }

    setAssistantEngineModel(engineModel) {
        if (engineModel === this.aiAssistantModelType) return;

        this.aiAssistantModelType = engineModel;

        let engineType;
        switch (engineModel) {
            case 'spark3.5':
            case 'spark3.5-max':
            case 'spark-pro':
            case 'spark4-ultra':
                engineType = AI_ENGINE_TYPE.XYF;
                break
            case 'gpt-4o':
            case 'gpt-4o-mini':
            case 'gpt-4-turbo':
            case 'gpt-4':
            case 'gpt-3.5-turbo':
                engineType = AI_ENGINE_TYPE.OpenAI;
                break
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
                engineType = AI_ENGINE_TYPE.QWenChat;
                break
            case 'glm-3-turbo':
            case 'glm-4':
            case 'glm-4-0520':
            case 'glm-4-air':
            case 'glm-4-airx':
            case 'glm-4-flash':
                engineType = AI_ENGINE_TYPE.ZhiPuChat;
                break
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
                engineType = AI_ENGINE_TYPE.GroqChat;
                break
            default:
                if (engineModel.startsWith('HuoShan-')) {
                    engineType = AI_ENGINE_TYPE.HuoShan;
                } else if (engineModel.startsWith('Coze-')) {
                    engineType = AI_ENGINE_TYPE.Coze;
                } else {
                    engineType = AI_ENGINE_TYPE.CustomEngine;
                }
                break
        }

        console.log('AIManager: setAssistantEngineModel: ' + engineType);

        if (this.aiAssistantChatAdapter !== undefined) {
            this.aiAssistantChatAdapter.destroyChatEngine();
        }
        switch (engineType) {
            case AI_ENGINE_TYPE.XYF:
                this.aiAssistantChatAdapter = new XFYAdapter(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, engineModel, this.appManager.storeManager);
                break;
            case AI_ENGINE_TYPE.OpenAI:
            case AI_ENGINE_TYPE.CustomEngine:
            case AI_ENGINE_TYPE.HuoShan:
            case AI_ENGINE_TYPE.ArixoChat:
            case AI_ENGINE_TYPE.GroqChat:
            case AI_ENGINE_TYPE.QWenChat:
            case AI_ENGINE_TYPE.ZhiPuChat:
                this.aiAssistantChatAdapter = new OpenAIAdapter(this.appManager, engineType, CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, engineModel);
                break;
            case AI_ENGINE_TYPE.Coze:
                this.aiAssistantChatAdapter = new CozeAdapter(this.appManager, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel);
                break;
            default:
                this.aiAssistantChatAdapter = new OpenAIAdapter(this.appManager, AI_ENGINE_TYPE.GroqChat, CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, engineModel);
                break;
        }
    }

    setSpeechEngineModel(newSpeechModelType) {

        if (newSpeechModelType === this.speechModelType) return;

        this.speechModelType = newSpeechModelType;

        console.log('AIManager: setSpeechEngineModel: ' + newSpeechModelType);
        if (this.ttsEngineAdapter !== undefined) {
            this.ttsEngineAdapter.destroy();
        }

        switch (this.speechModelType) {
            case SPEECH_ENGINE_TYPE.XYF:
                this.ttsEngineAdapter = new XFYAdapter(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, '', this.appManager.storeManager);
                break;
            case SPEECH_ENGINE_TYPE.AZURE:
                this.ttsEngineAdapter = new WebSpeechAudioAdapter(this.appManager, SPEECH_ENGINE_TYPE.AZURE);
                break;
        }

        this.ttsEngineAdapter.setTTSConvertResultListener(this.ttsResultListener);
        this.ttsEngineAdapter.setRecognizeResultListener((requestId, data) => this._handleRecognizeResult(requestId, data));
    }

    startAssistantSession(serialNumber, requestId, keyCode) {
        if (this._getSessionState() !== AI_SESSION_STATE_EMPTY && this.assistantDeviceSN !== '' && this.assistantDeviceSN !== serialNumber) {
            console.log('AIManager: startAssistantSession: Have ongoing assistant session with other device. Ignore request.');
            return false;
        }

        if (!this.appManager || !this.appManager.windowManager || !this.appManager.windowManager.aiAssistantWindow
            || !this.appManager.windowManager.aiAssistantWindow.win) {
            return false;
        }

        let delayMills = 1;

        if (this._getSessionState() !== AI_SESSION_STATE_IDLE) {
            this.cancelCurrentAssistantSession(this.assistantDeviceSN);
            delayMills = 300;
        }

        setTimeout(() => {
            this.aiAssistantChatAdapter.cancelChatExpireTimer();

            this.assistantDeviceSN = serialNumber;
            this.assistantDeviceInfo = {
                requestId: requestId,
                keyCode: keyCode
            };
            console.log('startAssistantSession: For device: ' + serialNumber);
            this._setSessionState(AI_SESSION_STATE_ONGOING);
            this.appManager.windowManager.aiAssistantWindow.win.webContents.send('StartAudioRecord', {requestAssistantId: requestId});
        }, delayMills);
        return true;
    }

    cancelCurrentAssistantSession(serialNumber) {
        this._resetAssistantSession(serialNumber);
    }

    recognizeVoice(requestId, audioData, isLastFrame) {
        console.log('AIManager: recognizeVoice: requestId: ' + requestId + ' DataLength: ' + audioData.byteLength + ' IsLastFrame: ' + isLastFrame);
        try {
            if (this.currentRequestId !== requestId) {
                this.audioDataArray = []
                this.audioDataFinished = true

                if (this.audioSendTimer !== undefined) {
                    clearInterval(this.audioSendTimer)
                }
                this.audioSendTimer = undefined
                this.audioDataArray = []
                this.lastProcessedAudioIdx = 0

                this.ttsEngineAdapter.cancelCurrentRecognize()
            }

            this.currentRequestId = requestId
            const chunkedData = this._splitBySize(audioData, 1280)
            if (chunkedData.length > 0) {
                chunkedData.forEach(chunk => {
                    this.audioDataArray.push(chunk)
                })
            }

            if (!isLastFrame) {
                this.audioDataFinished = false
                if (this.audioSendTimer === undefined) {
                    this._sendAudioDataToServer()
                }
            }

            if (isLastFrame) {
                this.audioDataFinished = true
            }
        } catch (e) {
            console.log('AIManager: recognizeVoice: Error: ' + JSON.stringify(e));
        }
    }

    playTTS(requestId, text) {
        if (this.assistantDeviceSN === '') return;

        this.ttsEngineAdapter.playTTS(requestId, text).catch(err => {
            console.log('AIManager: playTTS Error: ', err)
        })
    }

    setTTSConvertListener(listener) {
        this.ttsResultListener = listener;
        if (this.ttsEngineAdapter === undefined) return;

        this.ttsEngineAdapter.setTTSConvertResultListener(listener);
    }

    setSTTConvertListener(listener) {
        this.sttResultListener = listener;
    }

    setAssistantProcessDone() {
        if (this.isPendingChatFinish) {
            console.log('AIManager: setAssistantProcessDone: currently pending chat finish. Ignore request.');
            return;
        }
        console.log('AIManager: setAssistantProcessDone.');
        this._playAlertTone(Constants.ASSISTANT_SESSION_END);

        if (this.aiAssistantChatAdapter.getUseChatContext()) {
            this._setSessionState(AI_SESSION_STATE_IDLE);
        } else {
            this._setSessionState(AI_SESSION_STATE_EMPTY);
        }

        this.aiAssistantChatAdapter.startChatSessionExpireTimer().then(expired => {
            if (!expired) return;

            this._setSessionState(AI_SESSION_STATE_EMPTY);
        });

        this.ttsEngineAdapter.cancelCurrentTTSConvert();
        this.ttsEngineAdapter.cancelCurrentRecognize();
    }

    setAssistantProcessFailed() {
        if (this.assistantDeviceInfo) {
            this.appManager.deviceControlManager.showDeviceAlert(this.assistantDeviceSN, Constants.ALERT_TYPE_INVALID, this.assistantDeviceInfo.keyCode);
            this._setSessionState(AI_SESSION_STATE_EMPTY);
        }

        this.aiAssistantRequestId = undefined;
        this.assistantDeviceSN = '';
        this.assistantDeviceInfo = undefined;
        this.isPendingChatFinish = false;
        this._playAlertTone(Constants.ASSISTANT_SESSION_ERROR);
    }

    sendChatMessage(chatHistory = []) {
        const requestId = randomString(10);

        let temperature = this.appManager.storeManager.storeGet('aiConfig.chat.temperature');
        if (!temperature) {
            temperature = 1;
        }

        let topP = this.appManager.storeManager.storeGet('aiConfig.chat.topP');
        if (!topP) {
            topP = 0.7;
        }

        let requestModelName = this.aiChatModelType;

        if (this.aiChatModelType.startsWith('Custom-') || this.aiChatModelType.startsWith('HuoShan-')) {
            const aiConfigKeyPrefix = 'aiConfig.' + this.aiChatModelType;
            requestModelName = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.modelName');
        }

        const params = {
            model: requestModelName,
            messages: chatHistory,
            stream: true,
            max_tokens: 2048,
            temperature: temperature,
            top_p: topP
        }
        try {
            this.standardAIChatAdapter.chatWithAI(requestId, params);
        } catch (err) {
            console.log('AIManager: sendChatMessage detected error: ' + JSON.stringify(err));
            throw err;
        }

        return requestId;
    }

    setChatResponseListener(listener) {
        this.chatResponseListener = listener;

        if (this.standardAIChatAdapter === undefined) return;

        this.standardAIChatAdapter.setChatResponseListener(this.chatResponseListener);
    }

    cancelChatProcess(requestId) {
        this.standardAIChatAdapter.cancelChatProcess(requestId)
    }

    setChatEngineModel(engineModel) {

        if (engineModel === this.aiChatModelType) return;

        this.aiChatModelType = engineModel;

        let chatEngineType;
        switch (engineModel) {
            case 'spark3.5':
            case 'spark3.5-max':
            case 'spark-pro':
            case 'spark4-ultra':
                chatEngineType = AI_ENGINE_TYPE.XYF;
                break
            case 'gpt-4o':
            case 'gpt-4o-mini':
            case 'gpt-4-turbo':
            case 'gpt-4':
            case 'gpt-3.5-turbo':
                chatEngineType = AI_ENGINE_TYPE.OpenAI;
                break
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
                chatEngineType = AI_ENGINE_TYPE.QWenChat;
                break
            case 'glm-3-turbo':
            case 'glm-4':
            case 'glm-4-0520':
            case 'glm-4-air':
            case 'glm-4-airx':
            case 'glm-4-flash':
                chatEngineType = AI_ENGINE_TYPE.ZhiPuChat;
                break
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
                chatEngineType = AI_ENGINE_TYPE.GroqChat;
                break
            default:
                if (engineModel.startsWith('HuoShan-')) {
                    chatEngineType = AI_ENGINE_TYPE.HuoShan;
                } else if (engineModel.startsWith('Coze-')) {
                    chatEngineType = AI_ENGINE_TYPE.Coze;
                } else {
                    chatEngineType = AI_ENGINE_TYPE.CustomEngine;
                }
                break
        }

        console.log('AIManager: setChatEngineType: ' + chatEngineType);
        if (this.standardAIChatAdapter !== undefined) {
            this.standardAIChatAdapter.destroyChatEngine();
        }
        switch (chatEngineType) {
            case AI_ENGINE_TYPE.XYF:
                this.standardAIChatAdapter = new XFYAdapter(CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel, this.appManager.storeManager);
                break;
            case AI_ENGINE_TYPE.OpenAI:
            case AI_ENGINE_TYPE.ArixoChat:
            case AI_ENGINE_TYPE.CustomEngine:
            case AI_ENGINE_TYPE.HuoShan:
            case AI_ENGINE_TYPE.GroqChat:
            case AI_ENGINE_TYPE.StandardChat:
            case AI_ENGINE_TYPE.QWenChat:
            case AI_ENGINE_TYPE.ZhiPuChat:
                this.standardAIChatAdapter = new OpenAIAdapter(this.appManager, chatEngineType, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel);
                break;
            case AI_ENGINE_TYPE.Coze:
                this.standardAIChatAdapter = new CozeAdapter(this.appManager, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel);
                break;
            default:
                this.standardAIChatAdapter = new OpenAIAdapter(this.appManager, AI_ENGINE_TYPE.GroqChat, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel);
                break;
        }

        this.standardAIChatAdapter.setChatResponseListener(this.chatResponseListener);
    }

    _resetAssistantSession(serialNumber, fullReset = true) {
        console.log('AIManager: resetAssistantSession for: ' + serialNumber + ' Current: ' + this.assistantDeviceSN + ' fullReset: ' + fullReset);
        if (serialNumber === '' || serialNumber !== this.assistantDeviceSN) return;

        clearTimeout(this.waitChatMsgTimeoutTask);
        this.waitChatMsgTimeoutTask = undefined;

        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('StopAudioRecord', {requestAssistantId: this.assistantDeviceInfo.requestId});
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('StopTTSPlay', {requestAssistantId: this.assistantDeviceInfo.requestId});

        this.assistantChatHistory = [];
        this.aiAssistantRequestId = undefined;

        if (!fullReset) {
            this.chatResponseMsg = '';
            this.fullChatResponseMsg = '';

            this.aiAssistantChatAdapter.cancelChatProcess();
            this.ttsEngineAdapter.cancelCurrentTTSConvert();
            this.ttsEngineAdapter.cancelCurrentRecognize();
            return;
        }
        setTimeout(() => {
            this.chatResponseMsg = '';
            this.fullChatResponseMsg = '';

            this.aiAssistantChatAdapter.cancelChatProcess();
            this.ttsEngineAdapter.cancelCurrentTTSConvert();
            this.ttsEngineAdapter.cancelCurrentRecognize();

            this._setSessionState(AI_SESSION_STATE_EMPTY);

            this.assistantDeviceSN = '';
            this.assistantDeviceInfo = {};
            this.isPendingChatFinish = false;
        }, 300);
    }

    _handleRecognizeResult(requestId, dataStr = '') {
        if (this.assistantDeviceSN === '') return;
        console.log('AIManager: handleRecognizeResult: RequestId: ' + requestId + ' DataStr: ' + dataStr + ' CurrentChatMode: ' + this.aiAssistantChatAdapter.getChatMode());
        dataStr = dataStr.trim();
        if (dataStr.length < 2 || (dataStr === 2 && (dataStr.endsWith('。') || dataStr.endsWith('.')))) {
            this._setSessionState(AI_SESSION_STATE_EMPTY);
            console.log('AIManager: handleRecognizeResult: Ignored message for too short data.');
            this._resetAssistantSession(this.assistantDeviceSN);
            return;
        }

        this.firstChatFrameResponse = true;
        this.isPendingChatFinish = true;

        const deviceActiveProfile = this.appManager.deviceControlManager.getDeviceActiveProfile(this.assistantDeviceSN);
        const deviceLayoutConfig = this.appManager.deviceControlManager.getDeviceBasicConfig(this.assistantDeviceSN);
        this._handleAIAssistantProcess(requestId, dataStr, deviceActiveProfile, deviceLayoutConfig);
        this._setSessionState(AI_SESSION_STATE_PROCESSING);
    }

    async _handleChatResponse(requestId, status, message, messageType = CHUNK_MSG_TYPE.ANSWER) {

        if (this.assistantDeviceSN === '') return;

        switch (this.aiAssistantChatAdapter.getChatMode()) {
            case CHAT_TYPE.CHAT_TYPE_NORMAL:
                if (status === -1) {
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                    this.setAssistantProcessFailed();
                    this._resetAssistantSession(this.assistantDeviceSN);
                    return;
                }

                this.fullChatResponseMsg += message;
                this.chatResponseMsg += message;

                if ((this.firstChatFrameResponse && this.chatResponseMsg.length >= 20) || (!this.firstChatFrameResponse && this.chatResponseMsg.length >= 50) || status === 2) {
                    console.log('AIManager: handleChatResponse Triggered TTS Play: this.assistantDeviceSN: ' + this.assistantDeviceSN + ' RequestId: ' + requestId + ' status: ' + status + ' this.chatResponseMsg: ' + this.chatResponseMsg)
                    this.firstChatFrameResponse = false;
                    clearTimeout(this.waitChatMsgTimeoutTask);
                    this.waitChatMsgTimeoutTask = undefined;
                    if (status !== 2) {
                        this.waitChatMsgTimeoutTask = setTimeout(() => {
                            console.log(`AIManager: Timeout Wait AIMsg: ${this.chatResponseMsg}`);
                            this.ttsEngineAdapter.playTTS(requestId, this.chatResponseMsg);
                            this.chatResponseMsg = '';
                        }, 3000);
                    } else {
                        this.isPendingChatFinish = false;

                        this.assistantChatHistory.push({
                            role: 'assistant',
                            content: this.fullChatResponseMsg
                        });
                        this.fullChatResponseMsg = '';
                    }

                    const splitMsg = this._splitByLastPunctuation(this.chatResponseMsg);

                    console.log('AIManager: handleChatResponse: splitMsg: ', splitMsg);

                    if (splitMsg.length === 1 || splitMsg[1] === '') {
                        this.ttsEngineAdapter.playTTS(requestId, this.chatResponseMsg);
                        this.chatResponseMsg = '';
                    } else {
                        if (status === 2) {
                            this.ttsEngineAdapter.playTTS(requestId, this.chatResponseMsg);
                            this.chatResponseMsg = '';
                        } else {
                            this.ttsEngineAdapter.playTTS(requestId, splitMsg[0]);
                            this.chatResponseMsg = splitMsg[1];
                        }

                    }

                }
                break;
            case CHAT_TYPE.CHAT_TYPE_KEY_CONFIG:
                console.log('AIManager: handleChatResponse: for CHAT_TYPE_KEY_CONFIG this.assistantDeviceSN: ' + this.assistantDeviceSN + ' RequestId: ' + requestId + ' status: ' + status + ' Message: ' + message)

                if (status === 0) {
                    this.chatResponseMsg = '';
                    clearTimeout(this.waitChatMsgTimeoutTask);
                    this.waitChatMsgTimeoutTask = setTimeout(() => {
                        console.log(`AIManager: wait Chat config response timeout : ${this.chatResponseMsg}`);
                        this.ttsEngineAdapter.playTTS(requestId, this.chatResponseMsg);
                        this.chatResponseMsg = '';
                    }, AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);
                }
                this.chatResponseMsg += message;

                if (this.waitChatMsgTimeoutTask !== undefined && this.chatResponseMsg.includes('{') && this.chatResponseMsg.includes('title')) {
                    clearTimeout(this.waitChatMsgTimeoutTask);
                    this.waitChatMsgTimeoutTask = undefined;
                }

                if (status === 1) return;

                if (status === 2) {
                    const decodeDataStartIdx = this.chatResponseMsg.indexOf("{");
                    const decodeDataEndIdx = this.chatResponseMsg.lastIndexOf("}");
                    if (decodeDataStartIdx < 0 || decodeDataEndIdx <= decodeDataStartIdx) {
                        let returnedResponse = undefined;
                        let isValidResponse = false;
                        try {
                            returnedResponse = eval('(' + this.chatResponseMsg + ')');
                        } catch (err) {
                            console.log('AIManager: Invalid Json.')
                        }
                        console.log('AIManager: handleChatResponse: invalid config info: ' + this.chatResponseMsg + ' this.waitChatMsgTimeoutTask: ' + this.waitChatMsgTimeoutTask);
                        if (this.waitChatMsgTimeoutTask !== undefined) {
                            clearTimeout(this.waitChatMsgTimeoutTask);
                            if (this.chatResponseMsg.toLowerCase().startsWith(i18nRender("assistantConfig.modifyConfig").toLowerCase())) {
                                this.ttsEngineAdapter.playTTS(requestId, i18nRender("assistantConfig.unKnowConfigRequest"));
                            } else if (returnedResponse && returnedResponse.requestMsg) {
                                if (returnedResponse.requestMsg.toLowerCase() === 'New configuration' || returnedResponse.requestMsg.toLowerCase() === 'Modify configuration') {
                                    isValidResponse = true;
                                } else {
                                    this.ttsEngineAdapter.playTTS(requestId, returnedResponse.requestMsg);
                                }
                            } else {
                                this.ttsEngineAdapter.playTTS(requestId, this.chatResponseMsg);
                            }
                        } else {
                            this._showAssistantError(requestId);
                        }
                        if (!isValidResponse) {
                            this.isPendingChatFinish = false;
                            this.chatResponseMsg = '';
                            return;
                        }
                    }

                    const responseConfigJson = this.chatResponseMsg.substring(decodeDataStartIdx, (decodeDataEndIdx + 1));

                    console.log('AIManager: handleChatResponse: AI response config StartIndex: ' + decodeDataStartIdx + ' EndIdx: ' + decodeDataEndIdx +
                        ' OriginalResponse: ' + this.chatResponseMsg + ' responseConfigJson: ' + responseConfigJson);
                    let responseConfigData = '';
                    try {
                        responseConfigData = eval('(' + responseConfigJson + ')');
                    } catch (err) {
                        console.log('AIManager: handleChatResponse: Invalid Json.')
                        this._showAssistantError(requestId);
                        this.chatResponseMsg = '';
                        return;
                    }

                    console.log('AIManager: handleChatResponse: AI response config data detail: ' + JSON.stringify(responseConfigData));

                    const newConfigData = responseConfigData.ConfigData;
                    console.log('AIManager: handleChatResponse: newConfigData is null: ' + (newConfigData === undefined));

                    if (newConfigData === undefined) {
                        this.ttsEngineAdapter.playTTS(requestId, responseConfigData.requestMsg);
                        this.isPendingChatFinish = false;
                        this.chatResponseMsg = '';
                        break;
                    }

                    const deviceActiveProfile = this.appManager.deviceControlManager.getDeviceActiveProfile(this.assistantDeviceSN);

                    const configResourceId = deviceActiveProfile.resourceId;
                    let configData = deviceActiveProfile.configInfo;

                    configData = await this._convertConfigDataToProtocolConfig(newConfigData, configData, true);
                    this.appManager.resourcesManager.updateConfigInfo(configResourceId, configData);

                    this.appManager.deviceControlManager.sendProfileChangeRequest(this.assistantDeviceSN, configResourceId);

                    this._notifyDeviceConfigChange(this.assistantDeviceSN, configResourceId, deviceActiveProfile.configIdx);

                    console.log('AIManager: handleChatResponse: edit old config.');
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.configUpdated'));
                    this.isPendingChatFinish = false;
                    this.chatResponseMsg = '';
                }

                break;
            case CHAT_TYPE.CHAT_TYPE_OPERATE_PC:
                clearTimeout(this.waitChatMsgTimeoutTask);
                this.waitChatMsgTimeoutTask = undefined;
                if (status !== 2) {
                    this.waitChatMsgTimeoutTask = setTimeout(() => {
                        console.log(`AIManager: Timeout Wait AIMsg for CHAT_TYPE_OPERATE_PC: ${this.chatResponseMsg}`);
                        this.chatResponseMsg = '';
                        this.setAssistantProcessFailed();
                        this._resetAssistantSession(this.assistantDeviceSN);
                    }, 5000);
                }

                if (status === -1) {
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                    this.setAssistantProcessFailed();
                    this._resetAssistantSession(this.assistantDeviceSN);
                    return;
                }

                if (OPERATION_STAGE.STAGE_DECODE_END === this.operatePCContext.stage) {
                    this._resetOperatePCContext();
                    this.operatePCContext.stage = OPERATION_STAGE.STAGE_DECODE_ACTION;
                    this.chatResponseMsg = '';
                    this.fullChatResponseMsg = '';
                }

                this.fullChatResponseMsg += message;
                this.chatResponseMsg += message;

                this._decodeOperateActionData(requestId, this.chatResponseMsg, status === 2, messageType);

                if (!this.operatePCContext.actionProcessDone && this.operatePCContext.actionType !== '' && this.operatePCContext.actionDetail) {

                    await this._handleUserRequestActions(requestId, this.operatePCContext.actionType, this.operatePCContext.actionDetail, this.operatePCContext.actionOutput, status === 2);
                    if (this.operatePCContext.actionDetail.length > 0 && (this.operatePCContext.actionType === AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION || this.operatePCContext.actionType === AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION)) {
                        this.operatePCContext.actionProcessDone = true;
                        this.isPendingChatFinish = false;
                    }
                }

                if (status === 2) {
                    console.log('AIManager: handleChatResponse: Final CHAT_TYPE_OPERATE_PC message: ' + this.fullChatResponseMsg + ' DeCoded: Data: ', this.operatePCContext);
                    this.operatePCContext.stage = OPERATION_STAGE.STAGE_DECODE_END;

                    if (this.operatePCContext.actionType === '') {
                        this.isPendingChatFinish = false;
                        this.setAssistantProcessDone();
                        return;
                    }

                }

                break;
        }

    }

    _decodeOperateActionData(requestId, message, isLast = false, messageType) {
        if (message.includes('**UserRequestAction**')) {
            message = message.replace('**UserRequestAction**', '`UserRequestAction`');
        }
        if (message.includes('**ActionDetail**')) {
            message = message.replace('**ActionDetail**', '`ActionDetail`');
        }
        if (message.includes('**OutputResponse**')) {
            message = message.replace('**OutputResponse**', '`OutputResponse`');
        }
        switch (this.operatePCContext.stage) {
            case OPERATION_STAGE.STAGE_DECODE_ACTION:
                if (!message.includes('`UserRequestAction`:') || (!isLast && !message.includes('`ActionDetail`:'))) {
                    return;
                }

                this.operatePCContext.actionType = message
                    .substring(message.indexOf('`UserRequestAction`:') + 20, message.indexOf('`ActionDetail`:'))
                    .trim();

                if (this.operatePCContext.actionType.endsWith('\\')) {
                    this.operatePCContext.actionType = this.operatePCContext.actionType.substring(0, this.operatePCContext.actionType.length - 1);
                }

                this.operatePCContext.actionType = this.operatePCContext.actionType.replace(/`/g, '').replace(/'/g, '').replace(/-/g, '').trim();

                message = message.substring(message.indexOf('\n') + 1);

                console.log(
                    'AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION: this.operatePCContext.actionType: ' +
                    this.operatePCContext.actionType,
                    ' MessageRemain: ' + message
                );

                this.operatePCContext.stage = OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL;

                this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.ok'));

                if (message !== '') {
                    this.chatResponseMsg = message;
                    this._decodeOperateActionData(requestId, message, isLast, messageType);
                    return;
                }
                break;
            case OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: {
                if (!message.includes('`ActionDetail`:') || (!isLast && (!message.includes('`OutputResponse`:') || !message.includes('\n')))) {
                    return;
                }

                console.log(
                    'AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: Message: ' +
                    message
                );

                const replacements = {
                    '\n': '',
                    "'": '"',
                    '“': '"',
                    '：': ':'
                };

                const tempMsg = message.substring(0, message.indexOf('`OutputResponse`:'));

                const regExp = new RegExp(Object.keys(replacements).join("|"), "g");

                let decodeSubMsg = tempMsg;
                if (tempMsg.includes('[') && tempMsg.includes(']')) {
                    decodeSubMsg = tempMsg.substring(tempMsg.indexOf('['), tempMsg.lastIndexOf(']') + 1).trim();
                }

                try {
                    this.operatePCContext.actionDetail = JSON.parse(decodeSubMsg.replace(regExp, (matched) => replacements[matched]));
                } catch (err) {
                    if (decodeSubMsg.startsWith("[{") && decodeSubMsg.endsWith("}]")) {
                        decodeSubMsg = '[' + decodeSubMsg.substring(2, decodeSubMsg.length - 2) + ']';
                        this.operatePCContext.actionDetail = JSON.parse(decodeSubMsg.replace(regExp, (matched) => replacements[matched]));
                    } else {


                        const lines = decodeSubMsg.split('\n').filter(line => line.trim() !== '');
                        const result = {};

                        console.log('AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: Decoding decodeSubMsg: ', decodeSubMsg, ' lines: ', lines);
                        lines.forEach(line => {
                            console.log('AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: Decoding line: ', line);
                            let [key, value] = line.split(':').map(part => part.trim());
                            console.log('AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: Decoding key: ', key, ' value: ', value, ' Includes: ', key.includes('- '));

                            if (key.includes('- ')) {
                                key = key.replace('- ', '').trim();
                            }

                            console.log('AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: After Decoding key: ', key, ' value: ', value);

                            result[key] = value;
                        });

                        console.log('AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: After Decoding result: ', result);

                        this.operatePCContext.actionDetail = result;
                    }
                }

                message = message.substring(message.indexOf('`OutputResponse`:'));

                console.log(
                    'AIManager: handleChatResponse: OPERATION_STAGE.STAGE_DECODE_ACTION_DETAIL: this.operatePCContext.actionType: ActionDetail: ', this.operatePCContext.actionDetail,
                    ' MessageRemain: ' + message
                );

                this.operatePCContext.stage = OPERATION_STAGE.STAGE_DECODE_OUTPUT;
                this.operatePCContext.streamChunkMsg = '';

                if (message !== '') {
                    this.chatResponseMsg = message;
                    this._decodeOperateActionData(requestId, message, isLast, messageType);
                    return;
                }
                break;
            }
            case OPERATION_STAGE.STAGE_DECODE_OUTPUT: {

                let chunkedMsg = '';
                if (message.includes('`OutputResponse`:')) {
                    this.operatePCContext.actionOutput = message.substring(message.indexOf('`OutputResponse`:') + 17);
                    if (this.operatePCContext.actionOutput === '') {
                        this.operatePCContext.actionOutput = ' ';
                    }
                    this.operatePCContext.streamChunkMsg = '';
                    message = '';
                    chunkedMsg = '';
                } else if (this.operatePCContext.actionOutput !== '') {
                    this.operatePCContext.actionOutput += message;
                    chunkedMsg = message;
                    message = '';
                }

                if (messageType === CHUNK_MSG_TYPE.ANSWER) {
                    this.operatePCContext.streamChunkMsg += chunkedMsg;
                }
                break;
            }
        }

        this.chatResponseMsg = message;
    }

    async _sendAudioDataToServer() {
        if (this.lastProcessedAudioIdx >= this.audioDataArray.length) return

        const frameData = this.audioDataArray[this.lastProcessedAudioIdx]

        try {
            await this.ttsEngineAdapter.sendAudioData(this.currentRequestId, frameData, false)
        } catch (err) {
            console.log('sendAudioDataToServer: error: ', err)
        }

        this.lastProcessedAudioIdx += 1

        if (this.lastProcessedAudioIdx >= this.audioDataArray.length && this.audioDataFinished) {
            await this.ttsEngineAdapter.sendAudioData(this.currentRequestId, null, true)
            clearInterval(this.audioSendTimer);
            this.audioSendTimer = undefined
            this.audioDataArray = []
            this.lastProcessedAudioIdx = 0
        } else if (this.audioSendTimer === undefined) {
            this.audioSendTimer = setInterval(() => {
                this._sendAudioDataToServer()
            }, 40)

        }
    }

    _splitBySize(dataView, size) {
        let result = []; // 存放拆分后的结果

        for (let i = 0; i < dataView.byteLength; i += size) {
            let startIndex = i;
            let endIndex = Math.min(i + size, dataView.byteLength);

            let subArrayBuffer = dataView.buffer.slice(startIndex, endIndex);
            let subDataView = new DataView(subArrayBuffer);

            result.push(subDataView);
        }

        return result;
    }

    _playAlertTone(toneName) {
        const toneInfo = this.alterToneMap.get(toneName);
        console.log('AIManager: playAlertTone: ' + toneName + ' toneInfo: ', toneInfo);

        if (!toneInfo || toneInfo.playerId === undefined) return;


        this.appManager.windowManager.mainWindow.win.webContents.send('DoAudioAction', {
            playerId: toneInfo.playerId,
            audioAction: Constants.AUDIO_ACTION_PLAY_RESTART,
            audioFade: '0-0'
        });
    }

    _getAnimationResourceId(name) {
        const animationResourceInfo = this.aiSessionResourceMap.get(name);
        if (animationResourceInfo !== undefined) {
            return animationResourceInfo.id;
        }
        console.log('AIManager: getAnimationResourceId: could not find resource for ' + name);
    }

    _getSessionState() {
        return this.aiSessionState;
    }

    _setSessionState(state) {
        console.log('AIManager: setSessionState: ' + state);

        this.aiSessionState = state;

        if (this.assistantDeviceInfo === undefined || this.assistantDeviceInfo.keyCode === undefined) {
            console.log('AIManager: setSessionState: failed. Unknown keyCode');
            return;
        }

        const processKeyCode = this.assistantDeviceInfo.keyCode;

        const deviceControlManager = this.appManager.deviceControlManager;
        switch (state) {
            case AI_SESSION_STATE_EMPTY:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_TYPE_KEY_CONFIG), processKeyCode, -2);

                this.assistantDeviceSN = '';
                this.assistantDeviceInfo = undefined;
                this.aiAssistantRequestId = undefined;

                this._resetOperatePCContext();

                this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG);
                break;
            case AI_SESSION_STATE_ONGOING:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_TYPE_KEY_CONFIG), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -2);
                break;
            case AI_SESSION_STATE_PROCESSING:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_TYPE_KEY_CONFIG), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -2);
                break;
            case AI_SESSION_STATE_IDLE:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_TYPE_KEY_CONFIG), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this._getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -2);
                break;
        }
    }

    _notifyDeviceConfigChange(serialNumber, resourceId, configIdx) {
        if (!this.appManager || !this.appManager.windowManager || !this.appManager.windowManager.mainWindow
            || !this.appManager.windowManager.mainWindow.win) {
            return;
        }
        this.appManager.windowManager.mainWindow.win.webContents.send('DeviceProfileChange', {
            serialNumber: serialNumber,
            resourceId: resourceId,
            configIdx: configIdx
        });
    }

    async _convertConfigDataToProtocolConfig(newConfigData, oldConfig, isModify = false) {
        const deviceLayoutConfig = this.appManager.deviceControlManager.getDeviceBasicConfig(this.assistantDeviceSN);

        let maxKeySupport = 6, maxRow = 2, maxCol = 3;
        try {
            if (deviceLayoutConfig !== undefined && deviceLayoutConfig.keyMatrix !== undefined) {
                maxRow = deviceLayoutConfig.keyMatrix.row;
                maxCol = deviceLayoutConfig.keyMatrix.col;
                maxKeySupport = maxRow * maxCol;
            }
        } catch (err) {
            console.log('convertConfigDataToProtocolConfig: Failed to get device key matrix info. Use default.');
        }
        console.log('AIManager: convertConfigDataToProtocolConfig: maxKeySupport: ' + maxKeySupport + ' maxRow: ' + maxRow + ' maxCol: ' + maxCol);

        if (oldConfig === undefined) {
            oldConfig = this._getEmptyConfigList(maxRow, maxCol);
            console.log('AIManager: convertConfigDataToProtocolConfig: generated new config data: ' + JSON.stringify(oldConfig));
        }

        console.log('AIManager: convertConfigDataToProtocolConfig: before convert Old: ' + JSON.stringify(oldConfig) + '\n New: ' + JSON.stringify(newConfigData));

        let haveNewConfig = false;

        for (let i = 0; i < oldConfig.length; i++) {

            const keyCode = oldConfig[i].keyCode;

            if (keyCode === '0,1') continue;

            if (oldConfig[i].config.type === 'pageUp' || oldConfig[i].config.type === 'pageDown'
                    || oldConfig[i].config.type === 'back') {
                continue;
            }

            let newConfigItem = newConfigData[keyCode];
            if (newConfigItem === undefined) {
                newConfigItem = newConfigData[keyCode.replace(',', '_')];
            }

            // console.log('AIManager: convertConfigDataToProtocolConfig: ConfigData for ' + keyCode + " Data: " +JSON.stringify(newConfigItem));

            if (!newConfigItem) {
                if (isModify) {
                    continue;
                }

                oldConfig[i].childrenName = '';
                oldConfig[i].config = {
                    type: '',
                    title: {
                        text: '',
                        pos: 'bot',
                        size: 8,
                        color: '#FFFFFF',
                        display: true,
                        style: 'bold|italic|underline',
                        resourceId: ''
                    },
                    icon: '',
                    actions: []
                };
                continue;
            }

            haveNewConfig = true;

            try {
                const convertedData = await this._convertActionItemData(oldConfig[i], newConfigItem, keyCode);
                oldConfig[i] = convertedData[0];
                newConfigItem = convertedData[1];
            } catch (err) {
                console.log('AIManager: _convertActionItemData: detected err ', err);
                throw err;
            }


            if (newConfigItem.config.subActions) {
                delete newConfigItem.config.actions;
                oldConfig[i].config.subActions = newConfigItem.config.subActions;
            } else if (newConfigItem.config.actions) {
                oldConfig[i].config.actions = newConfigItem.config.actions.map(item => {
                    return {
                        type: item.operationName,
                        value: item.operationValue
                    };
                });
            } else {
                oldConfig[i].config.actions = [];
            }
        }

        // Clean all configs when user request
        if (!haveNewConfig) {
            const backConfig = oldConfig.find(oldConfigInfo => oldConfigInfo.config.type === 'back');

            oldConfig = this._getEmptyConfigList(maxRow, maxCol);

            if (backConfig) {
                oldConfig[0] = backConfig;
            }
        }

        console.log('AIManager: convertConfigDataToProtocolConfig: After convert ConfigList: ' + JSON.stringify(oldConfig));

        let haveKnobData = false;
        oldConfig = oldConfig.map(configInfo => {
            if (configInfo.config.type === '') {
                configInfo.config.icon = '';
            }

            if (!haveKnobData && configInfo.keyCode === '0,1') {
                haveKnobData = true;
            }

            return configInfo;
        });

        if (!haveKnobData) {
            oldConfig.push(tempAssistantObj);
        }

        console.log('AIManager: convertConfigDataToProtocolConfig: Final convert ConfigList: ' + JSON.stringify(oldConfig));

        return oldConfig;
    }

    async _convertActionItemData(oldConfigItem, newConfigItem, keyCode) {
        oldConfigItem.childrenName = newConfigItem.config.functionType;
        oldConfigItem.config.type = newConfigItem.config.functionType;
        oldConfigItem.config.title.text = newConfigItem.title;

        let haveAIIcon = false;
        if (newConfigItem.icon && newConfigItem.icon !== '' && newConfigItem.icon.startsWith('mdi-')) {
            const mdiIconName = newConfigItem.icon.substring(4);
            console.log('AIManager: ai return MDI icon: ', mdiIconName, ' newConfigItem.config.functionType: ', newConfigItem.config.functionType);

            const mdiIconResId = await this.appManager.resourcesManager.getMDIIconResIdByName(mdiIconName);

            if (mdiIconResId !== '-1') {
                oldConfigItem.config.icon = mdiIconResId;
                haveAIIcon = true;
            }
        }

        if (!haveAIIcon) {
            if (oldConfigItem.config.icon === undefined || oldConfigItem.config.icon === ''
                || oldConfigItem.config.icon.startsWith('0-')) {
                if (newConfigItem.config.functionType) {
                    oldConfigItem.config.icon = this.configToResIdMap.get(newConfigItem.config.functionType);
                } else {
                    oldConfigItem.config.icon = '';
                }
            }
        }

        switch (newConfigItem.config.functionType) {
            case 'hotkey':
            case 'hotkeySwitch':
                newConfigItem.config.actions = newConfigItem.config.actions.map(actionItem => {
                    if (actionItem.operationName === 'key' ) {
                        let hotKeyValue = actionItem.operationValue.toLowerCase().trim();
                        if (hotKeyValue === 'ctrl') {
                            hotKeyValue = hotKeyValue.replace('ctrl', 'control');
                            actionItem.operationValue = hotKeyValue;
                            return actionItem;
                        }

                        if (hotKeyValue === 'windows') {
                            hotKeyValue = hotKeyValue.replace('windows', 'command');
                            actionItem.operationValue = hotKeyValue;
                            return actionItem;
                        }

                        if (hotKeyValue === 'win') {
                            hotKeyValue = hotKeyValue.replace('win', 'command');
                            actionItem.operationValue = hotKeyValue;
                            return actionItem;
                        }

                        if (hotKeyValue.endsWith('esc')) {
                            hotKeyValue = hotKeyValue.replace('esc', 'escape');
                            actionItem.operationValue = hotKeyValue;
                            return actionItem;
                        }

                        if (hotKeyValue.includes('ctrl+')) {
                            hotKeyValue = hotKeyValue.replace('ctrl+', 'control+');
                        }

                        if (hotKeyValue.includes('+ctrl')) {
                            hotKeyValue = hotKeyValue.replace('+ctrl', '+control');
                        }

                        if (hotKeyValue.includes('windows+')) {
                            hotKeyValue = hotKeyValue.replace('windows+', 'command+');
                        }

                        if (hotKeyValue.includes('+windows')) {
                            hotKeyValue = hotKeyValue.replace('+windows', '+command');
                        }

                        if (hotKeyValue.includes('win+')) {
                            hotKeyValue = hotKeyValue.replace('win+', 'command+');
                        }

                        if (hotKeyValue.includes('+win')) {
                            hotKeyValue = hotKeyValue.replace('+win', 'command+');
                        }

                        actionItem.operationValue = hotKeyValue;

                    }
                    return actionItem;
                });

                if (newConfigItem.config.functionType === 'hotkeySwitch') {
                    if (oldConfigItem.config.alterIcon === undefined || oldConfigItem.config.alterIcon === ''
                        || oldConfigItem.config.alterIcon.startsWith('0-')) {
                        oldConfigItem.config.alterIcon = this.configToResIdMap.get(newConfigItem.config.functionType + 'Alter');
                    }
                    if (oldConfigItem.config.alterTitle === undefined) {
                        oldConfigItem.config.alterTitle = oldConfigItem.config.title;
                    }
                }
                break;
            case 'media':
            case 'multimedia':

                oldConfigItem.childrenName = 'media';
                oldConfigItem.config.type = 'media';

                newConfigItem.config.actions = newConfigItem.config.actions.map(actionItem => {
                    if (actionItem.operationName !== 'key') {
                        actionItem.operationName = 'key';
                    }
                    return actionItem;
                });
                break;
            case 'multiActions': {
                if (!newConfigItem.config.subActions && !newConfigItem.config.actions) break;

                let configActions = [];
                if (newConfigItem.config.actions[0].operationName && newConfigItem.config.actions[0].operationName === 'subActions') {
                    configActions = newConfigItem.config.actions[0].operationValue;
                } else if (newConfigItem.config.actions[0].subActions) {
                    configActions = newConfigItem.config.actions[0].subActions;
                } else {
                    configActions = newConfigItem.config.actions;
                }

                newConfigItem.config.subActions = [];
                for (let i = 0; i < configActions.length; i++) {
                    const subActionInfo = configActions[i];
                    subActionInfo.config = deepCopy(subActionInfo);

                    if (!subActionInfo.config.title) {
                        subActionInfo.config.title = {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: ''
                        }
                    }
                    if (!subActionInfo.config.icon) {
                        subActionInfo.config.icon = ''
                    }

                    if (!subActionInfo.title) {
                        subActionInfo.title = '';
                    } else {
                        subActionInfo.config.title = {
                            text: subActionInfo.title,
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: ''
                        }
                    }

                    subActionInfo.config.functionType = subActionInfo.config.config.functionType;
                    subActionInfo.config.actions = subActionInfo.config.config.actions;

                    subActionInfo.config.gap = 100;
                    subActionInfo.config.pressTime = 100;
                    subActionInfo.isMultiAction = true;
                    subActionInfo.multiActionIndex = i;
                    subActionInfo.multiActionsKeyCode = keyCode;

                    console.log('AIManager: _convertActionItemData: Before process subActionInfo: ' + JSON.stringify(subActionInfo));

                    const convertedData = await this._convertActionItemData(subActionInfo, subActionInfo, keyCode);

                    const newConfigData = convertedData[0];

                    if (newConfigData.config.config.actions) {
                        newConfigData.config.type = newConfigData.config.config.functionType;
                        newConfigData.childrenName = newConfigData.config.config.functionType;
                        newConfigData.config.actions = newConfigData.config.config.actions.map(item => {
                            return {
                                type: item.operationName,
                                value: item.operationValue
                            };
                        });
                    }

                    delete newConfigData.title;
                    delete newConfigData.icon;
                    delete newConfigData.config.config;

                    newConfigItem.config.subActions.push(newConfigData);
                }
                delete newConfigItem.config.actions;

                console.log('AIManager: _convertActionItemData: After process multi action: final newConfigItem: ' + JSON.stringify(newConfigItem));
                break;
            }
            case 'open':
            case 'close':
            case 'openApplication':
            case 'closeApplication': {
                if (!newConfigItem.config.actions || newConfigItem.config.actions.length < 1 || newConfigItem.config.actions[0].operationName !== 'appName' || newConfigItem.config.actions[0].operationValue.length < 1) break;

                let processApplicationInfo = undefined;
                newConfigItem.config.actions[0].operationValue.forEach(requestAppName => {
                    const appInfo = this._findAppInfo(requestAppName);

                    if (appInfo === undefined) return;

                    if (processApplicationInfo === undefined) {
                        processApplicationInfo = appInfo;
                        return;
                    }

                    if (appInfo.levenshteinDistance < processApplicationInfo.levenshteinDistance) {
                        processApplicationInfo = appInfo;
                    }
                });

                const isClose = newConfigItem.config.functionType === 'closeApplication' || newConfigItem.config.functionType === 'close';

                oldConfigItem.childrenName = isClose ? 'close' : 'open';
                oldConfigItem.config.type = isClose ? 'close' : 'open';

                if (processApplicationInfo === undefined) {
                    let recentAppInfo = undefined;

                    const recentApps = await this._getRecentApps();
                    if (recentApps && recentApps.length > 0) {
                        newConfigItem.config.actions[0].operationValue.forEach(requestAppName => {
                            const appInfo = recentApps.find(recentAppInfo => recentAppInfo.name === requestAppName);

                            if (appInfo !== undefined) {
                                recentAppInfo = appInfo;
                            }
                        });
                    }

                    if (recentAppInfo !== undefined) {
                        const appExeIconInfo = (await this.appManager.resourcesManager.getAppIconInfo(recentAppInfo.path));

                        if (appExeIconInfo !== undefined && appExeIconInfo.id !== undefined) {
                            oldConfigItem.config.icon = appExeIconInfo.id;
                        }
                    }

                    newConfigItem.config.actions = [{
                        operationName: 'path',
                        operationValue: (recentAppInfo === undefined ? "" : recentAppInfo.path)
                    }];
                } else {
                    newConfigItem.config.actions = [{
                        operationName: 'path',
                        operationValue: processApplicationInfo.appInfo.appLaunchPath
                    }];

                    const appExeIconInfo = (await this.appManager.resourcesManager.getAppIconInfo(processApplicationInfo.appInfo.appLaunchPath));

                    if (appExeIconInfo !== undefined && appExeIconInfo.id !== undefined) {
                        oldConfigItem.config.icon = appExeIconInfo.id;
                    }

                }
                console.log('AIManager: _convertActionItemData: after check app info: oldConfigItem: ', oldConfigItem);

                if (isClose) {
                    newConfigItem.config.actions.push({
                        operationName: 'force',
                        operationValue: 1
                    });
                }
                break;
            }
            case 'openSystemApplication':
            case 'closeSystemApplication': {
                if (!newConfigItem.config.actions || newConfigItem.config.actions.length < 1 || newConfigItem.config.actions[0].operationName !== 'cmdLine' || newConfigItem.config.actions[0].operationValue.length < 1) break;

                let cmdLine = newConfigItem.config.actions[0].operationValue;

                if (cmdLine === undefined) {
                    cmdLine = '';
                }

                if (cmdLine !== '' && cmdLine !== ' ') {
                    if (newConfigItem.config.functionType === 'openSystemApplication') {

                        switch (process.platform) {
                            case 'win32':
                                if (!cmdLine.startsWith('start ')) {

                                    if (cmdLine === 'ms-settings') {
                                        cmdLine += ':';
                                    }

                                    cmdLine = 'start ' + cmdLine;
                                }
                                break;
                            case 'darwin':
                                // TODO: MacOS cmd fix check
                                break;
                            case 'linux':
                                // TODO: Linux cmd fix check
                                break;
                        }
                    } else {
                        switch (process.platform) {
                            case 'win32':
                                if (!cmdLine.includes(' /f ') && !cmdLine.endsWith('/f')) {
                                    cmdLine += ' /f';
                                }
                                break;
                            case 'darwin':
                                // TODO: MacOS cmd fix check
                                break;
                            case 'linux':
                                if (!cmdLine.includes(' -9 ')) {
                                    cmdLine += ' -9';
                                }
                                break;
                        }

                    }
                }


                oldConfigItem.childrenName = 'cmd';
                oldConfigItem.config.type = 'cmd';

                newConfigItem.config.actions = [{
                    operationName: 'text',
                    operationValue: cmdLine
                }];
                break;
            }
            case 'cmd': {
                if (!newConfigItem.config.actions || newConfigItem.config.actions.length < 1 || newConfigItem.config.actions[0].operationName !== 'cmdLine' || newConfigItem.config.actions[0].operationValue.length < 1) break;

                let cmdLine = newConfigItem.config.actions[0].operationValue;

                if (cmdLine === undefined) {
                    cmdLine = '';
                }

                newConfigItem.config.actions = [{
                    operationName: 'text',
                    operationValue: cmdLine
                }];
                break;
            }
        }

        return [oldConfigItem, newConfigItem];
    }

    async _handleUserRequestActions(requestId, requestFunction, actionDetail, actionOutput, isLastAction) {
        let processApplicationInfo = undefined;
        let processSystemAppInfo = undefined;
        let applicationUrl = '';
        let applicationName = '';
        requestFunction = requestFunction.replace(':', '');

        switch (requestFunction) {
            default:
                this.operatePCContext.actionProcessDone = true;
                this.operatePCContext.streamChunkMsg = '';
                this.isPendingChatFinish = false;
                this.setAssistantProcessDone();
                break;
            case AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION:
                if (actionDetail.length === 0) break;
                console.log('AIManager: handleUserRequestActions: OPEN_APPLICATION Do user action: ', actionDetail);

                if (Object.prototype.toString.call(actionDetail) !== '[object Array]') {
                    actionDetail = Object.values(actionDetail);
                }

                actionDetail.forEach(requestAppName => {
                    if (requestAppName.startsWith('OpenSystemApp: ')) {
                        processSystemAppInfo = {
                            actionType: 1,
                            name: requestAppName,
                            command: requestAppName.substring(requestAppName.indexOf(': ') + 2)
                        }
                        return;
                    }

                    if (isURL(requestAppName.trim())) {
                        applicationUrl = requestAppName.trim();
                        return;
                    }

                    const appInfo = this._findAppInfo(requestAppName);
                    if (appInfo === undefined) return;

                    if (processApplicationInfo === undefined) {
                        processApplicationInfo = appInfo;
                        return;
                    }

                    if (appInfo.levenshteinDistance < processApplicationInfo.levenshteinDistance) {
                        processApplicationInfo = appInfo;
                    }
                });
                console.log('AIManager: handleUserRequestActions: Found AppInfo for APPINFO: ', processApplicationInfo, ' ProcessSystemAppInfo: ', processSystemAppInfo);
                if (processApplicationInfo !== undefined || processSystemAppInfo !== undefined) {
                    if (processSystemAppInfo !== undefined) {
                        if (!processSystemAppInfo.command.startsWith('start ')) {

                            if (processApplicationInfo !== undefined) {
                                this._openApplication(processApplicationInfo.appInfo.appLaunchPath);
                                this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.openingApplication') + processApplicationInfo.appInfo.DisplayName);
                                return;
                            }

                            if (processSystemAppInfo.command === 'ms-settings') {
                                processSystemAppInfo.command += ':';
                            }

                            processSystemAppInfo.command = 'start ' + processSystemAppInfo.command;
                        }
                        this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.openingApplication'));
                        this._openApplication(undefined, processSystemAppInfo.command);
                        break;
                    }

                    this._openApplication(processApplicationInfo.appInfo.appLaunchPath);
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.openingApplication') + processApplicationInfo.appInfo.DisplayName);
                    break;
                } else if (applicationUrl !== '') {

                    if (actionDetail.length > 1) {
                        applicationName = actionDetail[0];
                    }

                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.openingApplication') + applicationName);
                    shell.openExternal(applicationUrl);
                    break;
                }
                this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.applicationNotFound'));
                break;
            case AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION:
                if (actionDetail.length === 0) break;
                console.log('AIManager: handleUserRequestActions: CLOSE_APPLICATION Do user action: ' + actionDetail);

                if (Object.prototype.toString.call(actionDetail) !== '[object Array]') {
                    actionDetail = Object.values(actionDetail);
                }

                actionDetail.forEach(requestAppName => {
                    if (requestAppName.startsWith('CloseSystemApp: ')) {
                        const regExp = new RegExp(' ', "g");
                        let newReqAppName = requestAppName.replace('CloseSystemApp: ', '');
                        if (newReqAppName.startsWith('taskkill ')) {
                            newReqAppName = newReqAppName.replace('taskkill ', '');
                        }

                        if (newReqAppName.includes('/im ')) {
                            newReqAppName = newReqAppName.replace('/im ', '');
                        }

                        if (newReqAppName.includes('/IM ')) {
                            newReqAppName = newReqAppName.replace('/IM ', '');
                        }
                        processSystemAppInfo = {
                            actionType: 0,
                            name: newReqAppName.replace(regExp, ''),
                            command: requestAppName
                        }
                        return;
                    }

                    const appInfo = this._findAppInfo(requestAppName);
                    if (appInfo === undefined) return;

                    if (processApplicationInfo === undefined) {
                        processApplicationInfo = appInfo;
                        return;
                    }

                    if (appInfo.levenshteinDistance < processApplicationInfo.levenshteinDistance) {
                        processApplicationInfo = appInfo;
                    }
                });
                console.log('AIManager: handleUserRequestActions: Found AppInfo for APPINFO: ', processApplicationInfo, ' ProcessSystemAppInfo: ', processSystemAppInfo);
                if (processApplicationInfo === undefined && processSystemAppInfo === undefined) {
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.applicationNotFound'));
                } else {
                    if (processSystemAppInfo !== undefined) {
                        this._closeApplication(requestId, undefined, processSystemAppInfo.name);
                        break;
                    }
                    this._closeApplication(requestId, processApplicationInfo.appInfo.appLaunchPath);
                }
                break;
            case AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT:
                if (actionDetail.length === 0) break;

                if (!this.operatePCContext.writeProcessStart) {
                    this.operatePCContext.writeProcessStart = true;
                }

                if ((this.operatePCContext.streamChunkMsg && this.operatePCContext.streamChunkMsg.length >= 30) || isLastAction) {
                    const outputDetail = actionDetail[0];
                    if (outputDetail.outputFormat) {
                        if (outputDetail.outputFormat === 'cursor') {
                            this._writeOutputToKeyInput(this.operatePCContext.streamChunkMsg);
                            this.operatePCContext.streamChunkMsg = '';
                        }
                    }
                }
                if (isLastAction) {
                    console.log('AIManager: handleUserRequestActions: WRITE_TO_DOCUMENT: actionDetail: ', actionDetail, ' actionOutput: ', actionOutput);

                    if (actionDetail[0].outputFormat !== 'cursor') {
                        await this._markdownToDoc(this.operatePCContext.streamChunkMsg);
                    }

                    this.operatePCContext.streamChunkMsg = '';
                    this.operatePCContext.actionProcessDone = true;
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.finishedOutput'));
                    this.isPendingChatFinish = false;
                }
                break;
            case AI_SUPPORT_FUNCTIONS.GENERATE_REPORT:
                if (actionDetail.length === 0) break;

                if (!this.operatePCContext.writeProcessStart) {
                    this.operatePCContext.writeProcessStart = true;
                }

                if (isLastAction) {
                    console.log('AIManager: handleUserRequestActions: GENERATE_REPORT: actionDetail: ', actionDetail, ' actionOutput: ', actionOutput);

                    await this._markdownToDoc(this.operatePCContext.streamChunkMsg);

                    this.operatePCContext.streamChunkMsg = '';
                    this.operatePCContext.actionProcessDone = true;
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.finishedOutput'));
                    this.isPendingChatFinish = false;
                }
                break;
            case AI_SUPPORT_FUNCTIONS.EXECUTE_CMD: {

                let actionData = actionDetail;

                if (actionDetail instanceof Array) {
                    if (actionDetail.length === 0) break;
                    actionData = actionDetail[0];
                }

                if (!isLastAction) break;
                console.log('AIManager: handleUserRequestActions: EXECUTE_CMD Do user action: ' + actionData);

                // eslint-disable-next-line
                exec(actionData.cmdLine, (error, stdout, stderr) => {
                    if (error) {
                        console.log('AIManager: handleUserRequestActions: EXEC shutdown error');
                    } else {
                        this.operatePCContext.actionProcessDone = true;
                        this.ttsEngineAdapter.playTTS(requestId, actionData.greetingMessage);
                        this.isPendingChatFinish = false;
                    }
                });

                break;
            }

        }
    }

    async _markdownToDoc(mdContent) {

        mdContent = mdContent.trim();

        // if (mdContent.startsWith('```')) {
        //     mdContent = mdContent.substring(3);
        // }
        //
        // if (mdContent.endsWith('```')) {
        //     mdContent = mdContent.substring(0, mdContent.length - 3);
        // }

        // const htmlFragment = marked.parse(this.operatePCContext.streamChunkMsg);
        if (this.markdownConverter === undefined) {
            this.markdownConverter = new showdown.Converter({
                tables: true,
                simpleLineBreaks: true,
                tasklists: true,
                simplifiedAutoLink: true,
                headerLevelStart: 3,
                completeHTMLDocument: true,
                emoji: true,
                underline: true,
                moreStyling: true
            });
            this.markdownConverter.setFlavor('github');
        }
        const htmlFragment = this.markdownConverter.makeHtml(mdContent);

        console.log('AIManager: handleUserRequestActions: GENERATE_REPORT: htmlFragment: ', htmlFragment);

        const docxBlob = htmlDocx.asBlob(htmlFragment);

        const pcDocumentPath = app.getPath('documents');

        const outputPath = path.join(pcDocumentPath, 'DecoKeeAI-Generated-' + Date.now() + '.docx');

        const buffer = Buffer.from(await docxBlob.arrayBuffer());

        fs.writeFileSync(outputPath, buffer);

        setTimeout(() => {
            shell.openPath(outputPath);
        }, 300);
    }

    _openApplication(applicationPath, execCmd) {
        if (execCmd !== undefined) {
            // eslint-disable-next-line
            exec(execCmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`AIManager: openApplication: exec error: ${error}`);
                }
            });
            return;
        }
        shell.openPath(applicationPath).then(res => {
            console.log('AIManager: openApplication: OpenApplication ret: ' + JSON.stringify(res));
            setTimeout(() => {
                this._bringApplicationToFront(applicationPath);
            }, 1000);
        }).catch(err => {
            console.log('AIManager: openApplication: OpenApplication err: ' + JSON.stringify(err));
        });
    }

    _bringApplicationToFront(applicationPath) {
        let bringToFrontScript = '', script = '', appName;
        switch (process.platform) {
            case 'win32':
                appName = path.basename(applicationPath, '.exe');

                script = `
                        $mainWindowHandle = (Get-Process -Name '${appName}').MainWindowHandle;
                        Add-Type -Name User32 -Namespace Win32 -MemberDefinition @"
                            [DllImport("user32.dll")]
                            public static extern bool SetForegroundWindow(IntPtr hWnd);
                "@
                        [Win32.User32]::SetForegroundWindow($mainWindowHandle);
                    `;

                console.log('AIManager: _bringApplicationToFront: AppPath: ' + applicationPath + ' AppName: ' + appName + ' Script: ' + script);
                bringToFrontScript = 'powershell -Command "' + script + '"';
                break;
            case 'darwin':
                script = 'tell application "System Events" to set frontmost of process "' + applicationPath + '" to true';
                bringToFrontScript = 'osascript -e \'' + script;
                break;
            case 'linux':
                bringToFrontScript = 'xdotool search --onlyvisible --name "' + applicationPath + '" windowactivate';
                break;
            default:
                console.error('Unsupported platform');
                return;
        }

        console.log('AIManager: _bringApplicationToFront: bringToFrontScript: ' + bringToFrontScript);

        exec(bringToFrontScript, (wmError, wmStdout, wmStderr) => {
            if (wmError) {
                console.error(`AIManager: _bringApplicationToFront: Error setting foreground window: ${wmError.message}   wmStdout: ${wmStdout} wmStderr: ${wmStderr}`);
            } else {
                console.log(`AIManager: _bringApplicationToFront: Application ${applicationPath} opened and set to foreground. wmStdout: ${wmStdout} wmStderr: ${wmStderr}`);
            }
        });
    }

    _closeApplication(requestId, applicationPath, execName) {

        if (execName !== undefined) {
            if (!execName.toLowerCase().endsWith('.exe')) {
                execName = execName + '.exe';
            }

            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.closingApplication'));

            // 强制关闭进程
            // eslint-disable-next-line
            exec(`taskkill /F /im ${execName}`, (err, stdout, stderr) => {
                if (err) {
                    console.error('AIManager: closeApplication: exec error: ', err);
                    return;
                }
                console.log('AIManager: closeApplication: Process has been killed forcefully!');
            });
            return;
        }


        let exeName = '';
        exeName = applicationPath.split('\\').pop();
        if (!exeName || exeName === '') {
            exeName = applicationPath.split('/').pop();
        }

        if (!exeName || exeName === '') {
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.applicationNotFound'));
            return;
        }

        // eslint-disable-next-line
        exec('tasklist | findstr ' + exeName, (error, stdout, stderr) => {
            if (error) {
                this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.applicationNotFound'));
                console.error('AIManager: closeApplication: exec error: ', error);
                return;
            }

            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.closingApplication'));
            const pid = stdout.split(/\s+/)[1]; // 根据 tasklist 的输出格式获取 PID
            console.log('AIManager: closeApplication: pid ', pid, ' for ', applicationPath, ' processName: ', exeName);

            // 强制关闭进程
            // eslint-disable-next-line
            exec(`taskkill /F /PID ${pid}`, (err, stdout, stderr) => {
                if (err) {
                    console.log('AIManager: closeApplication: exec error: ', err);
                    return;
                }
                console.log('AIManager: closeApplication: Process has been killed forcefully!');
            });
        });
    }

    _findAppInfo(requestApplicationName) {

        const pcInstalledApps = this.appManager.resourcesManager.getInstalledApps();

        if (pcInstalledApps.length === 0) return undefined;

        let mostPossibleApp = undefined;
        let minDistance = Infinity;

        let mostPossibleAppByIdentifier = undefined;
        let minDistanceByIdentifier = Infinity;

        pcInstalledApps.forEach(applicationInfo => {
            const displayNameDistance = levenshtein.get(requestApplicationName, applicationInfo.DisplayName);

            if (applicationInfo.DisplayName.toLowerCase().includes(requestApplicationName.toLowerCase()) && displayNameDistance < minDistance) {
                console.log('AIManager: findAppInfo: Distance for Req: ' + requestApplicationName + ' And: ' + applicationInfo.DisplayName + ' Distance: ' + displayNameDistance);
                minDistance = displayNameDistance;
                mostPossibleApp = applicationInfo;
            }

            const appIdentifierNameDistance = levenshtein.get(requestApplicationName, applicationInfo.appIdentifier);

            if (applicationInfo.appIdentifier.toLowerCase().includes(requestApplicationName.toLowerCase()) && appIdentifierNameDistance < minDistanceByIdentifier) {
                console.log('AIManager: findAppInfo: Distance for Req: ' + requestApplicationName + ' And: ' + applicationInfo.appIdentifier + ' Distance: ' + appIdentifierNameDistance);
                minDistanceByIdentifier = appIdentifierNameDistance;
                mostPossibleAppByIdentifier = applicationInfo;
            }
        });
        if (mostPossibleApp === undefined && mostPossibleAppByIdentifier === undefined) return undefined;

        return {
            appInfo: mostPossibleApp !== undefined ? mostPossibleApp : mostPossibleAppByIdentifier,
            levenshteinDistance: mostPossibleApp !== undefined ? minDistance : minDistanceByIdentifier
        };
    }

    async _handleAIAssistantProcess(requestId, message, deviceActiveProfile, deviceLayoutConfig) {

        console.log('AIManager: handleAIAssistantProcess: requestId: ' + requestId + ' LastChatRequestId: ' + this.aiAssistantRequestId);
        let isNewSession = false;
        if (requestId !== this.aiAssistantRequestId) {
            this._resetAssistantSession(this.assistantDeviceSN, false);
            isNewSession = true;
            this.fullChatResponseMsg = '';
        }

        this.aiAssistantRequestId = requestId;
        // console.log('AIManager: handleAIAssistantProcess: deviceCurrentProfileData: ' + JSON.stringify(deviceActiveProfile));

        let chatMsgs = []
        const currentLanguage = this.appManager.storeManager.storeGet('system.locale');
        let params = {};

        let aiEngineType;
        switch (this.aiAssistantModelType) {
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
                aiEngineType = AI_ENGINE_TYPE.QWenChat;
                break
            case 'glm-3-turbo':
            case 'glm-4':
            case 'glm-4-0520':
            case 'glm-4-air':
            case 'glm-4-airx':
            case 'glm-4-flash':
                aiEngineType = AI_ENGINE_TYPE.ZhiPuChat;
                break
            case 'spark3.5':
            case 'spark3.5-max':
            case 'spark-pro':
            case 'spark4-ultra':
                aiEngineType = AI_ENGINE_TYPE.XYF;
                break
            case 'gpt-4o':
            case 'gpt-4o-mini':
            case 'gpt-4-turbo':
            case 'gpt-4':
            case 'gpt-3.5-turbo':
                aiEngineType = AI_ENGINE_TYPE.OpenAI;
                break
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
                aiEngineType = AI_ENGINE_TYPE.GroqChat;
                break
            default:
                if (this.aiAssistantModelType.startsWith('HuoShan-')) {
                    aiEngineType = AI_ENGINE_TYPE.HuoShan;
                } else if (this.aiAssistantModelType.startsWith('Coze-')) {
                    aiEngineType = AI_ENGINE_TYPE.Coze;
                } else {
                    aiEngineType = AI_ENGINE_TYPE.CustomEngine;
                }
                break
        }

        let requestModelName = this.aiAssistantModelType;

        let useDekiePrompt = true;
        if (this.aiAssistantModelType.startsWith('Custom-') || this.aiAssistantModelType.startsWith('HuoShan-')) {
            const aiConfigKeyPrefix = 'aiConfig.' + this.aiAssistantModelType;
            requestModelName = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.modelName');

            const configedUseDekiePrompt = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.useDekiePrompt');

            if (configedUseDekiePrompt !== undefined) {
                useDekiePrompt = configedUseDekiePrompt;
            }

        }

        params = {
            model: requestModelName,
            messages: [],
            max_tokens: 2048,
            temperature: 0.1,
            stream: false
        }

        if (isNewSession && useDekiePrompt) {
            let preChatMsgs = getChatPrePromptMsg(message, aiEngineType);
            console.log('AIManager: handleAIAssistantProcess: PreChatMessage: ', preChatMsgs);

            params.messages = preChatMsgs;

            try {
                let preChatFrameResponse = await this._awaitWithTimeout(this.aiAssistantChatAdapter.chatWithAssistant(requestId, params), 35000);
                console.log('AIManager: handleAIAssistantProcess: preChatFrameResponse: ', preChatFrameResponse);

                preChatFrameResponse = this._getResponseDataJsonString(preChatFrameResponse);

                if (preChatFrameResponse === undefined) {
                    console.log('AIManager: handleAIAssistantProcess: invalid pre-chat response: ' + preChatFrameResponse);
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                    this.setAssistantProcessFailed();
                    this._resetAssistantSession(this.assistantDeviceSN);
                    return;
                }

                const responseConfigData = eval('(' + preChatFrameResponse + ')');

                console.log('AIManager: handleAIAssistantProcess: PreChat Response: ', responseConfigData);

                if (responseConfigData.userRequestAction === undefined) {
                    this._showAssistantError(requestId);
                    return;
                }

                if (responseConfigData.userRequestAction === "operatingComputer") {
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_OPERATE_PC);
                    this.aiAssistantChatAdapter.setChatResponseListener((requestId, status, message, messageType) => {
                        this._handleChatResponse(requestId, status, message, messageType).catch(err => {
                            console.log('AIManager: handleAIAssistantProcess: CHAT_TYPE.CHAT_TYPE_OPERATE_PC _handleChatResponse detected error: ', err);
                            this.setAssistantProcessFailed();
                            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                        });
                    });
                    chatMsgs = getPCOperationBotPrePrompt(message, aiEngineType, currentLanguage);
                } else if (responseConfigData.userRequestAction === "generateConfiguration") {
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG);
                    const recentApps = await this._getRecentApps();
                    console.log('AIManager: handleAIAssistantProcess: recentApps: ', recentApps);
                    chatMsgs = getKeyConfigBotPrePrompt(message, deviceActiveProfile, currentLanguage, aiEngineType, deviceLayoutConfig, recentApps);
                    try {
                        const processPrompt = i18nRender('assistantConfig.generatingConfig');
                        console.log('AIManager: handleAIAssistantProcess: Request PlayTTS: ' + processPrompt);
                        this.ttsEngineAdapter.playTTS(requestId, processPrompt);
                    } catch (error) {
                        console.log('AIManager: handleAIAssistantProcess: Failed to handleAIChatResponse: ', error);
                        this._showAssistantError(requestId);
                        return;
                    }
                } else {
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_NORMAL);
                    this.aiAssistantChatAdapter.setChatResponseListener((requestId, status, message, messageType) => {
                        this._handleChatResponse(requestId, status, message, messageType).catch(err => {
                            console.log('AIManager: handleAIAssistantProcess: CHAT_TYPE.CHAT_TYPE_NORMAL _handleChatResponse detected error: ', err);

                            this.setAssistantProcessFailed();
                            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                        });
                    });
                    const deviceLocationInfo = this.appManager.storeManager.storeGet('system.deviceLocationInfo');
                    chatMsgs = getNormalChatPrePrompt(message, '', deviceLocationInfo);

                }
            } catch (err) {
                console.log('AIManager: handleAIAssistantProcess: failed to connect to OpenAI server. Cancel Chat process. In Pre-Chat. Error: ' + JSON.stringify(err));
                this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                this.setAssistantProcessFailed();
                this._resetAssistantSession(this.assistantDeviceSN);
                return;
            }

        } else if (isNewSession) {
            this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_NORMAL);
            chatMsgs.push({
                role: "user",
                content: message
            });

            this.aiAssistantChatAdapter.setChatResponseListener((requestId, status, message, messageType) => {
                this._handleChatResponse(requestId, status, message, messageType).catch(err => {
                    console.log('AIManager: handleAIAssistantProcess: CHAT_TYPE.CHAT_TYPE_NORMAL _handleChatResponse detected error: ', err);

                    this.setAssistantProcessFailed();
                    this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                });
            });
        } else {
            chatMsgs = this.assistantChatHistory;
            chatMsgs.push({
                role: "user",
                content: message
            });
        }
        params.messages = chatMsgs;


        let enableWebSearch = this.appManager.storeManager.storeGet('aiConfig.webSearch');

        if (enableWebSearch === undefined) {
            enableWebSearch = true;
        }

        let webSearchPlugin = {};

        switch (aiEngineType) {
            default:
                break;
            case AI_ENGINE_TYPE.QWenChat:
                webSearchPlugin = {
                    extra_body: {
                        enable_search: enableWebSearch
                    }
                };
                break;
            case AI_ENGINE_TYPE.ZhiPuChat:
                webSearchPlugin = {
                    tools: [{
                        type: 'web_search',
                        web_search: {
                            enable: enableWebSearch,
                            search_result: true
                        }
                    }]
                };
                break;
        }

        const finalParam = Object.assign(enableWebSearch ? webSearchPlugin : {}, params);

        if (this.aiAssistantChatAdapter.getChatMode() === CHAT_TYPE.CHAT_TYPE_NORMAL) {
            delete finalParam.response_format;
            finalParam.temperature = 0.9;
            finalParam.stream = true;
            this.aiAssistantChatAdapter.chatWithAI(requestId, finalParam);
            this.assistantChatHistory = chatMsgs;
            return;
        }

        if (this.aiAssistantChatAdapter.getChatMode() === CHAT_TYPE.CHAT_TYPE_OPERATE_PC) {
            delete finalParam.response_format;
            finalParam.temperature = 0.5;
            finalParam.stream = true;
            this.aiAssistantChatAdapter.chatWithAI(requestId, finalParam);
            this.assistantChatHistory = chatMsgs;
            return;
        }

        finalParam.max_tokens = 8000;

        let chatFrameResponse = '';

        console.log('AIManager: handleAIAssistantProcess: params: ', JSON.stringify(finalParam))


        try {
            await this._handleChatResponse(requestId, 0, '');

            chatFrameResponse = await this._awaitWithTimeout(this.aiAssistantChatAdapter.chatWithAssistant(requestId, finalParam), AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);
        } catch (err) {
            this._showAssistantError(requestId);
            return;
        }
        console.log('AIManager: handleAIAssistantProcess: ', chatFrameResponse);

        chatFrameResponse = this._getResponseDataJsonString(chatFrameResponse);

        console.log('AIManager: handleAIAssistantProcess: Final Response2: ', chatFrameResponse);

        if (chatFrameResponse === undefined) {
            console.log('AIManager: handleAIAssistantProcess: invalid config info: ' + chatFrameResponse);
            chatMsgs.pop();
            this._showAssistantError(requestId);
            return;
        }

        let responseConfigData = undefined;
        try {
            responseConfigData = eval('(' + chatFrameResponse + ')');
        } catch (err) {
            console.log('AIManager: handleAIAssistantProcess: Invalid Json. Try fix.');
            params.messages = [{
                    role: "user",
                    content: '修复以下 JSON: ' + chatFrameResponse + ' \n ConfigData中每一个数据的value的格式应为: ```' + JSON.stringify(KEY_CONFIG_OBJ) + '``` 注意：我不需要你的解释，仅返回给我正确的JSON数据。'
                }]
            chatFrameResponse = await this._awaitWithTimeout(this.aiAssistantChatAdapter.chatWithAssistant(requestId, params), AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);

            console.log('AIManager: handleAIAssistantProcess: Fixed Json: ' + chatFrameResponse);

            chatFrameResponse = this._getResponseDataJsonString(chatFrameResponse);
            console.log('AIManager: handleAIAssistantProcess: getResponseDataJsonString: ' + chatFrameResponse);

            try {
                responseConfigData = eval('(' + chatFrameResponse + ')');
            } catch (err) {
                responseConfigData = undefined;
            }

            console.log('AIManager: handleAIAssistantProcess: responseConfigData: ', responseConfigData);
        }

        if (!responseConfigData) {
            console.log('AIManager: handleAIAssistantProcess: Invalid Json.')
            this._showAssistantError(requestId);
            this.chatResponseMsg = '';
            return;
        }

        this.assistantChatHistory.push({
            role: 'assistant',
            content: chatFrameResponse
        });

        try {
            await this._handleChatResponse(requestId, 2, chatFrameResponse);
        } catch (err) {
            console.log('AIManager: _handleChatResponse: detected error: ', err);
            chatMsgs.pop();
            this._showAssistantError(requestId);
        }
    }

    _showAssistantError(requestId) {
        try {
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.generateFailed'));
            console.log('AIManager: handleChatResponse: Detected failed on chat with assistant');
            this.setAssistantProcessFailed();
        } catch (error) {
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.generateFailed'));
            console.log('AIManager: handleChatResponse: Failed to handleAIChatResponse: ', error);
            this.setAssistantProcessFailed();
        }

        this._resetAssistantSession(this.assistantDeviceSN);
    }

    _timeout(ms) {
        return new Promise((resolve, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms));
    }

    async _awaitWithTimeout(promise, timeoutMs) {
        const timeoutPromise = this._timeout(timeoutMs);
        try {
            return await Promise.race([promise, timeoutPromise]);
        } catch (error) {
            console.log('Promise Error.', error);
            throw error;
        }
    }


    _getResponseDataJsonString(responseMessage) {
        let finalResponseDataJsonString = responseMessage;

        let codeStartIdx = responseMessage.indexOf("```");

        let preChatDecodeDataStartIdx = finalResponseDataJsonString.indexOf("{");

        // Find first ``` start index if present and get the substring without first ```
        if (codeStartIdx > preChatDecodeDataStartIdx) {
            finalResponseDataJsonString = finalResponseDataJsonString.substring(0, codeStartIdx);
        } else if (codeStartIdx > 0) {
            finalResponseDataJsonString = finalResponseDataJsonString.substring(codeStartIdx + 3);
        }

        let codeEndIdx = finalResponseDataJsonString.indexOf("```");

        // Get substring within the end ``` index
        if (codeEndIdx > 0) {
            finalResponseDataJsonString = finalResponseDataJsonString.substring(0, codeEndIdx);
        }

        preChatDecodeDataStartIdx = finalResponseDataJsonString.indexOf("{");
        let preChatDecodeDataEndIdx = finalResponseDataJsonString.lastIndexOf("}");

        console.log('AIManager: getResponseDataJsonString: preChatDecodeDataStartIdx: ' + preChatDecodeDataStartIdx + ' preChatDecodeDataEndIdx: '+ preChatDecodeDataEndIdx);

        if (preChatDecodeDataStartIdx < 0 || preChatDecodeDataEndIdx < 1) {
            return undefined;
        }

        return finalResponseDataJsonString.substring(preChatDecodeDataStartIdx, preChatDecodeDataEndIdx + 1);
    }

    async _writeOutputToKeyInput(messageData) {
        if (!messageData || messageData === '') return;
        if (!this.outputRobot) {
            this.outputRobot = require('robotjs');
        }

        console.log('AIManager: writeOutputToKeyInput: ' + messageData);
        clipboard.writeText(messageData);
        this.outputRobot.keyTap('v', 50, ['control']);
    }

    _getEmptyConfigList(maxRow, maxCol) {
        const configList = [];
        for (let row = 1; row <= maxRow; row++) {
            for (let col = 1; col <= maxCol; col++) {
                configList.push({
                    childrenName: '',
                    keyCode: row + ',' + col,
                    config: {
                        type: '',
                        title: {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: ''
                        },
                        icon: '',
                        actions: []
                    }
                });
            }
        }
        return configList;
    }

    _resetOperatePCContext() {
        this.operatePCContext = {
            stage: OPERATION_STAGE.STAGE_DECODE_END,
            actionType: '',
            actionDetail: undefined,
            actionOutput: '',
            actionProcessDone: false
        }
    }

    _splitByLastPunctuation(text) {
        // 定义正则表达式匹配中英文断句标点符号
        const punctuationRegex = /[，。！？,.!?]/;

        // 查找最后一个匹配的标点符号
        const match = text.match(punctuationRegex);
        if (match) {
            // 查找最后一个标点符号的位置
            const lastIndex = text.lastIndexOf(match[0]);
            // 拆分字符串
            const before = text.substring(0, lastIndex + 1);
            const after = text.substring(lastIndex + 1);
            return [before, after];
        } else {
            // 如果没有找到标点符号，则返回原字符串和空字符串
            return [text, ''];
        }
    }

    async _getRecentApps() {

        switch (process.platform) {
            case 'win32': {
                const currentOpenApps = await this._getWindowsCurrentOpenAPPs();

                const uniqueAppList = [];

                for (let i = 0; i < currentOpenApps.length; i++) {
                    const appInfo = currentOpenApps[i];

                    if (appInfo.path === '----' || appInfo.path === '' || appInfo.path.endsWith('\\SystemSettings.exe') || appInfo.path.includes('\\WINDOWS\\SystemApps\\')) continue;

                    if (uniqueAppList.findIndex(uAppInfo => uAppInfo.name === appInfo.name && uAppInfo.path === appInfo.path) !== -1) continue;

                    uniqueAppList.push(appInfo);
                }

                for (let i = 0; i < this.currentRecentApps.length; i++) {
                    const appInfo = this.currentRecentApps[i];

                    if (appInfo.path === '----' || appInfo.path === '') continue;

                    if (uniqueAppList.findIndex(uAppInfo => uAppInfo.name === appInfo.name && uAppInfo.path === appInfo.path) !== -1) continue;

                    uniqueAppList.push(appInfo);
                }

                return uniqueAppList;
            }
            case 'darwin':
            case 'linux':
                return this.currentRecentApps;
        }
    }

    async _checkRecentApps() {
        try {
            this.currentRecentApps = await this._getPCRecentApps();
            console.log('AIManager: checkRecentApps: this.currentRecentApps: ', this.currentRecentApps);
        } catch (err) {
            console.log('AIManager: checkRecentApps: detect error: ', err)
        }

        setTimeout(() => {
            this._checkRecentApps();
        }, 60 * 60 * 1000);
    }

    async _getPCRecentApps() {
        let recentApps = [];
        switch (process.platform) {
            case 'win32':
                recentApps = await this._getRecentApplicationsWindows();

                console.log('WindowsRecentApps: ', recentApps);
                break;
            case 'darwin':
                recentApps = await this._getRecentApplicationsMacOS();
                break;
            case 'linux':
                recentApps = await this._getRecentApplicationsLinux();
                break;
        }

        const uniqueAppList = [];

        for (let i = 0; i < recentApps.length; i++) {
            const appInfo = recentApps[i];

            if (appInfo.path === '----') continue;

            if (uniqueAppList.findIndex(uAppInfo => uAppInfo.name === appInfo.name && uAppInfo.path === appInfo.path) !== -1) continue;

            uniqueAppList.push(appInfo);
        }

        return uniqueAppList;
    }

    _getWindowsCurrentOpenAPPs() {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line
            exec('powershell "chcp 65001; Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { $_.Description + \'|\' + $_.Path }"', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {

                    const apps = stdout.split('\n').filter(line => line.includes('|')).map(line => {
                        const parts = line.trim().split('|');
                        let appName = parts[0].trim();
                        const appPath = parts[1].trim();

                        if (appName === '') {
                            appName = path.parse(path.basename(appPath)).name
                        }
                        return {
                            name: appName,
                            path: appPath
                        };
                    });
                    resolve(apps);
                }
            });
        });
    }

    _getProgID(extension) {
        return new Promise((resolve) => {
            exec(`reg query HKEY_CLASSES_ROOT\\${extension}`, (err, stdout) => {
                if (err) {
                    console.warn(`Error querying ProgID for extension ${extension}:`, err);
                    return resolve(null);
                }
                const match = stdout.match(/REG_SZ\s+(.+)/);
                if (match) {
                    resolve(match[1].trim());
                } else {
                    console.warn(`No ProgID found for extension ${extension}`);
                    resolve(null);
                }
            });
        });
    }

    _getAppForProgID(progID) {
        return new Promise((resolve) => {
            exec(`reg query HKEY_CLASSES_ROOT\\${progID}\\shell\\open\\command`, (err, stdout) => {
                if (err) {
                    console.warn(`Error querying command for ProgID ${progID}:`, err);
                    return resolve(null);
                }
                const match = stdout.match(/"([^"]+)"/);
                if (match) {
                    resolve(match[1].trim());
                } else {
                    console.warn(`No command found for ProgID ${progID}`);
                    resolve(null);
                }
            });
        });
    }

    _getAppName(appPath) {
        return new Promise((resolve) => {
            exec(`powershell -command "(Get-Item '${appPath}').VersionInfo.ProductName"`, (err, stdout) => {
                if (err) {
                    console.warn(`Error getting app name for ${appPath}:`, err);
                    return resolve(path.basename(appPath)); // 返回文件名作为备用
                }
                resolve(stdout.trim() || path.basename(appPath));
            });
        });
    }

    _batchExec(commands, batchSize = 40) {
        const batches = [];
        for (let i = 0; i < commands.length; i += batchSize) {
            batches.push(commands.slice(i, i + batchSize).join(';'));
        }
        return batches;
    }

    async _getRecentApplicationsWindows() {
        console.log('CheckWindows RecentApp Start');
        return new Promise((resolve, reject) => {
            const recentFolder = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Recent');
            fs.readdir(recentFolder, async (err, files) => {
                if (err) {
                    console.error(`Error reading Recent folder:`, err);
                    return reject(err);
                }

                const lnkFiles = files.filter(file => file.endsWith('.lnk'));
                if (lnkFiles.length === 0) {
                    return resolve([]);
                }

                console.log('CheckWindows RecentApp Total lnkFiles length: ', lnkFiles.length);

                const commands = lnkFiles.map(file => {
                    const fullPath = path.join(recentFolder, file);
                    return `(New-Object -ComObject WScript.Shell).CreateShortcut('${fullPath}').TargetPath`;
                });

                console.log('CheckWindows RecentApp Total commands length: ', commands.length);

                const targetPaths = [];
                const batches = this._batchExec(commands);
                console.log('CheckWindows RecentApp Split batches: ', batches.length);

                for (const batch of batches) {
                    try {
                        const batchResult = await new Promise((resolve, reject) => {
                            exec(`powershell -command "${batch}"`, (err, stdout) => {
                                if (err) return reject(err);
                                resolve(stdout.trim().split('\r\n').filter(Boolean));
                            });
                        });
                        targetPaths.push(...batchResult);
                    } catch (err) {
                        console.error(`Error executing batch:`, err);
                    }
                }

                console.log('CheckWindows RecentApp After batches exec targetPaths.length: ', targetPaths.length);

                const fileTypes = new Set();
                const recentApps = new Map();

                targetPaths.forEach(targetPath => {
                    const ext = path.extname(targetPath);
                    if (ext) {
                        fileTypes.add(ext);
                    }
                });

                // Query ProgIDs and application paths in parallel
                const appPromises = Array.from(fileTypes).map(async (ext) => {
                    const progID = await this._getProgID(ext);
                    if (progID) {
                        const appPath = await this._getAppForProgID(progID);

                        if (appPath && appPath.toLowerCase().endsWith('.exe')) {
                            const appName = await this._getAppName(appPath);
                            recentApps.set(appPath, { name: appName, path: appPath });
                        }
                    }
                });

                await Promise.all(appPromises);
                console.log('CheckWindows RecentApp After get all Info: ', Array.from(recentApps.values()).length);
                resolve(Array.from(recentApps.values()));
            });
        });
    }

    _getRecentApplicationsMacOS() {
        return new Promise((resolve, reject) => {
            exec('mdfind "kMDItemLastUsedDate > $time.now(-7d)"', (err, stdout) => {
                if (err) return reject(err);

                const files = stdout.trim().split('\n');
                const recentApps = new Map();

                if (files.length === 0) {
                    return resolve([]);
                }

                let remaining = files.length;

                files.forEach(file => {
                    exec(`mdls -name kMDItemCFBundleIdentifier -r "${file}"`, (err, stdout) => {
                        if (err) return reject(err);

                        const appIdentifier = stdout.trim();
                        if (appIdentifier) {
                            exec(`osascript -e 'id of app "${appIdentifier}"'`, (err, stdout) => {
                                const appPath = stdout.trim();
                                if (appPath) {
                                    exec(`osascript -e 'name of app id "${appIdentifier}"'`, (err, stdout) => {
                                        const appName = stdout.trim();
                                        if (appName) {
                                            recentApps.set(appIdentifier, { name: appName, path: appPath });
                                        }

                                        remaining--;
                                        if (remaining === 0) {
                                            resolve(Array.from(recentApps.values()));
                                        }
                                    });
                                } else {
                                    remaining--;
                                    if (remaining === 0) {
                                        resolve(Array.from(recentApps.values()));
                                    }
                                }
                            });
                        } else {
                            remaining--;
                            if (remaining === 0) {
                                resolve(Array.from(recentApps.values()));
                            }
                        }
                    });
                });
            });
        });
    }

    _getRecentApplicationsLinux() {
        return new Promise((resolve, reject) => {
            exec('find ~ -type f -atime -7', (err, stdout) => {
                if (err) return reject(err);

                const files = stdout.trim().split('\n');
                const recentApps = new Map();

                if (files.length === 0) {
                    return resolve([]);
                }

                let remaining = files.length;

                files.forEach(file => {
                    exec(`xdg-mime query filetype "${file}"`, (err, stdout) => {
                        if (err) return reject(err);

                        const mimeType = stdout.trim();
                        if (mimeType) {
                            exec(`xdg-mime query default "${mimeType}"`, (err, stdout) => {
                                if (err) return reject(err);

                                const app = stdout.trim();
                                if (app) {
                                    exec(`basename "${app}"`, (err, stdout) => {
                                        const appName = stdout.trim();
                                        if (appName) {
                                            recentApps.set(app, { name: appName, path: app });
                                        }

                                        remaining--;
                                        if (remaining === 0) {
                                            resolve(Array.from(recentApps.values()));
                                        }
                                    });
                                } else {
                                    remaining--;
                                    if (remaining === 0) {
                                        resolve(Array.from(recentApps.values()));
                                    }
                                }
                            });
                        } else {
                            remaining--;
                            if (remaining === 0) {
                                resolve(Array.from(recentApps.values()));
                            }
                        }
                    });
                });
            });
        });
    }
}


export default AIManager;
