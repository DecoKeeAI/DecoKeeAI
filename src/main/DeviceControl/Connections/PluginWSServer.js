import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { ipcMain } from 'electron';
import Constants from '@/utils/Constants';
import {checkPortRange} from "@/utils/Utils";
import {PROTOCOL_RAW_RES_TYPE} from "@/main/DeviceControl/Connections/ProtocolUtil";

const {shell} = require('electron');
const textDecoder = new TextDecoder();
const path = require('path');
const fs = require('fs');

let pluginWSClientList = [];
let storeManager = undefined;
let appManager = undefined;
let deviceControlManager = undefined;

const ENABLE_LOG = false;

const CONTEXT_ID = {
    RESOURCE_ID: 0,
    PLUGIN_UUID: 1,
    ACTION_UUID: 2,
    KEY_CODE: 3,
    MULTI_ACTION_IDX: 4,
    DEVICE_SN: 5
}

export default class {
    constructor(globalAppManager, pluginDeviceControlManager) {
        storeManager = globalAppManager.storeManager;
        appManager = globalAppManager;
        deviceControlManager = pluginDeviceControlManager;
        this.server = createServer();
        this.wss = new WebSocketServer({noServer: true});

        this.wss.on('connection', function connection(ws, req, socketKey) {
            if (ENABLE_LOG) console.log('PluginWSServer: client connected socketKey: ', socketKey);

            ws.isAlive = true;
            ws.on('error', console.error);
            ws.on('pong', () => {
                // if (ENABLE_LOG) console.log('PluginWSServer: Received pong from');
                ws.isAlive = true;
            });

            ws.on('message', function (message) {
                const decodedData = textDecoder.decode(message);
                const msgData = JSON.parse(decodedData);

                try {
                    handlePluginEvent(socketKey, ws, msgData);
                } catch (err) {
                    console.log('PluginWSServer: handlePluginEvent detected error for socketKey: ', socketKey, ' Error: ', err)
                }
            });

            ws.on('close', (code, reason) => {
                if (ENABLE_LOG) console.log('PluginWSServer: client disconnected: code: ', code, ' reason: ', textDecoder.decode(reason));
                const closedWSClientInfo = pluginWSClientList.filter(pluginWSInfo => pluginWSInfo.socketKey === socketKey);

                if (closedWSClientInfo && closedWSClientInfo.length > 0) {
                    closedWSClientInfo.forEach(wsClientInfo => {
                        if (wsClientInfo.isPluginHandler) {
                            return;
                        }
                        processPropertyInspectorVisibilityChanged(wsClientInfo.pluginContext, false);
                    });
                }

                pluginWSClientList = pluginWSClientList.filter(pluginWSInfo => pluginWSInfo.socketKey !== socketKey);
            });
        });
        const that = this;

        this.server.on('upgrade', function upgrade(request, socket, head) {
            socket.on('error', onSocketError);

            that.wss.handleUpgrade(request, socket, head, function done(ws) {
                socket.removeListener('error', onSocketError);
                that.wss.emit('connection', ws, request, request.headers['sec-websocket-key']);
            });
        });


        checkPortRange(20240, 20260).then(results => {
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.taken) {
                    continue;
                }

                that.server.listen(result.port);
                console.log('PluginWSServer: client ws server listen on: ' + result.port);

                storeManager.storeSet('serverPorts.pluginWSServerPort', result.port);

                return;
            }
        }).catch(error => {
            console.error('Error checking ports:', error);
        });

        this.pingActionTask = setInterval(function ping() {
            that.wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false) {
                    if (ENABLE_LOG) console.log('Client Ping Timeout. Kick out client')
                    return ws.terminate();
                }

                // if (ENABLE_LOG) console.log('PluginWSServer: Sending ping to client');
                ws.isAlive = false;
                ws.ping();
            });
        }, 60000);

        ipcMain.on('PluginVisibilityChanged', (event, args) => {
            if (ENABLE_LOG) console.log('PluginWSServer: received PluginVisibilityChanged: ', args);
            this.notifyPluginVisibilityChange(args.activeProfileId, args.pluginId, args.action, args.keyCode, args.visible, args.isInMultiAction, args.multiActionIndex);

            setTimeout(() => {
                processPropertyInspectorVisibilityChanged((args.activeProfileId + ':' + args.pluginId + ':' + args.action + ':' + args.keyCode + ':' + args.multiActionIndex), args.visible);
            }, 300);
        });

        ipcMain.on('TitleChanged', (event, args) => {
            if (ENABLE_LOG) console.log('PluginWSServer: received TitleChanged: ', args);
            this.notifyTitleChanged(args.activeProfileId, args.pluginId, args.action, args.keyCode, args.titleData, args.multiActionIndex);
        })
    }

    notifyDeviceConnect(serialNumber, rowCount, colCount) {
        if (pluginWSClientList.length === 0) return;
        const callbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.isPluginHandler);

        if (!callbackClients || callbackClients.length === 0) return;

        callbackClients.forEach(callbackInfo => {
            sendMsgToDevice(callbackInfo.wsClient, JSON.stringify({
                event: 'deviceDidConnect',
                device: serialNumber,
                deviceInfo: {
                    name: '',
                    type: 0,
                    size: {
                        rows: rowCount,
                        columns: colCount
                    }
                },
            }));
        })
    }

    notifyDeviceDisconnect(serialNumber) {
        if (pluginWSClientList.length === 0) return;
        const callbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.isPluginHandler);

        if (!callbackClients || callbackClients.length === 0) return;

        callbackClients.forEach(callbackInfo => {
            sendMsgToDevice(callbackInfo.wsClient, JSON.stringify({
                event: 'deviceDidDisconnect',
                device: serialNumber
            }));
        });
    }

    notifyPluginVisibilityChange(activeProfileId, pluginId, action, keyCode, visible, isInMultiAction = false, multiActionIndex = 0, serialNumber = undefined) {
        if (pluginWSClientList.length === 0) return;
        const callbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === pluginId || pluginInfo.pluginContext === (activeProfileId + ':' +pluginId + ':' + action + ':' + keyCode + ':' + multiActionIndex));
        if (!callbackClients || callbackClients.length === 0) return;
        const coordinatesInfo = keyCode.split(',');

        callbackClients.forEach(callbackInfo => {
            let settingPluginId = callbackInfo.pluginContext;
            if (!callbackInfo.pluginContext.includes(':')) {
                settingPluginId = callbackInfo.pluginContext + ':' + action + ':' + keyCode + ':' + multiActionIndex;
            }
            if (!settingPluginId.startsWith(activeProfileId + ':')) {
                settingPluginId = activeProfileId + ':' + settingPluginId;
            }
            const pluginSettings = appManager.resourcesManager.getPluginSettings(activeProfileId, keyCode, multiActionIndex);

            const appearConfigMsg = {
                event: visible ? 'willAppear' : 'willDisappear',
                action: action,
                context: settingPluginId,
                payload: {
                    settings: {},
                    coordinates: {
                        column: coordinatesInfo[1],
                        row: coordinatesInfo[0]
                    },
                    controller: 'Keypad',
                    state: 0,
                    isInMultiAction: isInMultiAction,
                }
            };

            if (pluginSettings) {
                appearConfigMsg.payload.settings = pluginSettings;
            }
            if (serialNumber) {
                appearConfigMsg.device = serialNumber;
                appearConfigMsg.context += ':' + serialNumber;
            }

            sendMsgToDevice(callbackInfo.wsClient, JSON.stringify(appearConfigMsg));
        });
    }

    notifyTitleChanged(activeProfileId, pluginId, action, keyCode, titleData, multiActionIndex = 0, serialNumber = undefined) {
        if (pluginWSClientList.length === 0) return;
        const callbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === pluginId || pluginInfo.pluginContext === (activeProfileId + ':' + pluginId + ':' + action + ':' + keyCode + ':' + multiActionIndex));
        if (!callbackClients || callbackClients.length === 0) return;
        const coordinatesInfo = keyCode.split(',');

        callbackClients.forEach(callbackInfo => {
            let settingPluginId = callbackInfo.pluginContext;
            if (!callbackInfo.pluginContext.includes(':')) {
                settingPluginId = callbackInfo.pluginContext + ':' + action + ':' + keyCode + ':' + multiActionIndex;
            }
            if (!settingPluginId.startsWith(activeProfileId + ':')) {
                settingPluginId = activeProfileId + ':' + settingPluginId;
            }

            const pluginSettings = appManager.resourcesManager.getPluginSettings(activeProfileId, keyCode, multiActionIndex);

            const appearConfigMsg = {
                event: 'titleParametersDidChange',
                action: action,
                context: settingPluginId,
                payload: {
                    settings: {},
                    coordinates: {
                        column: coordinatesInfo[1],
                        row: coordinatesInfo[0]
                    },
                    state: 0,
                    title: titleData.text,
                    titleParameters: {
                        fontFamily: 'sans-serif',
                        fontSize: titleData.size,
                        fontUnderline: titleData.style.includes('underline'),
                        showTitle: titleData.display,
                        titleAlignment: 'bottom',
                        titleColor: titleData.color
                    }
                }
            };

            switch (titleData.pos) {
                case 'top':
                    appearConfigMsg.payload.titleParameters.titleAlignment = 'top'
                    break;
                case 'mid':
                    appearConfigMsg.payload.titleParameters.titleAlignment = 'middle'
                    break;
                default:
                case 'bot':
                    appearConfigMsg.payload.titleParameters.titleAlignment = 'bottom'
                    break;
            }

            if (pluginSettings) {
                appearConfigMsg.payload.settings = pluginSettings;
            }
            if (serialNumber) {
                appearConfigMsg.device = serialNumber;
                appearConfigMsg.context += ':' + serialNumber;
            }

            sendMsgToDevice(callbackInfo.wsClient, JSON.stringify(appearConfigMsg));
        });
    }

    notifyKeyAction(serialNumber, activeProfileId, pluginId, keyAction, pluginAction, keyCode, configState, isInMultiAction = false, multiActionIndex = 0) {
        if (pluginWSClientList.length === 0) return;
        const callbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === pluginId || pluginInfo.pluginContext === (activeProfileId + ':' + pluginId + ':' + pluginAction + ':' + keyCode + ':' + multiActionIndex));
        if (!callbackClients || callbackClients.length === 0) return;
        const coordinatesInfo = keyCode.split(',');

        callbackClients.forEach(callbackInfo => {
            let settingPluginId = callbackInfo.pluginContext;
            if (!settingPluginId.includes(':')) {
                settingPluginId = callbackInfo.pluginContext + ':' + pluginAction + ':' + keyCode + ':' + multiActionIndex;
            }

            if (!settingPluginId.startsWith(activeProfileId + ':')) {
                settingPluginId = activeProfileId + ':' + settingPluginId;
            }

            const pluginSettings = appManager.resourcesManager.getPluginSettings(activeProfileId, keyCode, multiActionIndex);

            const keyActionMsg = {
                event: keyAction === 0 ? 'keyDown' : 'keyUp',
                action: pluginAction,
                context: settingPluginId,
                payload: {
                    settings: {},
                    coordinates: {
                        column: coordinatesInfo[1],
                        row: coordinatesInfo[0]
                    },
                    state: configState,
                    isInMultiAction: isInMultiAction,
                }
            };

            if (configState !== undefined) {
                keyActionMsg.payload.state = configState;
            }

            if (isInMultiAction) {
                keyActionMsg.payload.userDesiredState = 0;
            }

            if (pluginSettings) {
                keyActionMsg.payload.settings = pluginSettings;
            }
            if (serialNumber) {
                keyActionMsg.device = serialNumber;
                keyActionMsg.context += ':' + serialNumber;
            }

            sendMsgToDevice(callbackInfo.wsClient, JSON.stringify(keyActionMsg));
        })
    }

    destroy() {
        return new Promise((resolve) => {
            let needFinishedCount = 2;

            if (ENABLE_LOG) console.log('PluginWSServer: destroy');
            clearInterval(this.pingActionTask);
            if (this.wss) {
                this.wss.removeAllListeners();
                this.wss.close((e) => {
                    if (ENABLE_LOG) console.log('PluginWSServer: WSS stopped. ', e);
                    this.wss = undefined;
                    needFinishedCount -= 1;
                    if (needFinishedCount <= 0) {
                        resolve();
                    }
                });
            } else {
                needFinishedCount -= 1;
            }

            if (this.server) {
                this.server.removeAllListeners();
                this.server.close((e) => {
                    if (ENABLE_LOG) console.log('PluginWSServer: Server stopped. ', e);
                    this.server = undefined;
                    needFinishedCount -= 1;
                    if (needFinishedCount <= 0) {
                        resolve();
                    }
                });
            } else {
                needFinishedCount -= 1;
            }

            if (needFinishedCount <= 0) {
                resolve();
            }
        });
    }

}


