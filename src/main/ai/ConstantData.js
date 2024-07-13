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
import { AI_ENGINE_TYPE } from '@/main/ai/AIManager';

export const CHAT_TYPE = {
    CHAT_TYPE_KEY_CONFIG: 0,
    CHAT_TYPE_NORMAL: 1,
    CHAT_TYPE_OPERATE_PC: 2,
};

export const AI_CONSTANT_CONFIG = {
    SESSION_EXPIRE_TIMEOUT: 5000, // 5 seconds
};

export const AI_SUPPORT_FUNCTIONS = {
    OPEN_APPLICATION: 'openApplication',
    CLOSE_APPLICATION: 'closeApplication',
    WRITE_TO_DOCUMENT: 'writeToDocument',
    GENERATE_REPORT: 'generateReport',
    EXECUTE_CMD: 'executeCommand',
};

export const OPEN_AI_IPC_MESSAGE = {
    CHANNEL_MANIPULATE_FILE: 'manipulate-file',
    CHANNEL_MANIPULATE_FILE_RESULT: 'manipulate-file-result',
    UPLOAD_FILE: 'uploadFile',
    LIST_FILE: 'listFile',
    RETRIEVE_FILE_CONTENT: 'retrieveFileContent',
    RETRIEVE_FILE: 'retrieveFile',
    DELETE_FILE: 'deleteFile',
};

export const KEY_CONFIG_OBJ = {
    title: '',
    icon: '',
    config: {
        functionType: '',
        actions: [
            {
                operationName: '',
                operationValue: '',
            },
        ],
    },
};

export const CONFIG_SAMPLE = {
    timer: {
        simple: {
            type: 'timer',
            actions: [
                {
                    type: 'time',
                    value: 10000,
                },
                {
                    type: 'sound',
                    value: '',
                },
                {
                    type: 'callback',
                    value: 1,
                },
            ],
        },
        fullData: {
            type: 'timer',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-0',
            actions: [
                {
                    type: 'time',
                    value: 10000,
                },
                {
                    type: 'sound',
                    value: '',
                },
                {
                    type: 'callback',
                    value: 1,
                },
            ],
        },
    },
    brightness: {
        simple: {
            type: 'brightness',
            actions: [
                {
                    type: 'level',
                    value: 0,
                },
            ],
        },
        fullData: {
            type: 'brightness',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-1',
            actions: [
                {
                    type: 'level',
                    value: 0,
                },
            ],
        },
    },
    website: {
        simple: {
            type: 'website',
            actions: [
                {
                    type: 'url',
                    value: '',
                },
            ],
        },
        fullData: {
            type: 'website',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-11',
            actions: [
                {
                    type: 'url',
                    value: '',
                },
            ],
        },
    },
    hotkeySwitch: {
        simple: {
            type: 'hotkeySwitch',
            actions: [
                {
                    type: 'key',
                    value: '',
                },
                {
                    type: 'key',
                    value: '',
                },
            ],
        },
        fullData: {
            type: 'hotkeySwitch',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            alterTitle: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-12',
            alterIcon: '0-26',
            actions: [
                {
                    type: 'key',
                    value: '',
                },
                {
                    type: 'key',
                    value: '',
                },
            ],
        },
    },
    hotkey: {
        simple: {
            type: 'hotkey',
            actions: [
                {
                    type: 'key',
                    value: '',
                },
            ],
        },
        fullData: {
            type: 'hotkey',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-13',
            actions: [
                {
                    type: 'key',
                    value: '',
                },
            ],
        },
    },
    text: {
        simple: {
            type: 'text',
            actions: [
                {
                    type: 'text',
                    value: '',
                },
                {
                    type: 'key',
                    value: 'enter',
                },
            ],
        },
        fullData: {
            type: 'text',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-16',
            actions: [
                {
                    type: 'text',
                    value: '',
                },
                {
                    type: 'key',
                    value: 'enter',
                },
            ],
        },
    },
    media: {
        simple: {
            type: 'media',
            actions: [
                {
                    type: 'key',
                    value: '',
                },
            ],
        },
        fullData: {
            type: 'media',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-17',
            actions: [
                {
                    type: 'key',
                    value: '',
                },
            ],
        },
    },
    playAudio: {
        simple: {
            type: 'playAudio',
            actions: [],
        },
        fullData: {
            type: 'playAudio',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-39',
            actions: [
                {
                    type: 'sound',
                    value: '',
                },
                {
                    type: 'audioAction',
                    value: 0,
                },
                {
                    type: 'audioFade',
                    value: '0-0',
                },
                {
                    type: 'volume',
                    value: 100,
                },
            ],
        },
    },
    stopAudio: {
        simple: {
            type: 'stopAudio',
            actions: [],
        },
        fullData: {
            type: 'stopAudio',
            title: {
                text: '',
                pos: 'bot',
                size: 8,
                color: '#FFFFFF',
                style: 'bold|italic|underline',
                resourceId: '0-0',
                display: true,
            },
            icon: '0-40',
            actions: [],
        },
    },
};

