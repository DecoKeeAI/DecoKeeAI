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
import {AI_CONSTANT_CONFIG, CHAT_TYPE} from "@/main/ai/ConstantData";

const CryptoJS = require('crypto-js')
const WebSocket = require('ws')
// const fs = require('fs')

// 系统配置
const config = {
    // 语音识别 请求地址
    voiceRecognizeHostUrl: "wss://iat-api.xfyun.cn/v2/iat",
    voiceRecognizeHost: "iat-api.xfyun.cn",
    voiceRecognizeUri: "/v2/iat",
    // TTS 请求地址
    ttsHostUrl: "wss://tts-api.xfyun.cn/v2/tts",
    ttsHost: "tts-api.xfyun.cn",
    ttsUri: "/v2/tts",
    // 星火3.5 Max 请求地址
    spark35MaxHostUrl: "wss://spark-api.xf-yun.com/v3.5/chat",
    spark35MaxHost: "spark-api.xf-yun.com",
    spark35MaxUri: "/v3.5/chat",
    spark35MaxModelDomain: "generalv3.5",

    // 星火 3.5 Pro 请求地址
    spark3ProHostUrl: "wss://spark-api.xf-yun.com/v3.1/chat",
    spark3ProHost: "spark-api.xf-yun.com",
    spark3ProUri: "/v3.1/chat",
    spark3ProModelDomain: "generalv3",

    // 星火 4 Ultra 请求地址
    spark4UltraHostUrl: "wss://spark-api.xf-yun.com/v4.0/chat",
    spark4UltraHost: "spark-api.xf-yun.com",
    spark4UltraUri: "/v4.0/chat",
    spark4UltraModelDomain: "4.0Ultra",

    appid: "",
    apiSecret: "",
    apiKey: ""
}

// 帧定义
const FRAME = {
    STATUS_FIRST_FRAME: 0,
    STATUS_CONTINUE_FRAME: 1,
    STATUS_LAST_FRAME: 2
}

let storeManager = undefined;

class XFYAdapter {
    constructor(chatMode, chatEngineModel, StoreManager) {

        storeManager = StoreManager;

        // 获取当前时间 RFC1123格式
        const date = new Date().toGMTString()
        // 设置当前临时状态为初始化
        this.recognizeFrameSendStatus = FRAME.STATUS_FIRST_FRAME
        // 记录本次识别用sid
        this.currentRecognizeSid = ""

        this.voiceRecognizeUrl = config.voiceRecognizeHostUrl + "?authorization=" + getAuthStr(date, config.voiceRecognizeHost, config.voiceRecognizeUri) + "&date=" + date + "&host=" + config.voiceRecognizeHost
        this.ttsUrl = config.ttsHostUrl + "?authorization=" + getAuthStr(date, config.ttsHost, config.ttsUri) + "&date=" + date + "&host=" + config.ttsHost
        switch (chatEngineModel) {
            case 'spark3.5':
            case 'spark3.5-max':
                this.sparkUrl = config.spark35MaxHostUrl + "?authorization=" + getAuthStr(date, config.spark35MaxHost, config.spark35MaxUri) + "&date=" + date + "&host=" + config.spark35MaxHost
                this.sparkDomain = config.spark35MaxModelDomain;
                break;
            case 'spark4-ultra':
                this.sparkUrl = config.spark4UltraHostUrl + "?authorization=" + getAuthStr(date, config.spark4UltraHost, config.spark4UltraUri) + "&date=" + date + "&host=" + config.spark4UltraHost
                this.sparkDomain = config.spark4UltraModelDomain;
                break;
            case 'spark-pro':
                this.sparkUrl = config.spark3ProHostUrl + "?authorization=" + getAuthStr(date, config.spark3ProHost, config.spark3ProUri) + "&date=" + date + "&host=" + config.spark3ProHost
                this.sparkDomain = config.spark3ProModelDomain;
                break;
        }


        this.chatResponseCallback = undefined;

        this.voiceRecognizeWS = undefined;
        this.ttsWS = undefined;
        this.sparkWS = undefined;

        this.recognizeResultListener = undefined;
        this.ttsConvertResultListener = undefined;
        this.chatResponseListener = undefined;
        this.recognizeRequestId = '';
        this.ttsConvertRequestId = '';
        this.chatRequestId = '';

        this.ttsOrderQueue = [];
        this.ttsQueueCheckStart = false;

        this.currentChatFrameResponse = '';
        this.useChatContext = true;
        this.currentChatMode = chatMode;
        this.chatWithStream = false;
        this.currentChatSid = undefined;

        this.chatSessionExpiredTimer = undefined;

        this.sendFrameCount = 0;

        console.log('XFYAdapter constructor chatEngineModel: ' + chatEngineModel + ' ChatMode: ' + this.currentChatMode + ' sparkUrl: ' + this.sparkUrl + ' sparkDomain: ' + this.sparkDomain);
    }