function handlePluginEvent(socketKey, wsClient, msgData) {
    const fullWSClientInfo = pluginWSClientList.filter(pluginWSInfo => pluginWSInfo.socketKey === socketKey);
    if (ENABLE_LOG) console.log('PluginWSServer: _handlePluginEvent From: ' + ((fullWSClientInfo[0] && fullWSClientInfo[0].pluginContext) ? fullWSClientInfo[0].pluginContext : 'not registered'), ' event type: ', msgData.event + ' msgData: ', msgData);

    switch (msgData.event) {
        case 'setSettings':
            processSetSettings(msgData.context, msgData.payload);
            break;
        case 'getSettings':
            processGetSettings(msgData.context, msgData.payload);
            break;
        case 'setGlobalSettings':
            processSetGlobalSettings(msgData.context, msgData.payload);
            break;
        case 'getGlobalSettings':
            processGetGlobalSettings(wsClient, msgData.context);
            break;
        case 'openUrl':
            processOpenUrl(msgData.payload.url);
            break;
        case 'logMessage':
            processLogMessage(socketKey, msgData.payload.message);
            break;
        case 'setTitle':
            processSetTitle(msgData.context, msgData.payload.title, msgData.payload.state);
            break;
        case 'setImage':
            processSetImage(msgData.context, msgData.payload.image, msgData.payload.state);
            break;
        case 'setFeedback':
            break;
        case 'showAlert':
            processShowAlert(msgData.context);
            break;
        case 'showOk':
            processShowOK(msgData.context);
            break;
        case 'setState':
            processSetState(msgData.context, msgData.payload.state);
            break;
        case 'switchToProfile':
            break;
        case 'sendToPropertyInspector':
            processSendToPropertyInspector(msgData.context, msgData.action, msgData.payload);
            break;
        case 'sendToPlugin':
            processSendToPlugin(msgData.context, msgData.action, msgData.payload);
            break;
        case 'registerPropertyInspector':
            pluginWSClientList.push({
                socketKey: socketKey,
                pluginContext: msgData.uuid,
                wsClient: wsClient,
                isPluginHandler: false
            });
            break;
        case 'registerPluginHandler':
            pluginWSClientList.push({
                socketKey: socketKey,
                pluginContext: msgData.uuid,
                wsClient: wsClient,
                isPluginHandler: true
            });
            break;
    }
}