export const SUPPORT_KEY_INPUTS = [
    'backspace',
    'delete',
    'enter',
    'tab',
    'escape',
    'up',
    'down',
    'right',
    'left',
    'home',
    'end',
    'pageup',
    'pagedown',
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f6',
    'f7',
    'f8',
    'f9',
    'f10',
    'f11',
    'f12',
    'f13',
    'f14',
    'f15',
    'f16',
    'f17',
    'f18',
    'f19',
    'f20',
    'f21',
    'f22',
    'f23',
    'f24',
    'capslock',
    'command',
    'alt',
    'right_alt',
    'control',
    'left_control',
    'right_control',
    'shift',
    'right_shift',
    'space',
    'printscreen',
    'insert',
    'menu',
    'audio_mute',
    'audio_vol_down',
    'audio_vol_up',
    'audio_play',
    'audio_stop',
    'audio_pause',
    'audio_prev',
    'audio_next',
    'audio_rewind',
    'audio_forward',
    'audio_repeat',
    'audio_random',
    'numpad_lock',
    'numpad_0',
    'numpad_0',
    'numpad_1',
    'numpad_2',
    'numpad_3',
    'numpad_4',
    'numpad_5',
    'numpad_6',
    'numpad_7',
    'numpad_8',
    'numpad_9',
    'numpad_+',
    'numpad_-',
    'numpad_*',
    'numpad_/',
    'numpad_.',
    'lights_mon_up',
    'lights_mon_down',
    'lights_kbd_toggle',
    'lights_kbd_up',
    'lights_kbd_down',
];

export function getChatPrePromptMsg(message, engineType) {
    switch (engineType) {
        default:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI:
        case AI_ENGINE_TYPE.CustomEngine:
            return [
                {
                    role: 'system',
                    content:
                        '## Role: \n' +
                        '   You are Dekie, a computer technology expert. You can assist me to operate my computer for my questions. ' +
                        'Use clear and simple language to explain the solution step-by-step.\n' +
                        '\n' +
                        '## Action: \n' +
                        '   Identify whether I need help with operating my computer, generate/modify my keyboard/hotkeys configurations or just chat with you. \n' +
                        '\n' +
                        '## Context: \n' +
                        "   I'm very lazy on doing some operation with my computer and config my customizable keyboard. Since you have the ability to operate my computer and config my keyboard, I need you to help me with my request.\n" +
                        '\n' +
                        '## Expectation: \n' +
                        '   Only reply with JSON format: ```{"userRequestAction": ""}```, do not reply any explanation other than the request JSON response. \n' +
                        '       **userRequestAction** supported items are: \n' +
                        '           *operatingComputer*: When assistance with operating a computer is needed. i.e: open application, write documents, generate report etc.\n' +
                        '           *generateConfiguration*: When assistance with generating/modifying keyboard/hotkeys configurations is needed.\n' +
                        "           *standardChat**: When not meet any of other 'userRequestAction'.\n",
                },
                {
                    role: 'user',
                    content: message,
                },
            ];
        case AI_ENGINE_TYPE.XYF:
        case AI_ENGINE_TYPE.ArixoChat:
        case AI_ENGINE_TYPE.ZhiPuChat:
        case AI_ENGINE_TYPE.QWenChat:
            return [
                {
                    role: 'system',
                    content: '你是小呆，一名计算机技术专家，你可以帮我操作电脑回答我的问题。尽量避免过多的技术细节，但在必要时使用它们'
                },
                {
                    role: 'user',
                    content:
                        '## Role: \n' +
                        '   你是小呆，一名计算机技术专家，你可以帮我操作电脑回答我的问题。尽量避免过多的技术细节，但在必要时使用它们。\n' +
                        '\n' +
                        '## Action: \n' +
                        '   确定我是否需要帮助操作计算机、生成/修改键盘/热键配置或只是与你聊天。\n' +
                        '\n' +
                        '## Context: \n' +
                        '   我很懒，不想用我的电脑做一些操作，也不想配置我的自定义键盘。既然你有能力操作我的电脑和配置我的键盘，我需要你帮我处理我的请求。\n' +
                        '\n' +
                        '## Expectation: \n' +
                        '   仅使用JSON格式 ```{"userRequestAction"：""}``` 来回复，不要回复请求JSON响应以外的任何解释。\n' +
                        '       **userRequestAction** 支持的项目包含以下信息:\n' +
                        '           *operatingComputer*: 当需要帮助操作电脑时，如打开/关闭某一个程序，生成/写入文档, 生成报告等。\n' +
                        '           *generateConfiguration*: 当需要生成/修改键盘/快捷键配置的帮助时。\n' +
                        "           *standardChat*: 当不符合其他 'userRequestAction' 的项目时。\n" +
                        "## Request:\n" +
                        "  我的问题是: " + message
                }
            ];
    }
}

