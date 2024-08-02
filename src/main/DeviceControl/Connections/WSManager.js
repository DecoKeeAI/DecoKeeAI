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
import { checkDataValid, wrapData } from "@/main/DeviceControl/Connections/ProtocolUtil";
import { parse } from 'url';

import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const WSActiveDeviceMap = new Map();
const connectionListeners = new Map();
const dataListeners = new Map();

export default class {
    constructor() {
        this.server = createServer();
        this.wss = new WebSocketServer({ noServer: true });

        const that = this;

        this.wss.on('connection', function connection(ws, req, serialNumber) {
            console.log('WS client %s connected', serialNumber);

            WSActiveDeviceMap.set(serialNumber, ws);

            ws.isAlive = true;
            ws.on('error', console.error);
            ws.on('pong', () => {
                console.log('Received pong from %s', serialNumber);
                ws.isAlive = true;
            });

            ws.on('message', function(message) {
                if (message instanceof Buffer) {
                    // console.log('WS Received: binary data from %s data ', serialNumber, message);
                    const receivedData = checkDataValid(message);
                    if (receivedData === null) return;
                    console.log('WS Received: binary data from %s receivedData: %s', serialNumber, JSON.stringify(receivedData));
                    // console.log('HID received data from device: ', serialNumber, ' Data: ', data);
                    if (dataListeners.size > 0) {
                        dataListeners.forEach((listener, tag) => {
                            listener(serialNumber, receivedData);
                        });
                    }
                } else {
                    console.log('WS Received: text %s from %s', message, serialNumber);
                }
            });

            ws.on('close', () => {
                console.log('WS client %s disconnected: ', serialNumber);

                WSActiveDeviceMap.delete(serialNumber);
                if (connectionListeners.size > 0) {
                    connectionListeners.forEach((listener, tag) => {
                        listener({serialNumber: serialNumber, connected: false });
                    });
                }
            });

            if (connectionListeners) {
                connectionListeners.forEach((listener, tag) => {
                    listener({serialNumber: serialNumber, connected: true });
                });
            }
        });

        this.server.on('upgrade', function upgrade(request, socket, head) {
            socket.on('error', onSocketError);

            authenticate(request, function next(err, client) {
                console.log('authenticate next: ', err, client);
                if (err || !client) {
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }

                socket.removeListener('error', onSocketError);

                that.wss.handleUpgrade(request, socket, head, function done(ws) {
                    that.wss.emit('connection', ws, request, client);
                });
            });
        });

        this.server.listen(20230);


        this.pingActionTask = setInterval(function ping() {
            that.wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false) return ws.terminate();

                console.log('Sending ping to client');
                ws.isAlive = false;
                ws.ping();
            });
        }, 60000);
    }

    sendData(serialNumber, dataObj) {
        if (!serialNumber || !WSActiveDeviceMap.get(serialNumber)) return false;

        try {
            const sendDataStr = JSON.stringify(dataObj);
            console.log("WS SendData:", sendDataStr);
            const sendoutData = new Buffer.from(wrapData(0xA1, sendDataStr, 0, 0, 0));
            WSActiveDeviceMap.get(serialNumber).send(sendoutData);
            // console.log("WS SendData sent size: ", sendDataStr.length + ' sendoutData: ', sendoutData);
            console.log("WS SendData sent size: ", sendDataStr.length);
            return true;
        } catch (err) {
            // console.log('HID SendData detected error on send msg', err);
        }

        return false;
    }

    sendResource(serialNumber, resourceBytes, opCode, resourceId, sequenceId) {
        if (!serialNumber || !WSActiveDeviceMap.get(serialNumber)) return;
        try {
            const sendoutData = new Buffer.from(wrapData(0xA2, resourceBytes, opCode, resourceId, sequenceId));
            WSActiveDeviceMap.get(serialNumber).send(sendoutData);
            // console.log("WS sendResource sent size: ", resourceBytes.length + ' sendoutData: ' + sendoutData.toString());
            // console.log("WS sendResource sent size: ", resourceBytes.length);
        } catch (err) {
            console.log('WS sendResource detected error on send resource info.', err);
        }
    }

    registerDeviceDataListener(tag, listener) {
        if (!listener) {
            throw new Error('Missing listener');
        }
        dataListeners.set(tag, listener);
    }

    unRegisterDeviceDataListener(tag) {
        if (dataListeners.size === 0) {
            return;
        }
        dataListeners.delete(tag);
    }

    registerDeviceConnectionListener(tag, listener) {
        console.log('WS registerDeviceConnectionListener: ');
        if (!listener) {
            throw new Error('Missing listener');
        }
        connectionListeners.set(tag, listener);

        if (WSActiveDeviceMap.size === 0) {
            return;
        }

        for (let serialNumber of WSActiveDeviceMap.keys()) {
            listener(serialNumber, true);
        }
    }

    unRegisterDeviceConnectionListener(tag) {
        if (!connectionListeners) {
            return;
        }
        connectionListeners.delete(tag);
    }

    getDeviceConnectionState(serialNumber) {
        if (WSActiveDeviceMap.size === 0) return false;

        return WSActiveDeviceMap.get(serialNumber) !== undefined && WSActiveDeviceMap.get(serialNumber).isAlive;
    }

    destroy() {
        console.log('WSManager: destroy');
        clearInterval(this.pingActionTask);
        if (this.wss) {
            this.wss.close((e) => {
                console.log('WSManager: WSServer stopped. ', e);
                this.wss = undefined;
            });
        }

        if (this.server) {
            this.server.close((e) => {
                console.log('WSManager: Server stopped. ', e);
                this.server = undefined;
            });
        }
    }
}

function authenticate(request, callback) {
    const params = parse(request.url).query;
    console.log('WS server authenticate: url: %s params: ', request.url, params);
    if (!params) {
        callback('Token Invalid', undefined);
        return;
    }
    const queryParams = new URLSearchParams(params);
    const deviceSN = queryParams.get('sn');
    console.log('WS server authenticate: deviceSN: ', deviceSN);

    if (!deviceSN || deviceSN === '') {
        callback('Token Invalid', undefined);
        return;
    }
    callback(null, deviceSN.trim());
}

function onSocketError(err) {
    console.error('WSManger: onSocketError: ', err);
}
