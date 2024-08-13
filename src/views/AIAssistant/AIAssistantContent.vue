<template>
    <div>
        <div class="chat-header">
            <img :src="historyImg" :style="{ cursor: AIStatus === 1 ? 'not-allowed' : 'pointer' }" :title="$t('history')" @click="historyBtn" />
            <img :src="configImg" :title="$t('settings.aiModelSetting')" @click="cinfigBtn" />
        </div>

        <!-- 聊天 -->
        <div>
            <el-scrollbar ref="scrollbar" :style="{ height: windowHeight + 'px' }">
                <div @click="reset" :style="{ height: windowHeight + 'px' }">
                    <div id="selectable-text">
                        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
                        <div class="chat-container" v-for="(message, index) in message" :key="index" v-if="message.role !== 'system'" @mouseenter="enterInto(index)" @mouseleave="leaveOut(index)">

                            <div :style="{maxWidth: (windowWidth - 120) + 'px'}" v-if="message.role === 'user'" class="message-received">
                                <div class="chat-user message">
                                    <div v-if="editIndex && index === editIndex" class="user-input">
                                        <el-input :autosize="{ minRows: 1, maxRows: 6}" @input="changeUserMessage($event, index)" resize="none" type="textarea" v-model="message.content"></el-input>
                                        <img class="send-img" :src="sendImg" :title="$t('send')" @click="confirmUserContent(index)" :style="{ cursor: AIStatus === 1 ? 'not-allowed' : 'pointer' }" />
                                        <i class="el-icon-close" @click="cancelUserContent"></i>
                                    </div>

                                    <span v-else>
                                        {{ message.content}}
                                    </span>
                                </div>

                                <div class="message-operate" v-if="hoverIndex === index && !editIndex">

                                    <el-button @click="copyMessageBtn(message.content)" type="text" icon="el-icon-document-copy">{{ $t('settings.copy') }}</el-button>
                                    <i v-if="userMaxIndex === hoverIndex" @click="editUserContent(index)" class="el-icon-edit"></i>
                                    <i @click="deleteMessageBtn(index)" class="el-icon-delete"></i>
                                </div>
                            </div>

                            <div class="div-assistant" v-if="message.role === 'assistant'">

                                <div class="message-assistant">
                                    <span class="chat-role-assistant">
                                        <i class="el-icon-loading" v-if="AIStatus === 1 && message.requestId"></i>
                                        <span class="message message-sent" v-html="formater(message.content)"></span>
                                    </span>
                                </div>

                                <div v-if="index !==1" class="message-regenerate message-operate">
                                    <!-- <el-link v-if="AIStatus === 1 && message.requestId" @click="stopAssistant" :underline="false">停止生成</el-link> -->
                                    <template v-if="AIStatus !== 1">
                                        <span v-if="index === maxIndex || hoverIndex === index">
                                            <template>
                                                <span v-if="AIStatus === -1 && index === maxIndex" class="regenerate-fail">{{ $t('generationFailed')}}</span>
                                                <el-button v-else @click="copyMessageBtn(message.content)" type="text danger" icon="el-icon-document-copy">{{ $t('settings.copy') }}</el-button>
                                            </template>
                                            <i @click="regenerateMessage" :title="$t('regenerate')" v-if="index === maxIndex" class="el-icon-refresh"></i>
                                            <i @click="deleteMessageBtn(index)" class="el-icon-delete"></i>
                                        </span>
                                    </template>
                                </div>

                            </div>

                            <div v-for="(follow, index) in followUpList" :key="index" class="chat-more" @click="chatMoreBtn(follow)" v-if="AIStatus === 2 && message.requestId">
                                <el-tag>
                                    <span>{{ follow }}</span>
                                    <i class="el-icon-right"></i>
                                </el-tag>
                            </div>

                        </div>
                    </div>
                </div>
            </el-scrollbar>

            <!-- 发送 -->
            <div id="chat-bottom">
                <span class="new-chat" @click="addSessionBtn" :style="{ cursor: AIStatus === 1 ? 'not-allowed' : 'pointer' }">
                    <img class="add-chat" :src="addImg" />
                    <span>New Chat</span>
                </span>
                <div style="padding: 5px">
                    <div class="chat-input">
                        <div class="chat-file" v-if="fileList">
                            <el-tag closable @close="clearFileList">
                                {{ fileList }}
                            </el-tag>
                        </div>
                        <el-input id="sendInput" @focus="reset" resize="none" type="textarea" v-model="currentMessage" placeholder="通过shift + 回车换行, ">
                        </el-input>
                        <div class="chat-img">
                            <!-- <img class="printscreen-img" @click="captureScreen" title="截图" :src="printscreenImg" alt="" /> -->

                            <!-- <img class="select-img" @click="selectFileBtn" title="选择文件" :src="selectFileImg" alt="" /> -->

                            <img class="send-img" :src="sendImg" @click="sendBtn" :title="$t('send')" :style="{ cursor: AIStatus === 1 ? 'not-allowed' : 'pointer' }" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 配置 -->
        <div class="configForm" :style="{ display: isShow, top:'35px' }">
            <el-form label-width="120px" label-position="left">
                <el-form-item :label="$t('settings.aiEngineType')">

                    <el-cascader v-model="aiModelType" :options="aiModelTypeList" :props="{ expandTrigger: 'hover', children: 'models' }" :show-all-levels="false" @change="handleAIEngineChanged">
                        <template slot-scope="{ node, data }">
                            <template v-if="!node.isLeaf">
                                <span>{{ data.label }}</span>
                                <span> ({{ data.models.filter(item => !item.isAddAction).length }}) </span>
                            </template>
                        </template>
                    </el-cascader>

                    <el-button @click="aiModelconfigBtn" style="margin-left: 10px;" type="text">{{ $t('config')}}</el-button>
                </el-form-item>

                <template v-if="isShowSystemRole">
                    <el-form-item :label="$t('settings.customAIPromptRole')">
                        <el-switch v-model="useCustomPrompt" />
                    </el-form-item>

                    <el-form-item :label="$t('settings.aiPromptRole')" class="selectRole">
                        <el-select v-if="!useCustomPrompt" filterable v-model="systemRole" @change="aiSystemRoleChange">
                            <el-option v-for="item in supportedSystemRoles" :key="item.value" :label="item.role" :value="item.value" />
                        </el-select>

                        <el-input v-else v-model="systemRolePrompt" type="textarea" resize="none">
                        </el-input>
                    </el-form-item>
                </template>

                <el-form-item :label="$t('settings.rolePersonality')">
                    <el-slider v-model="top_p" :min="0" :max="1" :step="0.05" :marks="{ 0: $t('settings.personalityPrecise'), 1: $t('settings.personalityFlexible') }"></el-slider>
                </el-form-item>
                <el-form-item :label="$t('settings.responseQuality')">
                    <el-slider v-model="temperature" :min="0" :max="2" :step="0.05" :marks="{ 0: $t('settings.qualityConservative'), 2: $t('settings.qualityGibberish') }"></el-slider>
                </el-form-item>
            </el-form>
            <el-button @click="updateBtn" size="small" type="primary" style="float: right; margin-top: 10px">
                {{ $t('update') }}
            </el-button>
        </div>

        <!-- 聊天记录 -->

        <el-drawer :style="{ marginTop: '67px', height: windowHeight + 'px' }" :with-header="false" :visible.sync="historyDrawer" direction="ltr" :modal="false">
            <div class="search-historyList">
                <el-input v-model="searchHistory" @input="searchHistoryInput" @clear="clearHistoryInput" clearable placeholder="搜索聊天记录" prefix-icon="el-icon-search" />
                <div class="select-all">
                    <el-button v-if="isShowSelectBtn" class="select-all" type="text" @click="selectAllChange">全选</el-button>

                    <template v-else>
                        <el-button disabled @click="selectDelete" type="danger" size="mini" icon="el-icon-delete" circle></el-button>
                        <el-button @click="selectCancel" type="info" size="mini" icon="el-icon-close" circle></el-button>
                    </template>
                </div>
            </div>

            <el-scrollbar v-if="historyList.length !== 0" :style="{ height: (windowHeight - 35) + 'px' }">
                <div class="chat-history" id="history-drawer">

                    <div class="history-list" v-for="(item, index) in historyList" :key="item.key">
                        <div class="list-item" v-if="editKey !== item.key">

                            <el-checkbox-group v-if="!isShowSelectBtn" v-model="selectAllGroup">
                                <el-checkbox :label="item.key">{{ '' }}</el-checkbox>
                            </el-checkbox-group>

                            <div class="list-title" :style="{ width: historyDrawerWidth - 70 + 'px' }">
                                <span>
                                    <el-link :class="{ highlight: isHighlighted(item.key) }" :underline="false" @click="clickTitle(item.key)">
                                        {{ item.title }}
                                    </el-link>
                                </span>
                                <span></span>
                            </div>
                            <div v-if="isShowSelectBtn">
                                <template>
                                    <i class="el-icon-edit" style="margin: 0 5px" @click="editTitle(item.key)" />
                                    <i class="el-icon-delete" @click="deleteTitle(item.key)" />
                                </template>

                            </div>

                        </div>

                        <template v-else>
                            <el-input id="edit-input" @input="handleInput($event, index)" v-model="item.title">
                                <template slot="suffix">
                                    <i class="el-icon-check" style="margin: 0 8px" @click="confirmBtn(index)"></i>
                                    <i class="el-icon-close" @click="cancelBtn"></i>
                                </template>
                            </el-input>
                        </template>
                    </div>

                </div>
            </el-scrollbar>

            <div v-else :style="{
                    height: windowHeight + 'px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }">
                <el-empty :description="$t('No chatHistory')" :image-size="100"></el-empty>
            </div>
        </el-drawer>
    </div>