export function getKeyConfigBotPrePrompt(message, deviceActiveProfile, language, engineType, deviceLayoutConfig, recentApps) {
    console.log('ConstantData: getKeyConfigBotPrePrompt: engineType: ' + engineType);

    let maxKeySupport = 6,
        rowNum = 2,
        colNum = 3;
    try {
        if (deviceLayoutConfig !== undefined && deviceLayoutConfig.keyMatrix !== undefined) {
            rowNum = deviceLayoutConfig.keyMatrix.row;
            colNum = deviceLayoutConfig.keyMatrix.col;
            maxKeySupport = rowNum * colNum;
        }
    } catch (err) {
        console.log('getKeyConfigBotPrePrompt: Failed to get device key matrix info. Use default.');
    }

    let deviceConfigArray = [];

    if (deviceActiveProfile === undefined) {
        for (let row = 0; row < rowNum; row++) {
            for (let col = 0; col < colNum; col++) {
                const requiredKeyCode = row + 1 + ',' + (col + 1);
                const tempData = {};
                tempData[requiredKeyCode] = KEY_CONFIG_OBJ;

                deviceConfigArray.push(tempData);
            }
        }
    } else {
        console.log(
            'getKeyConfigBotPrePrompt: deviceActiveProfile.configInfo: ' +
                JSON.stringify(deviceActiveProfile.configInfo) +
                ' Size: ' +
                deviceActiveProfile.configInfo.length
        );
        for (let row = 0; row < rowNum; row++) {
            for (let col = 0; col < colNum; col++) {
                const requiredKeyCode = row + 1 + ',' + (col + 1);
                const idxConfigItem = deviceActiveProfile.configInfo.filter(configItem => {
                    return configItem.keyCode === requiredKeyCode;
                });

                console.log(
                    'getKeyConfigBotPrePrompt: deviceActiveProfile.checking for: ' +
                        (row + 1) +
                        ',' +
                        (col + 1) +
                        ' have ConfigInfo: ' +
                        (idxConfigItem !== undefined && idxConfigItem.length > 0)
                );

                if (idxConfigItem === undefined || idxConfigItem.length === 0) {
                    const tempData = {};
                    tempData[requiredKeyCode] = KEY_CONFIG_OBJ;

                    deviceConfigArray.push(tempData);
                    continue;
                }

                const configData = idxConfigItem[0].config;
                const currentConfigActions = [];

                if (configData.subActions) {
                    configData.subActions.forEach(action => {
                        currentConfigActions.push({
                            title: action.config.title.text,
                            icon: '',
                            config: {
                                functionType: action.config.type,
                                actions: [
                                    {
                                        operationName: action.type,
                                        operationValue: action.value,
                                    },
                                ],
                            },
                        });
                    });
                } else if (configData.actions) {
                    configData.actions.forEach(action => {
                        currentConfigActions.push({
                            operationName: action.type,
                            operationValue: action.value,
                        });
                    });
                }

                const tempData = {};
                tempData[requiredKeyCode] = {
                    title: configData.title.text,
                    icon: '',
                    config: {
                        functionType: configData.type,
                        actions: currentConfigActions,
                    },
                };
                deviceConfigArray.push(tempData);
            }
        }
    }

    deviceConfigArray = deviceConfigArray.map(item => {
        for (let key in item) {
            if (key.includes(',')) {
                item[key.replace(',', '_')] = item[key];
                delete item[key];
            }
        }
        return item;
    });

    console.log('getKeyConfigBotPrePrompt: Max key array support: ' + maxKeySupport);

    let platform = 'windows';
    switch (process.platform) {
        default:
        case 'win32':
            platform = 'windows'
            break;
        case 'darwin':
            platform = 'macos'
            break;
        case 'linux':
            platform = 'linux'
            return;
    }

    const englishRequestConfigPrompt =
        '\n' +
        '## Role: ' +
        '   Now that you are a computer technology expert, you will answer my questions about shortcut keys and find the most relevant key configurations for user requests based on the following information:\n' +
        '\n' +
        '## Background: \n' +
        '   1. I have a keyboard that can customize key configurations. Each key on the device supports only one function type. ' +
        'The keyboard supports a maximum of ' + maxKeySupport + ' key configuration JSON objects with ' + colNum + ' per row. ' +
        'The current configuration of the keyboard is:\n' +
        '```json' +
        JSON.stringify(deviceConfigArray) +
        '```.\n' +
        "   The configuration format for each key's 'ConfigDetail' is in JSON format, specified as: \n" +
        "       - `'title'` represents a brief description of the functionType, no more than 6 words.\n" +
        "       - `'icon'` represents an MDI icon that most relevant of the key's function, with prefix of 'mdi-'.\n" +
        "       - `'config'` contains the configuration details:\n" +
        "           - `'functionType'` specifies the <functionType>.\n" +
        "           - `'actions'` is a list detailing the operations for the function, with each operation including:\n" +
        "               - `'operationName'`: the name of the operation.\n" +
        "               - `'operationValue'`: the <operationValue> for that operation.\n" +
        "       * NOTE: If the `'actions'` list is not empty, each entry must contain both `'operationName'` and `'operationValue'`.\n" +
        '\n' +
        '   2. It supports the following <functionType>:\n' +
        '\n' +
        '       - **Timer (timer)**, Supported operations:\n' +
        '           - `time`: Countdown duration in milliseconds, minimum 1000.\n' +
        '           - `sound`: Path of the audio to be played.\n' +
        '           - `callback`: Fixed value `1`.\n' +
        '\n' +
        '   - **Brightness (brightness)**, Supported operations:\n' +
        '       - `level`: Brightness level (0 to 6, corresponding to brighter, darker, brightest, brighter, moderate, darker, darkest respectively)\n' +
        '\n' +
        '   - **Website (website)**, Supported operations:\n' +
        '       - `url`: Full URL of the webpage to open.\n' +
        '\n' +
        '   - **Hotkey (hotkey) and Hotkey Switch (hotkeySwitch)**, Supported operations:\n' +
        "       - `key`: Key values only suppoerted for nodejs library 'roobotjs', lited as following values: ```\" " + JSON.stringify(SUPPORT_KEY_INPUTS) + "\"```. " +
        "Support single key and combination keys using the '+' sign. When set to 'hotkeySwitch', need two `key` in the list. Note: 'hotkeySwitch' only support two `key`s in actions list. \n" +
        '\n' +
        '   - **Text (text)**, Supported operations:\n' +
        '       - `text`: Predefined text input.\n' +
        '       - `key`: Fixed value `"enter"`.\n' +
        '\n' +
        '   - **Multimedia (media)**, Supported operations:\n' +
        '       - `key`: Multimedia action, supported <operationValue> are: `audio_mute`, `audio_vol_down`, `audio_vol_up`, `audio_play`, `audio_stop`, `audio_pause`, `audio_prev`, `audio_next`, `audio_rewind`, `audio_forward`, `audio_repeat`, `audio_random`.\n' +
        '\n' +
        '   - **Play Audio (playAudio)**, Supported operations:\n' +
        '       - `sound`: Path of the audio to play.\n' +
        '       - `audioAction`: Numeric value (0 to 4, corresponding to play/stop, add play, play/replay, loop play, stop all) representing play actions.\n' +
        '       - `audioFade`: Numeric value (0 to 3, corresponding to no fade, fade-in, fade-out, fade-in and fade-out) for fade options.\n' +
        '       - `volume`: Numeric value (0 to 100) for volume.\n' +
        '\n' +
        '   - **Stop Audio Playback (stopAudio)**, Supported operations:\n' +
        '       - No specific operations.\n' +
        '\n' +
        '   - **Open Application (openApplication)**, Supported operations:\n' +
        "       - `appName`: An string array of third part application's name for both Chinese and English .\n" +
        '\n' +
        '   - **Close Application (closeApplication)**, Supported operations:\n' +
        "       - `appName`: An string array of third part application's name for both Chinese and English .\n" +
        '\n' +
        '   - **Open System Application (openSystemApplication)**, Supported operations:\n' +
        "       - `cmdLine`: A command line that can be used in terminal to open user requested system default application.\n" +
        '\n' +
        '   - **Close System Application (closeSystemApplication)**, Supported operations:\n' +
        "       - `cmdLine`: A command line that can be used in terminal to close user requested system default application.\n" +
        '\n' +
        '   - **Terminal (cmd)**, Supported operations:\n' +
        "       - `cmdLine`: A command line that can use in the terminal to execute.\n" +
        '\n' +
        '   - **Multiactions (multiActions)**, Supported operations:\n' +
        "       - `subActions`: A list of 'ConfigDetail' that contains one or more <functionType> and process them one by one. \n" +
        '\n' +
        '   3. I\'m using a ' + platform + ' system.\n' +
        '   4. I have the following recent applications used on my computer, only use this information when I need config for recent applications:\n' +
        '```json' +
        JSON.stringify(recentApps) +
        '```' +
        '\n' +
        '## Tasks: \n' +
        "   Modify the configuration content of the user's device according to the above information and only reply with JSON object to user's request with below conditions:\n" +
        '\n' +
        '## Output: \n' +
        "   1. Only reply JSON format to answer the user's question:\n" +
        '       ```{ConfigData: {"1_1": ConfigDetail, ......},"requestMsg": ""}```\n' +
        '           - `ConfigData` corresponds to all key configurations;\n' +
        "               - `ConfigDetail` corresponds to the generated configuration data for each key;  mportant notes: 'ConfigDetail.icon' must be filled if 'ConfigDetail.config.functionType' is set. \n" +
        '           - `requestMsg` should be either "New configuration" for new configurations or "Modify configuration" for modify current configurations.\n' +
        '   2. If need new configuration, ignore what is in the current configurations then generate new configurations.\n' +
        '   3. If more information is needed, reply with ```{"requestMsg":"{{moreDetailsRequired}}"}```.\n' +
        '\n' +
        '---\n' +
        '\n' +
        "Reply to user's request in {{promptReplyLanguage}} using the above steps. \n" +
        "## Request:\n" +
        "  My request is: " + message;

    let chineseRequestConfigPrompt =
        '## Role: ' +
        '   现在你是一名计算机技术专家，你会解答我关于快捷键的问题，并根据以下信息找到与用户请求最相关的按键设置: \n' +
        '\n' +
        '## Background: \n' +
        '   1. 我有一个可自定义按键配置的键盘。 设备上的每个键只支持一种功能类型。键盘最多支持' + maxKeySupport + '个键配置JSON对象，每行' + colNum + '个。键盘的当前配置为:\n' +
        '```json' +
        JSON.stringify(deviceConfigArray) +
        '```.\n' +
        '   每个键的<配置数据>格式为 JSON，样式为: \n' +
        "       - `'title'` 按键<函数类型>的简要描述，最多6个字。\n" +
        "       - `'icon'` 代表与按键功能最相关的MDI图标，前缀为 'mdi-'。\n" +
        "       - `'config'` 包含配置详细信息:\n" +
        "           - `'functionType'` 代表<函数类型>。\n" +
        "           - `'actions'` 是一个详细说明函数操作的列表，每个操作包括:\n" +
        "               - `'operationName'`: 操作的名称。\n" +
        "               - `'operationValue'`: 该操作的值。\n" +
        "       * 注意: 如果 `'actions'` 列表不为空，则每个条目必须同时包含 `'operationName'` 和 `'operationValue'`.\n" +
        '\n' +
        '   2.  支持以下<函数类型>的操作：\n' +
        '\n' +
        '       - **计时器 (timer)**:\n' +
        '           - `time`: 以毫秒为单位的倒计时持续时间，最小值为1000。\n' +
        '           - `sound`: 要播放的音频的路径。\n' +
        '           - `callback`: 固定值`1`.\n' +
        '\n' +
        '       - **亮度 (brightness)**:\n' +
        '           - `level`: 亮度级别（0到6，分别对应较亮、较暗、最亮、较亮、中等、较暗和最暗）。\n' +
        '\n' +
        '       - **网站 (website)**:\n' +
        '           - `url`: 要打开的网页的完整url。\n' +
        '\n' +
        '       - **热键 (hotkey) 和 热键切换 (hotkeySwitch)**:\n' +
        "           - `key`: 供的列表支持的键值，支持使用 '+' 符号的单个键和组合键。当设置为热键Switch时，列表中需要两个 `key`。支持的键为: ```" + JSON.stringify(SUPPORT_KEY_INPUTS) + '```\n' +
        '\n' +
        '       - **文本 (text)**:\n' +
        '           - `text`: 预定义的文本输入。\n' +
        '           - `key`: 固定值 `"enter"`.\n' +
        '\n' +
        '       - **多媒体 (media)**:\n' +
        '           - `key`: 多媒体功能 (支持的配置值包括: `audio_mute`, `audio_vol_down`, `audio_vol_up`, `audio_play`, `audio_stop`, `audio_pause`, `audio_prev`, `audio_next`, `audio_rewind`, `audio_forward`, `audio_repeat`, `audio_random`).\n' +
        '\n' +
        '       - **播放音频 (playAudio)**:\n' +
        '           - `sound`: 要播放的音频的路径。\n' +
        '           - `audioAction`: 表示播放操作的数值（0到4， 分别对应播放/停止、添加播放、播放/重播、循环播放、全部停止）。\n' +
        '           - `audioFade`: 淡入淡出选项的数值（0到3， 分别对应无淡入淡出、淡入、淡出、淡入淡出）。\n' +
        '           - `volume`: 音量的数值（0到100）。\n' +
        '\n' +
        '       - **停止音频播放 (stopAudio)**:\n' +
        '           - 没有特定的操作。\n' +
        '\n' +
        '   - **打开应用程序 (openApplication)**:\n' +
        "       - `appName`: 一个字符串数组，包含第三方应用程序的中文和英文名称。\n" +
        '\n' +
        '   - **关闭应用程序 (closeApplication)**:\n' +
        "       - `appName`: 一个字符串数组，包含第三方应用程序的中文和英文名称。\n" +
        '\n' +
        '   - **打开系统应用程序 (openSystemApplication)**:\n' +
        "       - `cmdLine`: 可以在终端中使用的命令行，用于打开用户请求的系统默认应用程序。\n" +
        '\n' +
        '   - **关闭系统应用程序 (closeSystemApplication)**:\n' +
        "       - `cmdLine`: 可以在终端中使用的命令行，用于关闭用户请求的系统默认应用程序。\n" +
        '\n' +
        '   - **终端命令行 (cmd)**, Supported operations:\n' +
        "       - `cmdLine`: 可以在终端中执行的命令行。\n" +
        '\n' +
        '   - **多重操作 (multiActions)**, Supported operations:\n' +
        "       - `subActions`: 一个包含一条或多条<函数类型>的 'ConfigDetail' 列表，并逐个处理它们。\n" +
        '\n' +
        '   3. 我使用的是 ' + platform + ' 系统.\n' +
        '   4. 我电脑上最近使用的应用程序如下, 注意：只在我需要你来配置最近应用程序时再使用这些信息:\n' +
        '```json' +
        JSON.stringify(recentApps) +
        '```' +
        '\n' +
        '## Tasks: ' +
        '   根据上述信息修改用户设备的配置内容，并仅以 JSON 对象回复用户的请求，需满足以下条件，注意不要写解释:\n' +
        '\n' +
        '   1. 仅使用以下JSON格式回答用户的问题:\n' +
        '       ```{"ConfigData": {"1_1": ConfigDetail, ......},"requestMsg": ""}```\n' +
        '           - `ConfigData` 对应于所有按键设置;\n' +
        "               - `ConfigDetail` 对应每个键生成的<配置数据>; 注意：如果设置了 'ConfigDetail.config.functionType'，则必须填写 'ConfigDetail.icon'。\n" +
        '           - `requestMsg` 仅支持`New configuration`或`Modify configuration`.\n' +
        '   2. 如果需要生成新的配置, 忽略键盘当前的按键配置然后再生成.\n' +
        '   3. 如果需要更多信息，请回复 ```{"requestMsg":"抱歉，请提供更多信息。"}```.' +
        "使用{{promptReplyLanguage}}回复用户的请求。 \n" +
        "## Request:\n" +
        "  我的请求是: " + message;

    let finalRequestPrompt = '';
    switch (language) {
        default:
        case 'zh':
            switch (engineType) {
                case AI_ENGINE_TYPE.XYF:
                case AI_ENGINE_TYPE.ArixoChat:
                    finalRequestPrompt = chineseRequestConfigPrompt
                        .replace('{{promptReplyLanguage}}', '中文');
                    break;
                default:
                case AI_ENGINE_TYPE.ZhiPuChat:
                case AI_ENGINE_TYPE.QWenChat:
                case AI_ENGINE_TYPE.GroqChat:
                case AI_ENGINE_TYPE.CustomEngine:
                case AI_ENGINE_TYPE.OpenAI:
                    finalRequestPrompt = englishRequestConfigPrompt
                        .replace('{{promptReplyLanguage}}', 'chinese')
                        .replace('{{moreDetailsRequired}}', '抱歉，请提供更多信息');
                    break;
            }
            break;
        case 'en':
            switch (engineType) {
                case AI_ENGINE_TYPE.XYF:
                case AI_ENGINE_TYPE.ArixoChat:
                    finalRequestPrompt = chineseRequestConfigPrompt
                        .replace('{{promptReplyLanguage}}', '英文');
                    break;
                default:
                case AI_ENGINE_TYPE.QWenChat:
                case AI_ENGINE_TYPE.CustomEngine:
                case AI_ENGINE_TYPE.GroqChat:
                case AI_ENGINE_TYPE.OpenAI:
                case AI_ENGINE_TYPE.ZhiPuChat:
                    finalRequestPrompt = englishRequestConfigPrompt
                        .replace('{{promptReplyLanguage}}', 'english')
                        .replace('{{moreDetailsRequired}}', 'Sorry, please provide more details');
                    break;
            }
            break;
    }

    switch (engineType) {
        default:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI:
        case AI_ENGINE_TYPE.CustomEngine:
            return [
                {
                    role: 'system',
                    content:
                        'You are Dekie, a computer technology expert. You are familiar with the commonly used shortcuts in the system and shortcuts in various applications. I need you to provide me with relevant shortcuts according to my requirements.',
                },
                {
                    role: 'user',
                    content: finalRequestPrompt,
                },
            ];
        case AI_ENGINE_TYPE.XYF:
        case AI_ENGINE_TYPE.ArixoChat:
        case AI_ENGINE_TYPE.ZhiPuChat:
        case AI_ENGINE_TYPE.QWenChat:
            return [
                {
                    role: 'system',
                    content:
                        '你是小呆，一名计算机技术专家，你熟知系统中常用的快捷键和各个应用中的快捷键。我需要你根据我的需求给我提供相关的快捷键。',
                },
                {
                    role: 'user',
                    content: finalRequestPrompt,
                },
            ];
    }
}

