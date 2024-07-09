<template>
    <div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px">
            <div style="display: flex; align-items: center">
                <img :src="historyImg" title="历史记录" style="width: auto; height: 35px; cursor: pointer; margin-right: 10px" @click="historyBtn" />
            </div>

            <img :src="configImg" alt="配置" style="width: auto; height: 35px; cursor: pointer" @click="cinfigBtn" />
        </div>
        <!-- 聊天 -->
        <div>
            <el-scrollbar ref="scrollbar" :style="{ height: windowHeight + 'px' }">
                <div @click="reset">
                    <div id="selectable-text">
                        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
                        <div id="chat-container" v-for="(message, index) in message" :key="index" v-if="message.role !== 'system'">
                            <div v-if="message.role === 'user'" :class="['message', message.content !== '' ? 'message-received' : '']">
                                {{ message.content }}
                            </div>

                            <div v-if="message.role === 'assistant'">
                                <div class="message-assistant">
                                    <div class="icon-loading" v-if="AIStatus === 1 && message.requestId">
                                        <i class="el-icon-loading"></i>
                                    </div>
                                    <div class="my-editor" :class="['message', message.content !== '' ? 'message-sent' : '']" v-html="formater(message.content)"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
            <!-- 发送 -->
            <div id="chat-bottom">
                <div class="new-chat" @click="addSessionBtn">
                    <img class="add-chat" :src="addImg" />
                    <span>New Chat</span>
                </div>
                <div style="padding: 5px">
                    <div class="chat-input" :style="{ height: fileList ? '170px' : '140px' }">
                        <div class="chat-file" v-if="fileList">
                            <el-tag closable @close="clearFileList">
                                {{ fileList }}
                            </el-tag>
                        </div>

                        <el-input @focus="reset" @keyup.enter.native="sendBtn" resize="none" type="textarea" v-model="currentMessage" placeholder="Type your message here...">
                        </el-input>
                        <div class="chat-img">
                            <!-- <img class="printscreen-img" @click="captureScreen" title="截图" :src="printscreenImg" alt="" /> -->

                            <!-- <img class="select-img" @click="selectFileBtn" title="选择文件" :src="selectFileImg" alt="" /> -->

                            <img class="send-img" @click="sendBtn" title="发送" :src="sendImg" alt="" :style="{ cursor: AIStatus === 1 ? 'not-allowed' : 'pointer' }" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 配置 -->
        <div class="configForm" :style="{ display: isShow, top: top + 'px' }">
            <el-form label-width="120px" label-position="left">
                <el-form-item :label="$t('settings.aiEngineType')">
                    <el-select v-model="aiModelType" :placeholder="$t('pleaseSelect')">
                        <el-option v-for="item in aiModelTypeList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                    <el-button @click="aiModelconfigBtn" style="margin-left: 10px;" type="text">配置</el-button>
                </el-form-item>

                <el-form-item label="系统角色">
                    <el-select class="selectRole" filterable v-model="systemRole" @change="aiSystemRoleChanged">
                        <el-option v-for="item in aiSystemRole" :key="item.value" :label="item.role" :value="item.value" />
                    </el-select>
                    <el-input :disabled="systemRole === 0" v-model="systemRolePrompt" type="textarea" resize="none">
                    </el-input>
                </el-form-item>

                <el-form-item label="角色性格" class="temperature">
                    <el-slider v-model="top_p" :min="0" :max="1" :step="0.05" :marks="{ 0: '准确严谨', 1: '灵活创新' }"></el-slider>
                </el-form-item>
                <el-form-item label="回答质量" class="temperature">
                    <el-slider v-model="temperature" :min="0" :max="2" :step="0.05" :marks="{ 0: '重复保守', 2: '胡言乱语' }"></el-slider>
                </el-form-item>
            </el-form>
            <el-button @click="updateBtn" size="small" type="primary" style="float: right; margin-top: 10px">
                更新
            </el-button>
        </div>

        <!-- 聊天记录 -->

        <el-drawer :style="{ marginTop: '77px', height: windowHeight + 'px' }" :with-header="false" :visible.sync="historyDrawer" direction="ltr" :modal="false">
            <!-- <el-input class="search-historyList" v-model="searchHistory" clearable placeholder="搜索聊天记录" prefix-icon="el-icon-search" /> -->

            <el-scrollbar v-if="historyList.length !== 0" :style="{ height: windowHeight + 'px' }">
                <div class="chat-history" id="history-drawer">
                    <div class="history-list" v-for="(item, index) in historyList" :key="item.key">
                        <div class="list-item" v-if="editKey !== item.key">
                            <div class="list-title" :style="{ width: historyDrawerWidth - 70 + 'px' }">
                                <span>
                                    <el-link :class="{ highlight: isHighlighted(item.key) }" :underline="false" @click="clickTitle(item.key)">
                                        {{ item.title }}
                                    </el-link>
                                </span>
                                <span></span>
                            </div>
                            <div>
                                <i class="el-icon-edit" style="margin: 0 5px" @click="editTitle(item.key)" />
                                <i class="el-icon-delete" @click="deleteTitle(item.key)" />
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
                <el-empty description="暂无聊天记录" :image-size="100"></el-empty>
            </div>
        </el-drawer>
    </div>
