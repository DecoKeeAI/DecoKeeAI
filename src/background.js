'use strict'

import {protocol, shell, clipboard, app} from 'electron'
import AppManager from './main/managers/app'
import AIManager from "@/main/ai/AIManager";
import GeneralAIManager from "@/main/ai/GeneralAIManager";

const log = require('electron-log')
console.log = log.log

const fs = require('fs');
const path = require('path');

const {globalShortcut} = require('electron')

const {setTimeout,setInterval,clearTimeout,clearInterval} = require('timers');

const installPath = app.getPath('exe');
const userDataPath = app.getPath('userData');

global.setTimeout = setTimeout;
global.setInterval = setInterval;
global.clearTimeout = clearTimeout;
global.clearInterval = clearInterval;
global.log = log.log;
global.fs = fs;
global.path = path;
global.platform = process.platform
global.arch = process.arch
global.shell = shell
global.clipboard = clipboard
global.globalShortcut = globalShortcut
global.installPath = installPath
global.userDataPath = userDataPath

const shelljs = require('shelljs');
const extractPath = path.resolve(installPath, '..', 'resources', 'app');
console.log('installPath: ', installPath, ' ExtraPath: ',extractPath);

let needFullLoad = true;

if (fs.existsSync(extractPath + '-new') && moveFiles(extractPath, extractPath + '-bck')
    && moveFiles(extractPath + '-new', extractPath)) {
    shelljs.rm('-rf', extractPath + '-bck');

    if (fs.existsSync(extractPath + '.zip')) {
        shelljs.rm('-rf', extractPath + '.zip');
    }

    app.relaunch();
    setTimeout(() => {
        process.kill(process.pid, 'SIGINT');
    }, 300);
    needFullLoad = false;
} else if (fs.existsSync(extractPath + '-bck')) {
    moveFiles(extractPath + '-bck', extractPath);

    if (fs.existsSync(extractPath + '.zip')) {
        shelljs.rm('-rf', extractPath + '.zip');
    }

    app.relaunch();
    setTimeout(() => {
        process.kill(process.pid, 'SIGINT');
    }, 300);
    needFullLoad = false;
} else {

    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
        {scheme: 'app', privileges: {secure: true, standard: true}}
    ])
}

const appManager = new AppManager(needFullLoad)

global.appManager = appManager
if (needFullLoad) {
    const generalAIManager = new GeneralAIManager(appManager);
    global.generalAIManager = generalAIManager;
    global.aiChatManager = new AIManager(appManager, generalAIManager, true);
}

function moveFiles(srcFolderPath, destFolderPath) {
    try {
        if (!fs.existsSync(srcFolderPath)) {
            console.log("SRC folder not exist. Ignore move");
            return false;
        }
        shelljs.mv(srcFolderPath, destFolderPath);
        console.log("Folder moved from " + srcFolderPath + " To " + destFolderPath + " successfully!");
        return true;
    } catch (e) {
        console.error(e);
    }
    return false;
}
