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
import HIDManager from '@/main/DeviceControl/Connections/HIDManager';
import { desktopCapturer, ipcMain, screen, app } from 'electron';
import Constants from '@/utils/Constants';
import WSManager from '@/main/DeviceControl/Connections/WSManager';
import PluginWSServer from '@/main/DeviceControl/Connections/PluginWSServer';
import PluginAdapter, { PLUGIN_TYPE } from '@/main/DeviceControl/Connections/PluginAdapter';

const robotjs = require('robotjs');
const activeWindow = require('active-win');
const fs = require('fs');

const { shell } = require('electron');
const { exec } = require('child_process');


const SPECIAL_CHAR_INPUT = [
    ')',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ':',
    ';',
    ':',
    '+',
    '=',
    '<',
    ',',
    '_',
    '-',
    '>',
    '.',
    '?',
    '/',
    '~',
    '`',
    '{',
    ']',
    '[',
    '|',
    '\\',
    '}',
    '"',
];

const CONNECTION_TYPE_HID = 'HID';
const CONNECTION_TYPE_WS = 'WS';
const CONNECTION_TYPE_QMK = 'QMK';

let lastActiveApp = undefined;
let appManager = undefined;

let deviceProfileMap = new Map();
let deviceActiveProfileMap = new Map();
let deviceKeyDownTimeMap = new Map();
let deviceDefaultConfigMap = new Map();
let deviceConfigMultiStateMap = new Map();
let deviceMultiActionProgressMap = new Map();
let deviceMultiActionTimeTaskMap = new Map();
let deviceAudioPlayerMap = new Map();
let deviceTimeoutTaskMap = new Map();

let deviceReportActiveProfileTimer = null;

const deviceTypeMap = new Map();

let HIDDeviceManager = undefined;
let WSDeviceManager = undefined;
let pluginWSServer = undefined;

const pluginHandlerMap = new Map();

const deviceAppearPluginMap = new Map();

const deviceProfileChangeRequestMap = new Map();

let deviceProfileAppMonitorMap = undefined;
class DeviceControlManager {
    constructor(mainAppManager) {
        appManager = mainAppManager;
        HIDDeviceManager = new HIDManager();
        WSDeviceManager = new WSManager();
        pluginWSServer = new PluginWSServer(mainAppManager, this);

        const currentPluginInfo = appManager.storeManager.storeGet('plugin.streamDeck');
        if (currentPluginInfo && currentPluginInfo.length > 0) {
            setTimeout(() => {
                loadAllPluginHandler(false, null);
            }, 5000);
        }

        if (!HIDDeviceManager && !WSDeviceManager) {
            console.log(
                'DeviceControlManager unable to get HIDDeviceManager and WSDeviceManager'
            );
            return;
        }

        if (HIDDeviceManager) {
            HIDDeviceManager.registerDeviceDataListener(
                'DeviceControlManager',
                (serialNumber, data) => {
                    processDeviceData(serialNumber, data);
                }
            );

            HIDDeviceManager.registerDeviceConnectionListener(
                'DeviceControlManager',
                connectionInfo => {
                    console.log(
                        'DeviceControlManager GetDeviceConnectionChange: serialNumber: ',
                        connectionInfo.serialNumber,
                        ' connected: ',
                        connectionInfo.connected
                    );
                    if (connectionInfo.type === CONNECTION_TYPE_QMK) {
                        processDeviceConnection(
                            connectionInfo.serialNumber,
                            connectionInfo.connected,
                            CONNECTION_TYPE_QMK
                        );
                    } else {
                        processDeviceConnection(
                            connectionInfo.serialNumber,
                            connectionInfo.connected,
                            CONNECTION_TYPE_HID
                        );
                    }
                }
            );
        }

        if (WSDeviceManager) {
            WSDeviceManager.registerDeviceDataListener(
                'DeviceControlManager',
                (serialNumber, data) => {
                    processDeviceData(serialNumber, data);
                }
            );

            WSDeviceManager.registerDeviceConnectionListener(
                'DeviceControlManager',
                connectionInfo => {
                    console.log(
                        'DeviceControlManager GetDeviceConnectionChange: serialNumber: ',
                        connectionInfo.serialNumber,
                        ' connected: ',
                        connectionInfo.connected
                    );
                    processDeviceConnection(
                        connectionInfo.serialNumber,
                        connectionInfo.connected,
                        CONNECTION_TYPE_WS
                    );
                }
            );
        }

        try {
            ipcMain.on('ChangeDeviceProfile', (event, args) => {
                const requestSerialNumber = args.serialNumber;
                const resourceId = args.resourceId;

                console.log('DeviceControlManager: Received ChangeDeviceProfile: to ', resourceId, ' requestSerialNumber: ', requestSerialNumber);

                const needUpdateDevices = [];
                needUpdateDevices.push(requestSerialNumber);

                deviceActiveProfileMap.forEach((profileConfig, serialNumber) => {
                    if (profileConfig.resourceId === resourceId && !needUpdateDevices.includes(serialNumber)) {
                        needUpdateDevices.push(serialNumber);
                    }
                });

                needUpdateDevices.forEach(updateSerialNumber => {
                    processProfileSwitch(updateSerialNumber, resourceId, 0);
                });
            });

            ipcMain.on('PluginListChange', (event, args) => {
                console.log('DeviceControlManager: PluginListChange: ' + JSON.stringify(args));
                loadAllPluginHandler(args.isDelete, args.pluginId);
            });

            ipcMain.on('PlayerReady', (event, args) => {
                console.log('DeviceControlManager: received PlayerReady: ', args);
                const requestIdInfo = args.requestId.split('-');
                if (requestIdInfo.length < 3) {
                    return;
                }
                const serialNumber = requestIdInfo[0];
                const keyCode = requestIdInfo[1];
                const extra = requestIdInfo[2];

                let deviceAudioPlayerList = deviceAudioPlayerMap.get(serialNumber);
                if (!deviceAudioPlayerList) {
                    deviceAudioPlayerList = [];
                }

                deviceAudioPlayerList.push({
                    serialNumber: serialNumber,
                    keyCode: keyCode,
                    playerId: args.playerId,
                    extra: extra,
                    duration: args.duration,
                    soundPath: args.soundPath
                });
                deviceAudioPlayerMap.set(serialNumber, deviceAudioPlayerList);
            });

            ipcMain.on('AudioPlayStart', (event, args) => {
                console.log(
                    'DeviceControlManager received AudioPlayStart: ',
                    args
                );
                const requestIdInfo = args.requestId.split('-');
                if (requestIdInfo.length < 3) {
                    return;
                }
                const serialNumber = requestIdInfo[0];
                const keyCode = requestIdInfo[1];

                const activeProfile = deviceActiveProfileMap.get(serialNumber);
                if (activeProfile) {
                    const keyConfigs = activeProfile.configInfo.filter(configDetail => {
                        return configDetail.keyCode === keyCode;
                    });

                    if (!keyConfigs || keyConfigs.length < 1) return;

                    if (keyConfigs[0].config.type === 'timer') return;
                }

                notifyDeviceCountDownValue(serialNumber, args.duration, keyCode);
            });

            ipcMain.on('AudioPlayStop', (event, args) => {
                console.log(
                    'DeviceControlManager received AudioPlayStop: ',
                    args
                );
                const requestIdInfo = args.requestId.split('-');
                if (requestIdInfo.length < 3) {
                    return;
                }
                const serialNumber = requestIdInfo[0];
                const keyCode = requestIdInfo[1];

                const activeProfile = deviceActiveProfileMap.get(serialNumber);
                if (activeProfile) {
                    const keyConfigs = activeProfile.configInfo.filter(configDetail => {
                        return configDetail.keyCode === keyCode;
                    });

                    if (!keyConfigs || keyConfigs.length < 1) return;

                    if (keyConfigs[0].config.type === 'timer') {
                        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_STOP, keyCode);
                        return;
                    }
                }

                notifyDeviceCountDownValue(serialNumber, -1, keyCode);
            });

            ipcMain.on('ShowDeviceAlert', (event, args) => {
                console.log(
                    'DeviceControlManager received ShowDeviceAlert: ',
                    args
                );
                const requestIdInfo = args.requestId.split('-');
                if (requestIdInfo.length < 2) {
                    return;
                }
                const serialNumber = requestIdInfo[0];
                const keyCode = requestIdInfo[1];

                const activeProfile = deviceActiveProfileMap.get(serialNumber);
                if (activeProfile) {
                    notifyDeviceShowAlert(serialNumber, args.alertType, keyCode);
                }
            });
        } catch (err) {
            console.log(
                'DeviceControlManager detected error on process send msg',
                err
            );
        }
        robotjs.setKeyboardDelay(0);

        loadAppMonitorConfigInfo();

        this.checkActiveWindowTask = setInterval(() => {
            activeWindow().then(result => {
                // 比较前后两次获取的应用信息是否相同
                if (lastActiveApp !== undefined && (!result || (result.id === lastActiveApp.id && result.title === lastActiveApp.title))) {
                    return;
                }
                lastActiveApp = result;

                const ownerPath = result.owner.path;

                const appMonitoredDevices = deviceProfileAppMonitorMap[ownerPath];

                if (!appMonitoredDevices) return;

                const connectedDevices = this.getConnectedDevices();
                if (!connectedDevices || connectedDevices.length === 0) return;

                console.log('DeviceControlManager: 前台应用发生变化:', result.title, ' Sending profile change request to : ', appMonitoredDevices);

                for (let i = 0; i < appMonitoredDevices.length; i++) {
                    const monitorInfo = appMonitoredDevices[i];

                    // Send change profile request to all device
                    if (monitorInfo.deviceSN === 'All Device') {
                        console.log('DeviceControlManager: 前台应用发生变化: Sending profile change request to : ', connectedDevices);
                        for (let i = 0; i < connectedDevices.length; i++) {
                            const deviceInfo = connectedDevices[i];
                            this.sendProfileChangeRequest(deviceInfo.serialNumber, monitorInfo.resourceId);
                        }
                        continue;
                    }

                    const deviceInfo = connectedDevices.find(deviceInfo => deviceInfo.serialNumber === monitorInfo.deviceSN);
                    // Skip for not connected device
                    if (!deviceInfo) continue;

                    this.sendProfileChangeRequest(monitorInfo.deviceSN, monitorInfo.resourceId);
                }
            });
        }, 3000);