export function getPCOperationBotPrePrompt(message, engineType, currentLanguage) {
    let platform = 'windows';
    switch (process.platform) {
        default:
        case 'win32':
            platform = 'windows'
            break;
        case 'darwin':
            platform = 'macos'
            break;
        case 'linux':
            platform = 'linux'
            return;
    }

    let englishRequestOperationPrompt =
        '' +
        '## Role: \n' +
        '   You are Dekie, a computer technology expert. You can assist me to operate my computer for my questions. ' +
        'Use clear and simple language to explain the solution step-by-step.\n' +
        '## Context:\n' +
        '   I hope you can serve as an IT expert. I will provide you with all the information necessary for my technical issue, and your responsibility is to solve my problem. ' +
        'You should use your knowledge of computer science, network infrastructure, and IT security to solve my problem. ' +
        'It would be helpful to use intelligent, simple, and easy to understand language that is suitable for people of all levels in your answer. ' +
        'It is helpful to gradually explain your solution with key points. Try to avoid too many technical details, but use them when necessary. ' +
        "I'm using a " + platform + " system. I hope you can reply with a solution instead of writing any explanation and reply my question based on below steps: \n" +
        '\n' +
        '## Action:\n' +
        '   Determine what kind of operation I need for assist with operating the computer.\n' +
        '\n' +
        '## Result: \n' +
        '   Only reply with following format with a line break character at end of each key:\n' +
        '\n' +
        '       **UserRequestAction**: determines what does user need to do. Supported Items are: \n' +
        '           *' + AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION + "*: Open an system default application like 'SystemSettings', 'Calculator', etc. or third party application on computer. \n" +
        "When '" + AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION + "' is set also need set 'actionDetail' with a list of possible application's name strings based on following condition:\n" +
        "               - If user requested to open system default application, then set it with a prefix of 'OpenSystemApp: ' then followed with command line that can be used in terminal to open user requested application.\n" +
        "               - If user requested to open third part application, then fill the list with application's name for both Chinese and English, also set the last item to the link could open in web browser.\n" +
        '           *' + AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION + "*:  Close an system default application like 'SystemSettings', 'Calculator', etc. or third party application on computer. " +
        "When '" + AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION + "' is set also need set 'actionDetail' with a list of possible application's name strings based on following condition:\n" +
        "               - If user requested to close system default application, then set it with a prefix of 'CloseSystemApp: ' then followed with the name appears in " + platform + " tasklist.\n" +
        "               - If user requested to close third part application, then fill the list with application's name for both Chinese and English. \n" +
        '           *' + AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT + '*: Write the user requested message to specific location, such as cursor, or file. ' +
        "When '" + AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT + "' is set also need set 'actionDetail' with following output details:\n" +
        "               - 'outputFormat': Indicate write output message to the 'cursor' location or to a 'file'. If user not indicate the location, then set to default 'file'. \n" +
        "               - 'fileType': Indicate the file type user need output with when set 'file' as output location in 'outputFormat'. i.e: doc, txt. Default is doc.\n" +
        '           *' + AI_SUPPORT_FUNCTIONS.GENERATE_REPORT + '*: Generate a report to file. \'OutputData\' required to be markdown format. ' +
        "When '" + AI_SUPPORT_FUNCTIONS.GENERATE_REPORT + "' is set also need set 'actionDetail' with following output details:\n" +
        "               - 'outputFormat': Indicate write output message to the 'cursor' location or to a 'file'. If user not indicate the location, then set to default 'file'. \n" +
        "               - 'fileType': Indicate the file type user need output with when set 'file' as output location in 'outputFormat'. Default is doc.\n" +
        '           *' + AI_SUPPORT_FUNCTIONS.EXECUTE_CMD + '*: Execute a command line in terminal, i.e: shutdown/power off. ' +
        "When '" + AI_SUPPORT_FUNCTIONS.EXECUTE_CMD + "' is set also need set 'actionDetail' with following output details:\n" +
        "               - 'cmdLine': A command line that can be used in terminal to open user requested system default application. \n" +
        "               - 'greetingMessage': A friendly and interesting brief greeting about user request functionality, must use {{promptReplyLanguage}} to reply.\n" +
        "\n" +
        "       **ActionDetail**: A JSON object array of 'userRequestAction' action result.\n" +
        "\n" +
        "       **OutputData**: String based response like essay, report or chat response, the 'OutputData' must use {{promptReplyLanguage}} to reply my request.\n" +
        "## Request:\n" +
        "  My question is: " + message;

    let chineseRequestOperationPrompt =
        '' +
        '## Role: \n' +
        '   你是小呆，一名计算机技术专家，你可以帮我操作电脑回答我的问题。尽量避免过多的技术细节，但在必要时使用它们。\n' +
        '## Context:\n' +
        '   我希望你能成为一名IT专家。我将为您提供我的技术问题所需的所有信息，您的责任是解决我的问题。\n' +
        '你应该利用你的计算机科学、网络基础设施和IT安全知识来解决我的问题。\n' +
        '在你的答案中使用智能、简单、易于理解的语言，适合各个层次的人，这将很有帮助。\n' +
        '逐步用关键点解释你的解决方案是有帮助的。尽量避免过多的技术细节，但在必要时使用它们。\n' +
        '我使用的是 ' + platform + ' 系统。我希望你能给出一个解决方案，而不是写任何解释，并根据以下步骤回答我的问题：\n' +
        '\n' +
        '## Action: \n' +
        '   确定我需要什么样的操作来帮助操作计算机。\n' +
        '\n' +
        '## Result: \n' +
        '   仅使用以下格式来回复我的问题, 我不需要你的解释: \n' +
        '       **UserRequestAction**: 用户需要做的事情。支持的项目有: \n' +
        '           *' + AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION + "：打开计算机上的系统默认应用程序，如 'SystemSettings'（系统设置）、'Calculator'（计算器）等，或第三方应用程序。" +
        "当设置 '" + AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION + "' 时，还需要使用 'actionDetail' 设置一系列可能的应用程序名称字符串，基于以下条件：\n" +
        "               - 如果用户请求打开系统默认/自带的应用程序，则将其设置为在 " + platform + " 任务列表中出现的名称，并带有前缀 'OpenSystemApp: '，然后是可在终端中用于打开用户请求的应用程序的命令行。\n" +
        "               - 如果用户请求打开第三方应用程序，则用中文和英文填写应用程序的名称到 'actionDetail' 列表中，并将最后一项设置为可以在网络浏览器中打开的链接。\n" +
        '           *' + AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION + "：关闭计算机上的系统默认应用程序，如 'SystemSettings'（系统设置）、'Calculator'（计算器）等，或第三方应用程序。" +
        "当设置 '" + AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION + "' 时，还需要使用 'actionDetail' 设置一系列可能的应用程序名称字符串，基于以下条件：\n" +
        "               - 如果用户请求关闭系统默认应用程序，则将其设置为在 " + platform + " 任务列表中出现的名称，并带有前缀 'CloseSystemApp: '，然后是应用程序名称。\n" +
        "               - 如果用户请求关闭第三方应用程序，则用中文和英文填写应用程序的名称到 'actionDetail' 列表中。\n" +
        '           *' + AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT + '*:  将用户请求的消息写入特定位置，如光标或文件。' +
        "当设置了 '" + AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT + "' 时，还需要设置带有输出详细信息列表的 'actionDetail': \n" +
        "               - 'outputFormat': 表示将输出消息写入 'cursor' 位置或 'file'。如果用户未指示位置，则设置为默认的 'file' \n" +
        "               - 'fileType': 当 'outputFormat' 为 'file' 时，同时需要提供用户需要输出的文件类型。如：doc，txt。默认为doc。\n" +
        '           *' + AI_SUPPORT_FUNCTIONS.GENERATE_REPORT + '*: 生成用户请求归档的报告， \'OutputData\' 必须为 markdown 格式。' +
        "当设置了 '" + AI_SUPPORT_FUNCTIONS.GENERATE_REPORT + "' 时，还需要设置带有输出详细信息列表的 'actionDetail':\n" +
        "               - 'outputFormat': 表示将输出消息写入 'cursor' 位置或 'file'。如果用户未指示位置，则设置为默认的 'file' \n" +
        "               - 'fileType': 当 'outputFormat' 为 'file' 时，同时需要提供用户需要输出的文件类型。默认为doc。\n" +
        "       **ActionDetail**：'userRequestAction' 动作结果的JSON数组。\n" +
        "       **OutputData**：基于字符串的响应，如论文, 报告内容或聊天回复，'OutputData' 必须使用与我的请求所用的语言相同的语言。\n" +
        "## Request:\n" +
        "  我的问题是: " + message;

    switch (engineType) {
        case AI_ENGINE_TYPE.ArixoChat:
        case AI_ENGINE_TYPE.XYF:
        case AI_ENGINE_TYPE.QWenChat:
        case AI_ENGINE_TYPE.ZhiPuChat:
            return [
                {
                    role: 'system',
                    content: '你是小呆，一名计算机技术专家，你可以帮我操作电脑回答我的问题。尽量避免过多的技术细节，但在必要时使用它们',
                },
                {
                    role: 'user',
                    content: chineseRequestOperationPrompt,
                },
            ];
        default:
        case AI_ENGINE_TYPE.CustomEngine:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI: {
            const regExp = new RegExp("{{promptReplyLanguage}}", 'g');

            switch (currentLanguage) {
                case 'zh':
                    englishRequestOperationPrompt = englishRequestOperationPrompt
                        .replace(regExp, 'chinese')
                    break;
                case 'en':
                    englishRequestOperationPrompt = englishRequestOperationPrompt
                        .replace(regExp, 'english')
                    break;
            }

            return [
                {
                    role: 'system',
                    content: 'You are Dekie, a computer technology expert. You can assist me to operate my computer for my questions.',
                },
                {
                    role: 'user',
                    content: englishRequestOperationPrompt,
                },
            ];
        }
    }
}

