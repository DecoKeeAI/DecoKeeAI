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

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export default class {
    constructor(storeManager, classId, aiConfigData) {

        this.storeManager = storeManager;

        this.aiConfigData = aiConfigData;

        this.classId = classId;
        this.recognizeRequestId = -1;

        this.ttsConvertRequestId = -1;
        this.recognizeEngine = undefined;
        this.ttsEngine = undefined;
        this.ttsOrderQueue = [];

        if (aiConfigData !== undefined) {
            this.subscriptionKey = aiConfigData.speechServiceAPIKey;
        }

        if (this.subscriptionKey === undefined) {
            this.subscriptionKey = storeManager.storeGet('aiConfig.azure.speechServiceKey');
        }
    }

    sendAudioData(requestId, data, isLast, classId) {
        if (classId !== this.classId) return;
        // console.log(
        //     'AzureAudioEngine: sendAudioData: requestId: ',
        //     requestId,
        //     ' lastRequestId: ',
        //     this.recognizeRequestId,
        //     ' DataLength: ',
        //     data ? data.byteLength : 'null',
        //     ' DataType: ',
        //     data ? (Object.prototype.toString.call(data)) : 'unknown',
        //     ' isLast: ',
        //     isLast
        // );
        if (requestId !== this.recognizeRequestId) {
            this.cancelCurrentRecognize(classId);

            // 创建音频输入流
            const pushStream = sdk.AudioInputStream.createPushStream();
            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

            let azureServiceRegion = undefined;
            if (this.aiConfigData !== undefined) {
                azureServiceRegion = this.aiConfigData.azureServiceRegion;
            }
            if (azureServiceRegion === undefined) {
                azureServiceRegion = this.storeManager.storeGet('aiConfig.azure.serviceRegion', 'eastasia');
            }

            const speechConfig = sdk.SpeechConfig.fromSubscription(this.subscriptionKey, azureServiceRegion);

            let language = undefined;
            if (this.aiConfigData !== undefined) {
                language = this.aiConfigData.speechLanguageSelected;
            }
            if (language === undefined) {
                language = this.storeManager.storeGet('aiConfig.azure.speechLanguage', '');
            }

            console.log('AzureAudioEngine: sendAudioData: configed language: ' + language);

            speechConfig.speechRecognitionLanguage = language; // 将此行替换为你需要的语言代码

            const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            this.recognizeEngine = {
                pushStream: pushStream,
                audioConfig: audioConfig,
                speechConfig: speechConfig,
                recognizer: recognizer,
            };

            this.recognizeEngine.recognizer.recognizeOnceAsync(result => {
                console.log('AzureAudioEngine: Recognized: ' + JSON.stringify(result));
                recognizer.close();

                this.recognizeEngine = undefined;

                if (this.recognizeResultListener && result.text) {
                    this.recognizeResultListener(this.recognizeRequestId, result.text);
                }

                this.recognizeRequestId = -1;
            });
        }

        this.recognizeRequestId = requestId;

        if (data) {
            this.recognizeEngine.pushStream.write(data.buffer);
        }

        if (isLast) {
            this.recognizeEngine.pushStream.close();
        }
    }

    playTTS(requestId, text, classId) {
        if (classId !== this.classId) return;
        console.log('AzureAudioEngine: playTTS: requestId: ', requestId, ' LastRequestID: ', this.ttsConvertRequestId, ' text: ', text);
        if (requestId !== this.ttsConvertRequestId) {
            this.cancelCurrentTTSConvert(classId);

            this._initTTSConvertEngine();
        }

        this.ttsConvertRequestId = requestId;

        this.ttsOrderQueue.push({
            requestId: requestId,
            message: text,
        });

        this._checkTTSQueueAndConvert();
    }

    setRecognizeResultListener(listener) {
        console.log('AzureAudioEngine: setRecognizeResultListener');
        this.recognizeResultListener = listener;
    }

    setTTSConvertResultListener(listener) {
        console.log('AzureAudioEngine: setTTSConvertResultListener');
        this.ttsConvertResultListener = listener;
    }

    cancelCurrentRecognize(classId) {
        if (classId !== this.classId) return;
        console.log('AzureAudioEngine: cancelCurrentRecognize');
        this.recognizeRequestId = -1;

        if (this.recognizeEngine !== undefined) {

            if (this.recognizeEngine.pushStream) {
                this.recognizeEngine.pushStream.close();
            }

            if (this.recognizeEngine.recognizer) {
                this.recognizeEngine.recognizer.close();
            }
        }

        this.recognizeEngine = undefined;
    }

    cancelCurrentTTSConvert(classId) {
        if (classId !== this.classId) return;

        console.log('AzureAudioEngine: cancelCurrentTTSConvert');

        if (this.ttsEngine && this.ttsEngine.pushStream) {
            this.ttsEngine.pushStream.close();
        }

        if (this.ttsEngine && this.ttsEngine.synthesizer) {
            this.ttsEngine.synthesizer.close();
        }

        this.ttsConvertRequestId = -1;

        this.ttsOrderQueue = [];

        this.ttsEngine = undefined;
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
        console.log(
            'AzureAudioEngine: _convertToSpeechAnnouncement: RequestId: ' + this.ttsConvertRequestId + ' Text: ' + text
        );
        if (text === '' || text === ' ') {
            console.log('AzureAudioEngine: _convertToSpeechAnnouncement: Empty text to play. Ignore request');
            return;
        }

        this.ttsConvertRequestId = requestId;

        this.ttsEngine.synthesizer.speakTextAsync(text, result => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                console.log('AzureAudioEngine: Synthesis finished.');
            } else {
                console.error('AzureAudioEngine: Speech synthesis canceled, ' + result.errorDetails);
            }
        });
    }

    _initTTSConvertEngine() {
        const that = this;
        // 创建推流和音频配置
        const pushStream = sdk.PushAudioOutputStream.create({
            write(dataBuffer) {
                if (that.ttsConvertResultListener) {
                    that.ttsConvertResultListener(that.ttsConvertRequestId, dataBuffer);
                }
            },
            close() {
                console.log('AzureAudioEngine: Received Stream closed');

                if (that.ttsOrderQueue.length === 0) {
                    console.log('AzureAudioEngine: All TTS convert ended.');
                    that.ttsEngine = undefined;
                }
            },
        });
        const audioConfig = sdk.AudioConfig.fromStreamOutput(pushStream);

        let azureServiceRegion = undefined;
        if (this.aiConfigData !== undefined) {
            azureServiceRegion = this.aiConfigData.azureServiceRegion;
        }
        if (azureServiceRegion === undefined) {
            azureServiceRegion = this.storeManager.storeGet('aiConfig.azure.serviceRegion', 'eastasia');
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(this.subscriptionKey, azureServiceRegion);

        let voiceName = undefined;
        if (this.aiConfigData !== undefined) {
            voiceName = this.aiConfigData.speechVoiceSelected;
        }
        if (voiceName === undefined) {
            voiceName = this.storeManager.storeGet('aiConfig.azure.speechLanguageVoice', '');
        }

        console.log('AzureAudioEngine: sendAudioData: configed VoiceName: ' + voiceName);

        speechConfig.speechSynthesisVoiceName = voiceName; // 将此行替换为你需要的语言和声音名称

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        this.ttsEngine = {
            pushStream: pushStream,
            audioConfig: audioConfig,
            speechConfig: speechConfig,
            synthesizer: synthesizer,
        };
    }

    destroy() {
        this.cancelCurrentTTSConvert(this.classId);
        this.cancelCurrentRecognize(this.classId);
    }
}
