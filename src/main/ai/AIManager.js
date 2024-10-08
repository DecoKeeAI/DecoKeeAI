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
import { app, clipboard, ipcMain, shell } from 'electron';
import {
    AI_CONSTANT_CONFIG,
    AI_SUPPORT_FUNCTIONS,
    CHAT_TYPE, CHUNK_MSG_TYPE, DEFAULT_OPEN_TO_AI_DOMAINS,
    getChatPrePromptMsg, getHAControlPromptPhase1, getHAControlPromptPhase2,
    getKeyConfigBotPrePrompt,
    getNormalChatPrePrompt,
    getPCOperationBotPrePrompt,
    KEY_CONFIG_OBJ,
} from '@/main/ai/ConstantData';
import { i18nRender } from '@/plugins/i18n';
import { ALL_MENU_SIDEBAR } from '@/plugins/KeyConfiguration';

import { isURL, randomString } from '@/utils/Utils';
import WebSpeechAudioAdapter from '@/main/ai/Connector/WebSpeechAudioAdapter';
import { deepCopy } from '@/utils/ObjectUtil';
import CozeAdapter from "@/main/ai/Connector/CozeAdapter";
import FirecrawlEngineAdapter from "@/main/ai/Connector/FirecrawlEngineAdapter";

const { exec } = require('child_process');
const levenshtein = require('fast-levenshtein');
const path = require('path');
const fs = require('fs');

const htmlDocx = require('html-docx-js');
const showdown = require('showdown');

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

const HA_HANDLE_DECODE_STAGE = {
    STAGE_DECODE_END: 0,
    STAGE_DECODE_ACTION_TYPE: 1,
    STAGE_DECODE_ACTION_DETAIL: 2,
    STAGE_DECODE_ACTION_MESSAGE: 3
}

class AIManager {