</template>
<script>
import { AI_SUPPORT_BUILD_IN_ROLES } from '@/plugins/KeyConfiguration.js';
import { dialog } from '@electron/remote';
import { ipcRenderer } from 'electron';
import { setI18nLanguage } from '@/plugins/i18n';

import ClipboardJS from 'clipboard';
import showdown from "showdown";
import showdownHighlight from 'showdown-highlight'
// 公式
// import katex from 'katex';
// import 'katex/dist/katex.min.css';

import 'highlight.js/styles/an-old-hope.css';
const hljsExtension = function () {
    return [
        {
            type: 'output',
            filter: function (text) {
                // 使用正则表达式查找所有的<pre><code>块
                const regex = /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi;
                return text.replace(regex, function (match, p) {
                    const lang = p.match(/language-(\w+)/);

                    const codeIndex = parseInt(Date.now()) + Math.floor(Math.random() * 10000000);

                    const copyBtn = `<p style="cursor: pointer;" data-clipboard-action="copy" data-clipboard-target="#copy-target-${codeIndex}" class="copy-btn" >复制</p>`;

                    if (lang) {
                        return `
                        <div class="chat-div">
                            <div class="chat-heard hljs">${lang[1]} ${copyBtn}</div>
                            <div id="copy-target-${codeIndex}" class="chat-code">${match}</div>
                        </div>
                        `
                    }
                    return `
                        <div class="chat-div">
                            <div class="chat-heard hljs" style="justify-content: end;">${copyBtn}</div>
                            <div id="copy-target-${codeIndex}" class="chat-code">${match}</div>
                        </div>
                        `
                });
            }
        }
    ];
};