export function getNormalChatPrePrompt(message, language, locationInfo) {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(
        `AzureCheck Timezone: ${timezone}, Data: ${currentDate}, Time: ${currentTime}, locationInfo: ${locationInfo}`
    );

    let promptMsg = '';
    let extraDetailInfo = '';

    switch (language) {
        default:
        case 'zh':
            promptMsg =
                '你是小呆，你将扮演一个日常生活工作助理，并使用中文对用户的问题做出精确的回答。注意不要使用任何的特殊字符，markdown，表情和emoji在你的回复中。';
            extraDetailInfo = '我所在的城市为: {{city}}, 当前的时间为: {{currentDateTime}}, 时区为: {{timezone}}。';
            break;
        case 'en':
            promptMsg =
                "You are Dekie, you will act as an assistant for daily life and work and give precise answers in English to users' questions. Note that do not use any special characters, markdown, expressions or emojis in your responses. ";
            extraDetailInfo =
                'My city is: {{city}}, the current time is: {{currentDateTime}}, and the time zone is: {{timezone}}';
            break;
    }

    if (locationInfo) {
        extraDetailInfo = extraDetailInfo.replace('{{city}}', locationInfo.city);
    } else {
        extraDetailInfo = extraDetailInfo.replace('{{city}}', 'Unknown');
    }
    extraDetailInfo = extraDetailInfo.replace('{{currentDateTime}}', currentDate + ' ' + currentTime);
    extraDetailInfo = extraDetailInfo.replace('{{timezone}}', timezone);

    return [
        {
            role: 'system',
            content: promptMsg + extraDetailInfo,
        },
        {
            role: 'user',
            content: message,
        },
    ];
}
