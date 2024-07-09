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
import {ipcMain} from "electron";

export default class {
    constructor(AppManager, engineType) {
        this.appManager = AppManager;

        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('InitEngine', {
            engineType: engineType
        });

        ipcMain.on('TTSConvertResult', (event, args) => {
            if (!this.ttsResultListener) return;

            this.ttsResultListener(args.requestId, args.data);
        });

        ipcMain.on('STTRecognizeResult', (event, args) => {
            if (!this.sttRecognizedResultListener) return;

            this.sttRecognizedResultListener(args.requestId, args.text);
        });
    }

    sendAudioData(requestId, data, isLast) {
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('sendAudioData', {
            requestId: requestId,
            data: data,
            isLast: isLast
        });
    }

    playTTS(requestId, text) {
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('playTTS', {
            requestId: requestId,
            text: text
        });
    }

    setRecognizeResultListener(listener) {
        this.sttRecognizedResultListener = listener;
    }

    setTTSConvertResultListener(listener) {
        this.ttsResultListener = listener;
    }

    cancelCurrentRecognize() {
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('cancelCurrentRecognize', {});
    }

    cancelCurrentTTSConvert() {
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('cancelCurrentTTSConvert', {});
    }

    destroy() {
        this.appManager.windowManager.aiAssistantWindow.win.webContents.send('DestroyEngine', {});
    }
}
