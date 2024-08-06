const levenshtein = require('fast-levenshtein');

const {getInstalledApps} = require('get-installed-apps');

const fs = require('fs');
const path = require('path');

const excludeAppName = ['驱动程序包', 'Driver', 'Microsoft Visual C ', 'Microsoft Visual C++ ', 'Windows Software Development Kit', 'Installer', 'Setup', 'Uninstall', '卸载', 'install'];

process.on('message', async message => {
    console.log('SystemInstalledAppLoader Received: ', message);
    loadPCInstalledApps().then((installedApps) => {
        process.send({
            type: 'success',
            result: installedApps
        })
    });
});

function loadPCInstalledApps() {
    return new Promise(resolve => {
        let pcInstalledApps = [];

        console.log('Start To Check PC installed apps');
        getInstalledApps().then(installedApps => {

            try {
                console.log('Installed APPS: ', installedApps.length);

                const regExp = new RegExp('"', 'g');

                installedApps.forEach(applicationInfo => {

                    if (!applicationInfo.DisplayIcon && !applicationInfo.InstallLocation) {
                        return;
                    }

                    if (applicationInfo.DisplayName && isNameInList(applicationInfo.DisplayName, excludeAppName)) {
                        return;
                    }

                    let needCheckDisplayIconPath = false;
                    if (applicationInfo.DisplayIcon) {
                        const iconPath = applicationInfo.DisplayIcon.toLowerCase();
                        const execAppPath = iconPath.indexOf('.exe')
                        if (execAppPath > 4) {
                            let startIdx = 0;
                            let foundLaunchPath = false;
                            let finalLaunchPath = '';
                            while (!foundLaunchPath) {
                                const tempLaunchPath = applicationInfo.DisplayIcon.substring(startIdx, execAppPath + 4);
                                if (tempLaunchPath.startsWith("\\") || tempLaunchPath.startsWith('"')) {
                                    startIdx++;
                                    continue;
                                }
                                foundLaunchPath = true;
                                break;
                            }
                            finalLaunchPath = applicationInfo.DisplayIcon.substring(startIdx, execAppPath + 4);
                            const tempFinalLaunchPath = finalLaunchPath.toLowerCase();
                            if (!tempFinalLaunchPath.endsWith("uninstall.exe") && !tempFinalLaunchPath.endsWith("unins000.exe")
                                && !tempFinalLaunchPath.endsWith("uninst.exe")) {
                                applicationInfo.appLaunchPath = finalLaunchPath;
                                pcInstalledApps.push(applicationInfo);
                                return;
                            }
                        }
                        needCheckDisplayIconPath = true;
                    }

                    if (applicationInfo.InstallLocation) {
                        let installPath = applicationInfo.InstallLocation.replace(regExp, '');

                        if (installPath.includes(',')) {
                            installPath = installPath.split(',')[0];
                        }

                        const tempLaunchPath = getMatchingExeFile(installPath, applicationInfo.DisplayName);
                        // console.log('loadPCInstalledApps: GetNameFrom InstallPath: ' + applicationInfo.InstallLocation + ' EXEPath: ' + tempLaunchPath);
                        if (tempLaunchPath !== '') {
                            applicationInfo.appLaunchPath = tempLaunchPath;
                            pcInstalledApps.push(applicationInfo);
                            return;
                        }
                    }

                    if (needCheckDisplayIconPath && applicationInfo.DisplayIcon) {
                        let installPath = applicationInfo.DisplayIcon.replace(regExp, '');

                        if (installPath.includes(',')) {
                            installPath = installPath.split(',')[0];
                        }

                        const tempLaunchPath = getMatchingExeFile(installPath, applicationInfo.DisplayName);
                        if (tempLaunchPath !== '') {
                            applicationInfo.appLaunchPath = tempLaunchPath;
                            pcInstalledApps.push(applicationInfo);
                        }
                    }

                });
            } catch (err) {
                console.log('GetSystemInstalledAPP ERROR: ', err);
            }
            console.log('Filtered Installed APPS: Length: ', pcInstalledApps.length);

            if (process.platform === 'win32') {
                try {
                    const startUpMenuApps = getWindowsStartUpMenuApplications();
                    console.log('loadPCInstalledApps startUpMenuApps Length: ', startUpMenuApps.length);
                    console.log('loadPCInstalledApps startUpMenuApps Data: ' + JSON.stringify(startUpMenuApps));

                    for (let i = 0; i < startUpMenuApps.length; i++) {
                        const startUpMenuApp = startUpMenuApps[i];
                        if (pcInstalledApps.findIndex(existAppInfo => existAppInfo.appLaunchPath === startUpMenuApp.appLaunchPath) !== -1) {
                            continue;
                        }
                        console.log('loadPCInstalledApps startUpMenuApp Add: ', startUpMenuApp);
                        pcInstalledApps.push(startUpMenuApp);
                        if (startUpMenuApp.appName === 'WINWORD' && startUpMenuApp.DisplayName === 'Word') {
                            const microsoftWord = deepCopy(startUpMenuApp);
                            microsoftWord.DisplayName = 'Microsoft Word';
                            microsoftWord.appIdentifier = 'Microsoft Word';
                            pcInstalledApps.push(microsoftWord)
                        }
                    }

                } catch (err) {
                    console.log('loadPCInstalledApps failed to get startUpMenuApps: ', err);
                }
            }
            pcInstalledApps.sort((a, b) => {
                if (a.DisplayName < b.DisplayName) return -1;
                if (a.DisplayName > b.DisplayName) return 1;
                return 0;
            });
            return resolve(pcInstalledApps);
        });
    });
}