function processSetGlobalSettings(context, settings) {

    let pluginContextId = context;

    let globalSettingChangeCallbackClients;
    // Change on property inspector, send callback to plugin handler
    if (context.includes(':')) {
        if (ENABLE_LOG) console.log('PluginWSServer: _processSetSettings: Change Global Settings on PluginInspector: ' + context + ' Settings: ' + JSON.stringify(settings));

        const contextInfos = context.split(':');

        pluginContextId = contextInfos[CONTEXT_ID.PLUGIN_UUID];

        globalSettingChangeCallbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === pluginContextId);
    } else { // Change in plugin handler, send to all property inspector
        if (ENABLE_LOG) console.log('PluginWSServer: _processSetSettings: Change Global Settings on PluginHandler: ' + context + ' Settings: ' + JSON.stringify(settings));
        globalSettingChangeCallbackClients = pluginWSClientList.filter(pluginInfo => !pluginInfo.isPluginHandler && pluginInfo.pluginContext.includes(context + ':'));
    }

    storeManager.pluginStoreSet(pluginContextId + '.globalSettings', settings);

    if (!globalSettingChangeCallbackClients || globalSettingChangeCallbackClients.length === 0) return;

    globalSettingChangeCallbackClients.forEach(pluginInfo => {
        if (ENABLE_LOG) console.log('PluginWSServer: _processSetGlobalSettings: Global settings changed, sending changes to: ' + pluginInfo.pluginContext);
        sendGlobalSettingInfoToClient(pluginInfo.wsClient, settings);
    })

}

