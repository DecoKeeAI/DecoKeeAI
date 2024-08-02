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
import {checkDataValid, wrapData} from "@/main/DeviceControl/Connections/ProtocolUtil";

// const DEVICE_VID = 6790;
// const DEVICE_PID = 65031;
const DEVICE_VID = 4057;
const DEVICE_PID = 109;

const QMK_DEVICE_VID = 20498;
const QMK_DEVICE_PID = 26647;

const HID = require('node-hid');

let HidActiveDeviceMap = new Map();
let QMKActiveDeviceMap = new Map();

class HIDManager {

    constructor() {
        this.checkDeviceTimer = setInterval(() => {
            this.checkForHidDevices();
        }, 5000);
    }

    getAllDevices() {
        return HID.devices();
    }

    checkForHidDevices() {
        // const devices = HID.devices(DEVICE_VID, DEVICE_PID);
        const devices = HID.devices();
        // console.log('Current Attached Devices: ', devices);

        this._CheckForQMKDevice(devices);

        const deviceInfo = devices.find(
            (device) => device.vendorId === DEVICE_VID && device.productId === DEVICE_PID
        );

        if (!deviceInfo) {
            // console.error('Device not found');
            HidActiveDeviceMap.clear();
            return;
        }
        const serialNumber = deviceInfo.serialNumber;

        if (!serialNumber || serialNumber === '') return;

        if (HidActiveDeviceMap && HidActiveDeviceMap.get(serialNumber)) {
            return;
        }

        try {
            const hidDevice = new HID.HID(deviceInfo.path);

            console.log('Found New DeckKee Device: ', deviceInfo, ' Current Map: ', HidActiveDeviceMap);

            if (this.connectionListeners) {
                this.connectionListeners.forEach((listener, tag) => {
                    listener({serialNumber: serialNumber, connected: true, type: 'HID'});
                });

                if (deviceInfo.manufacturer === 'Elgato') {
                    setTimeout(() => {
                        if (this.dataListeners) {
                            const deviceConfigData = {
                                type: 'reportConfig',
                                keyMatrix: {
                                    row: 3,
                                    col: 5
                                },
                                keyConfig: [],
                                appVersion: '1.1.1'
                            };

                            for (let i = 0; i < 3; i++) {
                                for (let j = 0; j < 5; j++) {
                                    deviceConfigData.keyConfig.push({
                                        keyCode: `${i},${j}`,
                                        keyType: 2
                                    })
                                }
                            }

                            this.dataListeners.forEach((listener, tag) => {
                                listener(serialNumber, deviceConfigData);
                            });
                        }
                    }, 1000);
                }
            }

            hidDevice.on('data', data => {
                const receivedData = checkDataValid(data);
                if (receivedData === null) return;
                // console.log('HID received data from device: ', serialNumber, ' Data: ', data);
                console.log('HID received data from device: ', serialNumber);
                if (this.dataListeners) {
                    this.dataListeners.forEach((listener, tag) => {
                        listener(serialNumber, receivedData);
                    });
                }
            });

            hidDevice.on('error', error => {
                console.log('HID received error on device: ', serialNumber, ' Error: ', error);
                HidActiveDeviceMap.delete(serialNumber);
                if (this.connectionListeners) {
                    this.connectionListeners.forEach((listener, tag) => {
                        listener({serialNumber: serialNumber, connected: false});
                    });
                }
            });

            HidActiveDeviceMap.set(serialNumber, hidDevice);
        } catch (err) {
            console.log('HID Connect device ERROR: ', err);
        }
    }

    sendData(serialNumber, dataObj) {
        if (!serialNumber || !HidActiveDeviceMap.get(serialNumber)) return false;

        try {
            const sendDataStr = JSON.stringify(dataObj);
            console.log("HID SendData:", sendDataStr);
            const rc = HidActiveDeviceMap.get(serialNumber).write(wrapData(0xA1, sendDataStr, 0, 0, 0));
            console.log("HID SendData sent size: ", sendDataStr.length, " actual size:", rc);
            return true;
        } catch (err) {
            // console.log('HID SendData detected error on send msg', err);
        }

        return false;
    }

