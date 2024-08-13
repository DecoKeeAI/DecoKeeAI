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
import {AI_ENGINE_TYPE} from '@/main/ai/AIManager';

export const DEFAULT_OPEN_TO_AI_DOMAINS = ['climate', 'light', 'media_player', 'person', 'sensor', 'switch', 'weather'];

export const CHUNK_MSG_TYPE = {
    ANSWER: 'answer',
    FOLLOW_UP: 'followUp',
    END: 'end',
};

export const CHAT_TYPE = {
    CHAT_TYPE_KEY_CONFIG: 0,
    CHAT_TYPE_NORMAL: 1,
    CHAT_TYPE_OPERATE_PC: 2,
    CHAT_TYPE_OPERATE_EQUIPMENT: 3,
};

export const AI_CONSTANT_CONFIG = {
    SESSION_EXPIRE_TIMEOUT: 5000, // 5 seconds
    CHAT_RESPONSE_TIMEOUT: 60000,
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

export function getChatPrePromptMsg(message, engineType, supportHAConfig) {
    let chineseRoleSetupMsg = `
# 角色
  你是小呆，一名计算机技术专家，并且对互联网公开域信息了如指掌的专家。你可以帮通过操作我的电脑来帮我快速来完成任务。尽量避免过多的技术细节，但在必要时使用它们。你将根据用户的提问，来解决为用户解答高时效性问题。根据以下规则一步步执行：
  1. 理解用户的需求，确定我是否需要你帮助我操作电脑、生成/修改键盘/热键配置${supportHAConfig ? '、控制电器设备' : ''}或只是与你聊天。
  2. 判断用户需要执行哪些操作。
                        
# 任务
  请严格使用以下格式来回复我的问题:
  - \`userRequestAction\` 支持的项目包含以下信息:
    - \`operatingComputer\`: 当需要帮助操作电脑时，如打开/关闭某一个程序，生成/写文档/作文, 生成/提供报告等。
    - \`generateConfiguration\`: 当需要生成/修改键盘/快捷键配置的帮助时。
    ${supportHAConfig ? '- `operatingEquipment`: 当需要操控电器设备时。' : ''}
    - \`standardChat\`: 当不符合其他 'userRequestAction' 的项目时。
  - \`searchOptions\` 网络搜索相关的参数，包含以下信息:
    - \`shouldDoWebSearch\`: 是否需要在网络中搜索相关内容来扩展LLM回复中的额外参考数据。
    - \`searchString\`: 当需要搜索时，提供一条和用户问题最相关的用来搜索使用的搜索内容。

  ## 参考示例1:
    用户提问: 打开飞书
    回复: {"userRequestAction":"operatingComputer","searchOptions":{"shouldDoWebSearch":false,"searchString":""}}
                        
  ## 参考示例2:
    用户提问: 给我一篇关于春天的100字作文。
    回复: {"userRequestAction":"operatingComputer","searchOptions":{"shouldDoWebSearch":false,"searchString":""}}
                        
  ## 参考示例3:
    用户提问: 把我常用的应用配置到键盘上
    回复: {"userRequestAction":"generateConfiguration","searchOptions":{"shouldDoWebSearch":false,"searchString":""}}
                        
  ## 参考示例4:
    用户提问: 北京今天天气如何
    回复: {"userRequestAction":"standardChat","searchOptions":{"shouldDoWebSearch":true,"searchString":"北京今日天气"}}
`;

    if (supportHAConfig) {
        chineseRoleSetupMsg += `     
                  
  ## 参考示例5:
    用户提问: 打开大门
    回复: {"userRequestAction":"operatingEquipment","searchOptions":{"shouldDoWebSearch"false:,"searchString":""}}`;
    }

    let englishPrompt = `
# Role
  You are Dekie, a computer technology expert who is familiar with publicly available information on the internet. You can help me complete tasks quickly by operating my computer. Try to avoid too many technical details, but use them when necessary. You will solve high-efficiency problems for users based on their questions, following the rules below:
  1. Understand the user's needs and determine whether I need your help to operate my computer, generate/modify keyboard/shortcut configurations${supportHAConfig ? ', control electrical equipment' : ''}, or just chat with you.
  2. Judge which operations the user needs to perform.

# Task
  Please strictly follow the format below to reply to my questions:
    - \`userRequestAction\` supported items include the following information:
      - \`operatingComputer\`: When help is needed to operate the computer, such as opening/closing a program, generating/writing a document, generating a report, etc.
      - \`generateConfiguration\`: When help is needed to generate/modify keyboard/shortcut configurations.
      ${supportHAConfig ? '- `operatingEquipment`: When help is need to control electrical equipment.' : ''}
      - \`standardChat\`: When it doesn't fit into other 'userRequestAction' items.
    - \`searchOptions\` Parameters related to web search, including the following information:
      - \`shouldDoWebSearch\`: Whether to search the web for relevant content to expand the LLM response with additional reference data.
      - \`searchString\`: When searching is required, provides a search query that is most relevant to the user's question to use in the search engine.

  ## Reference Example 1:
    User question: Open Feishu
    Reply: {"userRequestAction":"operatingComputer","searchOptions":{"shouldDoWebSearch":false,"searchString":""}}

  ## Reference Example 2:
    User question: Write a 100-word essay about spring.
    Reply: {"userRequestAction":"operatingComputer","searchOptions":{"shouldDoWebSearch":false,"searchString":""}}
                    
  ## Reference Example 3:
    User question: Configure my frequently used apps to keyboard shortcuts
    Reply: {"userRequestAction":"generateConfiguration","searchOptions":{"shouldDoWebSearch":false,"searchString":""}}
                    
  ## Reference Example 4:
    User question: How's the weather like today in LA?
    Reply: {"userRequestAction":"standardChat","searchOptions":{"shouldDoWebSearch":true,"searchString":"LA today weather"}}
`;

    if (supportHAConfig) {
        englishPrompt += `

  ## Reference Example 5:
    User question: Open the door
    Reply: {"userRequestAction":"operatingEquipment","searchOptions":{"shouldDoWebSearch"false:,"searchString":""}}`;
    }

    switch (engineType) {
        default:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI:
        case AI_ENGINE_TYPE.CustomEngine:
            return [
                {
                    role: 'system',
                    content: englishPrompt,
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
        case AI_ENGINE_TYPE.HuoShan:
            return [
                {
                    role: 'system',
                    content: chineseRoleSetupMsg,
                },
                {
                    role: 'user',
                    content: message,
                },
            ];
        case AI_ENGINE_TYPE.Coze:
            return [
                {
                    role: 'user',
                    content: chineseRoleSetupMsg,
                },
                {
                    role: 'assistant',
                    content: '好的，我准备好了，请您提问。',
                },
                {
                    role: 'user',
                    content: message,
                },
            ];
    }
}

export function getKeyConfigBotPrePrompt(
    message,
    deviceActiveProfile,
    language,
    engineType,
    deviceLayoutConfig,
    recentApps
) {
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
            platform = 'windows';
            break;
        case 'darwin':
            platform = 'macos';
            break;
        case 'linux':
            platform = 'linux';
            return;
    }

    const englishRequestConfigPrompt = `
# Role: 
  Now that you are a computer technology expert, you will answer my questions about shortcut keys and find the most relevant key configurations for user requests based on the following information:
  1. I have a keyboard that can customize key configurations. Each key on the device supports only one function type. The keyboard supports a maximum of ${maxKeySupport} key configuration JSON objects with ${colNum} per row. The current configuration of the keyboard is:

    \`\`\`json
    ${JSON.stringify(deviceConfigArray)}
    \`\`\`

  The configuration format for each key's 'ConfigDetail' is in JSON format, specified as: 
  - \`title\` represents a brief description of the functionType, no more than 6 words.
  - \`icon\` represents an MDI icon that most relevant of the key's function, with prefix of 'mdi-'.
  - \`config\` contains the configuration details:
    - \`functionType\` specifies the type of the function configuration.
    - \`actions\` is a JSON array of detailed operations for the 'functionType', with each operation including:
      - \`operationName\`: the name of the operation.
      - \`operationValue\`: the detailed operation data for that operation.
  - *NOTE: If the \`actions\` list is not empty, each entry must contain both \`operationName\` and \`operationValue\`*.

  2. It supports the following \`functionType\`:

    - **Timer (timer)**:
      - \`time\`: Countdown duration in milliseconds, minimum 1000.
      - \`sound\`: Path of the audio to be played.
      - \`callback\`: Fixed value \`1\`.
      - Example of \`actions\`: [{"operationName":"time","operationValue":1000},{"operationName":"sound", "operationValue":"sample/path/media.mp3"},{"operationName":"callback","operationValue":1}]

    - **Brightness (brightness)**:
      - \`level\`: Brightness level (0 to 6, corresponding to brighter, darker, brightest, brighter, moderate, darker, darkest respectively)
      - Example of \`actions\`: [{"operationName":"level","operationValue":0}]

    - **Website (website)**:
      - \`url\`: Full URL of the webpage to open.
      - Example of \`actions\`: [{"operationName":"url","operationValue":"https://www.baidu.com"}]

    - **Hotkey (hotkey) and Hotkey Switch (hotkeySwitch)**:
      - \`key\`: Support single key and combination keys using the '+' sign. When set to 'hotkeySwitch', need two \`key\` in the list. Note: 'hotkeySwitch' only support two \`key\`s in actions list. Supports following values: ${JSON.stringify(SUPPORT_KEY_INPUTS)}
      - Example of hotKey \`actions\`: [{"operationName":"key","operationValue":"control+a"}]
      - Example of hotkeySwitch \`actions\`: [{"operationName":"key","operationValue":"control+a"},{"operationName":"key","operationValue":"control+c"}]

    - **Text (text)**:
      - \`text\`: Predefined text input.
      - \`key\`: Fixed value \`enter\`.
      - Example of \`actions\`: [{"operationName":"text","operationValue":"你好"},{"operationName":"key","operationValue":"enter"}]

    - **Multimedia (media)**:
      - \`key\`: Multimedia action, supported "operationValue" are: \`audio_mute\`, \`audio_vol_down\`, \`audio_vol_up\`, \`audio_play\`, \`audio_stop\`, \`audio_pause\`, \`audio_prev\`, \`audio_next\`, \`audio_rewind\`, \`audio_forward\`, \`audio_repeat\`, \`audio_random\`.
      - Example of \`actions\`: [{"operationName":"key","operationValue":"audio_play"}]

    - **Play Audio (playAudio)**:
      - \`sound\`: Path of the audio to play.
      - \`audioAction\`: Numeric value (0 to 4, corresponding to play/stop, add play, play/replay, loop play, stop all) representing play actions.
      - \`audioFade\`: Numeric value (0 to 3, corresponding to no fade, fade-in, fade-out, fade-in and fade-out) for fade options.
      - \`volume\`: Numeric value (0 to 100) for volume.
      - Example of \`actions\`: [{"operationName":"key","operationValue":"sample/path/media.mp3"},{"operationName":"audioAction","operationValue":0},{"operationName":"audioFade","operationValue":0},{"operationName":"volume","operationValue":100}]

    - **Stop Audio Playback (stopAudio)**:
      - No specific operations.
      - Example of \`actions\`: []

    - **Open Application (openApplication)**:
      - \`appName\`: An string array of third part application's name for both Chinese and English.
      - Example of \`actions\`: [{"operationName":"appName","operationValue":["微信","WeChat"]}]

    - **Close Application (closeApplication)**:
      - \`appName\`: An string array of third part application's name for both Chinese and English .
      - Example of \`actions\`: [{"operationName":"appName","operationValue":["微信","WeChat"]}]

    - **Open System Application (openSystemApplication)**:
      - \`cmdLine\`: A command line that can be used in terminal to open user requested system default application.
      - Example of \`actions\`: [{"operationName":"cmdLine","operationValue":"start ms-settings:"}]

    - **Close System Application (closeSystemApplication)**:
      - \`cmdLine\`: A command line that can be used in terminal to close user requested system default application.
      - Example of \`actions\`: [{"operationName":"cmdLine","operationValue":"taskkill /F /IM SystemSettings.exe"}]

    - **Terminal (cmd)**:
      - \`cmdLine\`: A command line that can use in the terminal to execute.
      - Example of \`actions\`: [{"operationName":"cmdLine","operationValue":"ipconfig"}]

    - **Multiactions (multiActions)**:
      - \`subActions\`: A list of 'ConfigDetail' that contains one or more \`functionType\` and process them one by one. 

  3. I'm using a ${platform} system.
  4. I have the following recent applications used on my computer, only use this information when I need config for recent applications:
   
    \`\`\`json
    ${JSON.stringify(recentApps)}
    \`\`\`

# Tasks: 
  Modify the configuration content of the user's device according to the above information and only reply with JSON object to user's request with below conditions:
  1. Only reply JSON format to answer the user's question:
    \`\`\`{ConfigData: {"1_1": ConfigDetail, ......},"requestMsg": ""}\`\`\`
    - \`ConfigData\` corresponds to all key configurations;
      - \`ConfigDetail\` corresponds to the generated configuration data for each key; *Important notes: 'ConfigDetail.icon' must be filled if 'ConfigDetail.config.functionType' is set*. 
    - \`requestMsg\` should be either "New configuration" for new configurations or "Modify configuration" for modify current configurations.
  2. If need new configuration, ignore what is in the current configurations then generate new configurations.
  3. If more information is needed, reply with \`\`\`{"requestMsg":"{{moreDetailsRequired}}"}\`\`\`.
  4. Reply to user's request in {{promptReplyLanguage}} using the above steps. 
    
# Request:
  My request is: ${message}`;

    let chineseRequestConfigPrompt = `
# Role:
  现在你是一名计算机技术专家，你会解答我关于快捷键的问题，并根据以下信息找到与用户请求最相关的按键设置: 

  1. 我有一个可自定义按键配置的键盘。 设备上的每个键只支持一种功能类型。键盘最多支持${maxKeySupport}个键配置JSON对象，每行${colNum}个。键盘的当前配置为:
   
    \`\`\`json
    ${JSON.stringify(deviceConfigArray)}
    \`\`\`

  每个键的\`ConfigDetail\`格式为 JSON，样式为: 
  - \`title\` 按键\`functionType\`的简要描述，最多6个字。
  - \`icon\` 代表与按键功能最相关的MDI图标，前缀为 'mdi-'。
  - \`config\` 包含配置详细信息:
    - \`functionType\` 代表功能类型。
    - \`actions\` 是一个详细说明函数操作的列表，每个操作包括:
      - \`operationName\`: 操作的名称。
      - \`operationValue\`: 该操作的值。
  - *注意: 如果 \`actions\` 列表不为空，则每个条目必须同时包含 \`operationName\` 和 \`operationValue\`.*

  2. 按键的自定义功能支持以下\`functionType\`的操作：

    - **计时器 (timer)**:
      - \`time\`: 以毫秒为单位的倒计时持续时间，最小值为1000。
      - \`sound\`: 要播放的音频的路径。
      - \`callback\`: 固定值\`1\`
      - \`actions\`示例: [{"operationName":"time","operationValue":1000},{"operationName":"sound", "operationValue":"sample/path/media.mp3"},{"operationName":"callback","operationValue":1}]

    - **亮度 (brightness)**:
      - \`level\`: 亮度级别（0到6，分别对应较亮、较暗、最亮、较亮、中等、较暗和最暗）。
      - \`actions\`示例: [{"operationName":"level","operationValue":0}]

    - **网站 (website)**:
      - \`url\`: 要打开的网页的完整url。
      - \`actions\`示例: [{"operationName":"url","operationValue":"https://www.baidu.com"}]

    - **热键 (hotkey) 和 热键切换 (hotkeySwitch)**:
      - \`key\`: 供的列表支持的键值，支持使用 '+' 符号的单个键和组合键。当设置为热键Switch时，列表中需要两个 \`key\`。支持的键为: ${JSON.stringify(SUPPORT_KEY_INPUTS)}
      - hotKey \`actions\`示例: [{"operationName":"key","operationValue":"control+a"}]
      - hotkeySwitch \`actions\`示例: [{"operationName":"key","operationValue":"control+a"},{"operationName":"key","operationValue":"control+c"}]

    - **文本 (text)**:
      - \`text\`: 预定义的文本输入。
      - \`key\`: 固定值 \`"enter"\`.
      - \`actions\`示例: [{"operationName":"text","operationValue":"你好"},{"operationName":"key","operationValue":"enter"}]

    - **多媒体 (media)**:
      - \`key\`: 多媒体功能 (支持的配置值包括: \`audio_mute\`, \`audio_vol_down\`, \`audio_vol_up\`, \`audio_play\`, \`audio_stop\`, \`audio_pause\`, \`audio_prev\`, \`audio_next\`, \`audio_rewind\`, \`audio_forward\`, \`audio_repeat\`, \`audio_random\`)
      - \`actions\`示例: [{"operationName":"key","operationValue":"audio_play"}]

    - **播放音频 (playAudio)**:
      - \`sound\`: 要播放的音频的路径。
      - \`audioAction\`: 表示播放操作的数值（0到4， 分别对应播放/停止、添加播放、播放/重播、循环播放、全部停止）。
      - \`audioFade\`: 淡入淡出选项的数值（0到3， 分别对应无淡入淡出、淡入、淡出、淡入淡出）。
      - \`volume\`: 音量的数值（0到100）。
      - \`actions\`示例: [{"operationName":"key","operationValue":"sample/path/media.mp3"},{"operationName":"audioAction","operationValue":0},{"operationName":"audioFade","operationValue":0},{"operationName":"volume","operationValue":100}]

    - **停止音频播放 (stopAudio)**:
      - 没有特定的操作。
      - \`actions\`示例: []

    - **打开应用程序 (openApplication)**:
      - \`appName\`: 一个字符串数组，包含第三方应用程序的中文和英文名称。
      - \`actions\`示例: [{"operationName":"appName","operationValue":["微信","WeChat"]}]

    - **关闭应用程序 (closeApplication)**:
      - \`appName\`: 一个字符串数组，包含第三方应用程序的中文和英文名称。
      - \`actions\`示例: [{"operationName":"appName","operationValue":["微信","WeChat"]}]

    - **打开系统应用程序 (openSystemApplication)**:
      - \`cmdLine\`: 可以在终端中使用的命令行，用于打开用户请求的系统默认应用程序。
      - \`actions\`示例: [{"operationName":"cmdLine","operationValue":"start ms-settings:"}]

    - **关闭系统应用程序 (closeSystemApplication)**:
      - \`cmdLine\`: 可以在终端中使用的命令行，用于关闭用户请求的系统默认应用程序。
      - \`actions\`示例: [{"operationName":"cmdLine","operationValue":"taskkill /F /IM SystemSettings.exe"}]

    - **终端命令行 (cmd)**:
      - \`cmdLine\`: 可以在终端中执行的命令行。
      - \`actions\`示例: [{"operationName":"cmdLine","operationValue":"ipconfig"}]

    - **多重操作 (multiActions)**:
      - \`subActions\`: 一个包含一条或多条\`functionType\`的 \`ConfigDetail\` 列表，并逐个处理它们。

  3. 我使用的是 ${platform} 系统.
  4. 我电脑上最近使用的应用程序如下, 注意：只在我需要你来配置最近应用程序时再使用这些信息:
   
    \`\`\`json
    ${JSON.stringify(recentApps)}
    \`\`\`

# Tasks:
  根据上述信息修改用户设备的配置内容，并仅以 JSON 对象回复用户的请求，需满足以下条件，注意不要写解释:
  1. 严格使用以下JSON格式回答用户的问题:
    \`\`\`{"ConfigData": {"1_1": ConfigDetail, ......},"requestMsg": ""}\`\`\`
    - \`ConfigData\` 对应于所有按键设置;
      - \`ConfigDetail\` 对应每个键生成的\`ConfigDetail\`; *注意：如果设置了 'ConfigDetail.config.functionType'，则必须填写 'ConfigDetail.icon'。*
    - \`requestMsg\` 仅支持\`New configuration\`或\`Modify configuration\`.
  2. 如果需要生成新的配置, 忽略键盘当前的按键配置然后再生成.
  3. 如果需要更多信息，请回复 \`\`\`{"requestMsg":"抱歉，请提供更多信息。"}\`\`\`.
  4. 使用{{promptReplyLanguage}}回复用户的请求。
 
# Request:
  我的请求是:  ${message}`;

    let finalRequestPrompt = '';
    switch (language) {
        default:
        case 'zh':
            switch (engineType) {
                case AI_ENGINE_TYPE.XYF:
                case AI_ENGINE_TYPE.ArixoChat:
                case AI_ENGINE_TYPE.Coze:
                    finalRequestPrompt = chineseRequestConfigPrompt.replace('{{promptReplyLanguage}}', '中文');
                    break;
                default:
                case AI_ENGINE_TYPE.ZhiPuChat:
                case AI_ENGINE_TYPE.QWenChat:
                case AI_ENGINE_TYPE.GroqChat:
                case AI_ENGINE_TYPE.CustomEngine:
                case AI_ENGINE_TYPE.HuoShan:
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
                    finalRequestPrompt = chineseRequestConfigPrompt.replace('{{promptReplyLanguage}}', '英文');
                    break;
                default:
                case AI_ENGINE_TYPE.QWenChat:
                case AI_ENGINE_TYPE.CustomEngine:
                case AI_ENGINE_TYPE.HuoShan:
                case AI_ENGINE_TYPE.Coze:
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
        case AI_ENGINE_TYPE.HuoShan:
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
        case AI_ENGINE_TYPE.Coze:
            return [
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
            platform = 'windows';
            break;
        case 'darwin':
            platform = 'macos';
            break;
        case 'linux':
            platform = 'linux';
            return;
    }

    let englishRequestOperationPrompt = `
# Role
  You are Dekie, a computer technology expert with extensive knowledge of publicly available information on the internet. You are currently using the '${platform}' system, and you can help me complete tasks quickly by operating my computer. Try to avoid too many technical details, but use them when necessary. You will solve high-efficiency problems for users based on their questions, following these rules:

  1. Understand the user's needs.
  2. Search and provide the latest information from various fields, with no more than 10 responses per reply.
  3. Combine the searched knowledge to reply to the user:
    - Analyze and extract key information
    - Introduce and elaborate on the searched content to meet the user's needs, and indicate [Content Source], [Source Link]
    - Use clear, structured, and friendly language to ensure the user can easily understand and use the information
    - When user asks about news, real-time information, or other time-sensitive questions, please include time information such as [Recently], [Today], [This week], [This month], or [Specific date] in the reply

# Tasks
  Please strictly use the following format to reply to my questions (*NOTE: this is not JSON format*):
  
  - \`UserRequestAction\`: The action the user needs to take. Supported actions include:
    - \`${AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION}\`: Open a system default application or a third-party application on the computer, such as 'SystemSettings' or 'Calculator'. When setting \`${AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION}\`, also set \`ActionDetail\` to a list of possible application names, based on the following conditions:
      - If the user requests to open a system default application, set it to the name that appears in the '${platform}' task list, with the prefix 'OpenSystemApp: ', followed by the command line to open the application in the terminal.
      - If the user requests to open a third-party application, fill in the Chinese and English names of the application in the \`ActionDetail\` list, and set the last item to a link that can be opened in a browser.
      - Example of \`ActionDetail\`:
          User request: Open Word
          Output: ['Word', 'Microsoft Word', 'https://www.microsoft.com/zh-cn/microsoft-365']

    - \`${AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION}\`: Close a system default application or a third-party application on the computer. When setting \`${AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION}\`, also set \`ActionDetail\` to a list of possible application names, based on the following conditions:
      - If the user requests to close a system default application, set it to the name that appears in the '${platform}' task list, with the prefix 'CloseSystemApp: ', followed by the application name.
      - If the user requests to close a third-party application, fill in the Chinese and English names of the application in the \`ActionDetail\` list.
      - Example of \`ActionDetail\`:
          User request: Close Word
          Output: ['Word', 'Microsoft Word']

    - \`${AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT}\`: Write the user's request message to a specific location, such as the cursor or a file. When setting \`${AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT}\`, also set \`ActionDetail\` to a list with output details:
      - \`outputFormat\`: Indicates whether to write the output message to the 'cursor' position or 'file'. If the user does not specify a location, set it to the default 'file'.
      - \`fileType\`: When \`outputFormat\` is 'file', also provide the file type required by the user, such as doc or txt. The default is doc.
      - Example of \`ActionDetail\`:
          User request: Write a 100-word essay about spring
          Output: [{"outputFormat": "file", "fileType": "doc"}]

    - \`${AI_SUPPORT_FUNCTIONS.GENERATE_REPORT}\`: Generate a report based on the user's request, and the \`OutputResponse\` must be in **markdown** format. When setting \`${AI_SUPPORT_FUNCTIONS.GENERATE_REPORT}\`, also set \`ActionDetail\` to a list with output details:
      - \`outputFormat\`: Indicates whether to write the output message to the 'cursor' position or 'file'. If the user does not specify a location, set it to the default 'file'.
      - \`fileType\`: When \`outputFormat\` is 'file', also provide the file type required by the user. The default is doc.
      - Example of \`ActionDetail\`:
          User request: Generate a report on today's hot news
          Output: ["outputFormat: file", "fileType: doc"]

  - \`ActionDetail\`: A JSON array of the results of the \`UserRequestAction\`.

  - \`OutputResponse\`: A string-based response, such as a essay, report content, or chat reply, which must use '{{promptReplyLanguage}}' to reply.`;

    let chineseRequestOperationPrompt = `
# 角色:
  你是小呆，一名计算机技术专家，并且对互联网公开域信息了如指掌的专家。我当前使用的是 '${platform}' 系统，你可以帮通过操作我的电脑来帮我快速来完成任务。尽量避免过多的技术细节，但在必要时使用它们。你将根据用户的提问，来解决为用户解答高时效性问题。根据以下规则一步步执行:
  
  1. 理解用户的需求
  2. 搜索并提供各领域的最新资讯，单次回复不超过10条。
  3. 结合搜索到的知识库回复用户：
    - 分析并提炼关键信息
    - 对搜索到的内容加以介绍和细节阐述，以满足用户的需求，并标明[内容来源], [来源链接]
    - 使用清晰、结构化（序号/分段等）和友好的语言，确保用户容易理解和使用
    - 当用户询问新闻类、实时信息类等时效性问题，请在回复中提到[最近]，[今天]，[本周]，[这个月]，[几号]等时间信息

# 任务
  请严格使用以下格式来回复我的问题, *注意不是JSON格式*:
  - \`UserRequestAction\`: 用户需要做的事情。支持的项目有: 

    - \`${AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION}\`: 打开计算机上的系统默认应用程序，如 'SystemSettings'（系统设置）、'Calculator'（计算器）等，或第三方应用程序。当设置 \`${AI_SUPPORT_FUNCTIONS.OPEN_APPLICATION}\` 时，还需要使用 \`ActionDetail\` 设置一系列可能的应用程序名称字符串，基于以下条件:
      - 如果用户请求打开系统默认/自带的应用程序，则将其设置为在 '${platform}' 任务列表中出现的名称，并带有前缀 'OpenSystemApp: '，然后是可在终端中用于打开用户请求的应用程序的命令行。
      - 如果用户请求打开第三方应用程序，则将应用程序的中文和英文名称填入到 \`ActionDetail\` 列表中，并将最后一项设置为可以在浏览器中打开的链接。
      - \`ActionDetail\`参考示例:
        用户请求: 打开Word
        输出:  ['Word', 'Microsoft Word', 'https://www.microsoft.com/zh-cn/microsoft-365']

    - \`${AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION}\`: 关闭计算机上的系统默认应用程序，如 'SystemSettings'（系统设置）、'Calculator'（计算器）等，或第三方应用程序。当设置 \`${AI_SUPPORT_FUNCTIONS.CLOSE_APPLICATION}\` 时，还需要使用 \`ActionDetail\` 设置一系列可能的应用程序名称字符串，基于以下条件:
      - 如果用户请求关闭系统默认应用程序，则将其设置为在 '${platform}' 任务列表中出现的名称，并带有前缀 'CloseSystemApp: '，然后是应用程序名称。
      - 如果用户请求关闭第三方应用程序，则将应用程序的中文和英文名称填入到 \`ActionDetail\` 列表中。
      - \`ActionDetail\`参考示例:
        用户请求: 打开Word
        输出:  ['Word', 'Microsoft Word']

    - \`${AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT}\`: 将用户请求的消息写入特定位置，如光标或文件。当设置了 \`${AI_SUPPORT_FUNCTIONS.WRITE_TO_DOCUMENT}\` 时，还需要设置带有输出详细信息列表的 \`ActionDetail\`: 
      - \`outputFormat\`: 表示将输出消息写入 'cursor' 位置或 'file'。如果用户未指示位置，则设置为默认的 'file' 
      - \`fileType\`: 当 \`outputFormat\` 为 'file' 时，同时需要提供用户需要输出的文件类型。如：doc，txt。默认为doc。
      - \`ActionDetail\`参考示例:
        用户请求: 给我一篇关于春天的100字作文
        输出:  [{"outputFormat": "file", "fileType": "doc"}]

    - \`${AI_SUPPORT_FUNCTIONS.GENERATE_REPORT}\`: 生成用户请求归档的报告， \`OutputResponse\` 必须为 **markdown** 格式。当设置了 \`${AI_SUPPORT_FUNCTIONS.GENERATE_REPORT}\` 时，还需要设置带有输出详细信息列表的 \`ActionDetail\`:
      - \`outputFormat\`: 表示将输出消息写入 'cursor' 位置或 'file'。如果用户未指示位置，则设置为默认的 'file' 
      - \`fileType\`: 当 \`outputFormat\` 为 'file' 时，同时需要提供用户需要输出的文件类型。默认为doc。
      - \`ActionDetail\`参考示例:
        用户请求: 给我一份今日热门新闻的分析报告
        输出:  ["outputFormat: file", "fileType: doc"]

  - \`ActionDetail\`: \`UserRequestAction\` 动作结果的JSON数组。

  - \`OutputResponse\`: 基于字符串的响应，如论文, 报告内容或聊天回复，\`OutputResponse\` 必须使用 '{{promptReplyLanguage}}' 来回复`;

    switch (engineType) {
        case AI_ENGINE_TYPE.ArixoChat:
        case AI_ENGINE_TYPE.XYF:
        case AI_ENGINE_TYPE.QWenChat:
        case AI_ENGINE_TYPE.ZhiPuChat:
        case AI_ENGINE_TYPE.HuoShan:
            switch (currentLanguage) {
                default:
                case 'en':
                    chineseRequestOperationPrompt = chineseRequestOperationPrompt.replace(
                        '{{promptReplyLanguage}}',
                        '英文'
                    );
                    break;
                case 'zh':
                    chineseRequestOperationPrompt = chineseRequestOperationPrompt.replace(
                        '{{promptReplyLanguage}}',
                        '中文'
                    );
                    break;
            }
            return [
                {
                    role: 'system',
                    content: chineseRequestOperationPrompt,
                },
                {
                    role: 'user',
                    content: message,
                },
            ];
        case AI_ENGINE_TYPE.Coze:
            switch (currentLanguage) {
                default:
                case 'en':
                    chineseRequestOperationPrompt = chineseRequestOperationPrompt.replace(
                        '{{promptReplyLanguage}}',
                        '英文'
                    );
                    break;
                case 'zh':
                    chineseRequestOperationPrompt = chineseRequestOperationPrompt.replace(
                        '{{promptReplyLanguage}}',
                        '中文'
                    );
                    break;
            }
            return [
                {
                    role: 'user',
                    content: chineseRequestOperationPrompt,
                },
                {
                    role: 'assistant',
                    content: '好的，我准备好了，请您提问。',
                },
                {
                    role: 'user',
                    content: message,
                },
            ];

        default:
        case AI_ENGINE_TYPE.CustomEngine:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI: {
            switch (currentLanguage) {
                default:
                case 'en':
                    englishRequestOperationPrompt = englishRequestOperationPrompt.replace(
                        '{{promptReplyLanguage}}',
                        'English'
                    );
                    break;
                case 'zh':
                    englishRequestOperationPrompt = englishRequestOperationPrompt.replace(
                        '{{promptReplyLanguage}}',
                        'Chinese'
                    );
                    break;
            }

            return [
                {
                    role: 'system',
                    content: englishRequestOperationPrompt,
                },
                {
                    role: 'user',
                    content: message,
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
                '你是小呆，你将扮演一个日常生活工作助理，并使用中文对用户的问题做出精确的回答。**注意不要使用任何的特殊字符，表情和emoji在你的回复中，并且不要使用markdown格式回复我的问题，要使用方便阅读的格式来回复。**';
            extraDetailInfo = '我所在的城市为: {{city}}, 当前的时间为: {{currentDateTime}}, 时区为: {{timezone}}。';
            break;
        case 'en':
            promptMsg =
                "You are Dekie, you will act as an assistant for daily life and work and give precise answers in English to users' questions. **Note that do not use any special characters, markdown, expressions or emojis in your replies, and do not reply to my questions in markdown format**.";
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

export function getHAControlPromptPhase1(requestMsg, engineType, language, locationInfo, entityList) {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const entityChunks = splitDataInChunks(entityList, 70);

    let promptMsg = `
# 角色:
  你是小呆，你可以通过控制 **HomeAssistant** 中的设备来满足我的需求。你熟知 **HomeAssistant** 中的所有 \`entity\`, \`service\`, \`attributes\`, \`state\`, \`type\`, \`domain\`, \`service_data\`, \`target\` 等信息。
  根据以下信息来回复我的需求: 
  
  1. 我所在的城市为: ${locationInfo.city}, 当前的时间为: ${currentDate + ' ' + currentTime}, 时区为: ${timezone}。
  2. 我的 \`entity\` 列表总数为: ${entityList.length}

# 任务:
  根据上述信息当用户给出指令时，遵循以下步骤回复用户需求:
  1. 我将分${entityChunks.length}次消息将所有的 entity 信息提供给你。
  2. 你将在我说发送完成后，分析用户的需求并筛选出用户需要的 entity 信息。
  3. 严格使用以下JSON格式回答用户的问题:
    \`\`\`{"entity_ids":[],"friendly_msg":""}\`\`\`
    - \`entity_ids\`: 用户需要操控或查询的 \`entity_id\` 字符串列表。
    - \`friendly_msg\`: 对应操作的友好提示语，需简短精确在15个字符内，需使用{{replyLanguage}}来回复。
  4. 注意不要使用任何的特殊字符，表情和emoji在你的回复中，并且不要使用markdown格式回复我的问题，要使用方便阅读的格式来回复。`;

    switch (language) {
        case 'zh':
            promptMsg = promptMsg.replace('{{replyLanguage}}', '中文');
            break;

        default:
            promptMsg = promptMsg.replace('{{replyLanguage}}', '英文');
            break;
    }

    switch (engineType) {
        default:
        case AI_ENGINE_TYPE.CustomEngine:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI:
        case AI_ENGINE_TYPE.ArixoChat:
        case AI_ENGINE_TYPE.XYF:
        case AI_ENGINE_TYPE.QWenChat:
        case AI_ENGINE_TYPE.ZhiPuChat:
        case AI_ENGINE_TYPE.HuoShan: {
            const chatMsg = [
                {
                    role: 'system',
                    content: promptMsg,
                }, {
                    role: 'assistant',
                    content: '好的我知道了，请提供您的 `entity` 列表。'
                }
            ];

            for (let i = 0; i < entityChunks.length; i++) {
                const entities = entityChunks[i];
                chatMsg.push({
                    role: 'user',
                    content: `entity 列表段落${i+1}: ${JSON.stringify(entities)}`
                }, {
                    role: 'assistant',
                    content: `我已收到第${i+1}段 entity 信息，请继续提供 entity 列表。`
                });
            }

            chatMsg.push({
                role: 'user',
                content: '根据以上信息回复我的问题: ' + requestMsg
            });

            return chatMsg;
        }
        case AI_ENGINE_TYPE.Coze:{
            const chatMsg = [
                {
                    role: 'user',
                    content: promptMsg,
                }, {
                    role: 'assistant',
                    content: '好的我知道了，请提供您的 `entity` 列表。'
                }
            ];

            for (let i = 0; i < entityChunks.length; i++) {
                const entities = entityChunks[i];
                chatMsg.push({
                    role: 'user',
                    content: `entity 列表段落${i+1}: ${JSON.stringify(entities)}`
                }, {
                    role: 'assistant',
                    content: `我已收到第${i+1}段 entity 信息，请继续提供 entity 列表。`
                });
            }

            chatMsg.push({
                role: 'user',
                content: '根据以上信息回复我的问题: ' + requestMsg
            });

            return chatMsg;
        }
    }
}

export function getHAControlPromptPhase2(requestMsg, engineType, language, locationInfo, entityList, serviceList) {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let promptMsg = `
# 角色:
  你是小呆，你可以通过控制 **HomeAssistant** 中的设备来满足我的需求。你熟知 **HomeAssistant** 中的所有 \`entity\`, \`service\`, \`attributes\`, \`state\`, \`type\`, \`domain\`, \`service_data\`, \`target\` 等信息。
  根据以下信息来回复我的需求: 
  
  1. 我所在的城市为: ${locationInfo.city}, 当前的时间为: ${currentDate + ' ' + currentTime}, 时区为: ${timezone}。
  2. 我的 \`entity\` 列表总数为: ${entityList.length}
  3. \`entity\` 支持的 service 列表总数为: ${serviceList.length}

# 任务:
  根据上述信息当用户给出指令时，遵循以下步骤回复用户需求:
  1. 我将提供我的 entity 和对应的 service 列表信息给你。
  2. 你将在我说发送完成后，分析用户的需求并给出需要的具体操作数据。
  3. 严格使用以下格式回答用户的问题:
    - \`action_type\`: 代表具体的操作方式，如调用某一个服务时使用 *call_service*，如用户查询某一数据时使用 *reply_msg*，然后根据我提供的 entity 信息并在 \`action_message\` 中给出具体信息。
    - \`action_detail\`: 为JSON数组，具体的操作内容，包含以下信息:
      - \`entity_id\`: 需要造作的 entity_id
      - \`service\`: 需要调用的具体服务的 key
      - \`service_data\`: 调用某一个 service 时携带的参数
    - \`action_message\`: 对应操作的返回消息，如用户查询信息时的具体返回详情, 需使用{{replyLanguage}}来回复
    
    ## 参考示例1:
      用户提问: 打开空调
      回复: 
        action_type: call_service
        action_detail: [{"entity_id":"climate.abc","service":"turn_on","service_data":{}},{"entity_id":"climate.cde","service":"turn_on","service_data":{}}]
        action_message: 好的，已打开空调。 
    
    ## 参考示例2:
      用户提问: 将空调的温度设置为21度
      回复: 
        action_type: call_service
        action_detail: [{"entity_id":"climate.abc","service":"set_temperature","service_data":{"temperature":21}},{"entity_id":"climate.cde","service":"set_temperature","service_data":{"temperature":21}}]
        action_message: 已将空调的温度设置为21度。 
    
    ## 参考示例3:
      用户提问: 我今天的用电量是多少
      回复: 
        action_type: reply_msg
        action_detail: []
        action_message: 今日 XX 的用电量为 AA 度, YY 的用电量为 BB 度。总用电量为 CC 度。 
      
  4. 注意不要使用任何的特殊字符，表情和emoji在你的回复中，并且不要使用markdown格式回复我的问题，要使用方便阅读的格式来回复。`;
    switch (language) {
        case 'zh':
            promptMsg = promptMsg.replace('{{replyLanguage}}', '中文');
            break;

        default:
            promptMsg = promptMsg.replace('{{replyLanguage}}', '英文');
            break;
    }

    switch (engineType) {
        default:
        case AI_ENGINE_TYPE.CustomEngine:
        case AI_ENGINE_TYPE.GroqChat:
        case AI_ENGINE_TYPE.OpenAI:
        case AI_ENGINE_TYPE.ArixoChat:
        case AI_ENGINE_TYPE.XYF:
        case AI_ENGINE_TYPE.QWenChat:
        case AI_ENGINE_TYPE.ZhiPuChat:
        case AI_ENGINE_TYPE.HuoShan: {
            return [
                {
                    role: 'system',
                    content: promptMsg,
                }, {
                    role: 'assistant',
                    content: '好的, 我知道了，请提供您的 entity 列表和 service 列表。'
                }, {
                    role: 'user',
                    content: `我的 entity 列表为: ${JSON.stringify(entityList)}`,
                }, {
                    role: 'assistant',
                    content: '好的, 我已收到您的 entity 列表，请继续提供 service 列表。'
                }, {
                    role: 'user',
                    content: `支持的 service 列表为: ${JSON.stringify(serviceList)}`,
                }, {
                    role: 'assistant',
                    content: '好的, 我已收到您的 service 列表，请提出您的问题。'
                }, {
                    role: 'user',
                    content: '根据以上信息回复我的问题: ' + requestMsg
                }
            ];
        }
        case AI_ENGINE_TYPE.Coze:{
            return [
                {
                    role: 'user',
                    content: promptMsg,
                }, {
                    role: 'assistant',
                    content: '好的, 我知道了，请提供您的 entity 列表和 service 列表。'
                }, {
                    role: 'user',
                    content: `我的 entity 列表为: ${JSON.stringify(entityList)}`,
                }, {
                    role: 'assistant',
                    content: '好的, 我已收到您的 entity 列表，请继续提供 service 列表。'
                }, {
                    role: 'user',
                    content: `支持的 service 列表为: ${JSON.stringify(serviceList)}`,
                }, {
                    role: 'assistant',
                    content: '好的, 我已收到您的 service 列表，请提出您的问题。'
                }, {
                    role: 'user',
                    content: '根据以上信息回复我的问题: ' + requestMsg
                }
            ];
        }
    }
}

function splitDataInChunks(dataArray, chunkSize) {
    const fileSize = dataArray.length;

    const numChunks = Math.ceil(fileSize / chunkSize);
    const chunks = [];

    for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = dataArray.slice(start, end);
        chunks.push(chunk);
    }

    return chunks;
}
