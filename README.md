**DecoKeeAI**
================

🌟 **Your Smart Desktop Assistant** 🌟

DecoKeeAI introduces a revolutionary human-machine interaction approach by combining AI technology with display-equipped shortcut keys, aiming to integrate AI into desktop HMI (Human-Machine Interface). Through the combination of voice control and new input devices (shortcut keys with displays), AI becomes your intelligent assistant.

✨ Voice-configured desktop application shortcuts: Achieve complex functions with a single command <br/>
✨ Voice-activated software: Configure multiple applications to display-equipped keys for quick switching through voice commands  <br/>
✨ Voice-generated content: Trigger AI content generation with a single press; different keys trigger different applications, making AI your versatile assistant through voice configuration and interaction.

**Learn More and Join Our GitHub Project**
------------------------------------------

🔗 [Visit DecoKeeAI's GitHub Project](https://github.com/DecoKeeAI/DecoKeeAI)

Companion Android controller<br/>
🔗 [Visit the DecoKeeMobile GitHub project](https://github.com/DecoKeeAI/DecoKeeMobile) 

**About DecoKeeAI**
-------------------

DecoKeeAI is built using **vue-cli 5** and **Electron 23.0.0**, providing a modular desktop application template with features like:

* Cross-platform fast packaging (Windows, Linux, MacOS)
* One-click multi-language switchingHere is the translation:
* Supported features:
  - Hotkey shortcuts
  - Open/close file or program
  - Pre-compiled text input
  - Open specific websites
  - Multimedia control
  - Command line execution
  - Audio player
  - Multi-function execution
  - Switch between multiple configuration sets at will
  - Dynamic configuration switching based on foreground application
* MDI icon plugin and third-party icon library import
* Support for third-party plugin import (such as HomeAssistant plugins, etc.)
* Support for mainstream AI model interface calls, including: (API keys need to be registered on the corresponding platform and filled in the settings. For the best experience, it is recommended to use Groq's llama3-70b-8192 or OpenAI' gpt-4o)
    - OpenAI: gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
    - Groq (Fastest in response. FREE at the moment !!!!!!): llama3-70b-8192
    - iFlytek: spark3.5-max, spark4-ultra
    - Qwen: qwen-turbo, qwen-plus, qwen-max, qwen-72b-chat, qwen1.5-32b-chat, qwen1.5-72b-chat, qwen1.5-110b-chat, qwen2-1.5b-instruct, qwen2-7b-instruct, qwen2-72b-instruct
    - Zhipu AI: glm-4-0520, glm-4, glm-4-air, glm-4-airx, glm-4-flash, glm-3-turbo
    - Volcano Ark(HuoShan): Supports configuration of multiple Model Inference or Agents, requiring users to create their own Model Inference endpoint and Agents. For more details, please refer to the [Volcano Ark Documentation](https://www.volcengine.com/docs/82379/1267885)
    - Custom: Any custom server, as long as it supports OpenAI API calls. Configurable with multiple custom models.
* Support for speech services (STT&TTS):
    - iFlytek, Microsoft Azure

**Language Support**
--------------------

* [中文](https://github.com/DecoKeeAI/DecoKeeAI/README-CN.md)
* English

**Get Started**
---------------

### **Download and Install**

[Windows Application](https://github.com/DecoKeeAI/DecoKeeAI/releases)

[Android Application](https://github.com/DecoKeeAI/DecoKeeMobile/releases)

**Compile Yourself**
--------------------

**Step 1: Clone the Project**

```bash
git clone https://github.com/DecoKeeAI/DecoKeeAI.git
```

**Step 2: Install Dependencies**

```bash
cd DecoKeeAI
npm install -g node-gyp@9.4.1
npm install -g @mapbox/node-pre-gyp@1.0.11
npm config edit
```

**Note:** For Windows users, you need to install `windows-build-tools` or Visual Studio with C/C++ environment.

**Step 3: Configure npm**

Modify the npm configuration file to set the registry, disturl, and electron_mirror:
```bash
registry=https://registry.npmmirror.com/
disturl=https://electronjs.org/headers
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ELECTRON_CUSTOM_DIR={{ version }}
node_gyp=C:\Users\xxxx\AppData\Roaming\npm\node_modules\node-gyp\bin\node-gyp.js
```

**Step 4: Install Dependencies**

```bash
npm install
```

**Step 5: Start the Application**

```bash
npm run go
```

**Step 6: Package the Application (Optional)**

Run the following command on the corresponding platform:
```bash
npm run buildapp:<platform>
```

**FAQ**
----

* **Compilation Errors**

If you encounter issues during compilation, check the following:

* On Ubuntu, if you encounter errors related to `X11/extensions/XTest.h`, install the following package:
```bash
sudo apt-get install libxtst-dev
```