    constructor(AppManager, GeneralAIManager, chatOnly = false, aiConfigData) {
        this.appManager = AppManager;
        this.generalAIManager = GeneralAIManager;
        console.log('AIManager constructor');

        this.classId = randomString(30);
        console.log('AIManager constructor this.classId: ', this.classId, ' aiConfigData: ', aiConfigData);

        this.aiConfigData = aiConfigData;

        this.chatOnly = chatOnly;

        this.ttsEngineAdapter = undefined;
        this.aiAssistantChatAdapter = undefined;
        this.standardAIChatAdapter = undefined;

        this.audioDataArray = [];
        this.lastProcessedAudioIdx = 0;
        this.audioDataFinished = true;
        this.currentRequestId = '';

        this.audioSendTimer = undefined;

        this.assistantDeviceSN = '';
        this.assistantDeviceInfo = undefined;

        this.waitChatMsgTimeoutTask = undefined;
        this.chatResponseMsg = '';
        this.fullChatResponseMsg = '';
        this.isPendingChatFinish = false;
        this.firstChatFrameResponse = true;

        this.aiSessionState = AI_SESSION_STATE_EMPTY;

        this.configToResIdMap = new Map();

        this.chatResponseListener = undefined;

        this.sttResultListener = undefined;

        this.assistantChatHistory = [];

        this.aiAssistantRequestId = undefined;

        this.aiAssistantModelType = '';
        this.speechModelType = '';
        this.aiChatModelType = '';

        this.outputRobot = undefined;

        this.markdownConverter = undefined;

        this.webSearchEngine = new FirecrawlEngineAdapter();

        this.operatePCContext = {
            stage: OPERATION_STAGE.STAGE_DECODE_END,
            actionType: '',
            actionDetail: [],
            actionOutput: '',
            actionProcessDone: false
        }

        this.haOperationContext = {
            stage: HA_HANDLE_DECODE_STAGE.STAGE_DECODE_END,
            actionType: '',
            actionDetail: [],
            actionMessage: '',
            actionProcessDone: false
        }

        if (chatOnly) {
            this.aiAudioReadyHandler = (event, args) => this._handleAIAudioHandlerReady(event, args);
            this.chatEngineChangeHandler = (event, args) => this._handleChatEngineTypeChange(event, args);

            ipcMain.on('AIAudioHandlerReady', this.aiAudioReadyHandler);
            ipcMain.on('ChatEngineTypeChange', this.chatEngineChangeHandler);
        } else {
            let speechEngineType = undefined;
            if (this.aiConfigData !== undefined) {
                speechEngineType = this.aiConfigData.speechEngineType;
            }

            if (speechEngineType === undefined) {
                speechEngineType = this.appManager.storeManager.storeGet('aiConfig.speechEngineType', SPEECH_ENGINE_TYPE.XYF);
            }

            console.log('AIManager EngineTypeChange: speechModelType: ' + speechEngineType);
            this.setSpeechEngineModel(speechEngineType);


            let modelType = undefined;
            if (this.aiConfigData !== undefined) {
                modelType = this.aiConfigData.aiModelType;
            }

            if (modelType === undefined) {
                modelType = this.appManager.storeManager.storeGet('aiConfig.modelType', 'llama-3.1-70b-versatile');
            }

            console.log('AIManager EngineTypeChange: aiAssistantModelType: ' + modelType);
            this.setAssistantEngineModel(modelType);
        }

        this.ttsPlayEndHandler = (event, args) => this._handleTTSPlayEnded(event, args);
        this.recorderStartFailedHandler = (event, args) => this._handleRecorderStartFailed(event, args);
        this.recorderEndHandler = (event, args) => this._handleRecorderEnded(event, args);
        this.sttRequestHandler = (event, args) => this._handleSTTRequest(event, args);

        ipcMain.on('TTSPlayEnded', this.ttsPlayEndHandler);
        ipcMain.on('RecorderStartFailed', this.recorderStartFailedHandler);
        ipcMain.on('RecorderEnded', this.recorderEndHandler);
        ipcMain.on('STTRequest', this.sttRequestHandler);

        ALL_MENU_SIDEBAR.forEach(menuConfig => {
            menuConfig.children.forEach(configData => {
                this.configToResIdMap.set(configData.config.type, configData.config.icon);
                if (configData.config.alterIcon !== undefined) {
                    this.configToResIdMap.set(configData.config.type + 'Alter', configData.config.alterIcon);
                }
            });
        });
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
                this.aiAssistantChatAdapter = new XFYAdapter(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, engineModel, this.appManager.storeManager, this.aiConfigData);
                break;
            case AI_ENGINE_TYPE.OpenAI:
            case AI_ENGINE_TYPE.CustomEngine:
            case AI_ENGINE_TYPE.HuoShan:
            case AI_ENGINE_TYPE.ArixoChat:
            case AI_ENGINE_TYPE.GroqChat:
            case AI_ENGINE_TYPE.QWenChat:
            case AI_ENGINE_TYPE.ZhiPuChat:
                this.aiAssistantChatAdapter = new OpenAIAdapter(this.appManager, engineType, CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, engineModel, this.aiConfigData);
                break;
            case AI_ENGINE_TYPE.Coze:
                this.aiAssistantChatAdapter = new CozeAdapter(this.appManager, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel, this.aiConfigData);
                break;
            default:
                this.aiAssistantChatAdapter = new OpenAIAdapter(this.appManager, AI_ENGINE_TYPE.GroqChat, CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, engineModel, this.aiConfigData);
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
                this.ttsEngineAdapter = new XFYAdapter(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG, '', this.appManager.storeManager, this.aiConfigData);
                break;
            case SPEECH_ENGINE_TYPE.AZURE:
                this.ttsEngineAdapter = new WebSpeechAudioAdapter(this.appManager, SPEECH_ENGINE_TYPE.AZURE, this.aiConfigData);
                break;
        }