export default {
    name: 'AIAssistantContent',

    computed: {
        // 高亮
        isHighlighted() {
            return key => key === this.selectKey;
        },
        maxIndex() {
            return this.message.length - 1;
        },
    },
    data() {
        return {
            sendImg: '',
            printscreenImg: '',
            selectFileImg: '',
            historyImg: '',
            configImg: '',
            addImg: '',

            markdown: null,

            // 先有一个列表存历史记录， 根据历史记录找到对应的聊天内容
            historyList: [
                {
                    key: 'key-1',
                    title: '会话1',
                },
            ],
            // 当前对话框的消息
            message: [],
            // 消息问题
            followUpList: [],

            // 当前输入的消息
            currentMessage: '',
            requestId: null, // 发送消息的 requestId
            userMaxIndex: -1,


            aiModelType: ['Groq', 'llama-3.1-70b-versatile'],
            aiModelTypeList: [],

            //  角色
            useCustomPrompt: false,
            supportedSystemRoles: AI_SUPPORT_BUILD_IN_ROLES,
            // 选择角色
            systemRole: 0,
            selectedSystemPrompt: '',
            // 自定义角色
            systemRolePrompt: '',
            // 是否显示角色
            isShowSystemRole: true,

            top_p: 0.7,
            temperature: 1,

            //  操作窗口
            isShow: 'none',

            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            //  聊天记录
            historyDrawer: false,
            selectKey: 'key-1',
            historyDrawerWidth: '',
            editKey: '',

            searchHistory: '',
            // 选中
            selectAllGroup: [],
            isShowSelectBtn: true,
            hoverIndex: null,
            editIndex: null,
            // fileList
            fileList: '',
            AIStatus: 2,
        };
    },

    created() {

        this.sendImg = window.resourcesManager.getRelatedSrcPath('@/sendable.png')

        this.printscreenImg = window.resourcesManager.getRelatedSrcPath('@/printscreen.png');
        this.selectFileImg = window.resourcesManager.getRelatedSrcPath('@/selectFile.png');
        this.historyImg = window.resourcesManager.getRelatedSrcPath('@/history.png');

        this.configImg = window.resourcesManager.getRelatedSrcPath('@/config.png');
        this.addImg = window.resourcesManager.getRelatedSrcPath('@/addSession.png');

        this.aiModelTypeList = window.generalAIManager.getAllSupportedModels();

        if (window.store.storeGet('aiConfig.chat')) {
            this.aiModelType = window.store.storeGet('aiConfig.chat.selectedModelType') || ['Groq', 'llama-3.1-70b-versatile'];
            this.isShowSystemRole = this.aiModelType[0] !== 'Coze'

            this.top_p = window.store.storeGet('aiConfig.chat.topP') || 0.7;
            this.temperature = window.store.storeGet('aiConfig.chat.temperature') || 1;

            this.useCustomPrompt = window.store.storeGet('aiConfig.chat.useCustomPrompt') || false;
            this.systemRole = window.store.storeGet('aiConfig.chat.systemRole') || 0;
            this.selectedSystemPrompt = this.supportedSystemRoles[this.systemRole].prompt || ''

            // 自定义角色
            this.systemRolePrompt = window.store.storeGet('aiConfig.chat.characterPrompt') || '';
        } else {
            this.updateBtn();
        }

        this.fileList = window.store.storeGet('aiConfig.fileList');

        this.selectKey = window.store.storeGet('aiConfig.selectKey') || 'key-1';
        if (!window.store.chatHistoryGet('historyList') || !window.store.chatHistoryGet('chatHistory')) {
            window.store.chatHistorySet('historyList', this.historyList);

            let systemContent
            if (this.isShowSystemRole) {
                systemContent = this.useCustomPrompt ? window.store.storeGet('aiConfig.chat.characterPrompt') : window.store.storeGet('aiConfig.chat.character')
            } else {
                systemContent = ''
            }
            window.store.chatHistorySet(`chatHistory.${this.selectKey}`, [
                {
                    role: 'system',
                    content: systemContent,
                },
                {
                    role: 'assistant',
                    content: '你好，我是AI助手，请问有什么可以帮助你的吗？',
                },
            ]);
        }

        this.historyList = window.store.chatHistoryGet('historyList');
        this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
        this.followUpList = window.store.chatHistoryGet(`followUpList.${this.selectKey}`) || [];
        this.message.forEach((item, index) => {
            if (item.role === "user") {
                this.userMaxIndex = index; // 更新最大索引
            }
        });
        this.$nextTick(() => {
            if (document.getElementById('chat-bottom')) {
                this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 70;

            }
        });


        // showdown
        this.markdown = new showdown.Converter({
            tables: true,
            ghCompatibleHeaderId: true,
            simpleLineBreaks: true,
            tasklists: true,
            simplifiedAutoLink: true,
            headerLevelStart: 3,
            completeHTMLDocument: true,
            emoji: true,
            underline: true,
            literalMidWord: true,

            extensions: [showdownHighlight(), hljsExtension]

        });

        const that = this;
        ipcRenderer.on('AIHelperMessage', (event, args) => {
            console.log('AIAssistantContent::AIHelperMessage', args);
            that.addSessionBtn();

            setTimeout(() => {
                that.currentMessage = args.requestMsg;
                that.sendBtn();
            }, 1000);
        });
    },
    mounted() {

        window.addEventListener('focus', () => {
            // console.log('AI对话窗口获得焦点');
            this.aiModelTypeList = window.generalAIManager.getAllSupportedModels();

            setI18nLanguage(window.store.storeGet('system.locale'))
        });

        window.addEventListener('resize', this.handleResize);

        this.$nextTick(() => {
            this.initScrollHeight();

            const clipboard = new ClipboardJS('.copy-btn');

            clipboard.on('success', e => {
                e.clearSelection();
                this.$message.success(this.$t('copySucceeded'));
            });

            clipboard.on('error', function (e) {
                e.clearSelection();
                this.$message.error(this.$t('copyFailed'));
            });



            if (document.getElementById('sendInput')) {
                document.getElementById('sendInput').addEventListener('keydown', (event) => {
                    // 检查是否是回车键
                    if (event.key === 'Enter') {
                        if (event.shiftKey) {
                            // console.log('Shift + Enter pressed, newline added.');
                        } else {
                            event.preventDefault(); // 阻止默认的换行行为
                            this.sendBtn();
                        }
                    }
                })
            }

        });
    },


    methods: {
        formater(message) {
            let markdownHtml = this.markdown.makeHtml(message)
            // const regex = /\$\$(.*?)\$\$/g;
            // markdownHtml = markdownHtml.replace(regex, (match, p1) => {

            //     return katex.renderToString(p1, { throwOnError: false });
            // });
            return markdownHtml
        },

        handleResize() {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 70;
            this.$nextTick(() => {
                if (document.getElementById('history-drawer')) {
                    this.historyDrawerWidth = document.getElementById('history-drawer').offsetWidth;
                }
            });
        },
        initScrollHeight() {
            this.$nextTick(() => {
                this.$refs['scrollbar'].wrap.scrollTop = document.getElementById('selectable-text').offsetHeight;
            });
        },
        updateScrollHeight() {
            this.$nextTick(() => {
                this.$refs['scrollbar'].wrap.scrollTop = this.$refs['scrollbar'].wrap.scrollHeight;

            });
        },
        reset() {
            this.historyDrawer = false;
            this.isShow = 'none';
            this.selectCancel()
        },
        cinfigBtn() {
            this.historyDrawer = false;
            if (this.isShow === 'none') {
                this.isShow = 'block';
            } else {
                this.isShow = 'none';
            }
        },

        aiSystemRoleChange(val) {
            this.selectedSystemPrompt = this.supportedSystemRoles[val].prompt;
            window.store.storeSet('aiConfig.chat.systemRole', val)
        },
        handleAIEngineChanged() {
            // console.log('AI聊天： handleAIEngineChanged', this.aiModelType);
            this.isShowSystemRole = this.aiModelType[0] !== 'Coze'
            window.store.storeSet('aiConfig.chat.selectedModelType', this.aiModelType)

        },
        aiModelconfigBtn() {
            if (window.windowManager.settingWindow.isVisible()) return;
            window.windowManager.settingWindow.changeVisibility(4);
        },
        updateBtn() {
            window.store.storeSet('aiConfig.chat.modelType', this.aiModelType[1]);
            window.store.storeSet('aiConfig.chat.topP', this.top_p);
            window.store.storeSet('aiConfig.chat.temperature', this.temperature);

            window.store.storeSet('aiConfig.chat.useCustomPrompt', this.useCustomPrompt);
            window.store.storeSet('aiConfig.chat.character', this.selectedSystemPrompt);

            window.store.storeSet('aiConfig.chat.characterPrompt', this.systemRolePrompt);
            this.isShow = 'none';
            ipcRenderer.send('ChatEngineTypeChange', {});


            if (this.message.length) {
                let systemContent
                if (this.isShowSystemRole) {

                    systemContent = this.useCustomPrompt ? window.store.storeGet('aiConfig.chat.characterPrompt') : window.store.storeGet('aiConfig.chat.character')
                } else {
                    systemContent = ''
                }
                this.message[0].content = systemContent
                window.store.chatHistorySet(`chatHistory.${this.selectKey}`, this.message);
            }

        },

        historyBtn() {
            if (this.AIStatus === 1) return
            this.historyDrawer = !this.historyDrawer;
            this.isShow = 'none';
            this.editKey = '';
            this.selectCancel()

            this.$nextTick(() => {
                if (document.getElementById('history-drawer')) {
                    this.historyDrawerWidth = document.getElementById('history-drawer').offsetWidth;
                }
            });
        },
        // 添加会话
        addSessionBtn() {
            if (this.AIStatus === 1) return
            this.editKey = '';
            if (this.historyList.length === 0) {
                this.historyList.push({
                    key: `key-1`,
                    title: `会话1`,
                });
            } else {
                const maxIndex = Math.max(...this.historyList.map(item => item.key.split('-')[1]));
                this.historyList.unshift({
                    key: `key-${maxIndex + 1}`,
                    title: `会话${maxIndex + 1}`,
                });

            }

            window.store.chatHistorySet('historyList', this.historyList);
            // this.historyList = window.store.chatHistoryGet('historyList');

            this.selectKey = this.historyList[0].key;

            let systemContent
            if (this.isShowSystemRole) {

                systemContent = this.useCustomPrompt ? window.store.storeGet('aiConfig.chat.characterPrompt') : window.store.storeGet('aiConfig.chat.character')
            } else {
                systemContent = ''
            }

            window.store.chatHistorySet(`chatHistory.${this.selectKey}`, [
                {
                    role: 'system',
                    content: systemContent,
                },
                {
                    role: 'assistant',
                    content: '你好，我是AI助手，请问有什么可以帮助你的吗？',
                },
            ]);
            this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
            window.store.storeSet('aiConfig.selectKey', this.selectKey);
        },

        clickTitle(key) {

            this.AIStatus = 2
            console.log('AI聊天： 聊天记录 key', key);
            this.selectKey = key;
            this.historyDrawer = false;
            this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
            this.followUpList = window.store.chatHistoryGet(`followUpList.${this.selectKey}`) || [];

            window.store.storeSet('aiConfig.selectKey', this.selectKey);
            this.initScrollHeight();
        },
        editTitle(key) {

            this.editKey = key;
            this.selectKey = key
            // this.$nextTick(() => {
            //     document.getElementById('edit-input').focus();
            // });
        },
        deleteObjFun(obj, id) {

            const newObj = {}
            for (const key in obj) {

                if (key !== id) {
                    newObj[key] = obj[key];
                }
            }
            return newObj
        },


        deleteTitle(id) {
            this.editKey = '';
            let tempFollowUpList = window.store.chatHistoryGet('followUpList') || {};
            let tempChatHistory =  window.store.chatHistoryGet('chatHistory') || {};


            const processId = (selectId) => {

                this.historyList = this.historyList.filter(item => item.key !== selectId);
                if (window.store.chatHistoryGet('followUpList') && window.store.chatHistoryGet('followUpList')[selectId]) {
                    tempFollowUpList = this.deleteObjFun(tempFollowUpList, selectId);
                }

                tempChatHistory = this.deleteObjFun(tempChatHistory, selectId);
            };

            if (Array.isArray(id)) {
                id.forEach(processId);
            } else {
                processId(id)
            }
            window.store.chatHistorySet('historyList', this.historyList);
            window.store.chatHistorySet('chatHistory', tempChatHistory);
            window.store.chatHistorySet('followUpList', tempFollowUpList);

            if (this.historyList.length === 0) {
                this.addSessionBtn();
            } else {

                this.selectKey = this.historyList[0].key;
                this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
                window.store.storeSet('aiConfig.selectKey', this.selectKey);

            }
        },
        handleInput(e, index) {
            this.$set(this.historyList, index, { ...this.historyList[index], title: e });
        },

        confirmBtn(index) {
            this.editKey = '';

            if (this.historyList[index].title.length < 10) {
                // eslint-disable-next-line no-self-assign
                this.historyList[index].title = this.historyList[index].title
            } else {
                this.historyList[index].title = this.historyList[index].title.slice(0, 10) + '...';
            }
            window.store.chatHistorySet('historyList', this.historyList);
        },
        cancelBtn() {
            this.editKey = '';
            this.historyList = window.store.chatHistoryGet('historyList');
        },

        // 搜索
        findKeysWithSearch(list, value) {
            let regex = new RegExp(value, 'g');
            let searchListArr = []

            for (let key in list) {
                for (let msg of list[key]) {
                    if (msg.content.match(regex)) {
                        // console.log(' AI聊天：包含的key', key);
                        // console.log(' AI聊天： AI聊天：content', msg.content);

                        searchListArr.push(key)
                    }
                }
            }
            return [...new Set(searchListArr)];
        },

        searchHistoryInput(val) {
            const chatHistoryList = window.store.chatHistoryGet(`chatHistory`);

            const res = this.findKeysWithSearch(chatHistoryList, val)
            this.clearHistoryInput()

            this.historyList = this.historyList.filter(item => res.includes(item.key));

        },
        clearHistoryInput() {
            this.historyList = window.store.chatHistoryGet('historyList');
        },
        selectAllChange() {
            this.isShowSelectBtn = false
            this.selectAllGroup = this.historyList.map(item => item.key)
            // console.log('AI聊天： 全选 key', this.selectAllGroup);

        },
        selectDelete() {
            console.log('AI聊天： 删除选中 key', this.selectAllGroup);

            this.deleteTitle(this.selectAllGroup)

            this.selectCancel()
        },

        selectCancel() {
            this.isShowSelectBtn = true
            this.selectAllGroup = []
        },
        sendChatMessage() {
            this.requestId = window.aiChatManager.sendChatMessage(this.message);

            console.log('AI聊天：发送消息的requestId', this.requestId);
            console.log('AI聊天：发送消息', this.message);
            this.message.push(
                {
                    role: 'assistant',
                    content: '',
                }
            );
            let AIMessage = '';
            this.followUpList = []
            window.aiChatManager.setChatResponseListener((requestId, status, message, msgType) => {
                this.AIStatus = status;

                this.AIStatus !== 2 ? this.sendImg = window.resourcesManager.getRelatedSrcPath('@/unsendable.png') : this.sendImg = window.resourcesManager.getRelatedSrcPath('@/sendable.png')

                if (status === -1) {
                    this.message[this.message.length - 1].content = message

                } else {

                    if (msgType !== 'followUp') {
                        AIMessage += message;
                        this.message[this.message.length - 1].content = AIMessage;
                        this.message[this.message.length - 1].requestId = requestId;
                        // if (window.store.chatHistoryGet('followUpList')[this.selectKey]) {
                        //     this.deleteObjFun('followUpList', this.selectKey)
                        // }
                    } else {
                        this.followUpList.push(message)
                        window.store.chatHistorySet(`followUpList.${this.selectKey}`, this.followUpList);
                    }
                }

                // console.log('msgType:', msgType);
                // console.log('message:', message);
                // console.log('status:', status);

                this.updateScrollHeight();
                if (status !== -1) {
                    window.store.chatHistorySet(`chatHistory.${this.selectKey}`, this.message);
                }
            });
        },

        sendBtn() {

            if (this.AIStatus === 1) return
            this.editIndex = null
            const reg = /^[\s]*$/;

            if (!reg.test(this.currentMessage)) {
                this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
                this.message = this.message.map(item => {
                    if (item.requestId) {
                        console.log(item);
                        const newItem = { ...item };
                        delete newItem.requestId;
                        return newItem;
                    }
                    return item;
                });

                this.message.push(
                    {
                        role: 'user',
                        content: this.currentMessage,
                    }
                );
                window.store.chatHistorySet(`chatHistory.${this.selectKey}`, this.message);

                this.userMaxIndex = this.message.length - 1; // 更新最大索引
                this.updateScrollHeight();

                this.sendChatMessage();



                // 更改 title
                this.historyList = this.historyList.map(item => {
                    if (item.key === this.selectKey) {
                        if (this.message[2].content.length <= 10) {
                            item.title = this.message[2].content;
                        } else {
                            item.title = this.message[2].content.slice(0, 10) + '...';
                        }
                    }
                    return item;
                });

                window.store.chatHistorySet('historyList', this.historyList);

                this.currentMessage = '';
            }
        },
        leaveOut() {
            this.hoverIndex = null
        },
        enterInto(index) {
            this.hoverIndex = index
        },
        changeUserMessage(e, index) {
            this.$set(this.message, index, { ...this.message[index], content: e });
        },
        cancelUserContent() {
            this.editIndex = null
            this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);

        },
        confirmUserContent(index) {
            this.editIndex = null
            const oldContent = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`)[index].content
            if (oldContent === this.message[index].content) return

            window.store.chatHistorySet(`chatHistory.${this.selectKey}`, this.message);
            // eslint-disable-next-line no-prototype-builtins
            if (this.message[this.message.length - 1].hasOwnProperty('requestId')) {
                this.message.pop();
            }
            this.sendChatMessage();
        },
        // 停止生成
        // stopAssistant() {
        //     console.log('stopAssistant  停止生成');
        //     window.aiChatManager.cancelChatProcess(this.requestId)
        //     this.AIStatus = 2
        // },
        async copyMessageBtn(messge) {

            try {
                await navigator.clipboard.writeText(messge);
                this.$message.success(this.$t('copySucceeded'));
            } catch (err) {
                this.$message.error(this.$t('copyFailed'));
            }
        },
        editUserContent(i) {
            this.editIndex = i
        },
        deleteMessageBtn(i) {

            this.message = this.message.filter((item, index) => index !== i)
            window.store.chatHistorySet(`chatHistory.${this.selectKey}`, this.message);
        },
        regenerateMessage() {

            // eslint-disable-next-line no-unused-vars
            const deleteItem = this.message.pop()
            this.sendChatMessage()

        },
        chatMoreBtn(text) {
            console.log(text);
            this.message = this.message.map(item => {
                if (item.requestId) {
                    const newItem = { ...item };
                    delete newItem.requestId;
                    return newItem;
                }
                return item;
            });

            this.message.push(
                {
                    role: 'user',
                    content: text,
                }
            );
            console.log(this.message);
            this.sendChatMessage()
        },
        selectFileBtn() {
            dialog
                .showOpenDialog({ properties: ['openFile'] })
                .then(result => {
                    console.log(' AI聊天： 打开文件', result);
                    if (result.filePaths.length === 0) return;
                    const fileList = result.filePaths[0].split('\\');
                    this.fileList = fileList[fileList.length - 1];
                    window.store.storeSet('aiConfig.fileList', this.fileList);
                    this.$nextTick(() => {
                        this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 70;
                        this.updateScrollHeight();
                    })

                    // const name = fileName.split('.exe');
                    // console.log(' AI聊天：fileName,name', fileName, name);

                    // window.app.getFileIcon(result.filePaths[0])
                    //   .then(icon => {
                    //     const outputPath = window.path.join(
                    //       window.userDataPath,
                    //       `${this.fileList}.png`
                    //     );
                    //     console.log(' AI聊天：临时文件', outputPath);
                    //     window.fs.writeFile(outputPath, icon.toPNG(), err => {
                    //       if (err) {
                    //         console.error(err);
                    //         return;
                    //       }
                    //       const iconId = window.resourcesManager.addResource(
                    //         outputPath,
                    //         `${this.fileList}.png`
                    //       );
                    //       console.log(iconId);
                    //     });
                    //   })
                    //   .catch(error => {
                    //     console.log(error);
                    //   });
                })
                .catch(error => {
                    console.log(' AI聊天：取消选择', error);
                });
        },
        clearFileList() {
            this.fileList = '';
            window.store.storeSet('aiConfig.fileList', this.fileList);
            this.$nextTick(() => {
                this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 70;
                this.updateScrollHeight();
            })

        },
        captureScreen() {
            // desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
            //     if (error) throw error
            //     for (let i = 0; i < sources.length; ++i) {
            //         console.log('iiiiiiiiiiiiiiiiiiii',i);
            //         if (sources[i].name === 'Electron') {
            //             navigator.webkitGetUserMedia({
            //                 audio: false,
            //                 video: {
            //                     mandatory: {
            //                         chromeMediaSource: 'desktop',
            //                         chromeMediaSourceId: sources[i].id,
            //                         minWidth: 1280,
            //                         maxWidth: 1280,
            //                         minHeight: 720,
            //                         maxHeight: 720
            //                     }
            //                 }
            //             }, this.handleStream, this.handleError)
            //             return
            //         }
            //     }
            // })

        },
        handleStream() {

        },
        handleError() {

        }
    },
};
</script>

<style scoped lang='less'>
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    img {
        width: auto;
        height: 35px;
        cursor: pointer;
    }
}
.chat-container {
    display: flex;
    flex-direction: column;
}

#selectable-text {
    padding: 10px;
    user-select: text;
}

.message {
    border-radius: 5px;
    color: #606266;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 2;
    padding: 10px;
}

.message-sent {
    overflow: auto;
    align-self: flex-start;
    background: #def;
}

.message-received {
    position: relative;
    align-self: flex-end;
    word-wrap: break-word;
    white-space: pre-line;
    margin-bottom: 28px;
    .chat-user {
        background: #fff;
        .user-input {
            display: flex;
            align-items: center;
        }

        i {
            cursor: pointer;
        }
    }
}
.message-operate {
    min-width: 120px;
    text-align: right;
    position: absolute;
    right: 0;
    bottom: -22px;
    font-family: monospace;
    .regenerate-fail {
        color: #f56c6c;
    }
    .el-button {
        padding: 0;
        color: #deeefe;
        margin-right: 5px;
    }

    i {
        cursor: pointer;
        font-size: 14px;
        color: #deeefe;
    }
    i:hover {
        color: #4b9cfb;
    }
    .el-icon-edit,
    .el-icon-refresh {
        margin-right: 5px;
    }
}

.div-assistant {
    margin-bottom: 28px;
    margin-right: 100px;
    position: relative;

    .message-assistant {
        // min-height: 20px;
        .chat-role-assistant {
            border-radius: 5px;
            display: flex;
            align-items: start;
            justify-content: start;
        }

        .el-icon-loading {
            font-size: 26px;
            color: #4b9cfb;
            margin: 5px;
        }
    }
    .message-regenerate {
        position: absolute;
        left: 0;
        text-align: left;
    }
}
.chat-more {
    cursor: pointer;
    .el-tag {
        margin-bottom: 5px;
        font-size: 12px;

        i {
            font-size: 14px;
            color: #4b9cfb;
            margin-left: 5px;
        }
    }
}
// 发送
#chat-bottom {
    position: sticky;
    left: 0;
    bottom: 0;
    padding: 10px;
}
.new-chat {
    display: flex;
    align-items: center;
    font-family: Consolas, 'Andale Mono';
    max-width: 120px;
    .add-chat {
        height: 25px;
        margin-right: 5px;
    }
}
.chat-input {
    background: #fff;
    border-radius: 5px;
    overflow: hidden;
    /deep/ .el-textarea__inner {
        height: 100px;
        border: none;
    }
}

.chat-file {
    color: #000;
    // font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    padding: 5px 10px 0;
}

.chat-img {
    display: flex;
    justify-content: end;
    align-items: center;
    margin: 8px;
}

img {
    width: auto;
}

.send-img {
    height: 25px;
}
.printscreen-img {
    height: 30px;
    cursor: pointer;
}
.select-img {
    margin-right: 5px;
    height: 20px;
    cursor: pointer;
}
// 配置
.configForm {
    width: 420px;
    padding: 10px;
    position: absolute;
    right: 0;
    background: #273238;
    border-radius: 8px;
    .selectRole {
        /deep/ .el-textarea__inner {
            height: 100px;
            border: none;
        }
    }
}
// 历史记录
.search-historyList {
    display: flex;
    align-items: center;
    height: 35px;

    /deep/ .el-input__inner {
        height: 35px;
        background: #2e3a41;
        border-radius: 15px;
        overflow: hidden;
    }
    /deep/ .el-icon-search {
        line-height: 35px;
        padding: 2px 6px;
    }
    .select-all {
        display: flex;
        padding: 5px;
    }
    .el-button--mini.is-circle {
        padding: 5px;
    }
}

.chat-history {
    .history-list {
        margin-bottom: 10px;
        border: 1px solid #515f67;
        .list-item {
            height: 45px;

            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10px;
        }
        .list-title {
            flex: 1;
            display: flex;
            flex-direction: column;
            span {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        /deep/ .el-link--inner {
            color: #c4d2ec;
        }

        /deep/.el-link--inner:hover {
            color: #fff;
        }

        .highlight {
            /deep/ .el-link--inner {
                color: #4b9cfb;
            }
        }

        i:hover {
            color: #4b9cfb;
            cursor: pointer;
        }

        /deep/ .el-input__inner {
            height: 45px;
            background: transparent;
            border: 1px solid #fff;
        }

        /deep/ .el-input__suffix {
            line-height: 45px;
        }

        /deep/ .el-input--suffix .el-input__inner {
            padding-right: 45px;
        }
    }
}
</style>
<style lang='less' scoped>
/deep/ .el-form-item__label {
    color: #fff;
}

/deep/ .el-slider__marks-text {
    transform: none;
    margin-top: 0px;
}

/deep/ .el-slider__marks-text:last-child {
    left: 224px !important;
}

/deep/ .el-form-item {
    margin-bottom: 5px;
}

/deep/ .el-drawer {
    background: #3d4d55;
    box-shadow: 0 0 0 0;
    width: 75% !important;
    border: 1px solid #515f67;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
}

/deep/ .el-drawer__body {
    overflow: hidden;
}

/deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
}

// markDown

/deep/ .chat-div {
    overflow: hidden;
    border-radius: 5px;
    margin: 8px 0;
}
/deep/ .chat-heard {
    display: flex;
    justify-content: space-between;
    background: #30313c;
    padding: 0 10px;
}
/deep/ pre code.hljs {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    padding: 5px 10px;
}
</style>