function processGetGlobalSettings(wsClient, context) {

    let pluginContextId = context;
    if (context.includes(':')) {
        const contextInfos = context.split(':');
        pluginContextId = contextInfos[CONTEXT_ID.PLUGIN_UUID];
    }

    const pluginGlobalSettings = storeManager.pluginStoreGet(pluginContextId + '.globalSettings');

    sendGlobalSettingInfoToClient(wsClient, pluginGlobalSettings);
}

function processSetSettings(context, settings) {

    // Change on property inspector, send callback to plugin handler
    if (context.includes(':')) {
        if (ENABLE_LOG) console.log('PluginWSServer: _processSetSettings: Change settings on PluginInspector: ' + context + ' Settings: ' + JSON.stringify(settings));
        const contextInfos = context.split(':');

        const pluginId = contextInfos[CONTEXT_ID.PLUGIN_UUID];
        const actionName = contextInfos[CONTEXT_ID.ACTION_UUID];
        const coordinatesInfo = contextInfos[CONTEXT_ID.KEY_CODE].split(',');

        appManager.resourcesManager.setPluginSettings(contextInfos[CONTEXT_ID.RESOURCE_ID], contextInfos[CONTEXT_ID.KEY_CODE], Number.parseInt(contextInfos[CONTEXT_ID.MULTI_ACTION_IDX]), settings);

        setTimeout(() => {
            const resourceInfo = this.getResourceInfo(contextInfos[CONTEXT_ID.RESOURCE_ID]);

            appManager.windowManager.mainWindow.win.webContents.send('ProfileConfigChanged', {
                resourceId: contextInfos[CONTEXT_ID.RESOURCE_ID],
                configIdx: resourceInfo.name
            });
        }, 500);

        const pluginHandlerInfo = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === pluginId);

        if (!pluginHandlerInfo || pluginHandlerInfo.length === 0) return;

        const deviceSNList = deviceControlManager.getDeviceSNsWithPluginKeyAction(contextInfos[CONTEXT_ID.RESOURCE_ID], contextInfos[CONTEXT_ID.PLUGIN_UUID], contextInfos[CONTEXT_ID.ACTION_UUID], contextInfos[CONTEXT_ID.KEY_CODE], Number.parseInt(contextInfos[CONTEXT_ID.MULTI_ACTION_IDX]));

        if (deviceSNList.length === 0) return;

        appManager.deviceControlManager.reloadDeviceConfigProfile(deviceSNList, contextInfos[CONTEXT_ID.RESOURCE_ID]);

        const contextPrefix = `${contextInfos[CONTEXT_ID.RESOURCE_ID]}:${contextInfos[CONTEXT_ID.PLUGIN_UUID]}:${contextInfos[CONTEXT_ID.ACTION_UUID]}:${contextInfos[CONTEXT_ID.KEY_CODE]}:${contextInfos[CONTEXT_ID.MULTI_ACTION_IDX]}`;

        if (ENABLE_LOG) console.log('PluginWSServer: _processSetSettings: Change settings on PluginInspector, sending changes to plugin handler: ' + pluginId);
        deviceSNList.forEach(deviceSN => {
            sendSettingInfoToClient(pluginHandlerInfo[0].wsClient, actionName, contextPrefix + ':' + deviceSN, settings, coordinatesInfo, false);
        });

        return;
    }
    if (ENABLE_LOG) console.log('PluginWSServer: _processSetSettings: Change settings on PluginHandler: ' + context + ' Settings: ' + JSON.stringify(settings));

    // Change in plugin handler, send to all property inspector
    const pluginHandlerInfo = pluginWSClientList.filter(pluginInfo => !pluginInfo.isPluginHandler && pluginInfo.pluginContext.includes(context + ':'));

    if (!pluginHandlerInfo || pluginHandlerInfo.length === 0) return;

    pluginHandlerInfo.forEach(pluginPropertyClient => {
        if (ENABLE_LOG) console.log('PluginWSServer: _processSetSettings: Change settings on PluginHandler, sending changes to plugin Inspector: ' + pluginPropertyClient.pluginContext);
        const contextInfos = pluginPropertyClient.pluginContext.split(':');
        sendSettingInfoToClient(pluginHandlerInfo[0].wsClient, contextInfos[CONTEXT_ID.ACTION_UUID], pluginPropertyClient.pluginContext, settings, contextInfos[CONTEXT_ID.KEY_CODE].split(','), false);
    });
}