</template>
<script>
import { aiSystemRole } from '@/plugins/KeyConfiguration.js';
import { dialog, screen } from '@electron/remote';
import { ipcRenderer } from 'electron';

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import ClipboardJS from 'clipboard';

import 'highlight.js/styles/an-old-hope.css';
export default {
    name: 'AIAssistantContent',

    computed: {
        // 高亮
        isHighlighted() {
            return key => key === this.selectKey;
        },
    },
    watch: {
        // eslint-disable-next-line no-unused-vars
        searchHistory(newVal, oldVal) {
            // console.log(newVal);
            // console.log(oldVal);
            const chatHistoryList = window.store.chatHistoryGet(`chatHistory`);
            for (let key in chatHistoryList) {
                for (let msg of chatHistoryList[key]) {
                    if (msg.content.includes(newVal)) {
                        console.log(msg.content);
                        this.historyList = this.historyList.filter(item => item.key === key);
                    } else {
                        this.historyList = [];
                    }
                }
            }

            if (newVal === '') {
                this.historyList = window.store.chatHistoryGet('historyList');
            }
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
            // 先有一个列表存历史记录， 根据历史记录找到对应的聊天内容
            historyList: [
                {
                    key: 'key-1',
                    title: '会话1',
                },
            ],
            // 当前对话框的消息
            message: [],

            // 当前输入的消息
            currentMessage: '',
            aiModelType: 'llama3-70b-8192',
            aiModelTypeList: [
                { label: 'Groq llama 70B', value: 'llama3-70b-8192' },
                { label: 'GPT 4o', value: 'gpt-4o' },
                { label: 'GPT 4 Turbo', value: 'gpt-4-turbo' },
                { label: 'GPT 4', value: 'gpt-4' },
                { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo' },
                { label: 'Spark 3.5 MAX', value: 'spark3.5-max' },
                { label: 'Spark 4 Ultra', value: 'spark4-ultra' },
                { label: '通义千问 turbo', value: 'qwen-turbo' },
                { label: '通义千问 Plus', value: 'qwen-plus' },
                { label: '通义千问 Max', value: 'qwen-max' },
                { label: '通义千问 72b-chat', value: 'qwen-72b-chat' },
                { label: '通义千问1.5 32b-chat', value: 'qwen1.5-32b-chat' },
                { label: '通义千问1.5 72b-chat', value: 'qwen1.5-72b-chat' },
                { label: '通义千问1.5 110b-chat', value: 'qwen1.5-110b-chat' },
                { label: '通义千问2 1.5b-instruct', value: 'qwen2-1.5b-instruct' },
                { label: '通义千问2 7b-instruct', value: 'qwen2-7b-instruct' },
                { label: '通义千问2 72b-instruct', value: 'qwen2-72b-instruct' },
                { label: '智谱 GLM 3 Turbo', value: 'glm-3-turbo' },
                { label: '智谱 GLM 4', value: 'glm-4' },
                { label: '自定义', value: 'custom-engine' },
            ],

            //  系统角色
            aiSystemRole,
            systemRole: 0,
            systemRolePrompt: '',

            top_p: 0.7,
            temperature: 1,

            //  操作窗口
            isShow: 'none',
            top: 0,

            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            //  聊天记录
            historyDrawer: false,
            selectKey: 'key-1',
            historyDrawerWidth: '',
            editKey: '',

            historycontent: '',

            searchHistory: '',
            // fileList
            fileList: '',
            AIStatus: 2,
        };
    },
    created() {
        this.sendImg = window.resourcesManager.getRelatedSrcPath('@/send.png');
        this.printscreenImg = window.resourcesManager.getRelatedSrcPath('@/printscreen.png');
        this.selectFileImg = window.resourcesManager.getRelatedSrcPath('@/selectFile.png');
        this.historyImg = window.resourcesManager.getRelatedSrcPath('@/history.png');

        this.configImg = window.resourcesManager.getRelatedSrcPath('@/config.png');
        this.addImg = window.resourcesManager.getRelatedSrcPath('@/addSession.png');

        if (window.store.storeGet('aiConfig.chat')) {
            this.aiModelType = window.store.storeGet('aiConfig.chat.modelType') || 'llama3-70b-8192';
            this.top_p = window.store.storeGet('aiConfig.chat.topP') || 0.7;
            this.temperature = window.store.storeGet('aiConfig.chat.temperature') || 1;
            this.systemRole = window.store.storeGet('aiConfig.chat.character') || 0;
            this.systemRolePrompt = window.store.storeGet('aiConfig.chat.characterPrompt') || '';
        } else {
            this.updateBtn();
        }

        this.fileList = window.store.storeGet('aiConfig.fileList');

        this.selectKey = window.store.storeGet('aiConfig.selectKey') || 'key-1';
        if (!window.store.chatHistoryGet('historyList') || !window.store.chatHistoryGet('chatHistory')) {
            window.store.chatHistorySet('historyList', this.historyList);
            window.store.chatHistorySet(`chatHistory.${this.selectKey}`, [
                {
                    role: 'system',
                    content: window.store.storeGet('aiConfig.chat.characterPrompt'),
                },
                {
                    role: 'assistant',
                    content: '你好，我是AI助手，请问有什么可以帮助你的吗？',
                },
            ]);
        }

        this.historyList = window.store.chatHistoryGet('historyList');
        this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);


        this.$nextTick(() => {
            this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 70;
        });
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.$nextTick(() => {
            this.initScrollHeight();

            const clipboard = new ClipboardJS('.copy-btn');

            clipboard.on('success', e => {
                e.clearSelection();
                this.$message.success('复制成功');
            });

            clipboard.on('error', function (e) {
                e.clearSelection();
                this.$message.error('复制失败');
            });
        });
    },

    methods: {
        formater(message) {
            // const that = this

            const md = new MarkdownIt({
                breaks: true,
                html: true,
                linkify: true,
                typographer: true,
                highlight: function (str, lang) {
                    const codeIndex = parseInt(Date.now()) + Math.floor(Math.random() * 10000000);

                    const copyBtn = `<p style="cursor: pointer;" data-clipboard-action="copy" data-clipboard-target="#copy-target-${codeIndex}" class="copy-btn" >复制</p>`;
                    if (lang && hljs.getLanguage(lang)) {
                        const langHtml = `<span class="lang-name">${lang}</span>`;
                        // 处理代码高亮
                        const preCode = hljs.highlight(lang, str, true).value;

                        return `<pre class="chat-pre"><code class="language-${lang} hljs"><div class="chat-heard">${langHtml} ${copyBtn}</div><div id="copy-target-${codeIndex}" class="chat-code">${preCode}</div></code></pre>`;
                    }

                    const preCode = hljs.highlightAuto(str).value;
                    return `<pre class="chat-pre"><code class="hljs"><div class="chat-heard" style="justify-content: end;">${copyBtn}</div><div id="copy-target-${codeIndex}" class="chat-code">${preCode}</div></code></pre>`;
                },
            });
            const randerMessage = md.render(message);

            return randerMessage;
        },

        handleResize() {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 70;
            this.$nextTick(() => {
                this.historyDrawerWidth = document.getElementById('history-drawer').offsetWidth;
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
        },
        cinfigBtn() {
            this.historyDrawer = false;
            if (this.isShow === 'none') {
                this.isShow = 'block';
            } else {
                this.isShow = 'none';
            }
            this.top = 40;
        },
        aiSystemRoleChanged(val) {
            console.log(val);
            this.systemRolePrompt = this.aiSystemRole[val].prompt;
        },
        aiModelconfigBtn () {
            if (window.windowManager.settingWindow.isVisible()) return;
            window.windowManager.settingWindow.changeVisibility();
        },
        updateBtn() {
            window.store.storeSet('aiConfig.chat.modelType', this.aiModelType);
            window.store.storeSet('aiConfig.chat.topP', this.top_p);
            window.store.storeSet('aiConfig.chat.temperature', this.temperature);
            window.store.storeSet('aiConfig.chat.character', this.systemRole);
            window.store.storeSet('aiConfig.chat.characterPrompt', this.systemRolePrompt);
            this.isShow = 'none';
            ipcRenderer.send('ChatEngineTypeChange', {});
        },

        historyBtn() {
            this.historyDrawer = !this.historyDrawer;
            this.isShow = 'none';
            this.editKey = '';
            this.$nextTick(() => {
                this.historyDrawerWidth = document.getElementById('history-drawer').offsetWidth;
            });
        },
        addSessionBtn() {
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
            this.historyList = window.store.chatHistoryGet('historyList');

            this.selectKey = this.historyList[0].key;
            window.store.chatHistorySet(`chatHistory.${this.selectKey}`, [
                {
                    role: 'system',
                    content: window.store.storeGet('aiConfig.chat.characterPrompt'),
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
            console.log(key);
            this.selectKey = key;
            this.historyDrawer = false;
            this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
            window.store.storeSet('aiConfig.selectKey', this.selectKey);
            this.initScrollHeight();
        },
        editTitle(key) {
            this.editKey = key;
            // this.$nextTick(() => {
            //     document.getElementById('edit-input').focus();
            // });
        },
        deleteTitle(id) {
            this.editKey = '';
            this.historyList = this.historyList.filter(item => item.key !== id);
            window.store.chatHistorySet('historyList', this.historyList);
            let tempList = window.store.chatHistoryGet('chatHistory');

            let str = JSON.stringify(tempList, (key, value) => (key === id ? undefined : value));
            tempList = JSON.parse(str);
            window.store.chatHistorySet('chatHistory', tempList);

            if (this.historyList.length === 0) {
                this.addSessionBtn();
            } else {
                this.selectKey = this.historyList[0].key;

                this.message = window.store.chatHistoryGet(`chatHistory.${this.selectKey}`);
                window.store.storeSet('aiConfig.selectKey', this.selectKey);
            }
        },
        handleInput(e, index) {
            this.$set(this.historyList[index], this.historyList[index].title, e);
        },

        confirmBtn() {
            this.editKey = '';

            // 更改 title
            // this.historyList = this.historyList.map(item => {
            //     if (item.key === this.selectKey) {
            //         if (this.message[2].content.length <= 10) {
            //             item.title = this.message[2].content;
            //         } else {
            //             item.title = this.message[2].content.slice(0, 10) + '...';
            //         }
            //     }
            //     return item;
            // });
            window.store.chatHistorySet('historyList', this.historyList);
        },
        cancelBtn() {
            this.editKey = '';
            this.historyList = window.store.chatHistoryGet('historyList');
        },
        // searchHistoryInput(val) {
        //     const chatHistoryList = window.store.chatHistoryGet(`chatHistory`);

        //     for (let key in chatHistoryList) {
        //         for (let msg of chatHistoryList[key]) {
        //             if (msg.content.includes(val)) {
        //                 // return key;
        //                 console.log('11111111111111', key);
        //                 console.log('11111111111111', msg);
        //                 this.historyList = this.historyList.filter(item => item.key === key);
        //                 break;
        //             }
        //         }
        //     }
        //     return null;
        // },

        sendBtn() {
            if (this.AIStatus === 1) {
                return;
            }
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
                    },
                    {
                        role: 'assistant',
                        content: '',
                    }
                );

                this.updateScrollHeight();

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

                const requestId = window.aiManager.sendChatMessage(this.message);
                console.log('发送消息的requestId', requestId);
                let AIMessage = '';

                window.aiManager.setChatResponseListener((requestId, status, message) => {
                    // console.log('AI status', status);
                    // console.log('AI requestId', requestId);

                    AIMessage += message;
                    this.AIStatus = status;
                    this.message[this.message.length - 1].content = AIMessage;
                    this.message[this.message.length - 1].requestId = requestId;

                    this.updateScrollHeight();
                    window.store.chatHistorySet(`chatHistory.${this.selectKey}`, this.message);
                });

                this.currentMessage = '';
            }
        },

        selectFileBtn() {
            dialog
                .showOpenDialog({ properties: ['openFile'] })
                .then(result => {
                    console.log('打开文件', result);
                    if (result.filePaths.length === 0) return;
                    const fileList = result.filePaths[0].split('\\');
                    this.fileList = fileList[fileList.length - 1];
                    window.store.storeSet('aiConfig.fileList', this.fileList);

                    this.windowHeight = window.innerHeight - document.getElementById('chat-bottom').offsetHeight - 80;

                    // const name = fileName.split('.exe');
                    // console.log('fileName,name', fileName, name);

                    // window.app.getFileIcon(result.filePaths[0])
                    //   .then(icon => {
                    //     const outputPath = window.path.join(
                    //       window.userDataPath,
                    //       `${this.fileList}.png`
                    //     );
                    //     console.log('临时文件', outputPath);
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
                    console.log('取消选择', error);
                });
        },
        clearFileList() {
            this.fileList = '';
            window.store.storeSet('aiConfig.fileList', this.fileList);
        },
        captureScreen() {
            screen.getDisplayNearestPoint({ x: 0, y: 0 }).then(display => {
                const { width, height } = display.workAreaSize;
                // const { x, y } = display.workArea;
                // const desktopCapturer = require('electron').desktopCapturer;
                console.log(width, height);
            });
        },
    },
};
</script>

<style scoped lang='less'>
#chat-container {
    display: flex;
    flex-direction: column;
}

#selectable-text {
    padding: 10px 10px 0;
    user-select: text;
}

