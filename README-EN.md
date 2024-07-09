**DecoKeeAI**
================

🌟 **Your Intelligent Desktop Assistant** 🌟

DecoKeeAI is a revolutionary desktop assistant that combines voice control and automation to make your workflow more efficient. With DecoKeeAI, you can:

✨ Configure shortcuts with voice commands <br/>
✨ Launch software with voice commands <br/>
✨ Generate content with voice commands

**Learn More and Join Our GitHub Project**
------------------------------------------

🔗 [Visit DecoKeeAI's GitHub Project](https://github.com/DecoKeeAI/DecoKeeAI)

**About DecoKeeAI**
-------------------

DecoKeeAI is built using **vue-cli 5** and **Electron 23.0.0**, providing a modular desktop application template with features like:

* Fast packaging
* One-click multi-language switching
* MDI icon plugin and third-party icon library import

**Language Support**
--------------------

* 中文
* [English](https://github.com/DecoKeeAI/DecoKeeAI/README-EN.md)

**Get Started**
---------------

### **Download and Install**

```bash
https://github.com/DecoKeeAI/releases/**
```

### **Compile Yourself**

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