function processGetSettings(wsClient, context) {
    let actionName = context;
    let coordinatesInfo = undefined;
    let pluginSettings = {};
    if (context.includes(':')) {
        const contextInfos = context.split(':');

        actionName = contextInfos[CONTEXT_ID.ACTION_UUID];
        coordinatesInfo = contextInfos[CONTEXT_ID.KEY_CODE].split(',');

        pluginSettings = appManager.resourcesManager.getPluginSettings(contextInfos[CONTEXT_ID.RESOURCE_ID], contextInfos[CONTEXT_ID.KEY_CODE], Number.parseInt(contextInfos[CONTEXT_ID.MULTI_ACTION_IDX]));
    }

    sendSettingInfoToClient(wsClient, actionName, context, pluginSettings, coordinatesInfo, false);
}

function processSendToPropertyInspector(context, action, payload) {
    // Change on property inspector, ignore
    if (context.includes(':')) {
        return;
    }

    // Change in plugin handler, send to all property inspector
    if (ENABLE_LOG) console.log('PluginWSServer: processSendToPropertyInspector: PluginHandler "' + context + '" need send to PropertyInspector for Action: ' + action + ' payload: ' + JSON.stringify(payload));
    let CallbackClients
    if (action) {
        CallbackClients = pluginWSClientList.filter(pluginInfo => !pluginInfo.isPluginHandler && pluginInfo.pluginContext.includes(context + ':' + action + ':'));
    } else {
        CallbackClients = pluginWSClientList.filter(pluginInfo => !pluginInfo.isPluginHandler && pluginInfo.pluginContext.includes(context + ':'));
    }
    if (!CallbackClients || CallbackClients.length === 0) return;

    CallbackClients.forEach(callbackInfo => {
        sendMsgToDevice(callbackInfo.wsClient, JSON.stringify({
            event: 'sendToPropertyInspector',
            acton: action,
            context: callbackInfo.pluginContext,
            payload: payload
        }));
    })
}