function isNameInList(checkString, checkList) {
    for (const char of checkList) {
        if (checkString.includes(char)) {
            return true;
        }
    }
    return false;
}

function getMatchingExeFile(rootDir, displayName) {
    let matchingExeFile = '';
    if (rootDir === '') return '';
    try {
        if (fs.lstatSync(rootDir).isFile()) {
            // If rootDir is a file, get the directory path and look for matching .exe file
            const dirPath = path.dirname(rootDir);
            const exeFile = `${path.basename(rootDir)}.exe`;
            const exeFilePath = path.join(dirPath, exeFile);
            const binExeFilePath = path.join(dirPath, 'bin', exeFile);
            const BinExeFilePath = path.join(dirPath, 'Bin', exeFile);
            if (fs.existsSync(exeFilePath)) {
                matchingExeFile = exeFilePath;
            } else if (fs.existsSync(binExeFilePath)) {
                matchingExeFile = binExeFilePath;
            } else if (fs.existsSync(BinExeFilePath)) {
                matchingExeFile = BinExeFilePath;
            } else {
                // If not found, look for other .exe files in the directory
                let exeFiles = fs.readdirSync(dirPath).filter((file) => file.toLowerCase().endsWith('.exe'));
                exeFiles = exeFiles.filter((file) => !file.toLowerCase().includes('uninstall.exe') && !file.toLowerCase().includes('unins000.exe') && !file.toLowerCase().includes('uninst.exe'));
                if (exeFiles.length > 0) {
                    let minDistance = Infinity;
                    let mostPossibleExeFileName = undefined;

                    exeFiles.forEach(exeFileName => {
                        const displayNameDistance = levenshtein.get(displayName, path.basename(exeFileName, '.exe'));

                        if (displayNameDistance < minDistance) {
                            console.log('SystemInstalledAppLoader: getMatchingExeFile: Distance for displayName: ' + displayName + ' And: ' + exeFileName + ' BaseName: ' + path.basename(exeFileName, '.exe') + ' Distance: ' + displayNameDistance);
                            minDistance = displayNameDistance;
                            mostPossibleExeFileName = exeFileName;
                        }
                    });

                    if (mostPossibleExeFileName) {
                        matchingExeFile = path.join(dirPath, mostPossibleExeFileName);
                    } else {
                        matchingExeFile = path.join(dirPath, exeFiles[0]);
                    }

                    console.log('SystemInstalledAppLoader: getMatchingExeFile: final MatchFile: ' + matchingExeFile);
                }
            }
        } else {
            // If rootDir is a directory, look for .exe file with the same name
            const dirName = path.basename(rootDir);
            const exeFile = `${dirName}.exe`;
            const exeFilePath = path.join(rootDir, exeFile);
            const binExeFilePath = path.join(rootDir, 'bin', exeFile);
            const BinExeFilePath = path.join(rootDir, 'Bin', exeFile);
            if (fs.existsSync(exeFilePath)) {
                matchingExeFile = exeFilePath;
            } else if (fs.existsSync(binExeFilePath)) {
                matchingExeFile = binExeFilePath;
            } else if (fs.existsSync(BinExeFilePath)) {
                matchingExeFile = BinExeFilePath;
            } else {
                // If not found, look for other .exe files in the directory
                let exeFiles = fs.readdirSync(rootDir).filter((file) => file.toLowerCase().endsWith('.exe'));
                exeFiles = exeFiles.filter((file) => !file.toLowerCase().includes('uninstall.exe') && !file.toLowerCase().includes('unins000.exe') && !file.toLowerCase().includes('uninst.exe'));
                if (exeFiles.length > 0) {
                    matchingExeFile = path.join(rootDir, exeFiles[0]);
                }
            }
        }
        return matchingExeFile;
    } catch (err) {
        return "";
    }
}

