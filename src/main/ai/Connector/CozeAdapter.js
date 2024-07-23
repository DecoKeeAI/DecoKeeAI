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

import { AI_CONSTANT_CONFIG, CHAT_TYPE, CHUNK_MSG_TYPE } from '@/main/ai/ConstantData';
import { ipcMain } from 'electron';
import { axios } from '@/plugins/request';

const COZE_SERVER_URL = 'https://api.coze.cn/v3/chat';

class CozeAdapter {
    constructor(appManager, chatType, modelName) {
        console.log('CozeAdapter: constructor: chatType: ' + chatType + ' modelName: ' + modelName);

        this.appManager = appManager;

        this.chatResponseListener = undefined;

        this.useChatContext = true;

        this.chatSessionExpiredTimer = undefined;

        this.chatRequestId = undefined;

        this.waitChatResponseCallback = undefined;

        this.modelName = modelName;

        this.currentChatMode = chatType;

        this.requestIdReqControllerMap = new Map();
    }

    async chatWithAssistant(requestId, params) {
        clearTimeout(this.chatSessionExpiredTimer);

        console.log('CozeAdapter: chatWithAssistant: requestId: ' + requestId);

        if (requestId !== this.chatRequestId) {
            this._resetChatProcess();
        }

        this.chatRequestId = requestId;

        try {
            return await this._awaitWithTimeout(
                this._sendChatMessage(requestId, params),
                AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT
            );
        } catch (err) {
            console.log('CozeAdapter: chatWithAssistant. Error: ' + JSON.stringify(err));
            this.chatRequestId = undefined;
            throw err;
        }
    }

    cancelChatProcess(requestId) {
        console.log('CozeAdapter: cancelChatProcess');
        if (
            this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL ||
            this.currentChatMode === CHAT_TYPE.CHAT_TYPE_OPERATE_PC
        ) {
            if (requestId !== this.chatRequestId) return;
        }
        this._resetChatProcess();
    }

    startChatSessionExpireTimer() {
        return new Promise(resolve => {
            if (!this.useChatContext) {
                this._resetChatProcess();
                resolve(0);
                return;
            }

            clearTimeout(this.chatSessionExpiredTimer);

            let sessionExpiredTimeout = 500;
            if (this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL) {
                sessionExpiredTimeout = AI_CONSTANT_CONFIG.SESSION_EXPIRE_TIMEOUT;
            }

            this.chatSessionExpiredTimer = setTimeout(() => {
                console.log('CozeAdapter: sendChatMessage chat session with context expired. Cancel chat session.');
                this._resetChatProcess();
                resolve(1);
            }, sessionExpiredTimeout);
        });
    }

    cancelChatExpireTimer() {
        console.log('CozeAdapter: cancelChatExpireTimer');
        clearTimeout(this.chatSessionExpiredTimer);
    }

    setChatMode(mode) {
        this.currentChatMode = mode;
    }

    getChatMode() {
        return this.currentChatMode;
    }

    setUseChatContext(useContext) {
        this.useChatContext = useContext;
    }

    getUseChatContext() {
        return this.useChatContext;
    }

    chatWithAI(requestId, params) {
        clearTimeout(this.chatSessionExpiredTimer);

        if (requestId !== this.chatRequestId) {
            this._resetChatProcess();
        }

        this.chatRequestId = requestId;

        this._sendChatMessage(requestId, params);
    }

    setChatResponseListener(listener) {
        this.chatResponseListener = listener;
    }

    destroyChatEngine() {
        console.log('CozeAdapter: destroyChatEngine');

        this.chatResponseListener = undefined;
        this.cancelChatProcess();
        this.cancelChatExpireTimer();

        ipcMain.removeAllListeners('AssistantChatResponse');
    }