function processSendToPlugin(context, action, payload) {
    // Change on property handler, ignore
    if (!context.includes(':')) {
        return;
    }

    const contextInfos = context.split(':');

    // Change in property inspector, send to plugin handler
    if (ENABLE_LOG) console.log('PluginWSServer: processSendToPlugin: PropertyInspector "' + context + '" need send to PluginHandler payload: ' + JSON.stringify(payload));
    const CallbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === contextInfos[CONTEXT_ID.PLUGIN_UUID]);
    if (!CallbackClients || CallbackClients.length === 0) return;

    CallbackClients.forEach(callbackInfo => {
        sendMsgToDevice(callbackInfo.wsClient, JSON.stringify({
            event: 'sentToPlugin',
            acton: action,
            context: callbackInfo.pluginContext,
            payload: payload
        }));
    });
}

function processPropertyInspectorVisibilityChanged(context, visible) {
    // Change on property handler, ignore
    if (!context.includes(':')) {
        return;
    }

    const contextInfos = context.split(':');

    const CallbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.pluginContext === contextInfos[CONTEXT_ID.PLUGIN_UUID]);
    if (!CallbackClients || CallbackClients.length === 0) return;

    CallbackClients.forEach(callbackInfo => {
        sendMsgToDevice(callbackInfo.wsClient, JSON.stringify({
            event: (visible ? 'propertyInspectorDidAppear' : 'propertyInspectorDidDisappear'),
            acton: contextInfos[CONTEXT_ID.ACTION_UUID],
            context: callbackInfo.pluginContext
        }));
    });
}