        appManager.resourcesManager.setDeviceConfigChangeListener(this.reloadDeviceConfigProfileOnDelete);
    }

    sendProfileChangeRequest(serialNumber, resourceId) {

        const changeRequestInfo = deviceProfileChangeRequestMap.get(serialNumber);

        console.log('DeviceControlManager: sendProfileChangeRequest: haveRequestInfo: ', (changeRequestInfo !== undefined));

        if (changeRequestInfo) {
            clearTimeout(changeRequestInfo.timerTask);
        }

        const processProfileChangeTimer = setTimeout(() => {
            const deviceConfig = deviceDefaultConfigMap.get(serialNumber);
            const keyMatrix =
                deviceConfig === undefined || deviceConfig.keyMatrix === undefined
                    ? {
                        row: 2,
                        col: 3,
                    }
                    : deviceConfig.keyMatrix;

            const configInfo = appManager.resourcesManager.getConfigInfo(
                resourceId,
                keyMatrix.row,
                keyMatrix.col
            );
            if (!configInfo) {
                console.log(
                    'DeviceControlManager: sendProfileChangeRequest: not find config on resourceId: ',
                    resourceId
                );
                deviceProfileChangeRequestMap.delete(serialNumber);
                return;
            }
            processProfileSwitch(serialNumber, resourceId, configInfo.name);
            deviceProfileChangeRequestMap.delete(serialNumber);
        }, 300);

        deviceProfileChangeRequestMap.set(serialNumber, {
            resourceId: resourceId,
            timerTask: processProfileChangeTimer
        });
    }

    showDeviceAlert(serialNumber, alertType, keyCode) {
        notifyDeviceShowAlert(serialNumber, alertType, keyCode);
    }

    showDeviceAnimation(serialNumber, resourceId, keyCode, time) {
        notifyDeviceShowAnimation(serialNumber, resourceId, keyCode, time);
    }

    getDeviceActiveProfile(serialNumber) {
        return deviceActiveProfileMap.get(serialNumber);
    }

    getDeviceBasicConfig(serialNumber) {
        return deviceDefaultConfigMap.get(serialNumber);
    }

    getConnectedDevices() {
        const connectedDevices = [];
        deviceTypeMap.forEach((connectionType, serialNumber) => {
            connectedDevices.push({
                serialNumber: serialNumber,
                connectionType: connectionType,
            });
        });
        return connectedDevices;
    }

    notifyDeviceConfigStateChange(serialNumber, keyCode, state) {
        processDeviceConfigSetState(serialNumber, keyCode, state);
    }

    reloadDeviceConfigProfile(deviceSNList, resourceId) {
        deviceSNList.forEach(serialNumber => {
            const activeProfileInfo = this.getDeviceActiveProfile(serialNumber);
            if (!activeProfileInfo || activeProfileInfo.resourceId !== resourceId) return;

            reloadDeviceProfiles(serialNumber, resourceId);
        })
    }

    async reloadDeviceConfigProfileOnDelete(resourceId, configId, pageId, folderId) {

        loadAppMonitorConfigInfo();

        console.log('DeviceControlManager: reloadDeviceConfigProfileOnDelete: resourceId: ', resourceId, ' configId: ', configId);

        const needUpdateDevices = [];

        deviceProfileMap.forEach((configBasicInfoList, serialNumber) => {
            if (needUpdateDevices.includes(serialNumber)) return;

            const filteredDeviceConfigRes = configBasicInfoList.filter(profileConfig => profileConfig.resourceId === resourceId);

            if (!filteredDeviceConfigRes || filteredDeviceConfigRes.length === 0) return;

            let nextResourceId = '';
            const availableRelatedResources = configBasicInfoList.filter(profileConfig => profileConfig.configIdx.startsWith(configId + ','));
            if (availableRelatedResources && availableRelatedResources.length > 0) {
                if (folderId > 1) {
                    nextResourceId = availableRelatedResources[0].resourceId;
                } else {
                    let nextPageId = pageId;
                    if (pageId === 1) {
                        nextPageId = 2;
                    } else {
                        nextPageId = pageId - 1;
                    }
                    const nextResourceInfo = availableRelatedResources.find(profileConfig => profileConfig.configIdx === (configId + ',' + nextPageId + ',1'));

                    if (nextResourceInfo) {
                        nextResourceId = nextResourceInfo.resourceId;
                    }
                }
            }

            needUpdateDevices.push({
                serialNumber: serialNumber,
                nextResourceId: nextResourceId
            });
        });

        console.log('DeviceControlManager: reloadDeviceConfigProfileOnDelete: resourceId: ', resourceId, ' configId: ', configId, ' needUpdateDevices: ', needUpdateDevices);

        if (needUpdateDevices.length === 0) return;

        needUpdateDevices.forEach(updateDeviceInfo => {
            loadDeviceActiveProfiles(updateDeviceInfo.serialNumber, updateDeviceInfo.nextResourceId);
        });
    }

    getDeviceSNsWithPluginKeyAction(resourceId, pluginId, actionName, keyCode, multiActionIndex) {
        const deviceSNList = [];
        deviceAppearPluginMap.forEach((loadedPlugins, serialNumber) => {
            console.log(
                'DeviceControlManager: getDeviceSNsWithPluginKeyAction: serialNumber: ',
                serialNumber,
                ' loadedPlugins:',
                loadedPlugins
            );
            if (loadedPlugins === undefined || loadedPlugins.length === 0) return;

            const matchedPlugins = loadedPlugins.filter(
                pluginInfo =>
                    pluginInfo.activeProfileId === resourceId &&
                    pluginInfo.pluginId === pluginId &&
                    pluginInfo.action === actionName &&
                    pluginInfo.keyCode === keyCode &&
                    pluginInfo.multiActionIndex === multiActionIndex
            );

            if (matchedPlugins === undefined || matchedPlugins.length === 0) return;

            deviceSNList.push(serialNumber);
        });

        return deviceSNList;
    }

    reloadAppMonitorConfigInfo() {
        loadAppMonitorConfigInfo();
    }

    async destroy() {
        clearInterval(this.checkActiveWindowTask);
        pluginHandlerMap.forEach((pluginAdapter, pluginId) => {
            pluginAdapter.destroyPlugin();
        });
        pluginHandlerMap.clear();

        if (HIDDeviceManager) {
            HIDDeviceManager.destroy();
        }
        HIDDeviceManager = undefined;

        if (pluginWSServer) {
            await pluginWSServer.destroy();
        }
        pluginWSServer = undefined;

        if (WSDeviceManager) {
            WSDeviceManager.destroy();
        }
        WSDeviceManager = undefined;
    }

}

function loadAppMonitorConfigInfo() {
    const appMonitorConfig = appManager.storeManager.storeGet('settings.appMonitorConfig');

    deviceProfileAppMonitorMap = {};

    if (!appMonitorConfig) {
        console.log('loadAppMonitorConfigInfo: {}');
        return;
    }

    const savedAppMonitorConfig = JSON.parse(appMonitorConfig);

    for (const configResId in savedAppMonitorConfig) {
        const monitorInfo = savedAppMonitorConfig[configResId];

        if (monitorInfo.appPath === 'Not Monitor') continue;

        let existMonitorInfo = deviceProfileAppMonitorMap[monitorInfo.appPath];
        if (!existMonitorInfo) {
            existMonitorInfo = [];
        }

        existMonitorInfo.push(monitorInfo);

        deviceProfileAppMonitorMap[monitorInfo.appPath] = existMonitorInfo;
    }

    console.log('loadAppMonitorConfigInfo: ' + JSON.stringify(deviceProfileAppMonitorMap));
}


function processDeviceData(serialNumber, data) {
    if (!data || !data.type) {
        console.log('DeviceControlManager: invalid data received from device');
        return;
    }

    console.log('DeviceControlManager: processDeviceData: from: ', serialNumber, ' data: ', data);

    switch (data.type) {
        case 'press':
            const action = data.keyAction;
            const keyCode = data.keyCode;
            console.log(
                'DeviceControlManager: processDeviceData: Key: ',
                keyCode,
                ' Action: ',
                action
            );
            processKeyAction(serialNumber, keyCode, action);
            break;
        case 'callback':
            break;
        case 'resource':
            sendResourceToDevice(
                serialNumber,
                data.resourceId,
                data.version,
                String(data.generateTime)
            );
            break;
        case 'reportConfig':
            const deviceDefaultConfig = {
                keyMatrix: data.keyMatrix,
                keyConfig: data.keyConfig,
                appVersion: data.appVersion,
            };
            deviceDefaultConfigMap.set(serialNumber, deviceDefaultConfig);

            if (!pluginWSServer) break;
            pluginWSServer.notifyDeviceConnect(
                serialNumber,
                data.keyMatrix.row,
                data.keyMatrix.col
            );
            break;
        case 'reportActiveProfile':
            const shouldWait = deviceReportActiveProfileTimer !== null;
            clearTimeout(deviceReportActiveProfileTimer);
            deviceReportActiveProfileTimer = null;
            if (shouldWait) {
                deviceReportActiveProfileTimer = setTimeout(() => {
                    loadDeviceActiveProfiles(
                        serialNumber,
                        data.resourceId,
                        data.version,
                        String(data.generateTime)
                    );
                }, 1100);
            } else {
                loadDeviceActiveProfiles(
                    serialNumber,
                    data.resourceId,
                    data.version,
                    String(data.generateTime)
                );
            }
            break;
    }

    if (
        appManager &&
        appManager.windowManager &&
        appManager.windowManager.mainWindow &&
        appManager.windowManager.mainWindow.win
    ) {
        appManager.windowManager.mainWindow.win.webContents.send('DeviceData', {
            serialNumber: serialNumber,
            data: data,
        });
    }
}

function processDeviceConnection(serialNumber, connected, connectionType) {
    clearTimeout(deviceReportActiveProfileTimer);
    deviceReportActiveProfileTimer = null;
    if (!connected) {
        deviceTypeMap.delete(serialNumber);

        if (connectionType === CONNECTION_TYPE_QMK) {
            broadcastDeviceConnectionChange(serialNumber, connected, connectionType);
            return;
        }

        deviceDefaultConfigMap.delete(serialNumber);
        deviceProfileMap.delete(serialNumber);
        deviceActiveProfileMap.delete(serialNumber);

        const deviceHotkeyActions = deviceConfigMultiStateMap.get(serialNumber);
        if (deviceHotkeyActions) {
            deviceHotkeyActions.clear();
        }
        deviceConfigMultiStateMap.delete(serialNumber);

        const deviceMultiActions = deviceMultiActionProgressMap.get(serialNumber);
        if (deviceMultiActions) {
            deviceMultiActions.clear();
        }
        deviceMultiActionProgressMap.delete(serialNumber);

        const deviceMultiActionsTimeTasks = deviceMultiActionTimeTaskMap.get(serialNumber);
        if (deviceMultiActionsTimeTasks) {
            deviceMultiActionsTimeTasks.clear();
        }
        deviceMultiActionTimeTaskMap.delete(serialNumber);

        const deviceTimeoutTasks = deviceTimeoutTaskMap.get(serialNumber);
        if (deviceTimeoutTasks) {
            deviceTimeoutTasks.forEach((keyCode, taskId) => {
                console.log(
                    'DeviceControlManager: processDeviceConnection: Cancel exist timer countdown for device: ' +
                        serialNumber +
                        ' Keycode: ' +
                        keyCode +
                        ' TaskId: ' +
                        taskId
                );
                clearTimeout(taskId);
            });
            deviceTimeoutTasks.clear();
        }
        deviceTimeoutTaskMap.delete(serialNumber);

        let devicePlayers = deviceAudioPlayerMap.get(serialNumber);
        if (devicePlayers && devicePlayers.length > 0) {
            devicePlayers.forEach(playerInfo => {
                if (
                    appManager &&
                    appManager.windowManager &&
                    appManager.windowManager.mainWindow &&
                    appManager.windowManager.mainWindow.win
                ) {
                    appManager.windowManager.mainWindow.win.webContents.send('DestroyPlayer', {
                        playerId: playerInfo.playerId,
                    });
                }
            });
            devicePlayers = [];
        }
        deviceAudioPlayerMap.delete(serialNumber);

        const oldDeviceLoadedPluginList = deviceAppearPluginMap.get(serialNumber);

        if (oldDeviceLoadedPluginList && oldDeviceLoadedPluginList.length > 0) {
            oldDeviceLoadedPluginList.forEach(pluginInfo => {
                pluginWSServer.notifyPluginVisibilityChange(
                    pluginInfo.activeProfileId,
                    pluginInfo.pluginId,
                    pluginInfo.action,
                    pluginInfo.keyCode,
                    false,
                    false,
                    0,
                    serialNumber
                );
            });
        }

        deviceAppearPluginMap.delete(serialNumber);

        pluginWSServer.notifyDeviceDisconnect(serialNumber);
    } else {
        deviceTypeMap.set(serialNumber, connectionType);

        if (connectionType === CONNECTION_TYPE_QMK) {
            broadcastDeviceConnectionChange(serialNumber, connected, connectionType);
            return;
        }

        deviceReportActiveProfileTimer = setTimeout(() => {
            loadDeviceActiveProfiles(serialNumber);
        }, 5000);
    }

    broadcastDeviceConnectionChange(serialNumber, connected, connectionType);
}

