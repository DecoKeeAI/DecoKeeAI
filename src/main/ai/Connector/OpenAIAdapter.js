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
import {AI_CONSTANT_CONFIG, CHAT_TYPE, OPEN_AI_IPC_MESSAGE} from "@/main/ai/ConstantData";
import {ipcMain} from "electron";
import {AI_ENGINE_TYPE} from "@/main/ai/AIManager";
import {randomString} from "@/utils/Utils";

class OpenAIAdapter {
    constructor(appManager, type, chatMode, engineModel, aiConfigData) {

        this.appManager = appManager;

        this.aiConfigData = aiConfigData;

        this.chatResponseListener = undefined;

        this.useChatContext = true;

        this.chatSessionExpiredTimer = undefined;

        this.chatRequestId = undefined;

        this.waitChatResponseCallback = undefined;
        this.fileManipulationCallbackMap = new Map();

        this.aiEngineType = type;
        this.currentChatMode = chatMode;
        this.aiEngineModel = engineModel;

        console.log('OpenAIAdapter constructor aiEngineModel: ' + this.aiEngineModel + ' ChatMode: ' + this.currentChatMode);

        ipcMain.on('AssistantChatResponse', (event, args) => {
            if (args.requestId !== this.chatRequestId) return;

            if (this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL || this.currentChatMode === CHAT_TYPE.CHAT_TYPE_OPERATE_PC || this.streamResponseCallBack !== undefined) {
                if (args.status === 2 || args.status === -1) {
                    this.chatRequestId = undefined;
                }

                if (this.streamResponseCallBack !== undefined) {
                    this.streamResponseCallBack(args.requestId, args.status, args.message);

                    if (args.status === 2 || args.status === -1) {
                        this.streamResponseCallBack = undefined;
                    }
                    return;
                }

                // console.log('OpenAIAdapter OpenAI handle AssistantChatResponse: args ', args, ' Have Listener: ', (this.chatResponseListener !== undefined))
                if (this.chatResponseListener === undefined) return;
                this.chatResponseListener(args.requestId, args.status, args.message);
                return;
            }

            if (this.waitChatResponseCallback === undefined) return;
            console.log('OpenAIAdapter OpenAI handle AssistantChatResponse: args ', args);

            this.waitChatResponseCallback(args.message);

            if (args.status === 2 || args.status === -1) {
                this.waitChatResponseCallback = undefined;
            }
        });

        ipcMain.on(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT, (event, args) => {
            console.log('OpenAIAdapter Received ' + OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT + ': args ', args);

            const resultCallback = this.fileManipulationCallbackMap.get(args.requestId);

            if (!resultCallback) return;

            resultCallback(args.resultData);
        });
    }

    async chatWithAssistant(requestId, params) {
        clearTimeout(this.chatSessionExpiredTimer);

        console.log('OpenAIAdapter: chatWithAssistant: requestId: ' + requestId);

        this.chatRequestId = requestId;

        try {
            return await this._awaitWithTimeout(this._sendChatMessage(requestId, params), AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);
        } catch (err) {
            console.log('OpenAIAdapter: chatWithAssistant. Error: ' + JSON.stringify(err));
            this.chatRequestId = undefined;
            throw err;
        }
    }

    cancelChatProcess(requestId) {
        console.log('OpenAIAdapter: cancelChatProcess')
        if (this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL || this.currentChatMode === CHAT_TYPE.CHAT_TYPE_OPERATE_PC) {
            if (requestId !== this.chatRequestId) return;
        }
        this._resetChatProcess();
    }