function processOpenUrl(url) {
    shell.openExternal(url);
}

function processLogMessage(socketKey, message) {
    const CallbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.socketKey === socketKey);
    if (!CallbackClients || CallbackClients.length === 0) return;

    if (ENABLE_LOG) console.log('PluginWSServer: processLogMessage: Client: [' + CallbackClients[0].pluginContext + '] Message: ' + message);
}

function processSetTitle(context, title, state) {
    // Change on property handler, ignore
    if (!context.includes(':')) {
        return;
    }
    const contextInfos = context.split(':');
    if (contextInfos.length < 6) return;

    const resourceId = contextInfos[CONTEXT_ID.RESOURCE_ID];
    const keyCode = contextInfos[CONTEXT_ID.KEY_CODE];
    const deviceSN = contextInfos[CONTEXT_ID.DEVICE_SN];

    sendMessageToMainWindow('ChangeTitle', {
        keyCode: keyCode,
        title: title,
        state: state,
        resourceId: resourceId
    });

    const deviceConfigProfileInfo = deviceControlManager.getDeviceActiveProfile(deviceSN);
    if (!deviceConfigProfileInfo) return;

    if (resourceId !== deviceConfigProfileInfo.resourceId) return;

    const deviceConfigInfo = deviceConfigProfileInfo.configInfo;

    let keyConfigIdx = -1;
    for (let i = 0; i < deviceConfigInfo.length; i++) {
        if (deviceConfigInfo[i].keyCode === keyCode) {
            keyConfigIdx = i;
            break;
        }
    }

    if (keyConfigIdx === -1) return;

    const activeKeyConfig = deviceConfigInfo[keyConfigIdx];
    if (!activeKeyConfig.isPlugin) return;

    const pluginActionInfo = activeKeyConfig.config.actions[0].value;
    const pluginActionDetail = JSON.parse(pluginActionInfo);

    if (state > (pluginActionDetail.States.length - 1)) {
        state = 0;
    }

    if (state === 1) {
        activeKeyConfig.config.alterTitle.text = title;
    } else {
        activeKeyConfig.config.title.text = title;
    }

    deviceConfigInfo[keyConfigIdx] = activeKeyConfig;

    appManager.resourcesManager.updateConfigInfo(deviceConfigProfileInfo.resourceId, deviceConfigInfo);

    deviceControlManager.sendProfileChangeRequest(deviceSN, deviceConfigProfileInfo.resourceId);

}

async function processSetImage(context, imageBase64, state) {
    // Change on property handler, ignore
    if (!context.includes(':')) {
        return;
    }

    const contextInfos = context.split(':');

    if (contextInfos.length < 6) return;

    const resourceId = contextInfos[CONTEXT_ID.RESOURCE_ID];
    const keyCode = contextInfos[CONTEXT_ID.KEY_CODE];
    const deviceSN = contextInfos[CONTEXT_ID.DEVICE_SN];
    const multiActionIdx = contextInfos[CONTEXT_ID.MULTI_ACTION_IDX];

    try {
        if (Number(multiActionIdx) !== 0) {
            return;
        }
    } catch (err) {
        console.log('PluginWSServer: processSetImage Detect error: ', err);
    }

    const deviceConfigProfileInfo = deviceControlManager.getDeviceActiveProfile(deviceSN);
    if (!deviceConfigProfileInfo) return;

    if (resourceId !== deviceConfigProfileInfo.resourceId) return;

    const deviceConfigInfo = deviceConfigProfileInfo.configInfo;

    let keyConfigIdx = -1;
    for (let i = 0; i < deviceConfigInfo.length; i++) {
        if (deviceConfigInfo[i].keyCode === keyCode) {
            keyConfigIdx = i;
            break;
        }
    }

    if (keyConfigIdx === -1) return;

    const activeKeyConfig = deviceConfigInfo[keyConfigIdx];
    if (!activeKeyConfig.isPlugin) return;

    const pluginActionInfo = activeKeyConfig.config.actions[0].value;
    const pluginActionDetail = JSON.parse(pluginActionInfo);

    if (state > (pluginActionDetail.States.length - 1)) {
        state = 0;
    }
    if (imageBase64 === undefined) {

        if (state === 1) {
            activeKeyConfig.config.alterIcon = activeKeyConfig.config.defaultAlterIcon;
        } else {
            activeKeyConfig.config.icon = activeKeyConfig.config.defaultIcon;
        }

        deviceConfigInfo[keyConfigIdx] = activeKeyConfig;

        appManager.resourcesManager.updateConfigInfo(deviceConfigProfileInfo.resourceId, deviceConfigInfo);
        return;
    }

    const currentPluginsList = appManager.storeManager.storeGet("plugin.streamDeck");
    const pluginDetail = currentPluginsList.filter(pluginInfo => pluginInfo.pluginId === contextInfos[CONTEXT_ID.PLUGIN_UUID]);

    if (!pluginDetail || pluginDetail.length === 0) return;

    try {
        const dataBuffer = await appManager.resourcesManager.base64ToJpegBuffer(imageBase64);

        deviceControlManager.sendRawResourceToDevice(deviceSN, keyCode, PROTOCOL_RAW_RES_TYPE.RES_TYPE_JPEG, dataBuffer.toJSON().data);
    } catch (err) {
        console.log('PluginWSServer: processSetImage Detect error: ', err);
    }
}

