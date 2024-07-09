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
import AzureAudioEngine from '@/main/ai/Connector/AzureAudioEngine';
import {ipcRenderer} from 'electron';

export default {
    name: 'AzureSpeechEngine',
    data() {
        return {
            azureSpeechEngine: undefined,
        };
    },
    created() {
        console.log('AzureSpeechEngine: created');
        const speechServiceKey = window.store.storeGet('aiConfig.azure.speechServiceKey');
        this.azureSpeechEngine = new AzureAudioEngine(speechServiceKey, window.store);

        ipcRenderer.on('sendAudioData', (event, args) => this.azureSpeechEngine.sendAudioData(args.requestId, args.data, args.isLast));
        ipcRenderer.on('playTTS', (event, args) => this.azureSpeechEngine.playTTS(args.requestId, args.text));
        ipcRenderer.on('cancelCurrentRecognize', this.azureSpeechEngine.cancelCurrentRecognize);
        ipcRenderer.on('cancelCurrentTTSConvert', this.azureSpeechEngine.cancelCurrentTTSConvert);

        this.azureSpeechEngine.setRecognizeResultListener(this.handleRecognizeResult);
        this.azureSpeechEngine.setTTSConvertResultListener(this.handleTTSConvertResult);
    },
    destroyed() {
        console.log('AzureSpeechEngine: destroyed');

        if (!this.azureSpeechEngine) return;

        ipcRenderer.removeAllListeners('sendAudioData');
        ipcRenderer.removeAllListeners('playTTS');
        ipcRenderer.removeAllListeners('setRecognizeResultListener');
        ipcRenderer.removeAllListeners('setTTSConvertResultListener');
        ipcRenderer.removeAllListeners('cancelCurrentRecognize');
        ipcRenderer.removeAllListeners('cancelCurrentTTSConvert');

        this.azureSpeechEngine.destroy();

        this.azureSpeechEngine = undefined;
    },
    methods: {
        handleRecognizeResult(requestId, text) {
            ipcRenderer.send('STTRecognizeResult', {
                requestId: requestId,
                text: text
            });
        },
        handleTTSConvertResult(requestId, data) {
            ipcRenderer.send('TTSConvertResult', {
                requestId: requestId,
                data: data
            });
        }
    },
};
</script>

<style lang="less"></style>
