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

**关于 DecoKeeAI**
-------------------

### DecoKeeAI 使用 **vue-cli 5** 和 **Electron 23.0.0** 构建，提供了一个模块化的桌面应用程序模板，具有以下特点：

* 快速打包
* 一键多语言切换
* MDI 图标插件和第三方图标库导入
* 支持三方插件导入 (如 HomeAssistant 插件等)
* 支持主流AI大模型接口调用包含：(API key需自行在对应平台中注册并在设置中填入，若想取得最好的体验，建议使用Groq的llama3或GPT 4o)
    - OpenAI: gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
    - Groq: llama3-70b-8192
    - 讯飞星火: spark3.5-max, spark4-ultra
    - 通义千问: qwen-turbo, qwen-plus, qwen-max, qwen-72b-chat, qwen1.5-32b-chat, qwen1.5-72b-chat, qwen1.5-110b-chat, qwen2-1.5b-instruct, qwen2-7b-instruct, qwen2-72b-instruct
    - 智谱AI: glm-3-turbo, glm-4
    - 自定义: 任意自定义服务器，只需支持 openAI API 调用即可
* 支持语音服务 (STT&TTS)：
    - 讯飞星火, Microsoft Azure

**语言支持**
--------------------

* 中文
* [English](https://github.com/DecoKeeAI/DecoKeeAI/README.md)

**直接食用**
---------------

### **下载并安装**

```bash
https://github.com/DecoKeeAI/DecoKeeAI/releases/download/V0.0.47/DecoKeeAI_Setup_0.0.47.exe
```

### **自己编译**

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