function processShowAlert(context) {
    if (!context.includes(':')) {
        return;
    }
    const contextInfos = context.split(':');
    if (contextInfos.length < 6) return;

    deviceControlManager.showDeviceAlert(contextInfos[CONTEXT_ID.DEVICE_SN], Constants.ALERT_TYPE_INVALID, contextInfos[CONTEXT_ID.KEY_CODE]);
}

function processShowOK(context) {
    if (!context.includes(':')) {
        return;
    }
    const contextInfos = context.split(':');
    if (contextInfos.length < 6) return;

    deviceControlManager.showDeviceAlert(contextInfos[CONTEXT_ID.DEVICE_SN], Constants.ALERT_TYPE_CHECKMARK, contextInfos[CONTEXT_ID.KEY_CODE]);
}

function processSetState(context, state) {
    if (!context.includes(':')) {
        return;
    }
    const contextInfos = context.split(':');
    if (contextInfos.length < 6) return;

    deviceControlManager.notifyDeviceConfigStateChange(contextInfos[CONTEXT_ID.DEVICE_SN], contextInfos[CONTEXT_ID.KEY_CODE], state);
}

function sendSettingInfoToClient(wsClient, actionName, context, settings, coordinates, isInMultiAction) {
    const pluginSettingsData = {
        action: actionName,
        event: 'didReceiveSettings',
        context: context,
        payload: {
            settings: settings,
            isInMultiAction: isInMultiAction
        }
    }

    if (coordinates) {
        pluginSettingsData.payload.coordinates = {
            row: coordinates[0],
            column: coordinates[1]
        }
    }

    sendMsgToDevice(wsClient, JSON.stringify(pluginSettingsData));
}

function sendGlobalSettingInfoToClient(wsClient, settings) {
    sendMsgToDevice(wsClient, JSON.stringify({
        event: 'didReceiveGlobalSettings',
        payload: {
            settings: settings
        }
    }));
}

function sendMsgToDevice(wsClient, message) {
    const CallbackClients = pluginWSClientList.filter(pluginInfo => pluginInfo.wsClient === wsClient);

    if (ENABLE_LOG) console.log('PluginWSServer: _sendMsgToDevice: clientContext: ', (CallbackClients && CallbackClients.length > 0 ? CallbackClients[0].pluginContext : 'UNKNOWN'), ' Message: ', message);
    wsClient.send(message);
}

function onSocketError(err) {
    console.error('PluginWSServer: onSocketError: ', err);
}

function sendMessageToMainWindow(channel, args) {
    if (!appManager || !appManager.windowManager || !appManager.windowManager.mainWindow
        || !appManager.windowManager.mainWindow.win || !appManager.windowManager.mainWindow.win.webContents) return;

    appManager.windowManager.mainWindow.win.webContents.send(channel, args);
}