    startChatSessionExpireTimer(timeout) {
        return new Promise((resolve) => {
            if (!this.useChatContext) {
                this._resetChatProcess();
                resolve(0);
                return;
            }

            clearTimeout(this.chatSessionExpiredTimer);

            let sessionExpiredTimeout = 500;
            if (this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL) {
                if (timeout === undefined) {
                    sessionExpiredTimeout = AI_CONSTANT_CONFIG.SESSION_EXPIRE_TIMEOUT;
                } else {
                    sessionExpiredTimeout = timeout * 1000;
                }
            }

            this.chatSessionExpiredTimer = setTimeout(() => {
                console.log('OpenAIAdapter: sendChatMessage chat session with context expired. Cancel chat session.');
                this._resetChatProcess();
                resolve(1);
            }, sessionExpiredTimeout);
        })
    }

    cancelChatExpireTimer() {
        console.log('OpenAIAdapter: cancelChatExpireTimer');
        clearTimeout(this.chatSessionExpiredTimer);
    }

    setChatMode(mode) {
        this.currentChatMode = mode;
    }

    getChatMode() {
        return this.currentChatMode;
    }

    setUseChatContext(useContext) {
        this.useChatContext = useContext
    }

    getUseChatContext() {
        return this.useChatContext;
    }

    destroyChatEngine() {
        console.log('OpenAIAdapter: destroyChatEngine')

        this.chatResponseListener = undefined;
        this.cancelChatProcess();
        this.cancelChatExpireTimer();

        ipcMain.removeAllListeners('AssistantChatResponse')
    }

    chatWithAI(requestId, params, streamResponseCallBack) {
        clearTimeout(this.chatSessionExpiredTimer);
        this.chatRequestId = requestId;

        this.streamResponseCallBack = streamResponseCallBack;
        console.log('OpenAIAdapter: chatWithAI: requestId: ', requestId, ' this.aiEngineType: ', this.aiEngineType, ' params: ', params)
        this._sendChatMessage(requestId, params)
    }

    setChatResponseListener(listener) {
        this.chatResponseListener = listener;
    }