    _sendChatMessage(requestId, params) {
        return new Promise((resolve, reject) => {
            const that = this;

            const requestParams = this._generateChatRequestParams(requestId, params);

            console.log(
                'CozeAdapter: _sendChatMessage: requestId: ',
                requestId,
                ' this.modelName: ',
                this.modelName,
                ' requestData: ',
                requestParams.data
            );


            that.waitChatResponseCallback = resolve;

            axios(requestParams)
                .then(response => {
                    if (!params.stream) {
                        console.log('CozeAdapter: sendChatMessage NONE Stream Response: ' + JSON.stringify(response));

                        that.retrieveNoneStreamTask = setTimeout(() => {
                            that._startRetrieveNoneStreamResponse(
                                requestId,
                                response.data.conversation_id,
                                response.data.id
                            );
                        }, 1000);
                        return;
                    }

                    let cachedChunkMsg = '';

                    // Handle the stream response
                    response.on('data', chunk => {
                        if (requestId !== that.chatRequestId) return;

                        // Process each chunk of data
                        const chunkMsg = chunk.toString();

                        cachedChunkMsg += chunkMsg.trim();

                        if (!cachedChunkMsg.endsWith('}')) {
                            return;
                        }
                        const lines = cachedChunkMsg.split('\n');

                        if (lines.length < 2) {

                            try {
                                const tempData = JSON.parse(cachedChunkMsg);
                                if (tempData.code) {
                                    if (that.chatResponseListener !== undefined) {
                                        that.chatResponseListener(requestId, -1, tempData.msg);
                                    }
                                }
                                return;
                            } catch (err) {
                                if (that.chatResponseListener !== undefined) {
                                    that.chatResponseListener(requestId, -1, '');
                                }
                                console.log('CozeAdapter: sendChatMessage: Received Error chunk: ', cachedChunkMsg);
                                return;
                            }
                        }

                        const event = lines[0].split(':')[1].trim();
                        const dataStr = lines[1].substring(lines[1].indexOf(':') + 1).trim();
                        let data = {};
                        try {
                            data = JSON.parse(dataStr);
                        } catch (err) {
                            console.log('CozeAdapter: sendChatMessage: Received chunk invalid lines: ', lines);
                        }


                        switch (event) {
                            case 'conversation.chat.created':
                                break;
                            case 'conversation.chat.in_progress':
                                break;
                            case 'conversation.message.delta':
                                if (that.chatResponseListener === undefined) break;

                                that.chatResponseListener(requestId, 1, data.content, CHUNK_MSG_TYPE.ANSWER);
                                break;
                            case 'conversation.message.completed':

                                if (data.type !== 'follow_up') break;

                                if (that.chatResponseListener !== undefined) {
                                    that.chatResponseListener(requestId, 1, data.content, CHUNK_MSG_TYPE.FOLLOW_UP);
                                }
                                break;
                            case 'conversation.chat.completed':

                                if (data.status === 'completed' && data.usage) {
                                    console.log(
                                        'CozeAdapter: sendChatMessage: Msg completed: Usage: ',
                                        data.usage
                                    );
                                }
                                break;
                            case 'conversation.chat.failed':
                                break;
                            case 'conversation.chat.requires_action':
                                break;
                            case 'error':
                                console.log('CozeAdapter: sendChatMessage: Returned Error: ', data);

                                if (that.chatResponseListener !== undefined) {
                                    that.chatResponseListener(requestId, -1, '');
                                }

                                reject();
                                break;
                            case 'done':
                                break;
                        }

                        cachedChunkMsg = '';
                    });

                    response.on('end', () => {
                        console.log('CozeAdapter: sendChatMessage: Stream ended.');
                        that.requestIdReqControllerMap.delete(requestId);

                        if (that.chatResponseListener !== undefined) {
                            that.chatResponseListener(requestId, 2, '');
                        }
                        resolve();
                    });
                })
                .catch(err => {
                    console.log('CozeAdapter: sendChatMessage: Error: ', err);
                    that.requestIdReqControllerMap.delete(requestId);

                    if (that.chatResponseListener !== undefined) {
                        that.chatResponseListener(requestId, -1, '');
                    }
                    reject();
                });
        });
    }

    _resetChatProcess() {
        console.log('CozeAdapter: resetChatProcess');

        const requestCancelController = this.requestIdReqControllerMap.get(this.chatRequestId);
        if (requestCancelController !== undefined) {
            requestCancelController.abort();
        }

        clearTimeout(this.retrieveNoneStreamTask);

        this.requestIdReqControllerMap.delete(this.chatRequestId);

        this.chatRequestId = '';
        this.waitChatResponseCallback = undefined;
    }

