const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

export default class NativePluginLoader {
    constructor(appManager, pluginInfo) {
        let execEndFix = '';
        let platform = 'windows';
        if (process.platform === 'win32') {
            execEndFix = '.exe';
        } else {
            platform = 'mac';
        }
        this.executableFileName = pluginInfo.manifestInfo.CodePath;
        if (!this.executableFileName.endsWith(execEndFix)) {
            this.executableFileName += execEndFix;
        }
        let pluginExecutePath = path.join(pluginInfo.pluginPath, this.executableFileName);
        if (!fs.existsSync(pluginExecutePath)) {
            console.log(
                'NativePluginLoader: constructor: Plugin: ',
                pluginInfo.pluginName,
                ' Not able to find executable file: ',
                pluginExecutePath
            );
            return;
        }

        this.inInfoParam = {
            application: {
                font: 'sans-serif',
                language: 'zh_CN',
                platform: platform,
                platformVersion: '11.4.0',
                version: '5.0.0.14247',
            },
            plugin: {
                uuid: pluginInfo.pluginId,
                Version: pluginInfo.pluginVersion,
            },
            devicePixelRatio: 2,
            colors: {
                buttonPressedBackgroundColor: '#303030FF',
                buttonPressedBorderColor: '#646464FF',
                buttonPressedTextColor: '#969696FF',
                disabledColor: '#F7821B59',
                highlightColor: '#F7821BFF',
                mouseDownColor: '#CF6304FF',
            },
            devices: [
                {
                    id: '55F16B35884A859CCE4FFA1FC8D3DE5B',
                    name: 'Device Name',
                    size: {
                        columns: 5,
                        rows: 3,
                    },
                    type: 0,
                },
            ],
        };

        setTimeout(() => {
            this._launchPlugin(appManager, pluginExecutePath, pluginInfo);
        }, 1000);
    }

    _launchPlugin(appManager, pluginExecutePath, pluginInfo) {
        const pluginWSServerPort = appManager.storeManager.storeGet('serverPorts.pluginWSServerPort');

        if (!pluginWSServerPort) {
            setTimeout(() => {
                this._launchPlugin(appManager, pluginExecutePath, pluginInfo);
            }, 1000);
            return;
        }

        const execCmd =
            pluginExecutePath +
            ' -port ' + pluginWSServerPort + ' ' +
            '-pluginUUID "' + pluginInfo.pluginId + '" ' +
            '-registerEvent "registerPluginHandler" ' +
            '-info "' + JSON.stringify(this.inInfoParam).replaceAll('"', '\\"') + '"';

        console.log(
            'NativePluginLoader: constructor: Plugin: ',
            pluginInfo.pluginName,
            ' Start on executable file: ',
            pluginExecutePath,
            ' execCmd: ',
            execCmd
        );

        exec(`${execCmd}`, (err, stdout, stderr) => {
            if (err) {
                console.error('NativePluginLoader: start: exec error: ', err);
                return;
            }
            console.log('NativePluginLoader: start: stdout: ', stdout, ' stderr: ', stderr);
        });
    }

    destroy() {
        const execName = this.executableFileName;
        exec(`taskkill /F /im ${execName}`, (err, stdout, stderr) => {
            if (err) {
                console.error('NativePluginLoader: destroy: exec error: ', err);
                return;
            }
            console.log('NativePluginLoader: destroy: Process has been killed forcefully!');
        });
    }
}