function loadProfilesData(
    serialNumber,
    deviceProfileId = '',
    deviceProfileVersion = 0,
    generateTime,
    sendNotification,
    oldResourceId) {
    const deviceConfigs = appManager.resourcesManager.getAllResourceInfoByType(
        Constants.RESOURCE_TYPE_DEVICE_CONFIG
    );
    console.log('DeviceControlManager: loadProfilesData: deviceConfigs: ', deviceConfigs);
    if (deviceConfigs.length === 0) {
        console.log('DeviceControlManager: loadProfilesData: no available deviceConfigs');
        return;
    }
    let defaultConfigDetail = undefined;

    let defaultConfigInfo = appManager.resourcesManager.getResourceInfo(deviceProfileId);
    let configId;
    const deviceConfig = deviceDefaultConfigMap.get(serialNumber);
    const keyMatrix =
        deviceConfig === undefined || deviceConfig.keyMatrix === undefined
            ? {
                row: 2,
                col: 3,
            }
            : deviceConfig.keyMatrix;

    if (deviceProfileId === '' || defaultConfigInfo === null || defaultConfigInfo.resourceType !== Constants.RESOURCE_TYPE_DEVICE_CONFIG) {
        defaultConfigInfo = appManager.resourcesManager.getDefaultResourceInfo(
            Constants.RESOURCE_TYPE_DEVICE_CONFIG
        );

        if (defaultConfigInfo === undefined || defaultConfigInfo.length === 0) {
            defaultConfigInfo = [deviceConfigs[0]];
        }
        configId = defaultConfigInfo[0].name.substring(0, defaultConfigInfo[0].name.indexOf(',') + 1);

        const configResourceInfo = defaultConfigInfo[0];

        defaultConfigDetail = {
            configIdx: configResourceInfo.name,
            resourceId: configResourceInfo.id,
            configInfo: appManager.resourcesManager.getConfigInfo(
                configResourceInfo.id,
                keyMatrix.row,
                keyMatrix.col
            ),
        };
        configId = configResourceInfo.name.substring(0, configResourceInfo.name.indexOf(',') + 1);
    } else {
        defaultConfigDetail = {
            configIdx: defaultConfigInfo.name,
            resourceId: defaultConfigInfo.id,
            configInfo: appManager.resourcesManager.getConfigInfo(
                defaultConfigInfo.id,
                keyMatrix.row,
                keyMatrix.col
            )
        };
        configId = defaultConfigInfo.name.substring(0, defaultConfigInfo.name.indexOf(',') + 1);

        if (
            defaultConfigInfo.version !== deviceProfileVersion ||
            String(defaultConfigInfo.generateTime) !== String(generateTime)
        ) {
            sendResourceToDevice(
                serialNumber,
                defaultConfigInfo.id,
                deviceProfileVersion,
                String(generateTime)
            );
        }
    }

    const configDetails = deviceConfigs.filter(config => {
        return config.name.startsWith(configId);
    });

    const configList = [];
    configDetails.forEach(config => {
        configList.push({
            configIdx: config.name,
            resourceId: config.id,
        });
    });

    console.log(
        'DeviceControlManager: loadDeviceActiveProfiles: loaded device configs:',
        configList
    );
    deviceProfileMap.set(serialNumber, configList);
    deviceActiveProfileMap.set(serialNumber, defaultConfigDetail);
    console.log(
        'DeviceControlManager: loadDeviceActiveProfiles: loaded device default active: ',
        defaultConfigDetail
    );

    if (sendNotification) {
        notifyDeviceProfileChange(
            serialNumber,
            defaultConfigDetail.resourceId,
            defaultConfigDetail.configIdx,
            oldResourceId
        );
    }
}

function loadDeviceActiveProfiles(
    serialNumber,
    deviceProfileId = '',
    deviceProfileVersion = 0,
    generateTime
) {
    loadProfilesData(serialNumber, deviceProfileId, deviceProfileVersion, generateTime, true);
}

function reloadDeviceProfiles(
    serialNumber,
    deviceProfileId = ''
) {
    loadProfilesData(serialNumber, deviceProfileId, 0, '-1', false, deviceProfileId);
}

function broadcastDeviceConnectionChange(serialNumber, connected, connectionType) {
    if (!connected) {
        global.aiManager.cancelCurrentAssistantSession(serialNumber);
    }

    if (
        !appManager ||
        !appManager.windowManager ||
        !appManager.windowManager.mainWindow ||
        !appManager.windowManager.mainWindow.win
    ) {
        return;
    }
    appManager.windowManager.mainWindow.win.webContents.send('DeviceConnection', {
        serialNumber: serialNumber,
        connected: connected,
        connectionType: connectionType,
    });
}

function processKeyAction(serialNumber, keyCode, action) {
    const eventTime = Date.now();
    let downTime = deviceKeyDownTimeMap.get(serialNumber + '_' + keyCode);
    if (action === 0) {
        downTime = eventTime;
        deviceKeyDownTimeMap.set(serialNumber + '_' + keyCode, eventTime);
    } else if (action === 1) {
        deviceKeyDownTimeMap.delete(serialNumber + '_' + keyCode);
    }

    const currentProfile = deviceActiveProfileMap.get(serialNumber);

    if (!currentProfile) {
        return;
    }
    // const deviceConfig = deviceDefaultConfigMap.get(serialNumber);

    // if (!deviceConfig) {
    //     return;
    // }

    let activeKeyConfig;
    for (let i = 0; i < currentProfile.configInfo.length; i++) {
        const keyConfig = currentProfile.configInfo[i];
        if (keyConfig.keyCode === keyCode) {
            activeKeyConfig = keyConfig;
            break;
        }
    }

    console.log('DeviceControlManager: processKeyAction: activeKeyConfig: ', activeKeyConfig);
    if (!activeKeyConfig || !activeKeyConfig.config || !activeKeyConfig.config.type) return;

    try {
        processConfiguredAction(
            serialNumber,
            activeKeyConfig.config,
            keyCode,
            action,
            downTime,
            eventTime,
            activeKeyConfig.pluginId
        );
    } catch (err) {
        console.error('processKeyAction: processConfiguredAction detected error.', err);
    }
}

function processConfiguredAction(
    serialNumber,
    activeConfig,
    keyCode,
    action,
    downTime,
    eventTime,
    pluginId,
    multiActionIdx = undefined
) {

    const isMultiAction = multiActionIdx !== undefined;
    const currentProfile = deviceActiveProfileMap.get(serialNumber);

    const keyActions = activeConfig.actions;
    const activeConfigIdx = currentProfile.configIdx;
    console.log(
        'DeviceControlManager: processConfiguredAction: activeConfig: ' +
            JSON.stringify(activeConfig),
        ' KeyActions: ',
        keyActions,
        ' action: ',
        action
    );

    if (pluginId !== undefined && pluginId !== '') {
        if (keyActions.length === 0) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            return;
        }

        let currentKeyState = undefined;
        const pluginActionsInfo = JSON.parse(keyActions[0].value);
        // For multi state key config, get last state
        if (pluginActionsInfo.States.length > 1) {
            let multiStateActions = deviceConfigMultiStateMap.get(serialNumber);
            if (!multiStateActions) {
                multiStateActions = new Map();
            }
            currentKeyState = multiStateActions.get(keyCode + ':' + multiActionIdx);
            if (currentKeyState === undefined) {
                currentKeyState = 1;
            }

            if (currentKeyState === 0) {
                currentKeyState = 1;
            } else {
                currentKeyState = 0;
            }
            multiStateActions.set(keyCode, currentKeyState);
            deviceConfigMultiStateMap.set(serialNumber, multiStateActions);
        }
        pluginWSServer.notifyKeyAction(
            serialNumber,
            currentProfile.resourceId,
            pluginId,
            action,
            activeConfig.type,
            keyCode,
            currentKeyState,
            isMultiAction,
            multiActionIdx
        );
        return;
    }

    switch (activeConfig.type) {
        case 'timer':
            if (action !== 0) break;

            processTimerActions(serialNumber, keyActions, keyCode);
            break;
        case 'brightness':
            if (action === 1) break;
            processBrightnessLevelConfig(serialNumber, keyActions, action);
            break;
        case 'multiActions':
            if (action === 1) break;
            processMultiActions(serialNumber, activeConfig, keyCode, 0, downTime, eventTime);
            break;
        case 'delay':
            break;
        case 'folder':
            if (action === 1) break;
            processPageOrFolderChange(serialNumber, 0, keyActions[0].value, activeConfigIdx);
            break;
        case 'back':
            if (action === 1) break;
            processPageOrFolderChange(serialNumber, 0, keyActions[0].value, activeConfigIdx);
            break;
        case 'switchProfile':
            if (action === 1) break;
            if (keyActions.length !== 2) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }
            let profileConfig,
                pageConfig = undefined;
            keyActions.forEach(configedAction => {
                switch (configedAction.type) {
                    case 'profile':
                        profileConfig = configedAction.value;
                        break;
                    case 'page':
                        pageConfig = configedAction.value;
                        break;
                }
            });

            if (profileConfig === undefined || pageConfig === undefined) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }

            if (profileConfig.indexOf('-') === 1 && appManager.resourcesManager.getResourceInfo(profileConfig) === null) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }

            processProfileSwitch(serialNumber, profileConfig, pageConfig);
            break;
        case 'pageUp':
            if (action === 1) break;
            processPageOrFolderChange(serialNumber, Constants.ACTION_PAGE_UP, '', activeConfigIdx);
            break;
        case 'pageDown':
            if (action === 1) break;
            processPageOrFolderChange(
                serialNumber,
                Constants.ACTION_PAGE_DOWN,
                '',
                activeConfigIdx
            );
            break;
        case 'goToPage':
            if (action === 1) break;
            if (keyActions[0].type !== 'page') {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }

            const goToPageIdx = keyActions[0].value;

            processPageOrFolderChange(serialNumber, goToPageIdx, '', activeConfigIdx);
            break;
        case 'pageNo':
            break;
        case 'website':
            if (action === 1) break;

            if (keyActions[0].type !== 'url') {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }

            let url = keyActions[0].value;
            if (!url) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                return;
            }
            if (!url.startsWith('http')) {
                url = 'http://' + url;
            }
            shell.openExternal(url);
            break;
        case 'hotkeySwitch':
            if (action === 1) break;
            if (
                keyActions.length !== 2 ||
                keyActions[0].type !== 'key' ||
                keyActions[1].type !== 'key'
            ) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }
            let deviceHotkeySwitchActions = deviceConfigMultiStateMap.get(serialNumber);
            if (!deviceHotkeySwitchActions) {
                deviceHotkeySwitchActions = new Map();
            }
            let lastSwitchId = deviceHotkeySwitchActions.get(keyCode);
            if (lastSwitchId === undefined) {
                lastSwitchId = 1;
            }
            const newState = lastSwitchId;

            if (lastSwitchId === 0) {
                lastSwitchId = 1;
                if (!sendKeyEvent(keyActions[lastSwitchId].value)) {
                    notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                }
            } else {
                lastSwitchId = 0;
                if (!sendKeyEvent(keyActions[lastSwitchId].value)) {
                    notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                }
            }
            deviceHotkeySwitchActions.set(keyCode, lastSwitchId);
            deviceConfigMultiStateMap.set(serialNumber, deviceHotkeySwitchActions);

            processDeviceConfigSetState(serialNumber, keyCode, newState);
            break;
        case 'hotkey':
            if (action === 1) break;
            if (
                keyActions.length < 1 ||
                keyActions[0].type !== 'key' ||
                keyActions[0].value === '' ||
                !sendKeyEvent(keyActions[0].value)
            ) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }
            break;
        case 'open':
            if (action === 1) break;

            if (keyActions[0].type !== 'path') {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }

            let filePath = keyActions[0].value;
            if (!filePath) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                return;
            }
            shell
                .openPath(filePath)
                .then(res => {
                    console.log('DeviceControlManager: processConfiguredAction: openPath ret: ', res);

                    if (res && res !== '' && res !== ' ') {
                        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                    }
                })
                .catch(err => {
                    console.log(
                        'DeviceControlManager: processConfiguredAction: openPath err: ',
                        err
                    );
                    if (err) {
                        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                    }
                });
            break;
        case 'close':
            if (action === 1) break;

            if (keyActions[0].type !== 'path') {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }

            let fPath = keyActions[0].value;
            if (!fPath) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                return;
            }
            processCloseAction(serialNumber, keyCode, fPath);
            break;
        case 'text':
            if (action === 1) break;
            if (keyActions.length < 1 || keyActions[0].type !== 'text') {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }
            robotjs.typeString(keyActions[0].value);

            if ((keyActions.length === 2 && keyActions[1].type === 'key') && !sendKeyEvent(keyActions[1].value)) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                break;
            }
            break;
        case 'media':
            if (action === 1) break;
            processMediaActions(serialNumber, keyActions, keyCode, action);
            break;
        case 'playAudio':
            if (action === 1) break;
            return processAudioPlay(serialNumber, keyCode, keyActions, multiActionIdx);
        case 'stopAudio':
            if (action === 1) break;
            processStopAudioPlay(serialNumber, keyCode);
            break;
        case 'knob':
            processKnobActions(serialNumber, activeConfig, keyCode, action, downTime, eventTime);
            break;
        case 'assistant':
            processAIAssistant(serialNumber, keyCode, action, downTime, eventTime);
            break;
        case 'cmd':
            if (action === 1) break;

            processCMDAction(serialNumber, keyCode, keyActions);
            break;
    }
}

