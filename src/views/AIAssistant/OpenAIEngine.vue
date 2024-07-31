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
    <div />
</template>

<script>
import OpenAI from 'openai';
import { ipcRenderer } from 'electron';
import {AI_CONSTANT_CONFIG, OPEN_AI_IPC_MESSAGE} from '@/main/ai/ConstantData';
import {deepCopy} from "@/utils/ObjectUtil";

export default {
    name: 'OpenAIEngine',
    data() {
        return {
            chatRequestIds: [],
            jsonFixType: ['rm \n', 'rm \\"', 'add }']
        };
    },
    created() {
        ipcRenderer.on('chatWithAssistant', (event, args) => {
            this.sendChatMessage(args.requestId, args.params, args.apiKey, args.baseUrl);
        });
        ipcRenderer.on('cancelChatWithAssistant', (event, args) => {
            this.removeRequestId(args.requestId);
        });
        ipcRenderer.on(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE, (event, args) => {
            const requestId = args.requestId;
            const openai = new OpenAI({
                apiKey: args.apiKey,
                baseURL: args.baseUrl,
                dangerouslyAllowBrowser: true,
            });

            switch (args.type) {
                case OPEN_AI_IPC_MESSAGE.UPLOAD_FILE:
                    this.handleUploadFile(openai, requestId, args.filePath, args.purpose);
                    break;
                case OPEN_AI_IPC_MESSAGE.LIST_FILE:
                    this.handleListFile(openai, requestId);
                    break;
                case OPEN_AI_IPC_MESSAGE.RETRIEVE_FILE:
                    this.handleRetrieveFile(openai, requestId, args.fileId);
                    break;
                case OPEN_AI_IPC_MESSAGE.RETRIEVE_FILE_CONTENT:
                    this.handleRetrieveFileContent(openai, requestId, args.fileId);
                    break;
                case OPEN_AI_IPC_MESSAGE.DELETE_FILE:
                    this.handleDeleteFile(openai, requestId, args.fileId);
                    break;
            }
        });
    },
    methods: {
        async handleUploadFile(openai, requestId, filePath, purpose) {
            const file = await openai.files.create({
                file: window.fs.createReadStream(filePath),
                purpose: purpose,
            });

            ipcRenderer.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.UPLOAD_FILE,
                resultData: file,
            });
        },
        async handleListFile(openai, requestId) {
            const list = await openai.files.list();

            const fileList = [];

            for await (const file of list) {
                fileList.push(file);
            }

            ipcRenderer.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.LIST_FILE,
                resultData: fileList,
            });
        },
        async handleRetrieveFile(openai, requestId, fileId) {
            const file = await openai.files.retrieve(fileId);

            ipcRenderer.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.RETRIEVE_FILE,
                resultData: file,
            });
        },
        async handleRetrieveFileContent(openai, requestId, fileId) {
            const file = await openai.files.content(fileId);

            ipcRenderer.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.RETRIEVE_FILE_CONTENT,
                resultData: file,
            });
        },
        async handleDeleteFile(openai, requestId, fileId) {
            const file = await openai.files.del(fileId);

            ipcRenderer.send(OPEN_AI_IPC_MESSAGE.CHANNEL_MANIPULATE_FILE_RESULT, {
                requestId: requestId,
                type: OPEN_AI_IPC_MESSAGE.DELETE_FILE,
                resultData: file,
            });
        },
        removeRequestId(removeRequestId) {
            this.chatRequestIds = this.chatRequestIds.filter(requestId => requestId !== removeRequestId);
        },
        haveRequestId(requestId) {
            return this.chatRequestIds.includes(requestId);
        },
        async sendChatMessage(requestId, params, apiKey = '', baseUrl) {
            try {
                if (!this.haveRequestId(requestId)) {
                    this.chatRequestIds.push(requestId);
                }
                console.log(
                    'OpenAIEngine: sendChatMessage: requestId: ',
                    requestId,
                    ' params: ',
                    JSON.stringify(params),
                    ' apiKey: ' + apiKey,
                    ' baseUrl: ',
                    baseUrl
                );
                const openai = new OpenAI({
                    apiKey: apiKey,
                    baseURL: baseUrl,
                    dangerouslyAllowBrowser: true,
                });
                const useStream = params.stream === undefined ? false : params.stream;

                const that = this;
                if (useStream) {
                    const chatContext = await this.awaitWithTimeout(openai.chat.completions.create(params), 10000);
                    for await (const chunk of chatContext) {
                        if (chunk.choices[0].delta.content === undefined) continue;

                        if (!that.haveRequestId(requestId)) {
                            return;
                        }

                        const chatFrameResponse = chunk.choices[0].delta.content;
                        // console.log('OpenAIEngine: sendChatMessage: Received Chunk: ' + chunk.choices[0].delta.content + ' choicesInfo: ', chunk.choices[0]);
                        ipcRenderer.send('AssistantChatResponse', {
                            requestId: requestId,
                            status: 1,
                            message: chatFrameResponse,
                        });
                    }

                    ipcRenderer.send('AssistantChatResponse', {
                        requestId: requestId,
                        status: 2,
                        message: '',
                    });

                    that.removeRequestId(requestId);

                    console.log('OpenAIEngine: sendChatMessage: Stream Cost: ', (chatContext ? chatContext.usage : 'unknown'));
                    return;
                }

                let chatFrameResponse, chatContext;
                try {
                    chatContext = await that.awaitWithTimeout(openai.chat.completions.create(params), AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);
                    chatFrameResponse = chatContext.choices[0].message.content;
                } catch (err) {
                    if (err.code === 'json_validate_failed') {
                        let errorJson = deepCopy(err.error.failed_generation);
                        for (let i = 0; i < that.jsonFixType.length; i++) {
                            errorJson = that.tryFixJson(errorJson, that.jsonFixType[i]);
                            try {
                                chatFrameResponse = JSON.stringify(eval('(' + errorJson + ')'));
                                console.log(
                                    'OpenAIEngine: sendChatMessage: OpenAI server returned error, but decode success.'
                                );
                            } catch (err) {
                                console.log('OpenAIEngine: sendChatMessage: OpenAI server returned error, Decode failed on index: ' + i + ' value: ' + that.jsonFixType[i]);
                            }
                        }
                        console.log(
                            'OpenAIEngine: sendChatMessage: OpenAI server returned error. Cancel Chat process. Generated invalid json: ' +
                            err.error.failed_generation + ' Tried fix final JSON: ' + errorJson
                        );
                        chatFrameResponse = err.error.failed_generation;
                    } else {
                        console.log(
                            'OpenAIEngine: sendChatMessage: OpenAI server returned error. Cancel Chat process. Error1: ' +
                                JSON.stringify(err)
                        );
                        ipcRenderer.send('AssistantChatResponse', {
                            requestId: requestId,
                            status: -1,
                            message: 'Failed to get chat response from server.',
                        });
                        this.removeRequestId(requestId);
                        return;
                    }
                }

                if (!that.haveRequestId(requestId)) {
                    return;
                }
                this.removeRequestId(requestId);

                ipcRenderer.send('AssistantChatResponse', {
                    requestId: requestId,
                    status: 2,
                    message: chatFrameResponse,
                });

                console.log('OpenAIEngine: sendChatMessage: Non-Stream Cost: ', (chatContext ? chatContext.usage : 'unknown'));
            } catch (err) {
                console.log('OpenAIEngine: chatWithOpenAI: failed to connect to OpenAI server. Cancel Chat process. Error: ', err);
                ipcRenderer.send('AssistantChatResponse', {
                    requestId: requestId,
                    status: -1,
                    message: err.message
                });
                this.removeRequestId(requestId);
            }
        },
        timeout(ms) {
            return new Promise((resolve, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms));
        },
        tryFixJson(invalidJson, fixType) {
            const [fixAction, fixValue] = fixType.split(' ');
            console.log('OpenAIEngine: tryFixJson: fixAction: ' + fixAction + ' fixValue: ' + fixValue);
            switch (fixAction) {
                case 'rm':
                    return invalidJson.replaceAll(fixValue, '');
                case 'add':
                    return invalidJson += fixValue;
            }
        },
        async awaitWithTimeout(promise, timeoutMs) {
            const timeoutPromise = this.timeout(timeoutMs);
            try {
                return await Promise.race([promise, timeoutPromise]);
            } catch (error) {
                console.log('Promise Error.', error);
                throw error;
            }
        },
    },
};
</script>

<style scoped></style>