function getWindowsStartUpMenuApplications() {
    const startMenuPaths = [
        path.join(process.env.PROGRAMDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
        path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    ];

    const getApps = (dir) => {
        return fs.readdirSync(dir, { withFileTypes: true })
            .flatMap(dirent => {
                const res = path.resolve(dir, dirent.name);
                return dirent.isDirectory() ? getApps(res) : res;
            })
            .filter(file => typeof file === 'string' && file.toLowerCase().endsWith('.lnk') && !isNameInList(path.basename(file, '.lnk'), excludeAppName));
    };
    const appLnkPath = startMenuPaths.flatMap(getApps);

    const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

    const chunks = appLnkPath.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 40);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // Start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

    return chunks.map(chunk => {
        const output = getWindowsShortcutProperties.sync(chunk);
        // console.log('WindowShortcutInfo: OutPut: ', output);

        return output.map(shortcutInfo => {
            let appName = path.basename(shortcutInfo.FullName, '.lnk');
            const pathAppName = path.parse(path.basename(shortcutInfo.TargetPath)).name;
            if (isGarbled(appName)) {
                appName = pathAppName;
            }
            if (isGarbled(appName)) {
                return {
                    DisplayName: ''
                };
            }

            return {
                appName: pathAppName,
                DisplayName: appName,
                appIdentifier: appName,
                DisplayIcon: shortcutInfo.TargetPath,
                appLaunchPath: shortcutInfo.TargetPath
            }
        }).filter(appInfo => appInfo.DisplayName !== '' && appInfo.appLaunchPath.toLowerCase().endsWith('.exe') && !isNameInList(appInfo.appName, excludeAppName));
    }).flat();
}

function isGarbled(text) {
    // 中文字符范围
    // const chineseCharacterRegex = /[\u4e00-\u9fff]/;

    // 检查字符串中的非打印字符
    const nonPrintableRegex = /[^\x20-\x7E]/; // 仅ASCII可打印字符

    let hasNonPrintable = nonPrintableRegex.test(text);
    // let hasChineseCharacters = chineseCharacterRegex.test(text);

    // 如果包含非打印字符且不包含中文字符，可能是乱码

    return hasNonPrintable;
}

function deepCopy(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    let result = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = deepCopy(obj[key]);
        }
    }

    return result;
}
