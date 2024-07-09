**DecoKeeAI**
================

🌟 **您的智能桌面助手** 🌟

DecoKeeAI 是一个革命性的桌面助手，结合语音控制和自动化，让您的工作流程更加高效。使用 DecoKeeAI，您可以：

✨ 使用语音命令配置快捷键<br/>
✨ 使用语音命令启动软件<br/>
✨ 使用语音命令生成内容

**了解更多并加入我们的 GitHub 项目**
------------------------------------------

🔗 [访问 DecoKeeAI 的 GitHub 项目](https://github.com/DecoKeeAI/DecoKeeAI)

**关于 DecoKeeAI**
-------------------

DecoKeeAI 使用 **vue-cli 5** 和 **Electron 23.0.0** 构建，提供了一个模块化的桌面应用程序模板，具有以下特点：

* 快速打包
* 一键多语言切换
* MDI 图标插件和第三方图标库导入

**语言支持**
--------------------

* 中文
* [English](https://github.com/DecoKeeAI/DecoKeeAI/README-EN.md)

**开始使用**
---------------

### **下载并安装**

```bash
https://github.com/DecoKeeAI/releases/**
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