function sendKeyEvent(keyValue) {
    return sendKeyEventWithGap(keyValue, 5);
}

function sendKeyEventWithGap(keyValue, delayGap) {
    try {
        const keyValues = keyValue.split('+');
        if (keyValues.length === 1 || keyValue === '+') {
            if (SPECIAL_CHAR_INPUT.includes(keyValue)) {
                robotjs.typeString(keyValue);
            } else {

                if (keyValue === 'printscreen') {
                    captureScreen();
                } else {
                    robotjs.keyTap(keyValue, delayGap);
                }
            }
        } else {
            if (keyValue === 'command+l' && process.platform === 'win32') {
                // Windows lock screen
                exec('rundll32.exe user32.dll,LockWorkStation', (err, stdout, stderr) => {
                    if (err) {
                        console.error(
                            `DeviceControlManager: processWindowsLockScreen: exec error: ${err}`
                        );
                    }
                });
            } else {
                const keyModifiers = [];
                for (let i = 0; i < keyValues.length - 1; i++) {
                    keyModifiers.push(keyValues[i]);
                }
                console.log('DeviceControlManager: keyModifiers: ' + keyModifiers);

                robotjs.keyTap(keyValues[keyValues.length - 1], delayGap, keyModifiers);
            }
        }
        return true;
    } catch (err) {
        console.error('sendKeyEvDeviceControlManager: entWithGap: failed to tap key values', err);
    }
    return false;
}

async function captureScreen() {
    // 获取系统图片库路径
    const imageLibraryPath = app.getPath('pictures');

    console.log('DeviceControlManager: Screenshot imageLibraryPath ' + imageLibraryPath);

    let displaySize = screen.getPrimaryDisplay().workAreaSize;

    const allDisplays = screen.getAllDisplays();
    if (allDisplays.length > 0) {
        allDisplays.forEach(displayInfo => {
            if (displayInfo.workAreaSize.width > displaySize.width && displayInfo.workAreaSize.height > displaySize.height) {
                displaySize = displayInfo.workAreaSize;
            }
        });
    }

    console.log(`DeviceControlManager: Screenshot: Max display size: ${displaySize.width}x${displaySize.height}`);

    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: displaySize.width, height: displaySize.height } });
    for (let i = 0; i < sources.length; i++) {
        const screenSource = sources[i];
        const imagePath = path.join(imageLibraryPath, 'screenshot-' + Date.now() + '-' + i + '.png');
        fs.writeFileSync(imagePath, screenSource.thumbnail.toPNG());
        console.log('DeviceControlManager: Screenshot saved to ' + imagePath);
    }
}

function notifyDeviceProfileChange(serialNumber, resourceId, configIdx, oldResourceId) {
    const deviceConfig = deviceDefaultConfigMap.get(serialNumber);
    const keyMatrix =
        deviceConfig === undefined || deviceConfig.keyMatrix === undefined
            ? {
                  row: 2,
                  col: 3,
              }
            : deviceConfig.keyMatrix;
    const configDetail = appManager.resourcesManager.getConfigInfo(
        resourceId,
        keyMatrix.row,
        keyMatrix.col
    );

    try {
        let devicePlayers = deviceAudioPlayerMap.get(serialNumber);
        if (devicePlayers && devicePlayers.length > 0) {
            devicePlayers.forEach(playerInfo => {
                if (
                    appManager &&
                    appManager.windowManager &&
                    appManager.windowManager.mainWindow &&
                    appManager.windowManager.mainWindow.win
                ) {
                    appManager.windowManager.mainWindow.win.webContents.send('DestroyPlayer', {
                        playerId: playerInfo.playerId,
                    });
                }
            });
            devicePlayers = [];
        }
        deviceAudioPlayerMap.delete(serialNumber);

        let deviceTimeoutTasks = deviceTimeoutTaskMap.get(serialNumber);

        if (deviceTimeoutTasks) {
            deviceTimeoutTasks.forEach((keyCode, taskId) => {
                console.log(
                    'DeviceControlManager: notifyDeviceProfileChange: Cancel exist timer countdown for device: ' +
                        serialNumber +
                        ' Keycode: ' +
                        keyCode +
                        ' TaskId: ' +
                        taskId
                );
                clearTimeout(taskId);
            });
            deviceTimeoutTasks.clear();
        }
        deviceTimeoutTaskMap.delete(serialNumber);
    } catch (err) {
        console.log(
            'DeviceControlManager: notifyDeviceProfileChange: detect error on DestroyPlayer: ',
            err
        );
    }

    if (configDetail) {
        try {
            loadConfigRelatedResource(serialNumber, resourceId, configDetail, -1, oldResourceId);
        } catch (err) {
            console.log(
                'DeviceControlManager: notifyDeviceProfileChange: loadConfigRelatedResource: detect error: ',
                err
            );
        }
    }

    const resourceInfo = appManager.resourcesManager.getResourceInfo(resourceId);
    if (
        !sendDataToDevice(serialNumber, {
            type: 'profile',
            resourceId: resourceId,
            configIdx: configIdx,
            version: resourceInfo.version,
            generateTime: String(resourceInfo.generateTime),
        })
    ) {
        return;
    }

    if (
        appManager &&
        appManager.windowManager &&
        appManager.windowManager.mainWindow &&
        appManager.windowManager.mainWindow.win
    ) {
        appManager.windowManager.mainWindow.win.webContents.send('DeviceProfileChange', {
            serialNumber: serialNumber,
            resourceId: resourceId,
            configIdx: configIdx,
        });
    }
}