    async sendAudioData(requestId, data, isLast) {
        if (this.recognizeRequestId !== requestId) {
            this._resetCurrentTTSConvert()
        }
        if (this.voiceRecognizeWS === undefined || this.voiceRecognizeWS.readyState !== WebSocket.OPEN) {
            this._connectToRecognizeServer()
        }
        this.recognizeRequestId = requestId
        // console.log('XFYAdapter: sendAudioData: Sending requestId: ' + requestId + ' frame: ' + this.sendFrameCount + ' isLast: ' + isLast + ' Status: ' + this.recognizeFrameSendStatus + ' WSState: ' + this.voiceRecognizeWS.readyState)

        let recheckConnectCount = 0
        while (this.voiceRecognizeWS.readyState !== WebSocket.OPEN) {
            await sleep(500)
            if (this.voiceRecognizeWS === undefined) {
                this._resetCurrentTTSConvert()
                return
            }
            if (this.voiceRecognizeWS.readyState !== WebSocket.OPEN) {
                recheckConnectCount++
            }
            if (recheckConnectCount >= 3) {
                console.log('XFYAdapter: sendAudioData: failed to connect to WS server. Cancel recognize.')
                this._resetCurrentTTSConvert()
                return
            }
        }

        if (isLast) {
            console.log('XFYAdapter: sendAudioData Info for requestId: ' + requestId + ' TotalFrames: ' + this.sendFrameCount);
            this.recognizeFrameSendStatus = FRAME.STATUS_LAST_FRAME
            this._sendRecognizeData("")
        } else {
            this._sendRecognizeData(btoa(new Uint8Array(data.buffer).reduce((accumulator, current) => accumulator + String.fromCharCode(current), '')))
        }
    }

    setRecognizeResultListener(listener) {
        this.recognizeResultListener = listener
    }

    setTTSConvertResultListener(listener) {
        this.ttsConvertResultListener = listener
    }

    setChatResponseListener(listener) {
        this.chatResponseListener = listener;
    }

    cancelCurrentRecognize() {
        console.log('XFYAdapter: cancelCurrentRecognize')
        this.recognizeRequestId = ''
        if (!this.voiceRecognizeWS) {
            return
        }

        this.voiceRecognizeWS.close()
        this.voiceRecognizeWS.terminate()
        this.voiceRecognizeWS = undefined
    }

    playTTS(requestId, text) {
        this.ttsOrderQueue.push({
            requestId: requestId,
            message: text
        });

        this._checkTTSQueueAndConvert();
    }

    cancelCurrentTTSConvert() {
        console.log('XFYAdapter: cancelCurrentTTSConvert')
        this._resetCurrentTTSConvert()
    }

    async chatWithAI(requestId, params) {
        clearTimeout(this.chatSessionExpiredTimer);

        if (this.currentChatSid) {
            let waitLastSessionEndCount = 0;
            while (waitLastSessionEndCount < 3) {
                await sleep(500)
                if (this.currentChatSid === undefined) {
                    break;
                }
                waitLastSessionEndCount += 1;
                if (waitLastSessionEndCount >= 3) {
                    console.log('XFYAdapter: chatWithAI: timeout on wait last session close.')
                    break;
                }
            }
        }

        this.chatRequestId = requestId;

        if (this.sparkWS === undefined || this.sparkWS.readyState !== WebSocket.OPEN) {
            await this._connectToSparkServer();
        }
        this._sendChatMessage(requestId, params);
    }

