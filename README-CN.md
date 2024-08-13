**DecoKeeAI**
================

🌟 **您的智能桌面助手** 🌟

DecoKeeAI 提出了一种通过 AI 技术与带显示快捷按键相结合的全新人机交互方式，旨在将 AI 应用于桌面 HMI（人机交互）。通过语音控制和新的输入设备（带显示的快捷按键）的结合，让 AI 成为您的智能助手。

✨ 语音配置桌面应用快捷键，一键实现复杂功能<br/>
✨ 语音启动软件: 通过语音将多个应用配置到带屏幕的按键，实现快速切换应用<br/>
✨ 语音生成内容: 一键触发 AI 内容生成，不同按键触发不同的应用，通过语音配置和交互，让AI成为全能助手

**了解更多并加入我们的 GitHub 项目**
------------------------------------------

🔗 [访问 DecoKeeAI 的 GitHub 项目](https://github.com/DecoKeeAI/DecoKeeAI)

配套的安卓端控制器<br/>
🔗 [访问 DecoKeeMobile 的 GitHub 项目](https://github.com/DecoKeeAI/DecoKeeMobile)

**关于 DecoKeeAI**
-------------------

### DecoKeeAI 使用 **vue-cli 5** 和 **Electron 23.0.0** 构建，提供了一个模块化的桌面应用程序模板，具有以下特点：

* 跨平台快速打包 (Windows, Linux, MacOS)
* 一键多语言切换
* 支持功能：
    - 多个AI智能体
    - 按键快捷键
    - 打开/关闭文件或程序
    - 预编译文本输入
    - 打开指定网站
    - 多媒体控制
    - 命令行执行
    - 音频播放器
    - 多项功能执行
    - 多套配置随意切换
    - 根据前台应用动态切换配置
    - 快捷划词工具. 快速的使用AI解释，总结，翻译等功能.
    - Home Assistant: 通过按键或与AI对话来控制您的智能家居功能/设备

* MDI 图标插件和第三方图标库导入
* 支持三方插件导入 (如 HomeAssistant 插件等)
* 支持主流AI大模型接口调用包含：(API key需自行在对应平台中注册并在设置中填入，若想取得最好的体验，建议使用 Groq 的 llama-3.1-70b-versatile 或 OpenAI 的 gpt-4o)
    - [OpenAI](https://platform.openai.com/apps): gpt-4o-mini, gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
    - [Groq](https://groq.com/) (速度最快！目前免费！！！): llama-3.1-405b-reasoning, llama-3.1-70b-versatile, llama-3.1-8b-instant, llama3-70b-8192, llama3-8b-8192, llama3-groq-70b-8192-tool-use-preview, llama3-groq-8b-8192-tool-use-preview, gemma2-9b-it, gemma-7b-it, mixtral-8x7b-32768 
    - [讯飞星火](https://xinghuo.xfyun.cn/sparkapi): spark3.5-max, spark4-ultra
    - [通义千问](https://dashscope.aliyun.com/?spm=5176.28197632.0.0.78417e06HoHqa3): qwen-turbo, qwen-plus, qwen-max, qwen-72b-chat, qwen1.5-32b-chat, qwen1.5-72b-chat, qwen1.5-110b-chat, qwen2-1.5b-instruct, qwen2-7b-instruct, qwen2-72b-instruct
    - [智谱AI](https://www.zhipuai.cn/): glm-4-0520, glm-4, glm-4-air, glm-4-airx, glm-4-flash, glm-3-turbo
    - [火山方舟](https://www.volcengine.com/): 可配置多个推理模型或智能体，需自行创建推理模型接入点和和智能体，详情参考 [火山方舟文档](https://www.volcengine.com/docs/82379/1267885)
    - [Coze](https://www.coze.com/): 可配置多个智能体或工作流控制，详情参考 [Coze配置文档](https://www.coze.cn/docs/developer_guides/preparation)
    - 自定义: 任意自定义服务器，只需支持 openAI API 调用即可。 可配置多个自定义模型。
* 支持语音服务 (STT&TTS)：
    - 讯飞星火, Microsoft Azure

**语言支持**
--------------------

* 中文
* [English](https://github.com/DecoKeeAI/DecoKeeAI/README.md)

**直接食用**
---------------

### **下载并安装**

[Windows 程序](https://github.com/DecoKeeAI/DecoKeeAI/releases)

[配套安卓软件](https://github.com/DecoKeeAI/DecoKeeMobile/releases)


**自己编译**
--------------

**步骤 1：克隆项目**

```bash
git clone https://github.com/DecoKeeAI/DecoKeeAI.git
```

**步骤 2：安装依赖项**

```bash
cd DecoKeeAI
npm install -g node-gyp@9.4.1
npm install -g @mapbox/node-pre-gyp@1.0.11
npm config edit
```

**注意：** 对于 Windows 用户，您需要安装 `windows-build-tools` 或 Visual Studio 带 C/C++ 环境。

**步骤 3：配置 npm**

修改 npm 配置文件，设置 registry、disturl 和 electron_mirror：
```bash
registry=https://registry.npmmirror.com/
disturl=https://electronjs.org/headers
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ELECTRON_CUSTOM_DIR={{ version }}
node_gyp=C:\Users\xxxx\AppData\Roaming\npm\node_modules\node-gyp\bin\node-gyp.js
```

**步骤 4：安装依赖项**

```bash
npm install
```

**步骤 5：启动应用程序**

```bash
npm run go
```

**步骤 6：打包应用程序（可选）**

在对应的平台上运行以下命令：
```bash
npm run buildapp:<平台>
```

**常见问题**
-------------

* **编译错误**

如果您在编译过程中遇到问题，请检查以下：

* 在 Ubuntu 上，如果您遇到与 `X11/extensions/XTest.h` 相关的错误，请安装以下包：
```bash
sudo apt-get install libxtst-dev
```