    uploadFile(filePath, purpose = "assistants") {
        return new Promise(resolve => {
            const requestId = randomString(16);

            this.appManager.windowManager.aiAssistantWindow.win.webContents.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.UPLOAD_FILE,
                filePath: filePath,
                purpose: purpose,
                apiKey: this._getAPIKey(),
                baseUrl: this._getBaseUrl()
            });

            this.fileManipulationCallbackMap.set(requestId, resolve);
        });
    }

    listFile() {
        return new Promise(resolve => {
            const requestId = randomString(16);

            this.appManager.windowManager.aiAssistantWindow.win.webContents.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.LIST_FILE,
                apiKey: this._getAPIKey(),
                baseUrl: this._getBaseUrl()
            });

            this.fileManipulationCallbackMap.set(requestId, resolve);
        });
    }

    retrieveFile(fileId) {
        return new Promise(resolve => {
            const requestId = randomString(16);

            this.appManager.windowManager.aiAssistantWindow.win.webContents.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.RETRIEVE_FILE,
                fileId: fileId,
                apiKey: this._getAPIKey(),
                baseUrl: this._getBaseUrl()
            });

            this.fileManipulationCallbackMap.set(requestId, resolve);
        });
    }

    retrieveFileContent(fileId) {
        return new Promise(resolve => {
            const requestId = randomString(16);

            this.appManager.windowManager.aiAssistantWindow.win.webContents.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.RETRIEVE_FILE_CONTENT,
                fileId: fileId,
                apiKey: this._getAPIKey(),
                baseUrl: this._getBaseUrl()
            });

            this.fileManipulationCallbackMap.set(requestId, resolve);
        });
    }

    deleteFile(fileId) {
        return new Promise(resolve => {
            const requestId = randomString(16);

            this.appManager.windowManager.aiAssistantWindow.win.webContents.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.DELETE_FILE,
                fileId: fileId,
                apiKey: this._getAPIKey(),
                baseUrl: this._getBaseUrl()
            });

            this.fileManipulationCallbackMap.set(requestId, resolve);
        });
    }

    _sendChatMessage(requestId, params) {
        if (this.aiEngineType === AI_ENGINE_TYPE.HuoShan) {
            params.temperature = params.temperature / 2.0;
        }

        return new Promise(resolve => {
            this.appManager.windowManager.aiAssistantWindow.win.webContents.send('chatWithAssistant', {
                requestId: requestId,
                params: params,
                apiKey: this._getAPIKey(),
                baseUrl: this._getBaseUrl()
            });

            this.waitChatResponseCallback = resolve;
        });
    }

    _resetChatProcess() {
        console.log('OpenAIAdapter: resetChatProcess')

        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('cancelChatWithAssistant', {
            requestId: this.chatRequestId
        });

        this.chatRequestId = '';
        this.waitChatResponseCallback = undefined;
    }

    _getAPIKey() {
        switch (this.aiEngineType) {
            case AI_ENGINE_TYPE.OpenAI:
                if (this.aiConfigData !== undefined && this.aiConfigData.apiKey !== undefined) {
                    return this.aiConfigData.apiKey;
                }

                return this.appManager.storeManager.storeGet('aiConfig.openAi.apiKey');
            default:
            case AI_ENGINE_TYPE.CustomEngine:
            case AI_ENGINE_TYPE.Coze:
            case AI_ENGINE_TYPE.HuoShan: {
                if (this.aiConfigData !== undefined && this.aiConfigData.apiKey !== undefined) {
                    return this.aiConfigData.apiKey;
                }
                const aiConfigKeyPrefix = 'aiConfig.' + this.aiEngineModel;
                return this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.apiKey');
            }
            case AI_ENGINE_TYPE.GroqChat:
                if (this.aiConfigData !== undefined && this.aiConfigData.apiKey !== undefined) {
                    return this.aiConfigData.apiKey;
                }
                return this.appManager.storeManager.storeGet('aiConfig.groq.apiKey');
            case AI_ENGINE_TYPE.QWenChat:
                if (this.aiConfigData !== undefined && this.aiConfigData.apiKey !== undefined) {
                    return this.aiConfigData.apiKey;
                }
                return this.appManager.storeManager.storeGet('aiConfig.qwen.apiKey');
            case AI_ENGINE_TYPE.ZhiPuChat:
                if (this.aiConfigData !== undefined && this.aiConfigData.apiKey !== undefined) {
                    return this.aiConfigData.apiKey;
                }
                return this.appManager.storeManager.storeGet('aiConfig.zhipu.apiKey');
            case AI_ENGINE_TYPE.StandardChat:
                if (this.aiConfigData !== undefined && this.aiConfigData.apiKey !== undefined) {
                    return this.aiConfigData.apiKey;
                }
                return this.appManager.storeManager.storeGet('aiConfig.chat.apiKey');
            case AI_ENGINE_TYPE.ArixoChat:
                return 'sk-111111111111111111111111111111111111111111111111';
        }
    }

    _getBaseUrl() {
        let baseUrl = undefined;
        switch (this.aiEngineModel) {
            case 'gpt-4o':
            case 'gpt-4o-mini':
            case 'gpt-4-turbo':
            case 'gpt-4':
            case 'gpt-3.5-turbo':
                baseUrl = undefined;
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
                baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
                break;
            case 'glm-3-turbo':
            case 'glm-4':
            case 'glm-4-0520':
            case 'glm-4-air':
            case 'glm-4-airx':
            case 'glm-4-flash':
                baseUrl = 'https://open.bigmodel.cn/api/paas/v4/';
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
                baseUrl = 'https://api.groq.com/openai/v1/';
                break;
            default: {
                if (this.aiConfigData !== undefined && this.aiConfigData.customUrlAddr !== undefined) {
                    return this.aiConfigData.customUrlAddr;
                }
                const aiConfigKeyPrefix = 'aiConfig.' + this.aiEngineModel;
                baseUrl = this.appManager.storeManager.storeGet(aiConfigKeyPrefix + '.baseUrl');
                break;
            }
        }

        return baseUrl;
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
}
export default OpenAIAdapter;