    sendResource(serialNumber, resourceBytes, opCode, resourceId, sequenceId) {
        if (!serialNumber || !HidActiveDeviceMap.get(serialNumber)) return;
        try {
            const rc = HidActiveDeviceMap.get(serialNumber).write(wrapData(0xA2, resourceBytes, opCode, resourceId, sequenceId));
            console.log("HID sendResource sent size: ", resourceBytes.length, " actual size:", rc);
        } catch (err) {
            console.log('HID sendResource detected error on send resource info.', err);
        }
    }

    registerDeviceDataListener(tag, listener) {
        if (!this.dataListeners) {
            this.dataListeners = new Map();
        }
        if (!listener) {
            throw new Error('Missing listener');
        }
        this.dataListeners.set(tag, listener);
    }

    unRegisterDeviceDataListener(tag) {
        if (!this.dataListeners) {
            return;
        }
        this.dataListeners.delete(tag);
    }

    registerDeviceConnectionListener(tag, listener) {
        if (!this.connectionListeners) {
            this.connectionListeners = new Map();
        }
        if (!listener) {
            throw new Error('Missing listener');
        }
        this.connectionListeners.set(tag, listener);
        if (HidActiveDeviceMap.size === 0) {
            return;
        }

        for (let serialNumber of HidActiveDeviceMap.keys()) {
            listener(serialNumber, true);
        }
    }

    unRegisterDeviceConnectionListener(tag) {
        if (!this.connectionListeners) {
            return;
        }
        this.connectionListeners.delete(tag);
    }

    getDeviceConnectionState(serialNumber) {
        if (HidActiveDeviceMap.size === 0) return false;

        return HidActiveDeviceMap.get(serialNumber) !== undefined;
    }

    _CheckForQMKDevice(devices) {
        const deviceInfo = devices.filter(
            (device) => device.usage === 0x61 && device.usagePage === 0xff60
        );

        if (!deviceInfo || deviceInfo.length === 0) {
            if (this.connectionListeners) {
                for (let serialNumber of QMKActiveDeviceMap.keys()) {
                    this.connectionListeners.forEach((listener, tag) => {
                        listener({serialNumber: serialNumber, connected: false, type: 'QMK'});
                    });
                }
            }
            QMKActiveDeviceMap.clear();
            return;
        }

        // Check for disconnected devices
        const needRemoveDevices = [];
        for (let serialNumber of QMKActiveDeviceMap.keys()) {
            const serialNumberDevice = deviceInfo.find((device) => device.serialNumber === serialNumber);

            if (serialNumberDevice !== undefined) {
                continue;
            }

            needRemoveDevices.push(serialNumber);

            console.log('QMK Device disconnected: ', serialNumber);

            if (this.connectionListeners) {
                this.connectionListeners.forEach((listener, tag) => {
                    listener({serialNumber: serialNumber, connected: false, type: 'QMK'});
                });
            }
        }

        if (needRemoveDevices.length > 0) {
            needRemoveDevices.forEach(serialNumber => {
                QMKActiveDeviceMap.delete(serialNumber);
            })
        }

        // Check for new connected devices
        for (let device of deviceInfo) {
            if (QMKActiveDeviceMap.get(device.serialNumber)) {
                continue;
            }
            QMKActiveDeviceMap.set(device.serialNumber, device);

            console.log('Find new QMK device ', device, ' serialNumber: ', device.serialNumber);

            if (this.connectionListeners) {
                this.connectionListeners.forEach((listener, tag) => {
                    listener({serialNumber: device.serialNumber, connected: true, type: 'QMK'});
                });
            }
        }
    }

    destroy() {
        clearInterval(this.checkDeviceTimer);
    }
}


export default HIDManager;