async function loadConfigRelatedResource(serialNumber, resourceId, configDetail, multiActionIndex = -1, oldResourceId) {
    const isMainEntry = multiActionIndex === -1;

    if (multiActionIndex === -1) {
        multiActionIndex = 0;
    }

    let loadSoundInfos = [];
    for (let i = 0; i < configDetail.length; i++) {
        const configInfo = configDetail[i];
        const config = configInfo.config;
        if (!config) continue;

        if (configInfo.isPlugin) {
            continue;
        } else if (configInfo.config.type === 'multiActions') {
            for (let j = 0; j < configInfo.config.subActions.length; j++) {
                await loadConfigRelatedResource(
                    serialNumber,
                    resourceId,
                    [configInfo.config.subActions[j]],
                    j,
                    oldResourceId
                );
            }
        }

        let soundPath = undefined,
            audioAction = '0',
            audioFade = '0-0',
            desiredVolume = 100;

        let deviceAudioPlayerList = deviceAudioPlayerMap.get(serialNumber);
        if (!deviceAudioPlayerList) {
            deviceAudioPlayerList = [];
        }

        const keyCodeProcess = configInfo.isMultiAction ? configInfo.multiActionsKeyCode : configInfo.keyCode;


        switch (config.type) {
            case 'playAudio':
                if (!config.actions || config.actions.length < 4) break;

                for (let i = 0; i < config.actions.length; i++) {
                    const configActionType = config.actions[i].type;
                    const configActionValue = config.actions[i].value;
                    switch (configActionType) {
                        case 'sound':
                            soundPath = configActionValue;
                            break;
                        case 'audioAction':
                            audioAction = configActionValue;
                            break;
                        case 'audioFade':
                            audioFade = configActionValue;
                            break;
                        case 'volume':
                            desiredVolume = configActionValue;
                            break;
                    }
                }
                break;
            case 'timer':
                if (!config.actions || config.actions.length < 2) break;

                for (let i = 0; i < config.actions.length; i++) {
                    if (config.actions[i].type === 'sound') {
                        soundPath = config.actions[i].value;
                        break;
                    }
                }
                break;
        }

        if (
            soundPath &&
            fs.existsSync(soundPath) &&
            appManager &&
            appManager.windowManager &&
            appManager.windowManager.mainWindow &&
            appManager.windowManager.mainWindow.win
        ) {

            console.log(
                'DeviceControlManager: loadConfigRelatedResource: generate player on keyCode: ' +
                    keyCodeProcess +
                    ' multiActionIndex: ' +
                    multiActionIndex +
                    ' SoundPath: ' +
                    soundPath
            );

            const loadedSoundInfo = deviceAudioPlayerList.find(playerInfo => playerInfo.keyCode === keyCodeProcess && playerInfo.soundPath === soundPath);

            if (loadedSoundInfo === undefined) {
                loadSoundInfos.push({
                    requestId: serialNumber + '-' + keyCodeProcess + '-' + multiActionIndex,
                    soundPath: soundPath,
                    volume: desiredVolume,
                });
            }
        }
    }

    if (loadSoundInfos.length > 0) {
        loadSoundInfos.forEach(soundInfo => {
            appManager.windowManager.mainWindow.win.webContents.send('LoadAudio', soundInfo);
        });
    }

    if (!isMainEntry) return;

    let disappearPluginList = [];
    let appearPluginList = [];
    let noChangePluginList = [];

    const deviceLoadPluginInfoList = getAllRelatedPluginList(resourceId, configDetail, 0, oldResourceId);

    console.log(
        'DeviceControlManager: loadConfigRelatedResource: deviceLoadPluginInfoList: ' + JSON.stringify(deviceLoadPluginInfoList)
    );

    const oldDeviceLoadedPluginList = deviceAppearPluginMap.get(serialNumber);

    // Filter out disappear plugins and no change plugin list
    if (oldDeviceLoadedPluginList && oldDeviceLoadedPluginList.length > 0) {
        if (deviceLoadPluginInfoList.length === 0) {
            disappearPluginList = oldDeviceLoadedPluginList;
        } else {
            oldDeviceLoadedPluginList.forEach(pluginInfo => {
                const commonPluginInfo = deviceLoadPluginInfoList.filter(
                    newPluginInfo =>
                        newPluginInfo.pluginId === pluginInfo.pluginId &&
                        newPluginInfo.action === pluginInfo.action &&
                        newPluginInfo.keyCode === pluginInfo.keyCode &&
                        newPluginInfo.multiActionIndex === pluginInfo.multiActionIndex
                );

                if (!commonPluginInfo || commonPluginInfo.length === 0) {
                    disappearPluginList.push(pluginInfo);
                } else {
                    noChangePluginList.push(pluginInfo);
                }
            });
        }
    }

    // Filter out newly showed plugin info
    if (deviceLoadPluginInfoList.length > 0) {
        deviceLoadPluginInfoList.forEach(pluginInfo => {
            const commonPluginInfo = noChangePluginList.filter(
                newPluginInfo =>
                    newPluginInfo.pluginId === pluginInfo.pluginId &&
                    newPluginInfo.action === pluginInfo.action &&
                    newPluginInfo.keyCode === pluginInfo.keyCode &&
                    newPluginInfo.multiActionIndex === pluginInfo.multiActionIndex
            );
            if (!commonPluginInfo || commonPluginInfo.length === 0) {
                appearPluginList.push(pluginInfo);
            }
        });
    }

    if (disappearPluginList.length > 0) {
        if (oldResourceId === undefined) {
            oldResourceId = resourceId;
        }
        disappearPluginList.forEach(pluginInfo => {
            pluginWSServer.notifyPluginVisibilityChange(
                oldResourceId,
                pluginInfo.pluginId,
                pluginInfo.action,
                pluginInfo.keyCode,
                false,
                false,
                pluginInfo.multiActionIndex,
                serialNumber
            );
        });
    }

    if (appearPluginList.length > 0) {
        appearPluginList.forEach(pluginInfo => {
            pluginWSServer.notifyPluginVisibilityChange(
                resourceId,
                pluginInfo.pluginId,
                pluginInfo.action,
                pluginInfo.keyCode,
                true,
                false,
                pluginInfo.multiActionIndex,
                serialNumber
            );
        });
    }

    console.log(
        'DeviceControlManager: loadConfigRelatedResource: disappearPluginList: ' + JSON.stringify(disappearPluginList)
    );
    console.log(
        'DeviceControlManager: loadConfigRelatedResource: appearPluginList: ' + JSON.stringify(appearPluginList)
    );
    console.log(
        'DeviceControlManager: loadConfigRelatedResource: noChangePluginList: ' + JSON.stringify(noChangePluginList)
    );

    deviceAppearPluginMap.set(serialNumber, deviceLoadPluginInfoList);
}

function getAllRelatedPluginList(resourceId, configDetail, multiActionIndex) {
    let deviceLoadPluginInfoList = [];
    console.log('DeviceControlManager: getAllRelatedPluginList: Checking For: ' + JSON.stringify(configDetail));
    for (let i = 0; i < configDetail.length; i++) {
        const configInfo = configDetail[i];
        const config = configInfo.config;
        if (!config) continue;

        if (configInfo.isPlugin) {
            deviceLoadPluginInfoList.push({
                activeProfileId: resourceId,
                pluginId: configInfo.pluginId,
                action: configInfo.config.type,
                keyCode: configInfo.isMultiAction ? configInfo.multiActionsKeyCode : configInfo.keyCode,
                multiActionIndex: multiActionIndex,
            });
        } else if (configInfo.config.type === 'multiActions') {
            console.log('DeviceControlManager: getAllRelatedPluginList: for MultiActions: Current: ' + JSON.stringify(deviceLoadPluginInfoList));
            for (let j = 0; j < configInfo.config.subActions.length; j++) {
                deviceLoadPluginInfoList = deviceLoadPluginInfoList.concat(
                    getAllRelatedPluginList(resourceId, [configInfo.config.subActions[j]], j)
                );
            }
            console.log('DeviceControlManager: getAllRelatedPluginList: for MultiActions: After: ' + JSON.stringify(deviceLoadPluginInfoList));
        }
    }

    return deviceLoadPluginInfoList;
}

function readFileInChunks(filePath, chunkSize) {
    const fileData = fs.readFileSync(filePath);
    const fileSize = fileData.length;
    const numChunks = Math.ceil(fileSize / chunkSize);
    const chunks = [];

    if (filePath.includes('KeyConfig') && filePath.endsWith('.json')) {
        console.log(
            'readFileInChunks: KeyConfig Detail: ',
            appManager.resourcesManager.readFileToStr(filePath)
        );
    }

    for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = fileData.slice(start, end);
        chunks.push(chunk);
    }

    return chunks;
}

function processPageOrFolderChange(serialNumber, pageAction, folderChange, currentConfigIdxInfo) {
    const activeConfigIdxInfo = currentConfigIdxInfo.split(',');

    if (activeConfigIdxInfo.length < 3) {
        console.log('DeviceControlManager: processPageChange: pageUp on invalid configIdx');
        return false;
    }
    const currentPage = Number.parseInt(activeConfigIdxInfo[1]);
    let nextPage = currentPage;

    const deviceConfigs = deviceProfileMap.get(serialNumber);
    if (pageAction >= -2) {
        switch (pageAction) {
            case Constants.ACTION_PAGE_UP:
                nextPage -= 1;
                break;
            case Constants.ACTION_PAGE_DOWN:
                nextPage += 1;
                break;
            case 0:
                break;
            default:
                nextPage = pageAction;
                break;
        }
    }

    const currentFolder = Number.parseInt(activeConfigIdxInfo[2]);
    let nextFolder = currentFolder;
    if (folderChange !== '') {
        nextFolder = Number.parseInt(folderChange.split(',')[2]);
    }

    let maxPage = 1;
    let maxFolder = 1;
    deviceConfigs.forEach(configInfo => {
        const idxInfo = configInfo.configIdx.split(',');
        const pageIdx = Number.parseInt(idxInfo[1]);
        if (pageIdx > maxPage) {
            maxPage = pageIdx;
        }

        const folderIdx = Number.parseInt(idxInfo[2]);
        if (folderIdx > maxFolder) {
            maxFolder = folderIdx;
        }
    });

    if (nextFolder > maxFolder) {
        nextFolder = maxFolder;
    } else if (nextFolder < 1) {
        nextFolder = 1;
    }

    if (nextPage > maxPage) {
        nextPage = 1;
    } else if (nextPage < 1) {
        nextPage = maxPage;
    }

    console.log(
        'DeviceControlManager: processPageChange: pageAction: ' +
            pageAction +
            ' currentPage: ' +
            currentPage +
            ' nextPage: ' +
            nextPage +
            ' folderChange: ' +
            folderChange +
            ' currentFolder: ' +
            currentFolder +
            ' nextFolder: ' +
            nextFolder
    );

    const nextActiveConfig = deviceConfigs.filter(configInfo => {
        // Find next page/folder config info. ie: for page up: current is 1,2,1   next will be 1,1,1
        return configInfo.configIdx === activeConfigIdxInfo[0] + ',' + nextPage + ',' + nextFolder;
    });

    if (!nextActiveConfig || nextActiveConfig.length === 0) {
        console.log(
            'DeviceControlManager: processPageChange: pageAction: ' +
                pageAction +
                ' folderChange: ' +
                folderChange +
                ' not find related page info'
        );
        return false;
    }
    console.log(
        'DeviceControlManager: processPageChange: pageAction: ' +
            pageAction +
            ' folderChange: ' +
            folderChange +
            ' find next page config: ',
        nextActiveConfig
    );

    const currentActiveProfile = deviceActiveProfileMap.get(serialNumber);

    const deviceConfig = deviceDefaultConfigMap.get(serialNumber);
    const keyMatrix =
        deviceConfig === undefined || deviceConfig.keyMatrix === undefined
            ? {
                  row: 2,
                  col: 3,
              }
            : deviceConfig.keyMatrix;
    deviceActiveProfileMap.set(serialNumber, {
        configIdx: nextActiveConfig[0].configIdx,
        resourceId: nextActiveConfig[0].resourceId,
        configInfo: appManager.resourcesManager.getConfigInfo(
            nextActiveConfig[0].resourceId,
            keyMatrix.row,
            keyMatrix.col
        ),
    });
    notifyDeviceProfileChange(
        serialNumber,
        nextActiveConfig[0].resourceId,
        nextActiveConfig[0].configIdx,
        currentActiveProfile.resourceId
    );

    return true;
}