    async chatWithAssistant(requestId, params) {
        console.log('XFYAdapter: chatWithAssistant: requestId: ' + requestId + ' LastChatRequestId: ' + this.chatRequestId);
        clearTimeout(this.chatSessionExpiredTimer);

        if (this.currentChatSid) {
            let waitLastSessionEndCount = 0;
            while (waitLastSessionEndCount < 3) {
                await sleep(500)
                if (this.currentChatSid === undefined) {
                    break;
                }
                waitLastSessionEndCount += 1;
                if (waitLastSessionEndCount >= 3) {
                    console.log('XFYAdapter: chatWithAssistant: timeout on wait last session close.')
                    break;
                }
            }
        }

        this.chatRequestId = requestId;

        if (this.sparkWS === undefined || this.sparkWS.readyState !== WebSocket.OPEN) {
            await this._connectToSparkServer();
        }

        try {
            return await awaitWithTimeout(this._sendChatMessage(requestId, params), AI_CONSTANT_CONFIG.CHAT_RESPONSE_TIMEOUT);
        } catch (err) {
            console.error('XFYAdapter: sendChatMessage: error: ', err);
            this._resetChatProcess();
            throw err;
        }
    }

    cancelChatProcess() {
        console.log('XFYAdapter: cancelChatProcess')
        this._resetChatProcess();
    }

    startChatSessionExpireTimer() {
        return new Promise((resolve) => {
            if (!this.useChatContext) {
                this.chatRequestId = '';
                resolve(0);
                return;
            }
            let sessionExpiredTimeout = 500;
            if (this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL) {
                sessionExpiredTimeout = AI_CONSTANT_CONFIG.SESSION_EXPIRE_TIMEOUT;
            }

            clearTimeout(this.chatSessionExpiredTimer);
            this.chatSessionExpiredTimer = setTimeout(() => {
                console.log('XFYAdapter: sendChatMessage chat session with context expired. Cancel chat session.')
                this._resetChatProcess();
                resolve(1);
            }, sessionExpiredTimeout);
        })
    }

    cancelChatExpireTimer() {
        console.log('XFYAdapter: cancelChatExpireTimer')
        clearTimeout(this.chatSessionExpiredTimer);
    }

    setChatMode(mode) {
        this.currentChatMode = mode;
    }

    getChatMode() {
        return this.currentChatMode;
    }

    setUseChatContext(useContext) {
        this.currentChatFrameResponse = ''
        this.useChatContext = useContext
    }

    getUseChatContext() {
        return this.useChatContext;
    }

    destroyChatEngine() {
        console.log('XFYAdapter: destroyChatEngine')
        this.cancelChatProcess();
        this.chatResponseListener = undefined;
    }

    destroy() {
        console.log('XFYAdapter: destroyChatEngine');

        this.destroyChatEngine();

        this.cancelCurrentTTSConvert();
    }

// ======================================== Voice Recognize Functions =======================================

    _connectToRecognizeServer() {
        this.voiceRecognizeWS = new WebSocket(this.voiceRecognizeUrl)

        this.recognizeFrameSendStatus = FRAME.STATUS_FIRST_FRAME

        this.sendFrameCount = 0
        const iatResult = []
        // 连接建立完毕，读取数据进行识别
        this.voiceRecognizeWS.on('open', (event) => {
            console.log("XFYAdapter: VoiceRecognize websocket connect!", event)
        })

        // 得到识别结果后进行处理，仅供参考，具体业务具体对待
        this.voiceRecognizeWS.on('message', (data, err) => {
            if (err) {
                console.log(`XFYAdapter: VoiceRecognize  err:${err}`)
                return
            }
            const res = JSON.parse(data)
            if (res.code !== 0) {
                console.log(`XFYAdapter: VoiceRecognize  error code ${res.code}, reason ${res.message}`)
                return
            }

            let str = ""
            if (res.data.status === 2) {
                // res.data.status ==2 说明数据全部返回完毕，可以关闭连接，释放资源
                this.currentRecognizeSid = res.sid
                this.voiceRecognizeWS.close()
                this.voiceRecognizeWS = undefined
            }
            iatResult[res.data.result.sn] = res.data.result
            if (res.data.result.pgs === 'rpl') {
                res.data.result.rg.forEach(i => {
                    iatResult[i] = null
                })
            }
            iatResult.forEach(i => {
                if (i !== null) {
                    i.ws.forEach(j => {
                        j.cw.forEach(k => {
                            str += k.w
                        })
                    })
                }
            })
            console.log('XFYAdapter: VoiceRecognize Status: ' + res.data.status + '  Result: ' + str)

            if (res.data.status === 2 && this.recognizeResultListener) {
                this.recognizeResultListener(this.recognizeRequestId, str)
            }
        })

        // 资源释放
        this.voiceRecognizeWS.on('close', () => {
            console.log(`XFYAdapter: VoiceRecognize  本次识别sid：${this.currentRecognizeSid}`)
            console.log('XFYAdapter: VoiceRecognize  connect close!')
        })

        // 建连错误
        this.voiceRecognizeWS.on('error', (err) => {
            console.log("XFYAdapter: VoiceRecognize websocket connect err: " + err)
        })
    }

// 传输数据
    _sendRecognizeData(data) {
        this.sendFrameCount++
        let frame = "";
        let frameDataSection = {
            "status": this.recognizeFrameSendStatus,
            "format": "audio/L16;rate=16000",
            "audio": (data === '' ? data.toString('base64') : data),
            "encoding": "raw"
        }
        const currentLanguage = global.appManager.storeManager.storeGet('system.locale');
        switch (this.recognizeFrameSendStatus) {
            case FRAME.STATUS_FIRST_FRAME:
                frame = {
                    // 填充common
                    common: {
                        app_id: config.appid
                    },
                    //填充business
                    business: {
                        language: currentLanguage === 'en' ? "en_us" : "zh_cn",
                        domain: "iat",
                        accent: "mandarin",
                        dwa: "wpgs" // 可选参数，动态修正
                    },
                    //填充data
                    data: frameDataSection
                }
                this.recognizeFrameSendStatus = FRAME.STATUS_CONTINUE_FRAME;
                break;
            case FRAME.STATUS_CONTINUE_FRAME:
            case FRAME.STATUS_LAST_FRAME:
                //填充frame
                frame = {
                    data: frameDataSection
                }
                break;
        }
        this.voiceRecognizeWS.send(JSON.stringify(frame))
    }

// ======================================== END Voice Recognize Functions =======================================

// ======================================== TTS Functions =======================================================

