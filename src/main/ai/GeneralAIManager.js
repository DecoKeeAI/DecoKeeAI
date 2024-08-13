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
import { exec } from 'child_process';
import { ipcMain } from 'electron';
import Constants from '@/utils/Constants';
import HAManager from "@/plugins/HomeAssistant/HAManager";

const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');

// eslint-disable-next-line
const BUILD_IN_AI_MODELS = [
    {
        label: 'Groq',
        value: 'Groq',
        models: [
            { label: 'Groq llama3 70B', value: 'llama3-70b-8192', canModify: false, supportedFunctions: 'chat' },
            { label: 'Groq llama3 8B', value: 'llama3-8b-8192', canModify: false, supportedFunctions: 'chat' },
            {
                label: 'Groq llama3 70B tool use preview',
                value: 'llama3-groq-70b-8192-tool-use-preview',
                canModify: false,
                supportedFunctions: 'chat',
            },
            {
                label: 'Groq llama3 8B tool use preview',
                value: 'llama3-groq-8b-8192-tool-use-preview',
                canModify: false,
                supportedFunctions: 'chat',
            },
            { label: 'Groq llama3 8b', value: 'llama-3.1-8b-instant', canModify: false, supportedFunctions: 'chat' },
            {
                label: 'Groq llama3.1 70b',
                value: 'llama-3.1-70b-versatile',
                canModify: false,
                supportedFunctions: 'chat',
            },
            {
                label: 'Groq llama3.1 405b',
                value: 'llama-3.1-405b-reasoning',
                canModify: false,
                supportedFunctions: 'chat',
            },
            { label: 'Groq gemma 7B', value: 'gemma-7b-it', canModify: false, supportedFunctions: 'chat' },
            { label: 'Groq gemma2 9B', value: 'gemma2-9b-it', canModify: false, supportedFunctions: 'chat' },
            { label: 'Groq mixtral 8x7b', value: 'mixtral-8x7b-32768', canModify: false, supportedFunctions: 'chat' },
        ],
    },
    {
        label: 'OpenAI',
        value: 'OpenAI',
        models: [
            { label: 'GPT 4o-mini', value: 'gpt-4o-mini', canModify: false, supportedFunctions: 'chat' },
            { label: 'GPT 4o', value: 'gpt-4o', canModify: false, supportedFunctions: 'chat' },
            { label: 'GPT 4 Turbo', value: 'gpt-4-turbo', canModify: false, supportedFunctions: 'chat' },
            { label: 'GPT 4', value: 'gpt-4', canModify: false, supportedFunctions: 'chat' },
            { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo', canModify: false, supportedFunctions: 'chat' },
        ],
    },
    {
        label: 'Spark',
        value: 'Spark',
        models: [
            { label: 'Spark 3.5 MAX', value: 'spark3.5-max', canModify: false, supportedFunctions: 'chat' },
            { label: 'Spark 4 Ultra', value: 'spark4-ultra', canModify: false, supportedFunctions: 'chat' },
        ],
    },
    {
        label: 'Qwen',
        value: 'Qwen',
        models: [
            { label: '通义千问 turbo', value: 'qwen-turbo', canModify: false, supportedFunctions: 'chat' },
            { label: '通义千问 Plus', value: 'qwen-plus', canModify: false, supportedFunctions: 'chat' },
            { label: '通义千问 Max', value: 'qwen-max', canModify: false, supportedFunctions: 'chat' },
            { label: '通义千问 72b-chat', value: 'qwen-72b-chat', canModify: false, supportedFunctions: 'chat' },
            { label: '通义千问1.5 32b-chat', value: 'qwen1.5-32b-chat', canModify: false, supportedFunctions: 'chat' },
            { label: '通义千问1.5 72b-chat', value: 'qwen1.5-72b-chat', canModify: false, supportedFunctions: 'chat' },
            {
                label: '通义千问1.5 110b-chat',
                value: 'qwen1.5-110b-chat',
                canModify: false,
                supportedFunctions: 'chat',
            },
            {
                label: '通义千问2 1.5b-instruct',
                value: 'qwen2-1.5b-instruct',
                canModify: false,
                supportedFunctions: 'chat',
            },
            {
                label: '通义千问2 7b-instruct',
                value: 'qwen2-7b-instruct',
                canModify: false,
                supportedFunctions: 'chat',
            },
            {
                label: '通义千问2 72b-instruct',
                value: 'qwen2-72b-instruct',
                canModify: false,
                supportedFunctions: 'chat',
            },
        ],
    },
    {
        label: 'ZhiPu',
        value: 'ZhiPu',
        models: [
            { label: '智谱 GLM 4 0520', value: 'glm-4-0520', canModify: false, supportedFunctions: 'chat' },
            { label: '智谱 GLM 4', value: 'glm-4', canModify: false, supportedFunctions: 'chat' },
            { label: '智谱 GLM 4 ari', value: 'glm-4-air', canModify: false, supportedFunctions: 'chat' },
            { label: '智谱 GLM 4 arix', value: 'glm-4-airx', canModify: false, supportedFunctions: 'chat' },
            { label: '智谱 GLM 4 flash', value: 'glm-4-flash', canModify: false, supportedFunctions: 'chat' },
            { label: '智谱 GLM 3 Turbo', value: 'glm-3-turbo', canModify: false, supportedFunctions: 'chat' },
        ],
    },
    {
        label: 'HuoShan',
        value: 'HuoShan',
        models: [],
    },
    {
        label: 'Coze',
        value: 'Coze',
        models: [],
    },
    {
        label: 'Custom',
        value: 'Custom',
        models: [],
    },
];

export default class GeneralAIManager {
    constructor(AppManager) {
        this.appManager = AppManager;
        this.currentRecentApps = undefined;

        setTimeout(() => {
            this._checkRecentApps();
        }, 5000);

        this.HAManager = new HAManager(this.appManager, {});

        this.aiSessionResourceMap = new Map();
        this.alterToneMap = new Map();

        ipcMain.on('PlayerReady', (event, args) => {
            console.log('GeneralAIManager PlayerReady: for ', args);
            if (!args.requestId || !args.requestId.startsWith('Load+')) return;

            const requestIdInfo = args.requestId.split('+');
            if (requestIdInfo.length !== 2) {
                return;
            }
            console.log('GeneralAIManager PlayerReady: for ', args, ' RequestInfo: ', requestIdInfo);

            this.alterToneMap.set(requestIdInfo[1], {
                playerId: args.playerId,
            });
        });

        ipcMain.on('RecorderStart', (event, args) => {
            console.log('GeneralAIManager RecorderStart: args ', args);
            this.playAlertTone(Constants.ASSISTANT_SESSION_START);
        });

        ipcMain.on('AIAudioHandlerReady', () => {
            const resourceManager = this.appManager.resourcesManager;

            const gifAnimations = resourceManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_GIF);
            if (gifAnimations !== undefined && gifAnimations.length > 0) {
                gifAnimations.forEach(resourceInfo => {
                    if (
                        resourceInfo.name === Constants.ASSISTANT_ANIMATION_IDLE ||
                        resourceInfo.name === Constants.ASSISTANT_ANIMATION_ONGOING ||
                        resourceInfo.name === Constants.ASSISTANT_ANIMATION_PROCESSING
                    ) {
                        this.aiSessionResourceMap.set(resourceInfo.name, resourceInfo);
                    }
                });
            }
            this.aiSessionResourceMap.set(Constants.ASSISTANT_TYPE_CHAT, resourceManager.getResourceInfo('0-49'));
            this.aiSessionResourceMap.set(Constants.ASSISTANT_TYPE_KEY_CONFIG, resourceManager.getResourceInfo('0-50'));

            const alertTones = resourceManager.getAllResourceInfoByType(Constants.RESOURCE_TYPE_TONE);

            if (alertTones !== undefined && alertTones.length > 0) {
                const assistantTones = alertTones.filter(tone => {
                    return (
                        tone.name === Constants.ASSISTANT_SESSION_START ||
                        tone.name === Constants.ASSISTANT_SESSION_END ||
                        tone.name === Constants.ASSISTANT_SESSION_ERROR
                    );
                });

                if (!assistantTones || assistantTones.length === 0) return;

                console.log('GeneralAIManager: getAssistantTones: ', assistantTones);

                assistantTones.forEach(toneInfo => {
                    this.appManager.windowManager.mainWindow.win.webContents.send('LoadAudio', {
                        requestId: 'Load+' + toneInfo.name,
                        soundPath: toneInfo.path,
                        volume: 100,
                    });
                });
            }
        });

        this.supportedModels = this.appManager.storeManager.storeGet('aiConfig.supportedModels');

        if (!this.supportedModels) {
            this.supportedModels = [];
        }

        BUILD_IN_AI_MODELS.forEach(modelGroupInfo => {
            const modelGroupIdx = this.supportedModels.findIndex(
                tempModelGroupInfo => tempModelGroupInfo.label === modelGroupInfo.label
            );
            if (modelGroupIdx === -1) {
                this.supportedModels.push(modelGroupInfo);
                return;
            }

            if (!this.supportedModels[modelGroupIdx].models) {
                this.supportedModels[modelGroupIdx].models = [];
            }

            modelGroupInfo.models.forEach(modelInfo => {
                if (
                    this.supportedModels[modelGroupIdx].models.findIndex(
                        tempModelInfo =>
                            tempModelInfo.name === modelInfo.name && tempModelInfo.value === modelInfo.value
                    ) > -1
                ) {
                    return;
                }
                this.supportedModels[modelGroupIdx].models.push(modelInfo);
            });
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
                    supportedFunctions: aiModel.supportedFunctions,
                });
            });

            newObj.models = finalGroupModels;

            finalSupportedAIModels.push(newObj);
        });

        this.appManager.storeManager.storeSet('aiConfig.supportedModels', finalSupportedAIModels);

        this.supportedModels = finalSupportedAIModels;
    }

    async getRecentApps() {
        switch (process.platform) {
            case 'win32': {
                const currentOpenApps = await this._getWindowsCurrentOpenAPPs();

                const uniqueAppList = [];

                for (let i = 0; i < currentOpenApps.length; i++) {
                    const appInfo = currentOpenApps[i];

                    if (
                        appInfo.path === '----' ||
                        appInfo.path === '' ||
                        appInfo.path.endsWith('\\SystemSettings.exe') ||
                        appInfo.path.includes('\\WINDOWS\\SystemApps\\')
                    )
                        continue;

                    if (
                        uniqueAppList.findIndex(
                            uAppInfo => uAppInfo.name === appInfo.name && uAppInfo.path === appInfo.path
                        ) !== -1
                    )
                        continue;

                    uniqueAppList.push(appInfo);
                }

                for (let i = 0; i < this.currentRecentApps.length; i++) {
                    const appInfo = this.currentRecentApps[i];

                    if (appInfo.path === '----' || appInfo.path === '') continue;

                    if (
                        uniqueAppList.findIndex(
                            uAppInfo => uAppInfo.name === appInfo.name && uAppInfo.path === appInfo.path
                        ) !== -1
                    )
                        continue;

                    uniqueAppList.push(appInfo);
                }

                return uniqueAppList;
            }
            case 'darwin':
            case 'linux':
                return this.currentRecentApps;
        }
    }

    playAlertTone(toneName) {
        const toneInfo = this.alterToneMap.get(toneName);
        console.log('GeneralAIManager: playAlertTone: ' + toneName + ' toneInfo: ', toneInfo);

        if (!toneInfo || toneInfo.playerId === undefined) return;

        this.appManager.windowManager.mainWindow.win.webContents.send('DoAudioAction', {
            playerId: toneInfo.playerId,
            audioAction: Constants.AUDIO_ACTION_PLAY_RESTART,
            audioFade: '0-0',
        });
    }

    getAnimationResourceId(name) {
        const animationResourceInfo = this.aiSessionResourceMap.get(name);
        if (animationResourceInfo !== undefined) {
            return animationResourceInfo.id;
        }
        console.log('GeneralAIManager: getAnimationResourceId: could not find resource for ' + name);
    }

    getSupportedSystemPrompts() {
        const savedLocale = this.appManager.storeManager.storeGet('system.locale');

        let promptFilePath;
        let defaultAct = {
            act: 'Default',
            prompt: ''
        };
        switch (savedLocale) {
            default:
            case 'zh':
                promptFilePath = this.appManager.resourcesManager.getRelatedSrcPath('@/prompts/prompts-zh.json');
                break;
            case 'en':
                promptFilePath = this.appManager.resourcesManager.getRelatedSrcPath('@/prompts/prompts-en.csv');
                break;
        }
        promptFilePath = promptFilePath.replace('file://', '');
        let promptData = [];
        try {
            const fileData = fs.readFileSync(promptFilePath, 'utf-8');
            if (promptFilePath.endsWith('.json')) {
                promptData = JSON.parse(fileData);
            } else {
                promptData = Papa.parse(fileData, {
                    header: true,
                    dynamicTyping: true
                }).data;
            }
        } catch (err) {
            console.log('GeneralAIManager: getSupportedSystemPrompts: failed to load prompt info for: ' + promptFilePath, err);
        }

        return [ defaultAct ,...promptData];
    }

    async _checkRecentApps() {
        try {
            this.currentRecentApps = await this._getPCRecentApps();
            // console.log('GeneralAIManager: checkRecentApps: this.currentRecentApps: ', this.currentRecentApps);
        } catch (err) {
            console.log('GeneralAIManager: checkRecentApps: detect error: ', err);
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

                // console.log('WindowsRecentApps: ', recentApps);
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

            if (
                uniqueAppList.findIndex(
                    uAppInfo => uAppInfo.name === appInfo.name && uAppInfo.path === appInfo.path
                ) !== -1
            )
                continue;

            uniqueAppList.push(appInfo);
        }

        return uniqueAppList;
    }

    _getWindowsCurrentOpenAPPs() {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line
            exec(
                'powershell "chcp 65001; Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { $_.Description + \'|\' + $_.Path }"',
                (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else {
                        const apps = stdout
                            .split('\n')
                            .filter(line => line.includes('|'))
                            .map(line => {
                                const parts = line.trim().split('|');
                                let appName = parts[0].trim();
                                const appPath = parts[1].trim();

                                if (appName === '') {
                                    appName = path.parse(path.basename(appPath)).name;
                                }
                                return {
                                    name: appName,
                                    path: appPath,
                                };
                            });
                        resolve(apps);
                    }
                }
            );
        });
    }

    _getProgID(extension) {
        return new Promise(resolve => {
            exec(`reg query HKEY_CLASSES_ROOT\\${extension}`, (err, stdout) => {
                if (err) {
                    // console.warn(`Error querying ProgID for extension ${extension}:`, err);
                    return resolve(null);
                }
                const match = stdout.match(/REG_SZ\s+(.+)/);
                if (match) {
                    resolve(match[1].trim());
                } else {
                    // console.warn(`No ProgID found for extension ${extension}`);
                    resolve(null);
                }
            });
        });
    }

    _getAppForProgID(progID) {
        return new Promise(resolve => {
            exec(`reg query HKEY_CLASSES_ROOT\\${progID}\\shell\\open\\command`, (err, stdout) => {
                if (err) {
                    // console.warn(`Error querying command for ProgID ${progID}:`, err);
                    return resolve(null);
                }
                const match = stdout.match(/"([^"]+)"/);
                if (match) {
                    resolve(match[1].trim());
                } else {
                    // console.warn(`No command found for ProgID ${progID}`);
                    resolve(null);
                }
            });
        });
    }

    _getAppName(appPath) {
        return new Promise(resolve => {
            exec(`powershell -command "(Get-Item '${appPath}').VersionInfo.ProductName"`, (err, stdout) => {
                if (err) {
                    // console.warn(`Error getting app name for ${appPath}:`, err);
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
                    // console.error(`Error reading Recent folder:`, err);
                    return reject(err);
                }

                const lnkFiles = files.filter(file => file.endsWith('.lnk'));
                if (lnkFiles.length === 0) {
                    return resolve([]);
                }

                // console.log('CheckWindows RecentApp Total lnkFiles length: ', lnkFiles.length);

                const commands = lnkFiles.map(file => {
                    const fullPath = path.join(recentFolder, file);
                    return `(New-Object -ComObject WScript.Shell).CreateShortcut('${fullPath}').TargetPath`;
                });

                // console.log('CheckWindows RecentApp Total commands length: ', commands.length);

                const targetPaths = [];
                const batches = this._batchExec(commands);
                // console.log('CheckWindows RecentApp Split batches: ', batches.length);

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
                        // console.error(`Error executing batch:`, err);
                    }
                }

                // console.log('CheckWindows RecentApp After batches exec targetPaths.length: ', targetPaths.length);

                const fileTypes = new Set();
                const recentApps = new Map();

                targetPaths.forEach(targetPath => {
                    const ext = path.extname(targetPath);
                    if (ext) {
                        fileTypes.add(ext);
                    }
                });

                // Query ProgIDs and application paths in parallel
                const appPromises = Array.from(fileTypes).map(async ext => {
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
                // console.log('CheckWindows RecentApp After get all Info: ', Array.from(recentApps.values()).length);
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