function processProfileSwitch(serialNumber, profileConfig, pageConfig) {
    const currentProfile = deviceActiveProfileMap.get(serialNumber);
    console.log('DeviceControlManager: processProfileSwitch: currentProfile: ', currentProfile);
    if (!currentProfile) {
        const defaultConfigInfo = appManager.resourcesManager.getDefaultResourceInfo(
            Constants.RESOURCE_TYPE_DEVICE_CONFIG
        );
        processProfileSwitch(serialNumber, defaultConfigInfo.id);
        return;
    }

    const currentConfigIdxInfo = currentProfile.configIdx.split(',');
    if (currentConfigIdxInfo.length !== 3) {
        console.log(
            'DeviceControlManager: processProfileSwitch: invalid configIdx',
            currentConfigIdxInfo
        );
        return;
    }
    const deviceConfigs = appManager.resourcesManager.getAllResourceInfoByType(
        Constants.RESOURCE_TYPE_DEVICE_CONFIG
    );
    console.log('DeviceControlManager: processProfileSwitch: deviceConfigs: ', deviceConfigs);

    if (deviceConfigs.length === 0) {
        return;
    }


    // Process go to next profile
    if (profileConfig === '-1') {
        const currentConfigId = Number.parseInt(currentConfigIdxInfo[0]);
        let nextConfigId = currentConfigId + 1;

        let maxConfigId = 1;
        let minConfigId = 1;
        deviceConfigs.forEach(configInfo => {
            const idxInfo = configInfo.name.split(',');
            const configId = Number.parseInt(idxInfo[0]);
            if (configId > maxConfigId) {
                maxConfigId = configId;
            }
            if (configId < minConfigId) {
                minConfigId = configId;
            }
        });

        if (nextConfigId > maxConfigId) {
            nextConfigId = minConfigId;
        }
        if (nextConfigId < minConfigId) {
            nextConfigId = maxConfigId;
        }

        // Filter all the configs under required configId
        const configDetails = deviceConfigs.filter(config => {
            return config.name.startsWith(nextConfigId + ',');
        });

        const configList = [];
        configDetails.forEach(config => {
            configList.push({
                configIdx: config.name,
                resourceId: config.id,
            });
        });

        console.log(
            'DeviceControlManager: processProfileSwitch: loaded device configs' + configList
        );
        deviceProfileMap.set(serialNumber, configList);
        const deviceConfig = deviceDefaultConfigMap.get(serialNumber);
        const keyMatrix =
            deviceConfig === undefined || deviceConfig.keyMatrix === undefined
                ? {
                      row: 2,
                      col: 3,
                  }
                : deviceConfig.keyMatrix;
        deviceActiveProfileMap.set(serialNumber, {
            configIdx: configList[0].configIdx,
            resourceId: configList[0].resourceId,
            configInfo: appManager.resourcesManager.getConfigInfo(
                configList[0].resourceId,
                keyMatrix.row,
                keyMatrix.col
            ),
        });

        notifyDeviceProfileChange(serialNumber, configList[0].resourceId, configList[0].configIdx, currentProfile.resourceId);

        return;
    }

    // Process go to default profile
    if (profileConfig === '0') {
        const defaultConfigInfo = appManager.resourcesManager.getDefaultResourceInfo(
            Constants.RESOURCE_TYPE_DEVICE_CONFIG
        );
        if (!defaultConfigInfo) return;

        profileConfig = defaultConfigInfo[0].id;
    }

    // Process go to requested profile

    if (profileConfig.indexOf('-') !== 1) return;

    console.log(
        'DeviceControlManager: processProfileSwitch: loaded device config need profileConfig: ' +
            profileConfig
    );

    const resourceId = profileConfig;
    const requireActiveConfig = appManager.resourcesManager.getResourceInfo(resourceId);

    let activeConfig;

    const configId = requireActiveConfig.name.substring(
        0,
        requireActiveConfig.name.indexOf(',') + 1
    );
    // Filter all the configs under required configId
    const configDetails = deviceConfigs.filter(config => {
        return config.name.startsWith(configId);
    });

    console.log(
        'DeviceControlManager: processProfileSwitch: loaded device config requireActiveConfig: ',
        requireActiveConfig,
        ' configId: ',
        configId
    );

    const configList = [];
    configDetails.forEach(config => {
        const configData = {
            configIdx: config.name,
            resourceId: config.id,
        };
        if (config.id === resourceId) {
            const deviceConfig = deviceDefaultConfigMap.get(serialNumber);
            const keyMatrix =
                deviceConfig === undefined || deviceConfig.keyMatrix === undefined
                    ? {
                          row: 2,
                          col: 3,
                      }
                    : deviceConfig.keyMatrix;
            activeConfig = {
                configIdx: config.name,
                resourceId: config.id,
                configInfo: appManager.resourcesManager.getConfigInfo(
                    config.id,
                    keyMatrix.row,
                    keyMatrix.col
                ),
            };
        }
        configList.push(configData);
    });

    deviceProfileMap.set(serialNumber, configList);
    deviceActiveProfileMap.set(serialNumber, activeConfig);

    console.log(
        'DeviceControlManager: processProfileSwitch: loaded device configs: ',
        configList,
        ' Active: ',
        activeConfig
    );

    if (activeConfig === undefined) return;

    notifyDeviceProfileChange(serialNumber, activeConfig.resourceId, activeConfig.configIdx, currentProfile.resourceId);
}

function processBrightnessLevelConfig(serialNumber, keyActions, action) {
    let actionIdx = 0;
    switch (action) {
        case 0:
            if (!keyActions || keyActions.length < 1 || keyActions[0].type !== 'level') break;
            break;
        case 2:
            if (!keyActions || keyActions.length < 2 || keyActions[1].type !== 'level') break;
            actionIdx = 1;
            break;
        case 3:
            if (!keyActions || keyActions.length < 3 || keyActions[2].type !== 'level') break;
            actionIdx = 2;
            break;
    }

    if (
        !sendDataToDevice(serialNumber, {
            type: 'brightness',
            level: keyActions[actionIdx].value,
        })
    ) {
        console.log(
            'DeviceControlManager: processBrightnessLevelConfig: failed to send data to device for brightness control'
        );
    }
}

async function processMultiActions(serialNumber, activeConfig, keyCode, idx, downTime, eventTime) {
    try {
        const subActions = activeConfig.subActions;
        let deviceMultiActionsProgress = deviceMultiActionProgressMap.get(serialNumber);
        console.log(
            'DeviceControlManager: processMultiActions: for ',
            serialNumber,
            ' idx: ',
            idx,
            ' subActions: ' + JSON.stringify(subActions)
        );

        if (!subActions || subActions.length < 1) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            if (deviceMultiActionsProgress) {
                deviceMultiActionsProgress.clear();
            }
            deviceMultiActionProgressMap.delete(serialNumber);
            return;
        }
        if (idx >= subActions.length) {
            if (deviceMultiActionsProgress) {
                deviceMultiActionsProgress.clear();
            }
            deviceMultiActionProgressMap.delete(serialNumber);
            return;
        }
        let deviceMultiActionsTimeTasks = deviceMultiActionTimeTaskMap.get(serialNumber);
        if (!deviceMultiActionsTimeTasks) {
            deviceMultiActionsTimeTasks = new Map();
        }

        const lastTaskId = deviceMultiActionsTimeTasks.get(keyCode);

        if (!deviceMultiActionsProgress) {
            deviceMultiActionsProgress = new Map();
        }
        const lastProcessedIdx = deviceMultiActionsProgress.get(keyCode);
        console.log('DeviceControlManager: processMultiActions: for ', serialNumber, ' idx: ', idx);
        if (idx === 0) {
            if (lastProcessedIdx === undefined) {
                console.log(
                    'DeviceControlManager: processMultiActions: start new multiActions: on ',
                    serialNumber,
                    ' subActions: ' + JSON.stringify(subActions)
                );
                deviceMultiActionsProgress.set(keyCode, idx);
                deviceMultiActionProgressMap.set(serialNumber, deviceMultiActionsProgress);
            } else {
                if (lastTaskId !== undefined) {
                    clearTimeout(lastTaskId);
                }
                sendDataToDevice(serialNumber, {
                    type: 'progress',
                    keyCode: keyCode,
                    percent: 100,
                });
                console.log(
                    'DeviceControlManager: processMultiActions: stop current multiActions: on ',
                    serialNumber
                );
                deviceMultiActionsProgress.delete(keyCode);

                deviceMultiActionsTimeTasks.delete(keyCode);
                return;
            }
        }

        deviceMultiActionsTimeTasks.delete(keyCode);

        const subAction = subActions[idx].config;
        console.log(
            'DeviceControlManager: processMultiActions: for ',
            serialNumber,
            ' subAction: ' + JSON.stringify(subAction)
        );

        let delayGap = subAction.gap;
        if (!delayGap) {
            delayGap = 100;
        }

        let processActionReturnValue = undefined;

        if (subActions[idx].isPlugin) {
            processConfiguredAction(
                serialNumber,
                subAction,
                keyCode,
                0,
                downTime,
                eventTime,
                subActions[idx].pluginId,
                idx
            );
        } else {
            switch (subAction.type) {
                case 'hotkey':
                    if (
                        subAction.actions.length < 1 ||
                        subAction.actions[0].type !== 'key' ||
                        !sendKeyEventWithGap(subAction.actions[0].value, subAction.pressTime)
                    ) {
                        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                        break;
                    }
                    break;
                case 'close':
                case 'open':
                case 'website':
                case 'switchProfile':
                case 'brightness':
                case 'playAudio':
                case 'stopAudio':
                case 'text':
                case 'media':
                case 'cmd':
                    processActionReturnValue = processConfiguredAction(
                        serialNumber,
                        subAction,
                        keyCode,
                        0,
                        downTime,
                        eventTime,
                        subActions[idx].pluginId,
                        idx
                    );
                    break;
                case 'delay':
                    if (subAction.actions.length < 1 || subAction.actions[0].type !== 'time') {
                        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                        break;
                    }
                    delayGap += Number.parseInt(subAction.actions[0].value);
                    break;
            }
        }

        if (processActionReturnValue !== undefined) {
            console.log('DeviceControlManager: processMultiActions sleep for action end. Duration: ', processActionReturnValue);
            await sleep(processActionReturnValue);
        }

        console.log(
            'DeviceControlManager: processMultiActions: for ',
            serialNumber,
            ' delayGap: ',
            delayGap
        );

        const taskId = setTimeout(() => {
            processMultiActions(
                serialNumber,
                activeConfig,
                keyCode,
                (idx += 1),
                downTime,
                eventTime
            );
        }, delayGap);

        deviceMultiActionsTimeTasks.set(keyCode, taskId);
        deviceMultiActionTimeTaskMap.set(serialNumber, deviceMultiActionsTimeTasks);

        sendDataToDevice(serialNumber, {
            type: 'progress',
            keyCode: keyCode,
            percent: Math.floor(((idx + 1) / (subActions.length * 1.0)) * 100),
        });
    } catch (err) {
        console.log(
            'DeviceControlManager: processMultiActions: for ',
            serialNumber,
            ' Detected Error: ' + JSON.stringify(err)
        );
        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
    }
}

function processAudioPlay(serialNumber, keyCode, configActions, multiActionIdx = 0) {
    const deviceAudioPlayers = deviceAudioPlayerMap.get(serialNumber);

    if (!deviceAudioPlayers || deviceAudioPlayers.length === 0) {
        console.log(
            'DeviceControlManager: processAudioPlay: Failed for ' +
                serialNumber +
                ' not found audio player.'
        );
        return 0;
    }

    const players = deviceAudioPlayers.filter(playerConfig => {
        return playerConfig.keyCode === keyCode && String(playerConfig.extra) === String(multiActionIdx);
    });
    if (!players || players.length === 0) {
        console.log(
            'DeviceControlManager: processAudioPlay: Failed for ' +
                serialNumber +
                ' not found audio player on keyCode: ' +
                keyCode
        );
        return 0;
    }
    const playerId = players[0].playerId;

    let audioAction = Constants.AUDIO_ACTION_PLAY_RESTART,
        audioFade = '0-0';
    if (configActions) {
        if (configActions.length < 4) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            console.log(
                'DeviceControlManager: processAudioPlay: Failed for ' +
                    serialNumber +
                    ' invalid actions: ',
                configActions
            );
            return 0;
        }

        for (let i = 0; i < configActions.length; i++) {
            const configActionType = configActions[i].type;
            const configActionValue = configActions[i].value;
            switch (configActionType) {
                case 'audioAction':
                    audioAction = configActionValue;
                    break;
                case 'audioFade':
                    audioFade = configActionValue;
                    break;
            }
        }
    }

    doAudioPlay(serialNumber, playerId, audioAction, audioFade);

    return players[0].duration;
}