    _connectToTTSServer() {
        return new Promise((resolve, reject) => {

            this.ttsWS = new WebSocket(this.ttsUrl)

            // 连接建立完毕，读取数据进行识别
            this.ttsWS.on('open', () => {
                console.log("XFYAdapter: TTS websocket connect!")
                resolve();
            })

            // 得到结果后进行处理，仅供参考，具体业务具体对待
            this.ttsWS.on('message', (data, err) => {
                if (err) {
                    console.log('XFYAdapter: TTS message error: ' + err)
                    return
                }

                let res = JSON.parse(data)

                if (res.sid) {
                    this.currentTTSPlaySid = res.sid;
                    console.log('XFYAdapter: TTS message this.currentTTSPlaySid: ' + this.currentTTSPlaySid)
                }

                if (res.code !== 0) {
                    console.log(`XFYAdapter: TTS Error: ${res.code}: ${res.message}`)
                    this.ttsWS.close()
                    return
                }
                let audio = res.data.audio

                if (this.ttsConvertResultListener) {
                    let audioData = transToAudioData(audio)
                    this.ttsConvertResultListener(this.ttsConvertRequestId, audioData)
                }
                if (res.code === 0 && res.data.status === 2) {
                    this.ttsWS.close()
                }
            })

            // 资源释放
            this.ttsWS.on('close', () => {
                this.currentTTSPlaySid = undefined;
                console.log('XFYAdapter: TTS connect close!')
            })

            // 连接错误
            this.ttsWS.on('error', (err) => {
                console.log("XFYAdapter: TTS websocket connect err: " + err);
                reject(err);
            })
        });
    }

    async _checkTTSQueueAndConvert() {
        if (this.ttsQueueCheckStart) return;

        this.ttsQueueCheckStart = true;
        while (this.ttsOrderQueue.length !== 0) {
            const ttsRequestInfo = this.ttsOrderQueue.shift();
            await this._convertToSpeechAnnouncement(ttsRequestInfo.requestId, ttsRequestInfo.message);
        }
        this.ttsQueueCheckStart = false;
    }