        this.ttsEngineAdapter.setTTSConvertResultListener((requestId, data) => {
            if (!this._isClassValid(requestId)) return;

            if (!this.appManager || !this.appManager.windowManager || !this.appManager.windowManager.aiAssistantWindow
                || !this.appManager.windowManager.aiAssistantWindow.win) {
                return false;
            }

            this.appManager.windowManager.aiAssistantWindow.win.webContents.send('PlayTTSAudio', { requestId: requestId, data: data });

        });
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
                keyCode: keyCode,
                deviceSN: requestId.split('-')[0]
            };
            console.log('startAssistantSession: For device: ' + serialNumber);
            this._setSessionState(AI_SESSION_STATE_ONGOING);
            this.appManager.windowManager.aiAssistantWindow.win.webContents.send('StartAudioRecord', { requestAssistantId: requestId });
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

    setSTTConvertListener(listener) {
        this.sttResultListener = listener;
    }

    setAssistantProcessDone() {
        if (this.isPendingChatFinish) {
            console.log('AIManager: setAssistantProcessDone: currently pending chat finish. Ignore request.');
            return;
        }
        console.log('AIManager: setAssistantProcessDone.');
        this.generalAIManager.playAlertTone(Constants.ASSISTANT_SESSION_END);

        if (this.aiAssistantChatAdapter.getUseChatContext()) {
            this._setSessionState(AI_SESSION_STATE_IDLE);
        } else {
            this._setSessionState(AI_SESSION_STATE_EMPTY);
        }

        let sessionTimeout = undefined;
        if (this.aiConfigData !== undefined) {
            sessionTimeout = this.aiConfigData.chatPendingTimeout;
        }
        this.aiAssistantChatAdapter.startChatSessionExpireTimer(sessionTimeout).then(expired => {
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
        this.generalAIManager.playAlertTone(Constants.ASSISTANT_SESSION_ERROR);
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

        if (this.aiChatModelType.startsWith('Custom-') || this.aiChatModelType.startsWith('HuoShan-') || this.aiChatModelType.startsWith('Coze-')) {

            requestModelName = undefined;
            if (this.aiConfigData !== undefined) {
                requestModelName = this.aiConfigData.customModelName;
            }

            if (requestModelName === undefined) {
                const aiConfigKeyPrefix = 'aiConfig.' + this.aiChatModelType;
                requestModelName = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.modelName');
            }
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
                this.standardAIChatAdapter = new XFYAdapter(CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel, this.appManager.storeManager, this.aiConfigData);
                break;
            case AI_ENGINE_TYPE.OpenAI:
            case AI_ENGINE_TYPE.ArixoChat:
            case AI_ENGINE_TYPE.CustomEngine:
            case AI_ENGINE_TYPE.HuoShan:
            case AI_ENGINE_TYPE.GroqChat:
            case AI_ENGINE_TYPE.StandardChat:
            case AI_ENGINE_TYPE.QWenChat:
            case AI_ENGINE_TYPE.ZhiPuChat:
                this.standardAIChatAdapter = new OpenAIAdapter(this.appManager, chatEngineType, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel, this.aiConfigData);
                break;
            case AI_ENGINE_TYPE.Coze:
                this.standardAIChatAdapter = new CozeAdapter(this.appManager, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel, this.aiConfigData);
                break;
            default:
                this.standardAIChatAdapter = new OpenAIAdapter(this.appManager, AI_ENGINE_TYPE.GroqChat, CHAT_TYPE.CHAT_TYPE_NORMAL, engineModel, this.aiConfigData);
                break;
        }

        this.standardAIChatAdapter.setChatResponseListener(this.chatResponseListener);
    }

    getClassId() {
        return this.classId;
    }

    destroyEngine() {
        if (this.ttsEngineAdapter !== undefined) {
            this.ttsEngineAdapter.destroy();
        }

        if (this.standardAIChatAdapter !== undefined) {
            this.standardAIChatAdapter.destroyChatEngine();
        }

        if (this.aiAssistantChatAdapter !== undefined) {
            this.aiAssistantChatAdapter.destroyChatEngine();
        }

        if (this.chatOnly) {
            ipcMain.off('AIAudioHandlerReady', this.aiAudioReadyHandler);
            ipcMain.off('ChatEngineTypeChange', this.chatEngineChangeHandler);
        }

        ipcMain.off('TTSPlayEnded', this.ttsPlayEndHandler);
        ipcMain.off('RecorderStartFailed', this.recorderStartFailedHandler);
        ipcMain.off('RecorderEnded', this.recorderEndHandler);
        ipcMain.off('STTRequest', this.sttRequestHandler);
    }

    _resetAssistantSession(serialNumber, fullReset = true) {
        console.log('AIManager: resetAssistantSession for: ' + serialNumber + ' Current: ' + this.assistantDeviceSN + ' fullReset: ' + fullReset);
        if (serialNumber === '' || serialNumber !== this.assistantDeviceSN) return;

        clearTimeout(this.waitChatMsgTimeoutTask);
        this.waitChatMsgTimeoutTask = undefined;

        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('StopAudioRecord', { requestAssistantId: this.assistantDeviceInfo.requestId });
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('StopTTSPlay', { requestAssistantId: this.assistantDeviceInfo.requestId });

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
        if (!this._isClassValid(requestId)) return;

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
        const deviceSN = this.assistantDeviceInfo.deviceSN;

        const deviceControlManager = this.appManager.deviceControlManager;
        switch (state) {
            case AI_SESSION_STATE_EMPTY:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.appManager.deviceControlManager.getDeviceKeyIcon(deviceSN, processKeyCode), processKeyCode, -2);

                this.assistantDeviceSN = '';
                this.assistantDeviceInfo = undefined;
                this.aiAssistantRequestId = undefined;

                this._resetOperatePCContext();
                this._resetHAOperateContext();

                this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG);
                break;
            case AI_SESSION_STATE_ONGOING:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.appManager.deviceControlManager.getDeviceKeyIcon(deviceSN, processKeyCode), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -2);
                break;
            case AI_SESSION_STATE_PROCESSING:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.appManager.deviceControlManager.getDeviceKeyIcon(deviceSN, processKeyCode), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -2);
                break;
            case AI_SESSION_STATE_IDLE:
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_ONGOING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_PROCESSING), processKeyCode, -1);
                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.appManager.deviceControlManager.getDeviceKeyIcon(deviceSN, processKeyCode), processKeyCode, -1);

                deviceControlManager.showDeviceAnimation(this.assistantDeviceSN, this.generalAIManager.getAnimationResourceId(Constants.ASSISTANT_ANIMATION_IDLE), processKeyCode, -2);
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
                    if (actionItem.operationName === 'key') {
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

                    const recentApps = await this.generalAIManager.getRecentApps();
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
        this.appManager.deviceControlManager.openApplication(applicationPath);
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
        let configedUseDekiePrompt = undefined;
        let supportHAControl = false;

        if (this.aiConfigData !== undefined) {
            configedUseDekiePrompt = this.aiConfigData.useDekiePrompt;
            supportHAControl = this.aiConfigData.homeAssistantControl;
        }

        if (this.aiAssistantModelType.startsWith('Custom-') || this.aiAssistantModelType.startsWith('HuoShan-') || this.aiAssistantModelType.startsWith('Coze-')) {
            requestModelName = undefined;
            if (this.aiConfigData !== undefined) {
                requestModelName = this.aiConfigData.customModelName;
            }
            const aiConfigKeyPrefix = 'aiConfig.' + this.aiAssistantModelType;

            if (requestModelName === undefined) {
                requestModelName = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.modelName');
            }

            if (configedUseDekiePrompt === undefined) {
                configedUseDekiePrompt = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.useDekiePrompt');
            }

        }

        if (configedUseDekiePrompt !== undefined) {
            useDekiePrompt = configedUseDekiePrompt;
        }

        params = {
            model: requestModelName,
            messages: [],
            max_tokens: 2048,
            temperature: 0.1,
            stream: false
        }

        if (isNewSession && useDekiePrompt) {
            let preChatMsgs = getChatPrePromptMsg(message, aiEngineType, supportHAControl);
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

                // let searchResult = undefined;
                // if (responseConfigData.searchOptions !== undefined && responseConfigData.searchOptions.shouldDoWebSearch) {
                //     searchResult = await this.webSearchEngine.search(responseConfigData.searchOptions.searchString, {
                //         pageOptions: {
                //             fetchPageContent: true
                //         }
                //     });
                // }
                //
                // console.log('AIManager: handleAIAssistantProcess: Get Search Result: ', searchResult);

                if (responseConfigData.userRequestAction === "operatingComputer") {
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_OPERATE_PC);
                    this.aiAssistantChatAdapter.setChatResponseListener((requestId, status, message, messageType) => {
                        if (!this._isClassValid(requestId)) return;

                        this._handleChatResponse(requestId, status, message, messageType).catch(err => {
                            console.log('AIManager: handleAIAssistantProcess: CHAT_TYPE.CHAT_TYPE_OPERATE_PC _handleChatResponse detected error: ', err);
                            this.setAssistantProcessFailed();
                            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                        });
                    });
                    chatMsgs = getPCOperationBotPrePrompt(message, aiEngineType, currentLanguage);
                } else if (responseConfigData.userRequestAction === "generateConfiguration") {
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_KEY_CONFIG);
                    const recentApps = await this.generalAIManager.getRecentApps();
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
                } else if (responseConfigData.userRequestAction === 'operatingEquipment') {
                    this.chatResponseMsg = '';
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_OPERATE_EQUIPMENT);
                } else {
                    this.aiAssistantChatAdapter.setChatMode(CHAT_TYPE.CHAT_TYPE_NORMAL);
                    this.aiAssistantChatAdapter.setChatResponseListener((requestId, status, message, messageType) => {
                        if (!this._isClassValid(requestId)) return;

                        this._handleChatResponse(requestId, status, message, messageType).catch(err => {
                            console.log('AIManager: handleAIAssistantProcess: CHAT_TYPE.CHAT_TYPE_NORMAL _handleChatResponse detected error: ', err);

                            this.setAssistantProcessFailed();
                            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
                        });
                    });
                    const deviceLocationInfo = this.appManager.storeManager.storeGet('system.deviceLocationInfo');

                    if (this.aiConfigData !== undefined && (this.aiConfigData.useCustomPrompt === true || this.aiConfigData.systemRoleIdx)) {
                        chatMsgs = [{
                            role: 'system',
                            content: this.aiConfigData.systemPrompt === undefined ? '' : this.aiConfigData.systemPrompt
                        }, {
                            role: 'user',
                            content: message
                        }]
                    } else {
                        chatMsgs = getNormalChatPrePrompt(message, '', deviceLocationInfo);
                    }

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

            if (this.aiConfigData !== undefined && (this.aiConfigData.useCustomPrompt === true || this.aiConfigData.systemRoleIdx)) {
                chatMsgs.push({
                    role: 'system',
                    content: this.aiConfigData.systemPrompt === undefined ? '' : this.aiConfigData.systemPrompt
                })
            }

            chatMsgs.push({
                role: "user",
                content: message
            });

            this.aiAssistantChatAdapter.setChatResponseListener((requestId, status, message, messageType) => {
                if (!this._isClassValid(requestId)) return;

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


        let enableWebSearch = undefined;
        if (this.aiConfigData !== undefined) {
            enableWebSearch = this.aiConfigData.enableWebSearch;
        }

        if (enableWebSearch === undefined) {
            enableWebSearch = this.appManager.storeManager.storeGet('aiConfig.webSearch', true);
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
            case AI_ENGINE_TYPE.ZhiPuChat: {
                const searchData = {
                    enable: enableWebSearch,
                    search_result: true
                }
                if (enableWebSearch) {
                    searchData.search_query = message;
                }
                webSearchPlugin = {
                    tools: [{
                        type: 'web_search',
                        web_search: searchData
                    }]
                };
                break;
            }
        }

        const finalParam = Object.assign(enableWebSearch ? webSearchPlugin : {}, params);

        if (this.aiAssistantChatAdapter.getChatMode() === CHAT_TYPE.CHAT_TYPE_NORMAL) {
            delete finalParam.response_format;

            if (this.aiConfigData !== undefined) {
                finalParam.temperature = this.aiConfigData.roleTemperature === undefined ? 1.0 : this.aiConfigData.roleTemperature;
                finalParam.top_p = this.aiConfigData.roleTopP === undefined ? 0.7 : this.aiConfigData.roleTopP;
            } else {
                finalParam.temperature = 1.0;
            }

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

        if (this.aiAssistantChatAdapter.getChatMode() === CHAT_TYPE.CHAT_TYPE_OPERATE_EQUIPMENT) {
            this._handleHAOperation(requestId, isNewSession, finalParam, message, aiEngineType, currentLanguage);
            return;
        }

        finalParam.max_tokens = 4096;

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

        console.log('AIManager: getResponseDataJsonString: preChatDecodeDataStartIdx: ' + preChatDecodeDataStartIdx + ' preChatDecodeDataEndIdx: ' + preChatDecodeDataEndIdx);

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

    _resetHAOperateContext() {
        this.haOperationContext = {
            stage: HA_HANDLE_DECODE_STAGE.STAGE_DECODE_END,
            actionType: '',
            actionDetail: undefined,
            actionMessage: '',
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

    _handleAIAudioHandlerReady(event, args) {
        console.log('AIManager: _handleAIAudioHandlerReady: ', args);
        const newSpeechModelType = this.appManager.storeManager.storeGet('aiConfig.speechEngineType');
        console.log('AIManager EngineTypeChange: this.speechModelType: ' + newSpeechModelType);
        this.setSpeechEngineModel(newSpeechModelType);

        let newAiChatModelType = this.appManager.storeManager.storeGet('aiConfig.chat.modelType');
        if (newAiChatModelType === undefined) {
            newAiChatModelType = 'llama-3.1-70b-versatile';
        }

        console.log('AIManager Init with chat model type: ' + newAiChatModelType);
        this.setChatEngineModel(newAiChatModelType);
    }

    _handleChatEngineTypeChange(event, args) {
        console.log('AIManager: _handleChatEngineTypeChange: ', args);

        const newAiChatModelType = this.appManager.storeManager.storeGet('aiConfig.chat.modelType');
        console.log('AIManager Init with chat model type: ' + newAiChatModelType);
        this.setChatEngineModel(newAiChatModelType);
    }

    _handleTTSPlayEnded(event, args) {
        if (!this._isClassValid(args.requestId)) return;

        if (args.requestId !== this.aiAssistantRequestId) return;

        console.log('AIManager: Received: TTSPlayEnded: for ', args);
        this.setAssistantProcessDone();
    }

    _handleRecorderStartFailed(event, args) {
        if (!this._isClassValid(args.requestId)) return;

        if (args.requestId !== this.aiAssistantRequestId) return;
        console.log('AIManager: Received: RecorderStartFailed: for ', args);

        this.setAssistantProcessFailed();
    }

    _handleRecorderEnded(event, args) {
        if (!this._isClassValid(args.requestId)) return;

        if (args.requestId !== this.aiAssistantRequestId) return;
        console.log('AIManager: Received: RecorderEnded: for ', args);

        this.setAssistantProcessDone();
    }

    _handleSTTRequest(event, args) {
        if (!this._isClassValid(args.requestId)) return;

        console.log('AIManager: Received: STTRequest: for ', args.requestId);
        this.recognizeVoice(args.requestId, args.audioData, args.isLastFrame);
    }

    async _handleHAOperation(requestId, isNewSession, params, message, aiEngineType, currentLanguage) {
        if (!this.generalAIManager.HAManager.checkConnection()) {
            this.setAssistantProcessFailed();
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.haNotConnected'));
            return;
        }

        const haEntityList = this.generalAIManager.HAManager.getAllEntitiesByGroup();
        if (haEntityList.length === 0) {
            this.setAssistantProcessFailed();
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.noEntityFound'));
            return;
        }

        delete params.response_format;
        params.temperature = 0.1;
        params.top_p = 1.0;


        const deviceLocationInfo = this.appManager.storeManager.storeGet('system.deviceLocationInfo', {
            city: 'Unknown'
        });
        params.stream = false;

        // Phase 1, determine which entity need to be control
        if (isNewSession) {

            let finalEntityList = haEntityList.flatMap(group => group.entities);
            finalEntityList = finalEntityList
                .filter(entity => {
                    if (entity.attributes.friendly_name === undefined || entity.attributes.friendly_name === '') return false;
                    if (this.aiConfigData.perceivableEntities === undefined) {
                        const domain = entity.entity_id.split('.')[0];

                        return DEFAULT_OPEN_TO_AI_DOMAINS.indexOf(domain) !== -1;
                    }

                    return this.aiConfigData.perceivableEntities.indexOf(entity.entity_id) !== -1;
                })
                .map(entity => ({
                    entity_id: entity.entity_id,
                    friendly_name: entity.attributes.friendly_name
                }));

            const chatMsg = getHAControlPromptPhase1(message, aiEngineType, currentLanguage, deviceLocationInfo, finalEntityList);

            params.messages = chatMsg;

            this.assistantChatHistory = chatMsg;
        } else {
            this.assistantChatHistory.push({
                role: 'user',
                content: message
            })
        }


        let phase1Response, determineEntityResponse;
        try {
            determineEntityResponse = await this._awaitWithTimeout(this.aiAssistantChatAdapter.chatWithAssistant(requestId, params), AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);
            if (determineEntityResponse.startsWith('```')) {
                determineEntityResponse = this._getResponseDataJsonString(determineEntityResponse);
            }
            phase1Response = eval('(' + determineEntityResponse.replace(/\\"/g, '"') + ')');
        } catch (err) {
            console.log('AIManager: _handleHAOperation: Received Invalid phase1 response', err.message, ' determineEntityResponse: ', determineEntityResponse);
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.serverError'));
            this.setAssistantProcessFailed();
            this._resetAssistantSession(this.assistantDeviceSN);
            return;
        }
        let friendlyMsg = ''
        if (phase1Response.friendly_msg !== undefined && phase1Response.friendly_msg !== '') {
            friendlyMsg = phase1Response.friendly_msg;
        }
        if (phase1Response.entity_ids === undefined || phase1Response.entity_ids.length === 0) {
            let errorMsg = ''
            if (friendlyMsg !== '') {
                errorMsg = friendlyMsg;
            } else {
                errorMsg = i18nRender('assistantConfig.controlDeviceNotFound');
            }
            this.ttsEngineAdapter.playTTS(requestId, errorMsg);
            this.setAssistantProcessFailed();
            this._resetAssistantSession(this.assistantDeviceSN);
            return;
        }

        console.log('AIManager: _handleHAOperation: phase1Response: ', phase1Response);

        const entityInfoList = this.generalAIManager.HAManager.getEntitiesInfo(phase1Response.entity_ids);
        console.log('AIManager: _handleHAOperation: entityInfoList: ', entityInfoList);
        if (entityInfoList.length === 0) {
            this.ttsEngineAdapter.playTTS(requestId, i18nRender('assistantConfig.controlDeviceNotFound'));
            this.setAssistantProcessFailed();
            this._resetAssistantSession(this.assistantDeviceSN);
            return;
        }

        const entityByDomain = entityInfoList.reduce((acc, entity) => {
            const domain = entity.entity_id.split('.')[0];
            if (!acc[domain]) {
                acc[domain] = [];
            }
            acc[domain].push(entity);
            return acc;
        }, {});
        console.log('AIManager: _handleHAOperation: entityByDomain: ', entityByDomain);
        console.log('AIManager: _handleHAOperation: required control domains: ', Object.keys(entityByDomain));

        const requiredControlDomains = Object.keys(entityByDomain);
        const relatedServices = [];
        if (requiredControlDomains.length > 0) {
            requiredControlDomains.forEach(domain => {
                const domainServices = this.generalAIManager.HAManager.getRelatedService(domain);
                if (relatedServices.findIndex(serviceInfo => serviceInfo.domain === domain) !== -1) {
                    return;
                }
                relatedServices.push({
                    domain: domain,
                    services: domainServices
                });
            });
        }
        console.log('AIManager: _handleHAOperation: relatedServices: ', JSON.stringify(relatedServices));

        // Phase 2: Get control HA device data
        params.messages = getHAControlPromptPhase2(message, aiEngineType, currentLanguage, deviceLocationInfo, entityInfoList, relatedServices);

        let phase2Message = '';

        this._resetHAOperateContext();
        const that = this;
        this.haOperationContext.stage = HA_HANDLE_DECODE_STAGE.STAGE_DECODE_ACTION_TYPE;
        this.haOperationContext.ttsPlayChunkMsg = '';
        this.aiAssistantChatAdapter.chatWithAI(requestId, params, (requestId, status, message) => {
            if (!that._isClassValid(requestId)) return;

            phase2Message += message;
            console.log('AIManager: _handleHAOperation: phase2Response: status: ', status, message);

            that._processHAPhase2Data(requestId, phase2Message, status === 2);

            if (status === 2 && this.haOperationContext.actionProcessDone) {
                console.log('AIManager: _handleHAOperation: phase2Response: Final: phase2Message: ', phase2Message);
                console.log('AIManager: _handleHAOperation: phase2Response: Final: this.haOperationContext: ', this.haOperationContext);

                this.haOperationContext.actionDetail.forEach(actionData => {
                    const result = that.generalAIManager.HAManager.sendCallService(actionData.entity_id, actionData.service, actionData.service_data);
                    console.log('AIManager: _handleHAOperation: callService to ', actionData.entity_id, ' Result: ', result);
                });
            }
        });

        this.isPendingChatFinish = false;
    }

    _processHAPhase2Data(requestId, message, isLast = false) {
        if (this.haOperationContext.actionProcessDone) return;

        const actionDetailStartIndex = message.indexOf('action_detail:');
        const actionMessageStartIndex = message.indexOf('action_message:');
        switch (this.haOperationContext.stage) {
            case HA_HANDLE_DECODE_STAGE.STAGE_DECODE_ACTION_TYPE: {
                const actionTypeStartIndex = message.indexOf('action_type:');
                const actionTypeDataStartIndex = actionTypeStartIndex + 12;
                if (actionTypeStartIndex >= 0 && actionDetailStartIndex > actionTypeDataStartIndex) {
                    this.haOperationContext.actionType = message.substring(actionTypeDataStartIndex, actionDetailStartIndex).trim();
                    this.haOperationContext.stage = HA_HANDLE_DECODE_STAGE.STAGE_DECODE_ACTION_DETAIL;
                    this._processHAPhase2Data(requestId, message, isLast);
                }
                break;
            }
            case HA_HANDLE_DECODE_STAGE.STAGE_DECODE_ACTION_DETAIL: {
                const actionDetailDataStartIndex = actionDetailStartIndex + 14;
                if (actionDetailStartIndex >= 0 && actionMessageStartIndex > actionDetailDataStartIndex) {
                    let actionDetailMsg = '';
                    try {
                        actionDetailMsg = message.substring(actionDetailDataStartIndex, actionMessageStartIndex).trim()
                        if (actionDetailMsg.startsWith('```')) {
                            actionDetailMsg = this._getResponseDataJsonString(actionDetailMsg);
                        }
                        this.haOperationContext.actionDetail = eval('(' + actionDetailMsg + ')');
                    } catch (err) {
                        console.log('AIManager: _processHAPhase2Data: Failed to parse action detail data: ', err.message, ' actionDetailMsg: ', actionDetailMsg);
                    }
                    this.haOperationContext.stage = HA_HANDLE_DECODE_STAGE.STAGE_DECODE_ACTION_MESSAGE;
                    this._processHAPhase2Data(requestId, message, isLast);
                }
                break;
            }
            case HA_HANDLE_DECODE_STAGE.STAGE_DECODE_ACTION_MESSAGE: {
                const actionMsgDataStartIndex = actionMessageStartIndex + 15;
                const actionMsg = message.substring(actionMsgDataStartIndex).trim();
                this.haOperationContext.actionMessage = actionMsg;

                if (this.haOperationContext.actionMessage.length > 20 || isLast) {

                    let needPlayMsg = '';
                    if (this.haOperationContext.ttsPlayChunkMsg.length === 0) {
                        needPlayMsg = this.haOperationContext.actionMessage;
                    } else {
                        needPlayMsg = actionMsg.replace(this.haOperationContext.ttsPlayChunkMsg, '');
                    }
                    let needPlayTTS = '';
                    if (isLast) {
                        this.haOperationContext.stage = HA_HANDLE_DECODE_STAGE.STAGE_DECODE_END;
                        this.haOperationContext.actionProcessDone = true;

                        needPlayTTS = needPlayMsg;
                    } else {
                        const splitMsg = this._splitByLastPunctuation(needPlayMsg);
                        needPlayMsg = splitMsg[0];
                    }
                    this.ttsEngineAdapter.playTTS(requestId, needPlayTTS);
                    this.haOperationContext.ttsPlayChunkMsg += needPlayTTS;
                }
                break;
            }
        }
    }

    _isClassValid(requestId = '') {
        if (typeof requestId !== "string") return false;

        const requestInfo = requestId.split('-');

        if (requestInfo.length < 3) return false;

        return requestInfo[2] === this.classId;
    }
}


export default AIManager;