function doAudioPlay(serialNumber, playerId, audioAction, audioFade) {
    if (
        !appManager ||
        !appManager.windowManager ||
        !appManager.windowManager.mainWindow ||
        !appManager.windowManager.mainWindow.win
    ) {
        return;
    }

    console.log(
        'DeviceControlManager: processAudioPlay: For device: ' +
            serialNumber +
            ' audioAction: ' +
            audioAction +
            ' audioFade: ' +
            audioFade +
            ' playerId: ' +
            playerId
    );
    appManager.windowManager.mainWindow.win.webContents.send('DoAudioAction', {
        playerId: playerId,
        audioAction: audioAction,
        audioFade: audioFade,
    });
}

function processStopAudioPlay(serialNumber, keyCode) {
    const deviceAudioPlayers = deviceAudioPlayerMap.get(serialNumber);

    if (!deviceAudioPlayers || deviceAudioPlayers.length === 0) {
        console.log(
            'DeviceControlManager: processAudioPlay: Failed for ' +
                serialNumber +
                ' not found audio player.'
        );
        return;
    }

    deviceAudioPlayers.forEach(playerInfo => {
        if (
            appManager &&
            appManager.windowManager &&
            appManager.windowManager.mainWindow &&
            appManager.windowManager.mainWindow.win
        ) {
            console.log(
                'DeviceControlManager: processStopAudioPlay: For device: ' +
                    serialNumber +
                    ' playerId: ' +
                    playerInfo.playerId
            );
            appManager.windowManager.mainWindow.win.webContents.send('DoAudioAction', {
                playerId: playerInfo.playerId,
                audioAction: Constants.AUDIO_ACTION_STOP_ALL,
                audioFade: '0-0',
            });
        }
    });
}

function processTimerActions(serialNumber, keyActions, keyCode) {
    console.log(
        'DeviceControlManager: processTimerActions: For device: ' +
            serialNumber +
            ' keyActions: ' +
            keyActions +
            ' keyCode: ' +
            keyCode
    );

    try {
        if (!keyActions || keyActions.length < 2) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            return;
        }

        let deviceTimeoutTasks = deviceTimeoutTaskMap.get(serialNumber);

        if (!deviceTimeoutTasks) {
            deviceTimeoutTasks = new Map();
        }

        const lastTimeoutTaskId = deviceTimeoutTasks.get(keyCode);
        if (lastTimeoutTaskId) {
            console.log(
                'DeviceControlManager: processTimerActions: Cancel exist timer countdown for device: ' +
                    serialNumber +
                    ' Keycode: ' +
                    keyCode +
                    ' TaskId: ' +
                    lastTimeoutTaskId
            );
            clearTimeout(lastTimeoutTaskId);
            deviceTimeoutTasks.delete(keyCode);
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_STOP, keyCode);
            notifyDeviceCountDownValue(serialNumber, -1, keyCode);
            deviceTimeoutTasks.set(serialNumber, deviceTimeoutTasks);
            return;
        }

        let timeout = undefined;
        for (let i = 0; i < keyActions.length; i++) {
            const actionInfo = keyActions[i];
            if (actionInfo.type === 'time') {
                timeout = actionInfo.value;
                break;
            }
        }

        if (!timeout) return;

        const timeoutTaskId = setTimeout(() => {
            processAudioPlay(serialNumber, keyCode, undefined);

            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_ALARM, keyCode);
            notifyDeviceCountDownValue(serialNumber, -1, keyCode);
        }, timeout);
        console.log(
            'DeviceControlManager: processTimerActions: Add new timer countdown for device: ' +
                serialNumber +
                ' Keycode: ' +
                keyCode +
                ' TaskId: ' +
                timeoutTaskId
        );
        deviceTimeoutTasks.set(keyCode, timeoutTaskId);
        deviceTimeoutTaskMap.set(serialNumber, deviceTimeoutTasks);

        notifyDeviceCountDownValue(serialNumber, timeout, keyCode);
    } catch (err) {
        console.log('DeviceControlManager: processTimerActions detect err: ', err);
    }
}

function processCloseAction(serialNumber, keyCode, filePath) {
    console.log(
        'DeviceControlManager: processCloseAction: current platform: ' +
            process.platform +
            ' filePath: ' +
            filePath
    );
    if (!fs.existsSync(filePath)) {
        console.log(
            'DeviceControlManager: processCloseAction: current platform: ' +
                process.platform +
                ' filePath: ' +
                filePath
        );
        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
        return;
    }

    if (process.platform === 'win32') {
        let exeName = filePath.split('\\').pop();
        if (!exeName || exeName === '') {
            exeName = filePath.split('/').pop();
        }
        if (!exeName || exeName === '') {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            return;
        }
        exec('tasklist | findstr ' + exeName, (error, stdout, stderr) => {
            if (error) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                console.error(`DeviceControlManager: processCloseAction: exec error: ${error}`);
                return;
            }

            const pid = stdout.split(/\s+/)[1]; // 根据 tasklist 的输出格式获取 PID
            console.debug(`processCloseAction: pid ${pid} for ${filePath} processName: ${exeName}`);

            // 强制关闭进程
            exec(`taskkill /F /PID ${pid}`, (err, stdout, stderr) => {
                if (err) {
                    notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                    console.error(`DeviceControlManager: processCloseAction: exec error: ${err}`);
                    return;
                }
                console.log(
                    'DeviceControlManager: processCloseAction: Process has been killed forcefully!'
                );
            });
        });
        return;
    }

    const exeName = filePath.split('/').pop();
    if (!exeName || exeName === '') {
        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
        return;
    }

    // 查找进程
    exec('ps aux | grep ' + exeName, (error, stdout, stderr) => {
        if (error) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            console.error(`DeviceControlManager: exec error: ${error}`);
            return;
        }

        const pid = stdout.trim().split(/\s+/)[1]; // 根据 ps 的输出格式获取 PID

        // 强制关闭进程
        exec(`kill -9 ${pid}`, (err, stdout, stderr) => {
            if (err) {
                notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
                console.error(
                    `DeviceControlManager: processCloseAction: exec error: ${err}`
                );
                return;
            }
            console.log(
                'DeviceControlManager: processCloseAction: Process has been killed forcefully!'
            );
        });
    });
}

function processMediaActions(serialNumber, keyActions, keyCode, action) {
    console.log(
        'DeviceControlManager: processMediaActions: for ' +
            serialNumber +
            ' keyActions: ' +
            keyActions +
            ' action: ' +
            action
    );

    if (
        (keyActions.length === 0 ||
            keyActions[0].type !== 'key' ||
            !sendKeyEvent(keyActions[0].value)) &&
        (action === 0 || action === 2 || action === 3)
    ) {
        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
    }
}

function processKnobActions(serialNumber, activeConfig, keyCode, action, downTime, eventTime) {
    const subActions = activeConfig.subActions;

    let requireActionIdx = 0;
    switch (action) {
        case 2:
            requireActionIdx = 1;
            break;
        case 3:
            requireActionIdx = 2;
            break;
    }

    console.log(
        'DeviceControlManager: processKnobActions: requireActionIdx: ' +
            requireActionIdx +
            ' subActions: ' +
            JSON.stringify(subActions)
    );

    if (!subActions || subActions.length === 0 || subActions.length < requireActionIdx + 1) {
        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
        return;
    }

    const configData = subActions[requireActionIdx].config;

    console.log(
        'DeviceControlManager: processKnobActions: configData: ' + JSON.stringify(configData)
    );

    processConfiguredAction(
        serialNumber,
        configData,
        keyCode,
        action,
        downTime,
        eventTime,
        subActions[requireActionIdx].pluginId
    );
}

function processAIAssistant(serialNumber, keyCode, action, downtime, eventtime) {
    const assistantId = serialNumber + '-' + keyCode;

    console.log(
        'DeviceControlManager: processAIAssistant: For device: ' +
            serialNumber +
            ' Action: ' +
            action +
            ' downtime: ' +
            downtime +
            ' eventtime: ' +
            eventtime
    );
    if (action === 0) {
        if (!global.aiManager.startAssistantSession(serialNumber, assistantId, keyCode)) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
        }
    } else if (action === 1) {
        setTimeout(() => {
            if (eventtime - downtime < 500) {
                global.aiManager.cancelCurrentAssistantSession(serialNumber);
            } else {
                global.appManager.windowManager.aiAssistantWindow.win.webContents.send(
                    'StopAudioRecord',
                    { requestAssistantId: assistantId }
                );
            }
        }, 800);
    }
}

function processCMDAction(serialNumber, keyCode, keyActions) {
    console.log(
        'DeviceControlManager: processCMDAction: For device: ' +
            serialNumber +
            ' Action: ' +
            JSON.stringify(keyActions)
    );

    if (
        keyActions.length < 1 ||
        !keyActions[0].type ||
        keyActions[0].type !== 'text' ||
        !keyActions[0].value ||
        keyActions[0].value === ''
    ) {
        notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
        return;
    }

    const userCMD = keyActions[0].value;

    // 强制关闭进程
    exec(`${userCMD}`, (err, stdout, stderr) => {
        if (err) {
            notifyDeviceShowAlert(serialNumber, Constants.ALERT_TYPE_INVALID, keyCode);
            console.error(
                `DeviceControlManager: processCMDAction: exec error: ${err}`
            );
        }
    });
}

function notifyDeviceCountDownValue(serialNumber, value, keyCode) {
    if (
        sendDataToDevice(serialNumber, {
            type: 'countdown',
            keyCode: keyCode,
            time: value,
        })
    ) {
        return;
    }
    console.log(
        'DeviceControlManager: notifyDeviceCountDownValue failed to send countdown to device.'
    );
}

function notifyDeviceShowAnimation(serialNumber, resourceId, keyCode, time) {
    if (
        sendDataToDevice(serialNumber, {
            type: 'showAnimation',
            keyCode: keyCode,
            time: time,
            resourceId: resourceId,
        })
    ) {
        console.log(
            'DeviceControlManager: notifyDeviceShowAnimation showAnimation on device: ' +
                serialNumber +
                ' resourceId: ' +
                resourceId +
                ' keyCode: ' +
                keyCode +
                ' time: ' +
                time
        );
        return;
    }
    console.log(
        'DeviceControlManager: notifyDeviceShowAnimation failed to send showAnimation to device.'
    );
}

function notifyDeviceShowAlert(serialNumber, alertType, keyCode) {
    if (
        sendDataToDevice(serialNumber, {
            type: 'showAlert',
            keyCode: keyCode,
            alertType: alertType,
        })
    ) {
        return;
    }
    console.log('DeviceControlManager: notifyDeviceShowAlert failed to send showAlert to device.');
}

function sendDataToDevice(serialNumber, data) {
    const deviceType = deviceTypeMap.get(serialNumber);

    if (!deviceType) return false;

    let deviceManager = undefined;

    switch (deviceType) {
        case CONNECTION_TYPE_HID:
            deviceManager = HIDDeviceManager;
            console.log('DeviceControlManager: sendDataToDevice TO HID device.');
            break;
        case CONNECTION_TYPE_WS:
            deviceManager = WSDeviceManager;
            console.log('DeviceControlManager: sendDataToDevice TO WS device.');
            break;
    }

    if (!deviceManager) return false;

    try {
        deviceManager.sendData(serialNumber, data);
        return true;
    } catch (err) {
        console.log('DeviceControlManager: sendDataToDevice failed to send data to device.', err);
    }
    return false;
}