    async _convertToSpeechAnnouncement(requestId, text) {
        if (requestId !== this.ttsConvertRequestId) {
            this._resetCurrentTTSConvert();
        }
        console.log('XFYAdapter: convertToSpeechAnnouncement: RequestId: ' + this.ttsConvertRequestId + ' Text: ' + text)
        if (text === '' || text === ' ') {
            console.log('XFYAdapter: convertToSpeechAnnouncement: Empty text to play. Ignore request')
            return
        }

        this.ttsConvertRequestId = requestId

        let recheckConnectCount = 0;
        while (this.ttsWS && this.ttsWS.readyState === WebSocket.OPEN) {
            await sleep(500);
            if (this.ttsWS === undefined) {
                break;
            }
            if (this.ttsWS.readyState === WebSocket.OPEN) {
                recheckConnectCount++
            }
            if (recheckConnectCount >= 100) {
                console.log('XFYAdapter: sendAudioData: failed to connect to WS server. Cancel recognize.')
                this._resetCurrentTTSConvert()
                break;
            }
        }


        if (this.currentTTSPlaySid) {
            let waitLastSessionEndCount = 0;
            while (waitLastSessionEndCount < 20) {
                console.log('XFYAdapter: convertToSpeechAnnouncement: Pending last to finish');
                await sleep(500)
                if (this.currentTTSPlaySid === undefined) {
                    break;
                }
                waitLastSessionEndCount += 1;
                if (waitLastSessionEndCount >= 20) {
                    console.log('XFYAdapter: chatWithAI: timeout on wait last session close.')
                    break;
                }
            }
        }

        if (this.ttsWS === undefined || this.ttsWS.readyState !== WebSocket.OPEN) {
            await this._connectToTTSServer();
        }

        this._sendTTSData(text);
    }

    _resetCurrentTTSConvert() {
        console.log('XFYAdapter: resetCurrentTTSConvert');
        this.ttsConvertRequestId = '';

        if (this.ttsWS === undefined) {
            return
        }

        this.ttsWS.close()
        this.ttsWS.terminate()
        this.ttsWS = undefined
    }

    _sendTTSData(ttsText) {
        let frame = {
            // 填充common
            "common": {
                "app_id": config.appid
            },
            // 填充business
            "business": {
                "aue": "raw",
                "auf": "audio/L16;rate=16000",
                "vcn": "aisxping",
                "tte": "UTF8"
            },
            // 填充data
            "data": {
                "text": Buffer.from(ttsText).toString('base64'),
                "status": 2
            }
        }
        this.ttsWS.send(JSON.stringify(frame))
    }

// ======================================== END TTS Functions =======================================================

// ======================================== Chat Functions ===========================================================

    _connectToSparkServer() {
        return new Promise((resolve, reject) => {

            this.sparkWS = new WebSocket(this.sparkUrl);

            // 连接建立完毕，读取数据进行识别
            this.sparkWS.on('open', () => {
                console.log("XFYAdapter: Spark websocket connect!");
                resolve(0);
            })

            // 得到结果后进行处理，仅供参考，具体业务具体对待
            this.sparkWS.on('message', (data, err) => {
                if (err) {
                    console.log('XFYAdapter: Spark message error: ' + err);
                    return;
                }

                let res = JSON.parse(data);

                console.log("XFYAdapter: Spark response result: " + JSON.stringify(res));
                this.currentChatSid = res.header.sid;

                if (res.header.code !== 0) {
                    console.log(`XFYAdapter: Spark Error: ${res.header.code}: ${res.header.message}`);
                    this._resetChatProcess();
                    return;
                }
                if (res.header.code === 0 && res.header.status === 2 && !this.useChatContext) {
                    this.sparkWS.close();
                    this.sparkWS = undefined;
                }
                const choicesInfo = res.payload.choices;

                if (choicesInfo.status === 0) {
                    this.currentChatFrameResponse = '';
                }

                this.currentChatFrameResponse += choicesInfo.text[0].content;

                if (res.payload.usage && res.payload.usage.text) {
                    console.log('XFYAdapter: Spark Cost: ', res.payload.usage.text)
                }

                if (this.currentChatMode === CHAT_TYPE.CHAT_TYPE_NORMAL || this.currentChatMode === CHAT_TYPE.CHAT_TYPE_OPERATE_PC) {
                    if (this.chatWithStream) {
                        if (!this.chatResponseListener) return;

                        this.chatResponseListener(this.chatRequestId, choicesInfo.status, choicesInfo.text[0].content);
                        return;
                    }
                }

                if (choicesInfo.status === 2) {
                    if (!this.chatResponseCallback) return;
                    this.chatResponseCallback(this.currentChatFrameResponse);
                }

                this.chatRequestId = undefined;

            });

            // 资源释放
            this.sparkWS.on('close', () => {
                this.currentChatSid = undefined;
                console.log('XFYAdapter: Spark connect close!')
                if (this.chatResponseListener && this.chatRequestId && this.chatRequestId !== '') {
                    this.chatResponseListener(this.chatRequestId, 2, '');
                }
                this._resetChatProcess();
            })

            // 连接错误
            this.sparkWS.on('error', (err) => {
                console.log("XFYAdapter: Spark websocket connect err: " + err)
                if (this.chatResponseListener && this.chatRequestId && this.chatRequestId !== '') {
                    this.chatResponseListener(this.chatRequestId, 2, '');
                }
                this._resetChatProcess();
                reject(err);
            })
        });
    }