.message {
    border-radius: 5px;
    color: #606266;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 2;
    padding: 5px;
}

.message-sent {
    overflow: auto;

    background-color: #def;
    align-self: flex-start;
    margin-right: 50px;
}

.message-received {
    align-self: flex-end;
    background: #fff;
    margin: 8px 0 8px 50px;
}

.message-assistant {
    display: flex;

    .icon-loading {
        font-size: 26px;
        color: #4b9cfb;
        margin-right: 10px;
    }
}

#chat-bottom {
    width: 100%;
    position: sticky;
    left: 0;
    bottom: 0;
    padding: 10px;
}
.new-chat {
    display: flex;
    align-items: center;
    font-family: Consolas, 'Andale Mono';
    cursor: pointer;
    .add-chat {
        height: 25px;
        margin-right: 5px;
    }
}
.chat-input {
    background: #fff;
    border-radius: 5px;
    overflow: hidden;
}

.chat-file {
    color: #000;
    // font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-family: Consolas, 'Andale Mono';
    padding: 5px 10px 0;
}

.chat-img {
    display: flex;
    justify-content: end;
    align-items: center;
    margin: 8px;

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
}

.configForm {
    width: 420px;
    padding: 10px;
    position: absolute;
    right: 0;
    background: #273238;
    border-radius: 8px;
}
// 历史记录
.search-historyList {
    /deep/ .el-input__inner {
        height: 35px;
        background: #2e3a41;
    }
    /deep/ .el-icon-search {
        line-height: 35px;
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
            // white-space: nowrap;
            // overflow: hidden;
            // text-overflow: ellipsis;
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
/deep/ .el-textarea__inner {
    height: 100px;
    border: none;
}

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

// /deep/ .prism-editor__textarea:focus {
//   outline: none;
// }

// markDown
/deep/ pre code.hljs {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;

    padding: 0;
    border-radius: 5px;
}

/deep/ .chat-pre {
    margin-bottom: 5px;
}

/deep/ .chat-heard {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background: #30313c;
    padding: 0 10px;
}

/deep/ .chat-code {
    overflow: auto;
    padding: 0 10px;
}
</style>