    _generateChatRequestParams(requestId, params) {
        let botId = this.appManager.storeManager.storeGet('aiConfig.' + this.modelName + '.modelName');
        console.log('CozeAdapter: _generateChatRequestParams: requestId: ', requestId, ' botId: ', botId);

        if (botId === undefined) {
            botId = '';
        }

        const chatHistory = params.messages.map(msg => {
            const newMsg = Object.assign({}, msg);

            if (newMsg.role === 'system') {
                newMsg.role = 'user';
            }

            if (newMsg.role === 'user') {
                newMsg.type = 'question';
            } else {
                newMsg.type = 'answer';
            }

            newMsg.content_type = 'text';

            return newMsg;
        });

        const controller = new AbortController();
        const signal = controller.signal;

        this.requestIdReqControllerMap.set(requestId, controller);

        return {
            headers: this._getAuthHeader(),
            url: COZE_SERVER_URL,
            method: 'POST',
            data: {
                user_id: requestId,
                bot_id: botId,
                stream: params.stream,
                additional_messages: chatHistory,
                auto_save_history: true,
            },
            responseType: params.stream ? 'stream' : undefined,
            signal: signal,
        };
    }

    _getAuthHeader() {
        const apiKey = this.appManager.storeManager.storeGet('aiConfig.' + this.modelName + '.apiKey');

        if (apiKey === undefined) {
            return '';
        }

        return {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    _startRetrieveNoneStreamResponse(requestId, conversationId, chatId) {
        if (this.waitChatResponseCallback === undefined) return;

        const that = this;

        axios({
            headers: this._getAuthHeader(),
            url: COZE_SERVER_URL + '/retrieve',
            method: 'GET',
            params: {
                conversation_id: conversationId,
                chat_id: chatId,
            },
        })
            .then(response => {
                if (response.code !== 0) {
                    that.waitChatResponseCallback('');
                    return;
                }

                const responseData = response.data;

                switch (responseData.status) {
                    case 'created':
                    case 'in_progress':
                        that.retrieveNoneStreamTask = setTimeout(() => {
                            that._startRetrieveNoneStreamResponse(requestId, conversationId, chatId);
                        }, 3000);
                        break;
                    case 'completed':
                        console.log(
                            'CozeAdapter: _startRetrieveNoneStreamResponse: Msg completed: Usage: ',
                            responseData.usage
                        );
                        that._retrieveFinalResponse(requestId, conversationId, chatId);
                        break;
                    case 'failed':
                    case 'requires_action':
                        console.log('CozeAdapter: _startRetrieveNoneStreamResponse: Msg ERROR: ', responseData);
                        that.waitChatResponseCallback('');
                        return;
                }
            })
            .catch(err => {
                console.log('CozeAdapter: _startRetrieveNoneStreamResponse: Error: ', err);
            });
    }

    _retrieveFinalResponse(requestId, conversationId, chatId) {
        if (this.waitChatResponseCallback === undefined) return;

        const that = this;

        axios({
            headers: this._getAuthHeader(),
            url: COZE_SERVER_URL + '/message/list',
            method: 'GET',
            params: {
                conversation_id: conversationId,
                chat_id: chatId,
            },
        })
            .then(response => {
                if (response.code !== 0) {
                    that.waitChatResponseCallback('');
                    return;
                }

                const responseData = response.data;

                console.log('CozeAdapter: _retrieveFinalResponse: ResponseData: ', responseData);

                for (let i = 0; i < responseData.length; i++) {
                    const msgData = responseData[i];
                    if (msgData.role === 'assistant' && msgData.type === 'answer') {
                        console.log('CozeAdapter: _retrieveFinalResponse: ResolveCallback: ', msgData.content);
                        that.waitChatResponseCallback(msgData.content);
                        return;
                    }
                }
            })
            .catch(err => {
                console.log('CozeAdapter: _retrieveFinalResponse: ERROR', err);
            });
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

export default CozeAdapter;