    _sendChatMessage(requestId, requestParams) {
        return new Promise(resolve => {
            console.log('XFYAdapter: sendChatMessage: requestParams: ' + JSON.stringify(requestParams));

            this.chatWithStream = requestParams.stream === undefined ? false : requestParams.stream;

            const params = {
                header: {
                    app_id: config.appid,
                    uid: "fd3f47e4-d" // todo: change to use different for each client
                },
                parameter: {
                    chat: {
                        domain: this.sparkDomain,
                        temperature: requestParams.temperature,
                        max_tokens: requestParams.max_tokens
                    }
                },
                payload: {
                    message: {
                        text: requestParams.messages
                    }
                }
            }
            console.log('XFYAdapter: sendChatMessage: params: ', JSON.stringify(params));
            this.chatResponseCallback = resolve;

            this.sparkWS.send(JSON.stringify(params));

        });
    }

    _resetChatProcess() {
        console.log('XFYAdapter: resetChatProcess')
        clearTimeout(this.chatSessionExpiredTimer);
        this.chatSessionExpiredTimer = undefined;
        this.currentChatFrameResponse = '';
        this.chatRequestId = '';
        if (this.sparkWS === undefined) {
            return;
        }
        this.sparkWS.close();
        this.sparkWS.terminate();
        this.sparkWS = undefined;
    }

}

// ======================================== END Chat Functions ========================================================


// ======================================== Common Functions ==========================================================

// 鉴权签名
function getAuthStr(date, host, uri) {

    let sparkAIConfig = storeManager.storeGet('aiConfig.xfy.apiAuth');
    console.log('XYFAdapter: getAuthStr: sparkAIConfig:', sparkAIConfig);

    if (sparkAIConfig === undefined) {
        sparkAIConfig = {
            appId: '',
            apiSecret: '',
            apiKey: ''
        }
    }

    config.appid = sparkAIConfig.appId;
    config.apiSecret = sparkAIConfig.apiSecret;
    config.apiKey = sparkAIConfig.apiKey;

    let signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${uri} HTTP/1.1`
    let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret)
    let signature = CryptoJS.enc.Base64.stringify(signatureSha)
    let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
    return authStr
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function base64ToS16(base64AudioData) {
    try {
        base64AudioData = atob(base64AudioData)

        const outputArray = new Uint8Array(base64AudioData.length)

        for (let i = 0; i < base64AudioData.length; ++i) {
            outputArray[i] = base64AudioData.charCodeAt(i)
        }
        return new Int16Array(new DataView(outputArray.buffer).buffer)
    } catch (err) {
        return new Int16Array(Buffer.from([]));
    }
}

function transS16ToF32(input) {

    let tmpData = []

    for (let i = 0; i < input.length; i++) {
        let d = input[i] < 0 ? input[i] / 0x8000 : input[i] / 0x7fff
        tmpData.push(d)
    }
    return new Float32Array(tmpData)
}

function transToAudioData(audioDataStr, fromRate = 16000, toRate = 22505) {
    let outputS16 = base64ToS16(audioDataStr)
    let output = transS16ToF32(outputS16)
    output = transSamplingRate(output, fromRate, toRate)
    output = Array.from(output)

    return output
}

function transSamplingRate(data, fromRate = 44100, toRate = 16000) {

    let fitCount = Math.round(data.length * (toRate / fromRate))
    let newData = new Float32Array(fitCount)
    let springFactor = (data.length - 1) / (fitCount - 1)

    newData[0] = data[0]

    for (let i = 1; i < fitCount - 1; i++) {
        let tmp = i * springFactor
        let before = Math.floor(tmp).toFixed()
        let after = Math.ceil(tmp).toFixed()
        let atPoint = tmp - before
        newData[i] = data[before] + (data[after] - data[before]) * atPoint
    }

    newData[fitCount - 1] = data[data.length - 1]
    return newData
}


function timeout(ms) {
    return new Promise((resolve, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms));
}

async function awaitWithTimeout(promise, timeoutMs) {
    const timeoutPromise = timeout(timeoutMs);
    try {
        return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
        console.log('Promise Error.', error);
        throw error;
    }
}

export default XFYAdapter;
