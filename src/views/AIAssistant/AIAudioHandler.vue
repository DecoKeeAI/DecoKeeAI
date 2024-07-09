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
        <OpenAIEngine />
        <AzureSpeechEngine v-if="speechEngineType === allSpeechEngineType.AZURE" />
    </div>
</template>

<script>
import Recorder from '@/main/ai/recorder';
import { ipcRenderer } from 'electron';
import OpenAIEngine from '@/views/AIAssistant/OpenAIEngine';
import AzureSpeechEngine from '@/views/AIAssistant/AzureSpeechEngine';
import { SPEECH_ENGINE_TYPE } from '@/main/ai/AIManager';

export default {
    name: 'AIAudioHandler',
    components: {
        OpenAIEngine,
        AzureSpeechEngine,
    },
    data() {
        return {
            allSpeechEngineType: SPEECH_ENGINE_TYPE,
            recorder: null,
            recorderConfig: {
                sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
                sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
                numChannels: 1, // 声道，支持 1 或 2， 默认是1
                compiling: true, // 是否边录边转换，默认是false
            },
            deviceSupportRecordAudio: false,
            getAudioDataTimer: null,
            recordingAudio: false,
            isSilentRecord: true,
            silentAudioCount: 0,
            aiRecognizeManager: undefined,
            audioData: [],
            audioDataOffset: 0,
            audioContext: undefined,
            bufferSource: undefined,
            deviceAIAssistantId: '',
            speechEngineType: undefined,
            resetTTSPlayTimer: undefined,
        };
    },
    mounted() {},
    created() {
        console.log('AIAudioHandler: created');

        this.audioInit();

        ipcRenderer.on('InitEngine', (event, args) => {
            console.log('AIAudioHandler: InitEngine: ', args);

            this.speechEngineType = args.engineType;
        });

        ipcRenderer.on('DestroyEngine', (event, args) => {
            console.log('AIAudioHandler: DestroyEngine: ', args);

            this.speechEngineType = undefined;
        });

        ipcRenderer.on('StartAudioRecord', (event, args) => {
            console.log('AIAudioHandler Received StartAudioRecord: ', args);
            this.deviceAIAssistantId = args.requestAssistantId;
            if (this.recordingAudio) {
                this.stopRecordAudio();
            }
            this.recordAudio();
        });

        ipcRenderer.on('StopAudioRecord', (event, args) => {
            console.log('AIAudioHandler Received StopAudioRecord: ', args);
            this.deviceAIAssistantId = args.requestAssistantId;
            if (this.recordingAudio) {
                this.stopRecordAudio();
            }
        });

        ipcRenderer.on('StopTTSPlay', (event, args) => {
            console.log('AIAudioHandler Received StopTTSPlay: ', args);
            this.resetAudio();
        });
        this.aiRecognizeManager = window.aiManager;
        this.aiRecognizeManager.setTTSConvertListener((requestId, data) =>
            this.handleTTSConvertResult(requestId, data)
        );

        ipcRenderer.send('AIAudioHandlerReady', {});
    },
    methods: {
        recordAudio() {
            console.log('AIAudioHandler： recordAudio');

            if (this.recordingAudio) {
                this.stopRecordAudio();
            }

            if (!this.recorder) {
                this.recorder = new Recorder(this.recorderConfig);
            }

            const defaultSelectedMic = window.store.storeGet('aiConfig.defaultMic');
            console.log('Record Audio With mic: ' + defaultSelectedMic);

            this.recorder.start(defaultSelectedMic).then(
                () => {
                    this.recordingAudio = true;
                    this.setupAudioProcess();
                    ipcRenderer.send('RecorderStart', {});
                    // 开始录音
                    console.log('AIAudioHandler: recordAudio Start');
                },
                error => {
                    // 出错了
                    window.aiManager.setAssistantProcessFailed();
                    this.recordingAudio = false;
                    switch (error.name || error.message) {
                        case 'NotFoundError':
                            console.log('AIAudioHandler: recordAudio: 未找到麦克风设备');
                            break;
                        default:
                            console.log('AIAudioHandler: recordAudio Error: ' + `${error.name} : ${error.message}`);
                            break;
                    }
                    this.deviceAIAssistantId = '';
                }
            );
        },
        stopRecordAudio() {
            console.log('AIAudioHandler： stopRecordAudio');

            try {
                if (this.getAudioDataTimer) {
                    clearInterval(this.getAudioDataTimer);
                    this.getAudioDataTimer = null;
                }
                if (this.recorder && this.recordingAudio) {
                    this.recorder.stop();
                    this.recorder.destroy();
                    this.recordingAudio = false;
                }
                if (this.aiRecognizeManager) {
                    this.aiRecognizeManager.recognizeVoice(this.deviceAIAssistantId, [], true);
                }
                this.isSilentRecord = true;
                this.silentAudioCount = 0;
            } catch (err) {
                console.log('AIAudioHandler： stopRecordAudio: Detected Error: ', err);
            }
        },
        setupAudioProcess() {
            this.isSilentRecord = true;
            this.silentAudioCount = 0;
            this.recorder.onprogress = params => {
                // 此处控制数据的收集频率
                // if (this.isSilentRecord && params.vol > 15) {
                //     this.isSilentRecord = false;
                // }
                //
                // if (!this.isSilentRecord) {
                //     if (this.silentAudioCount >= 15) {
                //         console.log('AIAudioHandler: onprogress: no more voice detect, stop recognize.');
                //         this.stopRecordAudio();
                //         return
                //     }
                //     if (params.vol < 15) {
                //         this.silentAudioCount++;
                //     } else {
                //         this.silentAudioCount = 0;
                //     }
                // }

                // console.log('onprogress: Check Vol: ' + params.vol.toFixed(2));
                if (params.duration >= 58) {
                    console.log(
                        'AIAudioHandler: onprogress: max audio duration reached. Stop record audio: duration: ' +
                        params.duration.toFixed(5) +
                        ' fileSize: ' +
                        params.fileSize +
                        ' vol: ' +
                        params.vol.toFixed(2)
                    );
                    this.stopRecordAudio();
                    window.aiManager.setAssistantProcessDone();
                }
            };
            // 定时获取录音的数据
            this.getAudioDataTimer = setInterval(() => {
                if (!this.recorder) {
                    return;
                }

                let newData = this.recorder.getNextData();
                if (!newData.length) {
                    return;
                }
                let byteLength = newData[0].byteLength;
                let buffer = new ArrayBuffer(newData.length * byteLength);
                let mergedAudioData = new DataView(buffer);

                // 数据合并
                for (let i = 0, iLen = newData.length; i < iLen; ++i) {
                    for (let j = 0, jLen = newData[i].byteLength; j < jLen; ++j) {
                        mergedAudioData.setInt8(i * byteLength + j, newData[i].getInt8(j));
                    }
                }

                // if (!this.isSilentRecord && this.aiRecognizeManager) {
                if (this.aiRecognizeManager) {
                    this.aiRecognizeManager.recognizeVoice(this.deviceAIAssistantId, mergedAudioData, false);
                }

                console.log(
                    'AIAudioHandler: Timer Get Audio Data Length: ' +
                    newData.length +
                    ' byteLength: ' +
                    byteLength +
                    ' TotalByteLength: ' +
                    mergedAudioData.byteLength
                );
            }, 1000);
        },

        resetAudio() {
            if (this.bufferSource) {
                try {
                    this.bufferSource.stop();
                } catch (err) {
                    console.log('AIAudioHandler: resetAudio: error: ', err);
                }
            }
            this.audioDataOffset = 0;
            this.audioData = [];
        },
        // 音频初始化
        audioInit() {
            let AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.audioContext.resume();
                this.audioDataOffset = 0;
            }
        },
        handleTTSConvertResult(requestId, data) {
            try {
                this.audioData.push(data);
                if (this.audioDataOffset === 0) {
                    this.playAnnouncement(requestId);
                }
            } catch (err) {
                console.log('AIAudioHandler: handleTTSConvertResult: Error: ', err);
            }
        },
        playAnnouncement(requestId) {
            clearTimeout(this.resetTTSPlayTimer);
            this.resetTTSPlayTimer = undefined;
            let ttsAudioData = [];
            const that = this;

            let cachedAudioData = this.audioData.slice(this.audioDataOffset);
            let audioBuffer;

            let finalAudioDataHoldArray = [];
            let totalArrayLength = 0;

            cachedAudioData.forEach(audioDataItem => {
                if (audioDataItem instanceof ArrayBuffer) {
                    const newArrayItem = new Uint8Array(audioDataItem);
                    finalAudioDataHoldArray.push(newArrayItem);

                    totalArrayLength += newArrayItem.length;
                } else {
                    ttsAudioData = ttsAudioData.concat(audioDataItem);
                }
            });

            if (finalAudioDataHoldArray.length > 0) {
                const finalAudioArray = new Uint8Array(totalArrayLength);

                let dataArrayOffset = 0;
                finalAudioDataHoldArray.forEach(arrayItem => {
                    finalAudioArray.set(arrayItem, dataArrayOffset);
                    dataArrayOffset += arrayItem.length;
                });

                this.audioDataOffset += cachedAudioData.length;

                this.audioContext.decodeAudioData(finalAudioArray.buffer.slice(0), decodedData => {
                    let bufferSource = (that.bufferSource = that.audioContext.createBufferSource());
                    bufferSource.buffer = decodedData;
                    bufferSource.connect(that.audioContext.destination);

                    // 设置音频播放完成的回调
                    bufferSource.onended = () => {
                        that.handleAudioPlayEnd(requestId);
                    };

                    bufferSource.start(0);
                });
                return;
            }

            console.log('AIAudioHandler: playAnnouncement: : ttsAudioData.length: ' + ttsAudioData.length);
            audioBuffer = this.audioContext.createBuffer(1, ttsAudioData.length, 22050);
            let nowBuffering = audioBuffer.getChannelData(0);
            if (audioBuffer.copyToChannel) {
                audioBuffer.copyToChannel(new Float32Array(ttsAudioData), 0, 0);
            } else {
                for (let i = 0; i < ttsAudioData.length; i++) {
                    nowBuffering[i] = ttsAudioData[i];
                }
            }

            this.audioDataOffset += cachedAudioData.length;

            let bufferSource = (this.bufferSource = this.audioContext.createBufferSource());

            bufferSource.buffer = audioBuffer;
            bufferSource.connect(this.audioContext.destination);
            bufferSource.start();

            bufferSource.onended = () => {
                this.handleAudioPlayEnd(requestId);
            };
        },
        handleAudioPlayEnd(requestId) {
            console.log(
                'AIAudioHandler: playAnnouncement: onended: this.audioData.length: ' +
                this.audioData.length +
                ' audioDataOffset: ' +
                this.audioDataOffset
            );
            if (this.audioDataOffset < this.audioData.length) {
                this.playAnnouncement(requestId);
            } else {
                this.resetTTSPlayTimer = setTimeout(() => {
                    ipcRenderer.send('TTSPlayEnded', {
                        requestId: requestId
                    });
                    this.resetAudio();
                }, 500);
            }
        },
    },
};
</script>

<style scoped></style>
