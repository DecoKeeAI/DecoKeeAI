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
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function JSONstringifyHex(arr) {
    let str='[';
    for (let i = 0; i < arr.length-1; i++) {
        str += '0x' + arr[i].toString(16)
        if(i<arr.length-2) { str+=','; }
    }
    str += ']';
    return str;
}

export function checkDataValid(dataBytes) {
    try {
        switch (dataBytes[0]) {
            case 0x01:
                for (let i = 0; i < 15; i++) {
                    if (dataBytes[4 + i] === 0x01) {
                        return {
                            type: 'press',
                            keyAction: 0,
                            keyCode: Math.floor((i / 5) + 1) + ',' + ((i % 5) + 1)
                        }
                    }
                }

                return "";
            case 0xA1:
                const dataLength = bytesToInt(dataBytes.slice(1, 3));
                console.log('checkDataValid 0xA1 dataLength: ', dataLength);

                let sum = 0;
                for (let i = 0; i < dataLength; i++) {
                    sum += dataBytes[3 + i];
                }
                const resultCheckSum = sum % 0xFF;
                const checkSum = dataBytes[3 + dataLength];

                console.log('checkDataValid: dataCheckSum: ', checkSum, ' ResultCheckSum: ', resultCheckSum);

                if (resultCheckSum !== checkSum) {
                    return null;
                }

                const dataJson = textDecoder.decode(dataBytes.slice(3, 3 + dataLength))
                console.log('checkDataValid: getDataJson: ' + JSON.stringify(dataJson));
                return JSON.parse(dataJson);
        }
    } catch (err) {
        console.log('checkDataValid: Failed to check data validity: ', err);
    }

    return null;
}

export function wrapData(type, data, opCode, resourceId, sequenceId) {
    try {
        let wrappedData = [];
        switch (type) {
            case 0xA1:
                wrappedData.push(0xA1);
                wrappedData = wrappedData.concat(intToBytes(data.length, 2));

                const dataBytes = textEncoder.encode(data);

                wrappedData = wrappedData.concat(Array.from(dataBytes));

                let sum = 0;
                for (let i = 0; i < dataBytes.length; i++) {
                    sum += dataBytes[i];
                }

                wrappedData.push(sum % 0xFF);

                return wrappedData;
            case 0xA2:
                wrappedData.push(0xA2);
                const fullDataLength = intToBytes(data.length + 7, 2);
                console.log('Full protocol resource length: ' + fullDataLength[0] + ' ' + fullDataLength[1] + " dataLength: " + data.length);
                wrappedData = wrappedData.concat(fullDataLength);

                wrappedData.push(opCode);

                const resourceInfo = resourceId.split('-');
                const resourceInfoPreId = intToBytes(parseInt(resourceInfo[0]), 1);
                const resourceInfoEndId = intToBytes(parseInt(resourceInfo[1]), 4);
                wrappedData = wrappedData.concat(resourceInfoPreId);
                wrappedData = wrappedData.concat(resourceInfoEndId);
                console.log("wrapData AfterAddResourceId: ", wrappedData, ' ResourceId: ' + resourceId);

                wrappedData = wrappedData.concat(intToBytes(sequenceId, 1));

                // console.log("wrapData AfterSequenceId: ", wrappedData, ' data: ', data);
                console.log("wrapData AfterSequenceId: ", wrappedData);

                wrappedData = wrappedData.concat(data);
                // console.log("wrapData AfterAddData ", wrappedData);

                let totalSum = 0;
                totalSum += opCode;
                totalSum += resourceInfoPreId[0];
                totalSum += resourceInfoEndId[0] + resourceInfoEndId[1] + resourceInfoEndId[2] + resourceInfoEndId[3];
                totalSum += sequenceId;
                console.log("wrapData totalSum before data ", totalSum);
                for (let i = 0; i < data.length; i++) {
                    totalSum += data[i];
                }

                console.log("wrapData totalSum after data ", totalSum);
                wrappedData.push(totalSum % 0xFF);
                console.log("wrapData totalSum final " + (totalSum % 0xFF) + ' wrappedData.length: ' + wrappedData.length);
                // console.log("wrapData totalSum final ", totalSum % 0xFF, ' wrappedData: ', wrappedData, ' wrappedData.length: ' + wrappedData.length);

                return wrappedData;
        }
    } catch (err) {
        console.log('wrapData: Failed to wrap data: ', err);
    }
    return null;
}

export function intToBytes(value, length) {
    if (length === -1) {
        length = 1;
        if (value <= 0xFF) {
            return [value & 0xFF]
        } else if (value <= 0xFFFF) {
            length = 2;
        } else if (value <= 0xFFFFFF) {
            length = 3;
        } else if (value <= 0xFFFFFFFF) {
            length = 4;
        } else {
            return [0xFF, 0xFF, 0xFF, 0xFF];
        }
    }
    const maxIdx = length - 1;
    const byteArray = [];
    for (let i = 0; i < length; i++) {
        byteArray.push((value >> ((maxIdx - i) * 8)) & 0xff);
    }

    return byteArray;
}

export function bytesToInt(byteArray) {
    if (byteArray.length > 4) {
        return 0xFFFFFFFF;
    }

    let value = 0;
    for (let i = 0; i < byteArray.length; i++) {
        value = value << 8;
        value = value | (byteArray[i] & 0xFF);
    }
    return value;
}