function processDeviceConfigSetState(serialNumber, keyCode, state) {
    console.log(
        'DeviceControlManager: processDeviceConfigSetState To device: ',
        serialNumber,
        ' OnKeyCode: ',
        keyCode,
        ' State: ',
        state
    );

    const activeProfile = deviceActiveProfileMap.get(serialNumber);
    if (!activeProfile) return;

    const keyConfigs = activeProfile.configInfo.filter(configDetail => {
        return configDetail.keyCode === keyCode;
    });

    if (!keyConfigs || keyConfigs.length < 1) return;

    const keyConfigInfo = keyConfigs[0];
    const keyConfigActions = keyConfigInfo.config.actions;
    if (keyConfigInfo.isPlugin && keyConfigActions.value) {
        const pluginActionsInfo = JSON.parse(keyConfigActions.value);
        // For multi state key config, get last state
        if (pluginActionsInfo.States.length < 2) {
            return;
        }
        const multiStateActions = deviceConfigMultiStateMap.get(serialNumber);
        if (!multiStateActions) {
            return;
        }
        const currentKeyState = multiStateActions.get(keyCode);
        if (currentKeyState === undefined) {
            return;
        }

        multiStateActions.set(keyCode, state);
        deviceConfigMultiStateMap.set(serialNumber, multiStateActions);
    } else if (keyConfigActions.length < state + 1) {
        return;
    }

    if (
        sendDataToDevice(serialNumber, {
            type: 'setState',
            keyCode: keyCode,
            state: state,
        })
    ) {
        return;
    }
    console.log('DeviceControlManager: notifyDeviceShowAlert failed to send showAlert to device.');
}

function sendInvalidResourceInfo(deviceManager, serialNumber, resourceId) {
    const invalidConfigResourceInfo = appManager.resourcesManager.getResourceInfo('0-53');
    const filePath = appManager.resourcesManager
        .getRelatedSrcPath(invalidConfigResourceInfo.path)
        .replace('file://', '');
    sendDataToDevice(serialNumber, {
        type: 'resource',
        resourceId: resourceId,
        name: invalidConfigResourceInfo.name,
        fileName: invalidConfigResourceInfo.path.substring(
            invalidConfigResourceInfo.path.lastIndexOf('/') + 1
        ),
        version: -1,
        hasUpdate: 1,
        generateTime: '-1',
    });

    setTimeout(() => {
        const dataArrays = readFileInChunks(filePath, 65500);

        for (let i = 0; i < dataArrays.length; i++) {
            const dataBytes = dataArrays[i];
            const sequenceId = i + 1 === dataArrays.length ? 0 : i + 1;
            console.log(
                'DeviceControlManager: sendInvalidResourceInfo: sending chunk for resourceID: ' +
                    invalidConfigResourceInfo.id +
                    ' idx: ' +
                    sequenceId,
                ' Size: ' + dataBytes.length
            );
            deviceManager.sendResource(serialNumber, Array.from(dataBytes), resourceId, sequenceId);
        }
    }, 500);
}

function sendResourceToDevice(serialNumber, resourceId, version, generateTime) {
    const deviceType = deviceTypeMap.get(serialNumber);

    if (!deviceType) return false;

    let deviceManager = undefined;

    switch (deviceType) {
        case CONNECTION_TYPE_HID:
            deviceManager = HIDDeviceManager;
            console.log('DeviceControlManager: sendResourceToDevice TO HID device.');
            break;
        case CONNECTION_TYPE_WS:
            deviceManager = WSDeviceManager;
            console.log('DeviceControlManager: sendResourceToDevice TO WS device.');
            break;
    }

    if (!deviceManager) return false;

    if (!version) {
        version = 0;
    }

    const resourceInfo = appManager.resourcesManager.getResourceInfo(resourceId);
    if (resourceInfo == null) {
        sendInvalidResourceInfo(deviceManager, serialNumber, resourceId);
        console.log(
            'DeviceControlManager: sendResourceToDevice: could not find valid resource for: ',
            resourceId
        );
        return false;
    }

    const filePath = appManager.resourcesManager
        .getRelatedSrcPath(resourceInfo.path)
        .replace('file://', '');
    if (!fs.existsSync(filePath)) {
        console.log('DeviceControlManager: sendResourceToDevice: file not exist for ', filePath);
        sendInvalidResourceInfo(deviceManager, serialNumber, resourceId);
        return false;
    }

    const finalResourceInfo = {
        type: 'resource',
        resourceId: resourceInfo.id,
        name: resourceInfo.name,
        version: resourceInfo.version,
        fileName: resourceInfo.path.substring(resourceInfo.path.lastIndexOf('/') + 1),
        hasUpdate: 0,
        generateTime:
            resourceInfo.generateTime === undefined ? '-1' : String(resourceInfo.generateTime),
    };

    let filePathInfo = [];
    if (process.platform === 'win32') {
        filePathInfo = finalResourceInfo.fileName.split('\\');
    } else {
        filePathInfo = finalResourceInfo.fileName.split('/');
    }

    if (resourceInfo.path.startsWith('@/')) {
        finalResourceInfo.fileName = 'default_' + filePathInfo[filePathInfo.length - 1];
    } else {
        finalResourceInfo.fileName =
            filePathInfo[filePathInfo.length - 2] + '_' + filePathInfo[filePathInfo.length - 1];
    }

    if (!resourceInfo.generateTime) {
        resourceInfo.generateTime = '';
    }

    console.log(
        'DeviceControlManager: sendDataToDevice: current Version: ' +
            resourceInfo.version +
            ' Report Version: ' +
            version +
            ' VersionSame: ' +
            (resourceInfo.version === version) +
            ' Current generateTime: ' +
            resourceInfo.generateTime +
            ' ReportGenerateTime: ' +
            generateTime +
            ' GenerateTimeSame: ' +
            (String(resourceInfo.generateTime) === String(generateTime))
    );

    if (
        resourceInfo.version === version &&
        String(resourceInfo.generateTime) === String(generateTime)
    ) {
        console.log(
            'DeviceControlManager: sendResourceToDevice: No newer version found for ',
            resourceInfo.name
        );
        sendDataToDevice(serialNumber, finalResourceInfo);
        return false;
    }

    finalResourceInfo.hasUpdate = 1;

    sendDataToDevice(serialNumber, finalResourceInfo);

    setTimeout(() => {
        const dataArrays = readFileInChunks(filePath, 65500);

        for (let i = 0; i < dataArrays.length; i++) {
            const dataBytes = dataArrays[i];
            const sequenceId = i + 1 === dataArrays.length ? 0 : i + 1;
            console.log(
                'DeviceControlManager: sendResourceToDevice: sending chunk for resourceID: ' +
                    resourceInfo.id +
                    ' idx: ' +
                    sequenceId,
                ' Size: ' + dataBytes.length
            );
            deviceManager.sendResource(serialNumber, Array.from(dataBytes), resourceId, sequenceId);
        }
    }, 500);

    return true;
}

function loadAllPluginHandler(isDelete, pluginId) {
    const currentPluginInfo = appManager.storeManager.storeGet('plugin.streamDeck');
    if (!currentPluginInfo || currentPluginInfo.length === 0) {
        pluginHandlerMap.forEach((pluginAdapter, pluginId) => {
            pluginAdapter.destroyPlugin();
        });
        return;
    }

    // First start load all installed plugin handler
    if (pluginId === null) {
        currentPluginInfo.forEach(pluginInfo => {
            if (pluginHandlerMap.has(pluginInfo.pluginId)) {
                return;
            }

            if (!isPluginSupportOnCurrentPlatform(pluginInfo)) {
                return;
            }

            startPlugin(pluginInfo);
        });
        return;
    }

    // Process uninstall plugin handle
    if (isDelete) {
        console.log(
            'DeviceControlManager: loadAllPluginHandler: Delete plugin adapter Id: ' +
                pluginId +
                ' PluginLoaded: ' +
                pluginHandlerMap.has(pluginId)
        );
        if (pluginHandlerMap.has(pluginId)) {
            const pluginAdapter = pluginHandlerMap.get(pluginId);
            pluginAdapter.destroyPlugin();
            pluginHandlerMap.delete(pluginId);
        }
        return;
    }

    // Process install new plugin handle

    console.log(
        'DeviceControlManager: loadAllPluginHandler: Add plugin adapter Id: ' +
            pluginId +
            ' PluginLoaded: ' +
            pluginHandlerMap.has(pluginId)
    );
    if (pluginHandlerMap.has(pluginId)) {
        return;
    }

    const filteredPluginInfo = currentPluginInfo.filter(
        pluginInfo => pluginInfo.pluginId === pluginId
    );
    if (!filteredPluginInfo || filteredPluginInfo.length === 0) return;

    const pluginInfo = filteredPluginInfo[0];

    if (!isPluginSupportOnCurrentPlatform(pluginInfo)) {
        return;
    }

    console.log(
        'DeviceControlManager: loadAllPluginHandler: Add plugin Info: ' + JSON.stringify(pluginInfo)
    );
    startPlugin(pluginInfo);
}

function startPlugin(pluginInfo) {
    if (pluginInfo.manifestInfo.CodePath) {
        if (pluginInfo.manifestInfo.CodePath.endsWith('.html')) {
            pluginHandlerMap.set(
                pluginInfo.pluginId,
                new PluginAdapter(appManager, PLUGIN_TYPE.WEB_PROCESS, pluginInfo)
            );
        } else {
            pluginHandlerMap.set(
                pluginInfo.pluginId,
                new PluginAdapter(appManager, PLUGIN_TYPE.NATIVE_PROCESS, pluginInfo)
            );
        }
    } else if (pluginInfo.manifestInfo.CodePathWin || pluginInfo.manifestInfo.CodePathMac) {
        if (process.platform === 'win32') {
            pluginInfo.manifestInfo.CodePath = pluginInfo.manifestInfo.CodePathWin;
        } else {
            pluginInfo.manifestInfo.CodePath = pluginInfo.manifestInfo.CodePathMac;
        }
        pluginHandlerMap.set(
            pluginInfo.pluginId,
            new PluginAdapter(appManager, PLUGIN_TYPE.NATIVE_PROCESS, pluginInfo)
        );
    }
}

function isPluginSupportOnCurrentPlatform(pluginInfo) {
    let supportCurrentOS = false;
    if (process.platform === 'win32') {
        pluginInfo.manifestInfo.OS.forEach(osInfo => {
            if (supportCurrentOS) return false;
            if (osInfo.Platform === 'windows') {
                supportCurrentOS = true;
            }
        });
    } else if (process.platform === 'darwin') {
        pluginInfo.manifestInfo.OS.forEach(osInfo => {
            if (supportCurrentOS) return false;
            if (osInfo.Platform === 'mac') {
                supportCurrentOS = true;
            }
        });
    } else {
        return false;
    }

    if (!supportCurrentOS) {
        console.log(
            'DeviceControlManager: isPluginSupportOnCurrentPlatform: Plugin: ',
            pluginInfo.pluginName,
            ' Not support on current platform: ',
            process.platform
        );
        return false;
    }
    return true;
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export default DeviceControlManager;
