import { app } from 'electron';
import defaultResourcesMap from '@/assets/resources.js';
import Constants from '@/utils/Constants';
import { randomString } from '@/utils/Utils';
import {loadPCInstalledApps} from "@/main/ai/SystemInstalledAppLoader";

const DecompressZip = require('decompress-zip');
const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const sharp = require('sharp');
const { DOMParser, XMLSerializer } = require('xmldom')

const DEFAULT_RESOURCE_PATH = '/resources/app/assets/';
const NODE_MODULES_PATH = '/resources/app/node_modules/';
const EXTRA_RESOURCE_PATH = '/resources/app/assets/resource/';
const RESOURCE_CONFIG_FILE = DEFAULT_RESOURCE_PATH + 'resources.conf';

export const PLUGIN_INSTALL_PATH = '/Plugins/';
export const ICON_INSTALL_PATH = '/resources/ExtraIcons/';
const EXTERNAL_ICONS_INDEX_FILE = ICON_INSTALL_PATH + 'iconResources.conf';

export const RESOURCE_DB = {
    BUILD_IN: 0,
    STANDARD_EXTRA: 1,
    EXTERNAL_IMPORT: 2,
};

class ResourcesManager {
    constructor(storeManager) {
        this.storeManager = storeManager;


        this.deviceConfigChangeListener = undefined;
        this.userDataPath = app.getPath('userData');
        this.defaultInstallPath = app.getPath('exe');

        this.resourcesConfigPath = path.join(this.userDataPath, RESOURCE_CONFIG_FILE);
        this.externalIconsConfigPath = path.join(this.userDataPath, EXTERNAL_ICONS_INDEX_FILE);

        this.extraResourcesPath = path.join(this.userDataPath, EXTRA_RESOURCE_PATH);

        if (!fs.existsSync(this.extraResourcesPath)) {
            fs.mkdirSync(this.extraResourcesPath, { recursive: true });
        }

        this.resourcesConfigPath = path.join(this.userDataPath, RESOURCE_CONFIG_FILE);
        console.log(
            'ResourceManager: defaultResourcePath: ',
            this.defaultInstallPath,
            ' userDataPath: ',
            this.userDataPath,
            ' resourcesConfigPath: ',
            this.resourcesConfigPath
        );

        if (!fs.existsSync(this.resourcesConfigPath)) {
            this.resourcesMap = [];
            this.resourcesMap.push(defaultResourcesMap);
            this.resourcesMap.push({
                data: [],
            });
            saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);
        } else {
            this.resourcesMap = JSON.parse(fs.readFileSync(this.resourcesConfigPath, 'utf-8'));
        }

        if (this.resourcesMap[RESOURCE_DB.BUILD_IN].version < defaultResourcesMap.version) {
            this.resourcesMap[RESOURCE_DB.BUILD_IN] = defaultResourcesMap;
            saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);
        }
        this.pcInstalledApps = [];

        loadPCInstalledApps().then(async installedApps => {
            console.log('ResourceManager: Loaded Installed APPS length: ', installedApps.length);
            console.log('ResourceManager: Loaded Installed APPS: ', installedApps);

            for (let i = 0; i < installedApps.length; i++) {
                const appInfo = installedApps[i];
                const appIconInfo = await this.getAppIconInfo(appInfo.appLaunchPath);
                if (appIconInfo) {
                    appInfo.displayIcon = appIconInfo.id;
                }
                this.pcInstalledApps.push(appInfo);
            }
        });
    }

    getInstalledApps() {
        return this.pcInstalledApps;
    }

    setDeviceConfigChangeListener(listener) {
        this.deviceConfigChangeListener = listener;
    }

    readFileToStr(filePath) {
        if (!fs.existsSync(filePath)) {
            return undefined;
        } else {
            return fs.readFileSync(filePath, 'utf-8');
        }
    }

    addPlugin(filePath) {
        return new Promise((resolve, reject) => {
            const that = this;

            const filePathInfo = this._getFilePathSplitInfo(filePath);

            const pluginId = filePathInfo[filePathInfo.length - 1].substring(
                0,
                filePathInfo[filePathInfo.length - 1].lastIndexOf('.')
            );
            const pluginStorePath = path.join(that.userDataPath, PLUGIN_INSTALL_PATH, pluginId);
            const extractPath = path.join(pluginStorePath, '..');

            const unzipper = new DecompressZip(filePath);

            unzipper.on('error', function (err) {
                console.log('ResourceManager: addPlugin: Caught an error during unzip.', err);
                shelljs.rm('-rf', pluginStorePath);
                reject(err);
            });

            unzipper.on('extract', async function () {
                console.log('ResourceManager: addPlugin: Finished extracting');

                const manifestFilePath = path.join(pluginStorePath, 'manifest.json');

                console.log('ResourceManager: addPlugin: manifestFilePath: ', manifestFilePath);

                if (!fs.existsSync(manifestFilePath)) {
                    shelljs.rm('-rf', pluginStorePath);
                    reject('Invalid plugin package');
                    return;
                }

                const manifestInfo = JSON.parse(that.readFileToStr(manifestFilePath));

                if (!manifestInfo.CodePath && !manifestInfo.CodePathWin && !manifestInfo.CodePathMac) {
                    reject('Plugin type not support');
                    return;
                }

                let currentPluginInfo = that.storeManager.storeGet('plugin.streamDeck');
                if (!currentPluginInfo) {
                    currentPluginInfo = [];
                }

                const tempIconStoreMap = new Map();

                let pluginIconPath = path.join(pluginStorePath, manifestInfo.Icon) + '.png';
                if (!fs.existsSync(pluginIconPath)) {
                    pluginIconPath = path.join(pluginStorePath, manifestInfo.Icon) + '.svg';

                    const resourceSavePath = path.join(pluginStorePath, 'extraIcons', manifestInfo.Icon + '.png');

                    await that.svgToPng(pluginIconPath, resourceSavePath);

                    pluginIconPath = resourceSavePath;
                }
                const iconInfoList = that._getFilePathSplitInfo(pluginIconPath);

                const iconResId = that.addExternalResource(pluginIconPath, iconInfoList[iconInfoList.length - 1]);

                tempIconStoreMap.set(manifestInfo.Icon, iconResId);

                const pluginLargeIconPath = path.join(pluginStorePath, manifestInfo.Icon) + '@2x.png';
                let iconLargeResId = undefined;
                if (fs.existsSync(pluginLargeIconPath)) {
                    const largeIconInfoList = that._getFilePathSplitInfo(pluginLargeIconPath);
                    iconLargeResId = that.addExternalResource(
                        pluginLargeIconPath,
                        largeIconInfoList[largeIconInfoList.length - 1]
                    );
                } else {
                    iconLargeResId = iconResId;
                }

                tempIconStoreMap.set(manifestInfo.Icon + '@2x', iconLargeResId);

                let categoryIconId = undefined;
                let categoryLargeIconId = undefined;

                if (manifestInfo.CategoryIcon) {
                    categoryIconId = tempIconStoreMap.get(manifestInfo.CategoryIcon);

                    if (!categoryIconId) {
                        let categoryIconPath = path.join(pluginStorePath, manifestInfo.CategoryIcon) + '.png';
                        if (!fs.existsSync(categoryIconPath)) {
                            categoryIconPath = path.join(pluginStorePath, manifestInfo.CategoryIcon) + '.svg';

                            const resourceSavePath = path.join(
                                pluginStorePath,
                                'extraIcons',
                                manifestInfo.CategoryIcon + '.png'
                            );

                            await that.svgToPng(categoryIconPath, resourceSavePath);

                            categoryIconPath = resourceSavePath;
                        }
                        const categoryIconInfoList = that._getFilePathSplitInfo(categoryIconPath);

                        categoryIconId = that.addExternalResource(
                            categoryIconPath,
                            categoryIconInfoList[categoryIconInfoList.length - 1]
                        );

                        tempIconStoreMap.set(manifestInfo.CategoryIcon, categoryIconId);
                    }

                    categoryLargeIconId = tempIconStoreMap.get(manifestInfo.CategoryIcon + '@2x');

                    if (!categoryLargeIconId) {
                        const categoryLargeIconPath = path.join(pluginStorePath, manifestInfo.CategoryIcon) + '@2x.png';
                        if (fs.existsSync(categoryLargeIconPath)) {
                            const largeIconInfoList = that._getFilePathSplitInfo(categoryLargeIconPath);
                            categoryLargeIconId = that.addExternalResource(
                                categoryLargeIconPath,
                                largeIconInfoList[largeIconInfoList.length - 1]
                            );
                        } else {
                            categoryLargeIconId = categoryIconId;
                        }

                        tempIconStoreMap.set(manifestInfo.CategoryIcon + '@2x', categoryLargeIconId);
                    }
                }

                for (let i = 0; i < manifestInfo.Actions.length; i++) {
                    const actionInfo = manifestInfo.Actions[i];

                    let actionIconResId = tempIconStoreMap.get(actionInfo.Icon);

                    if (!actionIconResId) {
                        let actionIconPath = path.join(pluginStorePath, actionInfo.Icon) + '.png';
                        if (!fs.existsSync(actionIconPath)) {
                            actionIconPath = path.join(pluginStorePath, actionInfo.Icon) + '.svg';

                            const resourceSavePath = path.join(pluginStorePath, 'extraIcons', actionInfo.Icon + '.png');

                            await that.svgToPng(actionIconPath, resourceSavePath);

                            actionIconPath = resourceSavePath;
                        }
                        const actionIconInfoList = that._getFilePathSplitInfo(actionIconPath);
                        actionIconResId = that.addExternalResource(
                            actionIconPath,
                            actionIconInfoList[actionIconInfoList.length - 1]
                        );
                        tempIconStoreMap.set(actionInfo.Icon, actionIconResId);
                    }
                    manifestInfo.Actions[i].iconId = actionIconResId;

                    if (!actionInfo.PropertyInspectorPath && manifestInfo.PropertyInspectorPath) {
                        manifestInfo.Actions[i].PropertyInspectorPath = manifestInfo.PropertyInspectorPath;
                    }

                    let actionLargeIconResId = tempIconStoreMap.get(actionInfo.Icon + '@2x');

                    if (!actionLargeIconResId) {
                        const actionLargeIconPath = path.join(pluginStorePath, actionInfo.Icon) + '@2x.png';
                        if (fs.existsSync(actionLargeIconPath)) {
                            const largeIconInfoList = that._getFilePathSplitInfo(actionLargeIconPath);
                            actionLargeIconResId = that.addExternalResource(
                                actionLargeIconPath,
                                largeIconInfoList[largeIconInfoList.length - 1]
                            );
                        } else {
                            actionLargeIconResId = actionIconResId;
                        }
                        tempIconStoreMap.set(actionInfo.Icon + '@2x', actionLargeIconResId);
                    }
                    manifestInfo.Actions[i].iconLargeId = actionLargeIconResId;

                    for (let j = 0; j < actionInfo.States.length; j++) {
                        const stateInfo = actionInfo.States[j];

                        let stateImgResId = tempIconStoreMap.get(stateInfo.Image);

                        if (!stateImgResId) {
                            let stateImgPath = path.join(pluginStorePath, stateInfo.Image) + '.png';
                            if (!fs.existsSync(stateImgPath)) {
                                stateImgPath = path.join(pluginStorePath, stateInfo.Image) + '.svg';

                                const resourceSavePath = path.join(
                                    pluginStorePath,
                                    'extraIcons',
                                    stateInfo.Image + '.png'
                                );

                                await that.svgToPng(stateImgPath, resourceSavePath);

                                stateImgPath = resourceSavePath;
                            }
                            const stateImgInfoList = that._getFilePathSplitInfo(stateImgPath);
                            stateImgResId = that.addExternalResource(
                                stateImgPath,
                                stateImgInfoList[stateImgInfoList.length - 1]
                            );
                            tempIconStoreMap.set(stateInfo.Image, stateImgResId);
                        }
                        actionInfo.States[j].imageId = stateImgResId;

                        let stateLargeImgResId = tempIconStoreMap.get(stateInfo.Image + '@2x');
                        if (!stateLargeImgResId) {
                            const stateLargeImgPath = path.join(pluginStorePath, stateInfo.Image) + '@2x.png';
                            if (fs.existsSync(stateLargeImgPath)) {
                                const largeIconInfoList = that._getFilePathSplitInfo(stateLargeImgPath);
                                stateLargeImgResId = that.addExternalResource(
                                    stateLargeImgPath,
                                    largeIconInfoList[largeIconInfoList.length - 1]
                                );
                            } else {
                                stateLargeImgResId = stateImgResId;
                            }
                            tempIconStoreMap.set(stateInfo.Image + '@2x', stateLargeImgResId);
                        }
                        actionInfo.States[j].imageLargeId = stateLargeImgResId;
                    }

                    if (actionInfo.Endoder && actionInfo.Endoder.Icon) {
                        let encoderIconResId = tempIconStoreMap.get(actionInfo.Endoder.Icon);

                        if (!encoderIconResId) {
                            let encoderIconPath = path.join(pluginStorePath, actionInfo.Endoder.Icon) + '.png';
                            if (!fs.existsSync(encoderIconPath)) {
                                encoderIconPath = path.join(pluginStorePath, actionInfo.Endoder.Icon) + '.svg';

                                const resourceSavePath = path.join(
                                    pluginStorePath,
                                    'extraIcons',
                                    actionInfo.Endoder.Icon + '.png'
                                );

                                await that.svgToPng(encoderIconPath, resourceSavePath);

                                encoderIconPath = resourceSavePath;
                            }
                            const encoderIconInfoList = that._getFilePathSplitInfo(encoderIconPath);
                            encoderIconResId = that.addExternalResource(
                                encoderIconPath,
                                encoderIconInfoList[encoderIconInfoList.length - 1]
                            );
                            tempIconStoreMap.set(actionInfo.Endoder.Icon, encoderIconResId);
                        }
                        manifestInfo.Actions[i].Endoder.iconId = encoderIconResId;

                        let encoderLargeIconResId = tempIconStoreMap.get(actionInfo.Endoder.Icon + '@2x');
                        if (!encoderLargeIconResId) {
                            const encoderLargeIconPath =
                                path.join(pluginStorePath, actionInfo.Endoder.Icon) + '@2x.png';
                            if (fs.existsSync(encoderLargeIconPath)) {
                                const largeIconInfoList = that._getFilePathSplitInfo(encoderLargeIconPath);
                                encoderLargeIconResId = that.addExternalResource(
                                    encoderLargeIconPath,
                                    largeIconInfoList[largeIconInfoList.length - 1]
                                );
                            } else {
                                encoderLargeIconResId = encoderIconResId;
                            }
                            tempIconStoreMap.set(actionInfo.Endoder.Icon + '@2x', encoderLargeIconResId);
                        }
                        manifestInfo.Actions[i].Endoder.iconLargeId = encoderLargeIconResId;
                    }
                }

                const newPluginInfo = {
                    pluginId: pluginId,
                    pluginPath: pluginStorePath,
                    iconId: iconResId,
                    iconLargeId: iconLargeResId,
                    categoryIconId: categoryIconId,
                    categoryLargeIconId: categoryLargeIconId,
                    pluginName: manifestInfo.Name,
                    manifestInfo: manifestInfo,
                };

                const newPluginInfoList = currentPluginInfo.filter(
                    pluginInfo => pluginInfo.pluginId && pluginInfo.pluginId !== pluginId
                );

                newPluginInfoList.push(newPluginInfo);

                newPluginInfoList.sort((pluginInfoA, pluginInfoB) => {
                    return pluginInfoA.pluginName - pluginInfoB.pluginName;
                });

                that.storeManager.storeSet('plugin.streamDeck', newPluginInfoList);

                resolve({
                    pluginName: manifestInfo.Name,
                    pluginId: pluginId,
                });
            });

            unzipper.on('progress', function (fileIndex, fileCount) {
                console.log('ResourceManager: addPlugin: Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
            });

            unzipper.extract({
                path: extractPath,
                filter: function (file) {
                    return file.type !== 'SymbolicLink';
                },
            });
        });
    }

    deletePlugin(pluginId) {
        console.log('ResourceManager: deletePlugin for ', pluginId);

        const currentPluginInfo = this.storeManager.storeGet('plugin.streamDeck');
        if (!currentPluginInfo) {
            return;
        }

        const existPluginInfo = currentPluginInfo.filter(
            pluginInfo => pluginInfo.pluginId && pluginInfo.pluginId === pluginId
        );

        if (!existPluginInfo || existPluginInfo.length === 0) return;

        const pluginDetails = existPluginInfo[0];

        this._deletePluginIcon(pluginDetails.iconId);
        this._deletePluginIcon(pluginDetails.iconLargeId);
        this._deletePluginIcon(pluginDetails.categoryIconId);
        this._deletePluginIcon(pluginDetails.categoryLargeIconId);

        pluginDetails.manifestInfo.Actions.forEach(actionInfo => {
            this._deletePluginIcon(actionInfo.iconId);
            this._deletePluginIcon(actionInfo.iconLargeId);

            actionInfo.States.forEach(stateInfo => {
                this._deletePluginIcon(stateInfo.imageId);
                this._deletePluginIcon(stateInfo.imageLargeId);
            });

            if (actionInfo.Endoder && actionInfo.Endoder.Icon) {
                this._deletePluginIcon(actionInfo.Endoder.iconId);
                this._deletePluginIcon(actionInfo.Endoder.iconLargeId);
            }
        });

        const pluginIcons = this.getAllResourceInfoByType(Constants.RESOURCE_TYPE_PLUGIN_ICON);

        if (pluginIcons && pluginIcons.length > 0) {
            let separator;
            if (process.platform === 'win32') {
                separator = '\\';
            } else {
                separator = '/';
            }
            const pluginExtraIcons = pluginIcons.filter(config => {
                return config.path.includes(separator + pluginId + separator);
            });

            if (pluginExtraIcons && pluginExtraIcons.length > 0) {
                pluginExtraIcons.forEach(iconInfo => {
                    this._deletePluginIcon(iconInfo.id);
                });
            }
        }

        shelljs.rm('-rf', existPluginInfo[0].pluginPath);

        const newPluginInfoList = currentPluginInfo.filter(
            pluginInfo => pluginInfo.pluginId && pluginInfo.pluginId !== pluginId
        );

        this.storeManager.storeSet('plugin.streamDeck', newPluginInfoList);
    }

    getResourceInfo(resourceId) {
        if (resourceId.indexOf('-') !== 1) {
            console.log('getResourceInfo invalid resourceId');
            return null;
        }

        const resInfo = resourceId.split('-');
        let resourceMapId, resourceInfoId;
        try {
            resourceMapId = Number.parseInt(resInfo[0]);
            resourceInfoId = Number.parseInt(resInfo[1]);
        } catch (err) {
            console.log('getResourceInfo failed to get ', resourceId, ' err: ', err);
            return null;
        }

        if (!this.resourcesMap[resourceMapId] || !this.resourcesMap[resourceMapId].data) return null;

        if (resourceInfoId >= this.resourcesMap[resourceMapId].data.length) {
            return null;
        }

        const resourceInfo = this.resourcesMap[resourceMapId].data[resourceInfoId];

        if (resourceInfo.isDelete) {
            return null;
        }
        return resourceInfo;
    }

    getConfigInfo(resourceId, rowCount = 2, colCount = 3) {
        const resourceInfo = this.getResourceInfo(resourceId);

        if (null === resourceInfo) {
            console.log('getConfigInfo for config ', resourceId, ' not exist');
            return null;
        }

        if (!fs.existsSync(resourceInfo.path)) {
            return null;
        }

        const requiredConfigs = rowCount * colCount;

        const configDetail = JSON.parse(fs.readFileSync(resourceInfo.path, 'utf-8'));

        if (requiredConfigs + 1 <= configDetail.length) return configDetail;

        const finalConfigDetail = [];

        for (let row = 1; row <= rowCount; row++) {
            for (let col = 1; col <= colCount; col++) {
                const visitKeyCode = `${row},${col}`;
                const filteredItem = configDetail.filter(item => item.keyCode === visitKeyCode);
                if (filteredItem !== undefined && filteredItem.length !== 0) {
                    finalConfigDetail.push(filteredItem[0]);
                    continue;
                }
                finalConfigDetail.push({
                    keyCode: visitKeyCode,
                    config: {
                        type: '',
                        title: {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: 0,
                        },
                        icon: '',
                        actions: [
                            {
                                type: '',
                                value: '',
                            },
                        ],
                    },
                });
            }
        }

        // Find and push for Knob Data
        const filteredItem = configDetail.filter(item => item.keyCode === '0,1');
        if (filteredItem !== undefined && filteredItem.length !== 0) {
            finalConfigDetail.push(filteredItem[0]);
        }

        console.log('ResourceManager:getConfigInfo: After filled missing data: ', finalConfigDetail);
        return finalConfigDetail;
    }

    getAllResourceInfoByType(resourceType) {
        if (!this.resourcesMap) {
            return [];
        }

        // console.log('ResourceManager:getAllResourceInfoByType: resourceType: ', resourceType);

        let resultList = [];
        if (this.resourcesMap[RESOURCE_DB.BUILD_IN].data && this.resourcesMap[RESOURCE_DB.BUILD_IN].data.length >= 1) {
            resultList = resultList.concat(
                this.resourcesMap[RESOURCE_DB.BUILD_IN].data.filter(resourceInfo => {
                    return resourceInfo.resourceType === resourceType && !resourceInfo.isDelete;
                })
            );
        }

        if (
            this.resourcesMap[RESOURCE_DB.STANDARD_EXTRA].data &&
            this.resourcesMap[RESOURCE_DB.STANDARD_EXTRA].data.length >= 1
        ) {
            resultList = resultList.concat(
                this.resourcesMap[RESOURCE_DB.STANDARD_EXTRA].data.filter(resourceInfo => {
                    return resourceInfo.resourceType === resourceType && !resourceInfo.isDelete;
                })
            );
        }

        // console.log('ResourceManager:getAllResourceInfoByType: filtered list: ', resultList);
        return resultList;
    }

    getAllExternalResourceInfoByType(resourceType, resourceDBId = RESOURCE_DB.STANDARD_EXTRA) {
        if (!this.resourcesMap) {
            return [];
        }

        // console.log('ResourceManager:getAllExternalResourceInfoByType: resourceType: ', resourceType);

        let resultList = [];

        if (!this.resourcesMap[resourceDBId] || !this.resourcesMap[resourceDBId].data) return [];

        if (this.resourcesMap[resourceDBId].data.length >= 1) {
            resultList = resultList.concat(
                this.resourcesMap[resourceDBId].data.filter(resourceInfo => {
                    return resourceInfo.resourceType === resourceType && !resourceInfo.isDelete;
                })
            );
        }

        // console.log('ResourceManager:getAllExternalResourceInfoByType: filtered list: ', resultList);
        return resultList;
    }

    addConfigInfo(configId, page, folder, configData) {
        const nextId = this.resourcesMap[RESOURCE_DB.STANDARD_EXTRA].data.length;

        if (nextId >= 0xffffffff) {
            console.log('ResourceManager:Max resources reached cannot add anymore !!!!!!!!');
            return '-1';
        }

        configId = Number(configId);
        page = Number(page);
        folder = Number(folder);

        const configFolderPath = path.join(this.extraResourcesPath, '/Configs/DeviceConfig' + configId);
        if (!fs.existsSync(configFolderPath)) {
            fs.mkdirSync(configFolderPath, { recursive: true });
        }

        if (page > 1 && folder === 1) {
            this._addNextPageButtonToPrevConfig(configId, page);

            configData = this._addPrevPageToConfig(configData);
        }

        const configFileName = 'KeyConfig' + page + '-' + folder + '.json';
        const configFilePath = path.join(configFolderPath, configFileName);
        console.log(
            'addConfigInfo for configId: ',
            configId,
            ' page: ',
            page,
            ' folder: ',
            folder,
            ' Path: ',
            configFilePath
        );
        fs.writeFileSync(configFilePath, JSON.stringify(configData));

        this.resourcesMap[RESOURCE_DB.STANDARD_EXTRA].data.push({
            id: 1 + '-' + nextId,
            name: configId + ',' + page + ',' + folder,
            path: configFilePath,
            isDelete: false,
            isDefault: false,
            resourceType: Constants.RESOURCE_TYPE_DEVICE_CONFIG,
            version: 1,
            generateTime: new Date().getTime(),
        });

        saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);

        return 1 + '-' + nextId;
    }

    updateConfigInfo(resourceId, configData) {
        const resourceInfo = this.getResourceInfo(resourceId);
        if (null === resourceInfo) {
            console.log('updateConfigInfo for config not exist');
            return false;
        }

        const currentConfigData = this.getConfigInfo(resourceId);

        const finalConfigArray = [];

        const keyCodeMap = {};

        configData.forEach(item => {
            keyCodeMap[item.keyCode] = item;
            finalConfigArray.push(item);
        });


        if (currentConfigData) {
            currentConfigData.forEach(item => {
                if (!keyCodeMap[item.keyCode]) {
                    finalConfigArray.push(item);
                }
            });
        }

        const currentConfigInfo = JSON.stringify(currentConfigData);
        const newConfigInfo = JSON.stringify(finalConfigArray);

        if (currentConfigInfo === newConfigInfo) {
            console.log('updateConfigInfo same config info for ' + resourceId + ' ignore update');
            return true;
        }

        console.log('updateConfigInfo for config: ', resourceInfo.name);
        fs.writeFileSync(resourceInfo.path, newConfigInfo);

        const resInfo = resourceId.split('-');
        let resourceMapId, resourceInfoId;
        try {
            resourceMapId = Number.parseInt(resInfo[0]);
            resourceInfoId = Number.parseInt(resInfo[1]);
        } catch (err) {
            console.log('updateConfigInfo failed to get ', resourceId, ' err: ' + JSON.stringify(err));
            return false;
        }

        if (resourceInfoId >= this.resourcesMap[resourceMapId].data.length) {
            return false;
        }

        this.resourcesMap[resourceMapId].data[resourceInfoId].generateTime = new Date().getTime();

        this.resourcesMap[resourceMapId].data[resourceInfoId].version =
            this.resourcesMap[resourceMapId].data[resourceInfoId].version === 0xffffffff
                ? 1
                : this.resourcesMap[resourceMapId].data[resourceInfoId].version + 1;
        saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);

        return true;
    }

    copyConfig(resourceId) {
        console.log('ResourceManager: copyConfig: for: ', resourceId);
        const resourceInfo = this.getResourceInfo(resourceId);
        if (resourceInfo.resourceType !== Constants.RESOURCE_TYPE_DEVICE_CONFIG) return;

        const configIdx = resourceInfo.name;

        const configIdxInfo = configIdx.split(',');

        const currentConfigId = Number.parseInt(configIdxInfo[0]);

        const keyConfigResources = this.getAllResourceInfoByType(Constants.RESOURCE_TYPE_DEVICE_CONFIG);
        const relatedConfigResourcesList = [];
        let maxConfigId = currentConfigId;

        // Get maxConfigId and configs under current config, i.e: page/folder > current
        keyConfigResources.forEach(configResource => {
            if (configResource.name.startsWith(currentConfigId + ',')) {
                relatedConfigResourcesList.push(configResource);
            }
            const cfgIdx = configResource.name.split(',');
            const filterConfigId = Number.parseInt(cfgIdx[0]);
            if (filterConfigId > maxConfigId) {
                maxConfigId = filterConfigId;
            }
        });
        console.log(
            'ResourceManager: copyConfig: for: ',
            resourceId,
            ' MaxConfigId: ',
            maxConfigId,
            ' currentConfigId: ',
            currentConfigId
        );

        if (relatedConfigResourcesList.length === 0) {
            return;
        }

        let newConfigMainId = undefined;

        relatedConfigResourcesList.forEach(configResInfo => {
            const currentConfigInfo = this.getConfigInfo(configResInfo.id);

            const currentConfigIdx = configResInfo.name.split(',');

            const pageId = Number.parseInt(currentConfigIdx[1]);
            const folderId = Number.parseInt(currentConfigIdx[2]);

            for (let i = 0; i < currentConfigInfo.length; i++) {
                const configInfo = currentConfigInfo[i];
                if (configInfo.config.type !== 'back' && configInfo.config.type !== 'folder') {
                    continue;
                }
                const oldConfigActions = configInfo.config.actions
                // eslint-disable-next-line
                const [oldConfigId, oldPageId, oldFolderId] = oldConfigActions[0].value.split(',');

                configInfo.config.actions = [{
                    type: oldConfigActions[0].type,
                    value: `${maxConfigId + 1},${oldPageId},${oldFolderId}`,
                }];
                currentConfigInfo[i] = configInfo;
            }

            const newCfgId = this.addConfigInfo(maxConfigId + 1, pageId, folderId, currentConfigInfo);

            if (!newConfigMainId && pageId === 1 && folderId === 1) {
                newConfigMainId = newCfgId;
            }
        });

        return newConfigMainId;
    }

    deleteConfig(resourceId) {
        const resourceInfo = this.getResourceInfo(resourceId);

        if (!resourceInfo) return;

        if (resourceInfo.resourceType !== Constants.RESOURCE_TYPE_DEVICE_CONFIG) return;

        const configIdx = resourceInfo.name;
        console.log('ResourceManager: deleteConfig for ResourceId: ', resourceId, ' configIdx: ', configIdx);

        const configIdxInfo = configIdx.split(',');

        const currentConfigId = Number.parseInt(configIdxInfo[0]);
        const currentPage = Number.parseInt(configIdxInfo[1]);
        const currentFolder = Number.parseInt(configIdxInfo[2]);

        const keyConfigs = this.getAllResourceInfoByType(Constants.RESOURCE_TYPE_DEVICE_CONFIG);

        // Get all configs under current configId
        const deviceConfigResourceList = [];
        let maxPageId = 1;
        keyConfigs.forEach(config => {
            // eslint-disable-next-line
            const [configId, pageId, folderId] = config.name.split(',');

            if (Number(configId) !== currentConfigId) return;

            const configPageId = Number(pageId);
            if (configPageId > maxPageId) {
                maxPageId = configPageId;
            }

            if (config.id !== resourceId) {
                deviceConfigResourceList.push(config);
            }
        });
        console.log('ResourceManager: deleteConfig for ResourceId: ' + resourceId + ' currentConfigId: ' + currentConfigId + ' deviceConfigResourceList: ' + JSON.stringify(deviceConfigResourceList) + ' keyConfigs: ' + JSON.stringify(keyConfigs));

        const appMonitorConfig = this.storeManager.storeGet('settings.appMonitorConfig');

        if (appMonitorConfig) {
            const savedAppMonitorConfig = JSON.parse(appMonitorConfig);
            delete savedAppMonitorConfig[resourceId];

            this.storeManager.storeSet('settings.appMonitorConfig', JSON.stringify(savedAppMonitorConfig));
        }


        if (deviceConfigResourceList.length === 0) {
            this.deleteResource(resourceId);

            if (!this.deviceConfigChangeListener) return;

            this.deviceConfigChangeListener(resourceId, currentConfigId, currentPage, currentFolder);
            return;
        }

        console.log('ResourceManager: deleteConfig for ResourceId: ', resourceId, ' currentPage: ', currentPage, ' maxPageId: ', maxPageId, ' currentFolder: ', currentFolder);
        // Delete related invalid pageUp/pageDown action when delete first or last page
        if (currentFolder === 1 && (currentPage === 1 || currentPage === maxPageId)) {
            this._removeInvalidPageAction(deviceConfigResourceList, currentPage, maxPageId);
        }

        const needUpdateResources = [];

        deviceConfigResourceList.forEach(configInfo => {
            const nextConfigIdx = configInfo.name.split(',');

            const nextPageId = Number.parseInt(nextConfigIdx[1]);

            if (nextPageId)

            if (nextPageId === currentPage && Number.parseInt(nextConfigIdx[2]) > currentFolder) { // Delete folders in page
                this.deleteResource(configInfo.id);
            } else if (nextPageId > currentPage) { // Filter all sub pages
                needUpdateResources.push({
                    resourceId: configInfo.id,
                    configId: currentConfigId,
                    pageId: nextPageId - 1,
                    folderId: nextConfigIdx[2],
                    path: configInfo.path,
                });
            }
        });

        this.deleteResource(resourceId);

        if (needUpdateResources.length === 0) {
            if (!this.deviceConfigChangeListener) return;

            this.deviceConfigChangeListener(resourceId, currentConfigId, currentPage, currentFolder);
            return;
        }

        // Update sub pages cache data for page, folder info
        needUpdateResources.forEach(updateResourceInfo => {
            const configFolderPath = path.join(
                this.extraResourcesPath,
                '/Configs/DeviceConfig' + updateResourceInfo.configId
            );

            const configFileName =
                'KeyConfig' + updateResourceInfo.pageId + '-' + updateResourceInfo.folderId + '.json';
            const configFilePath = path.join(configFolderPath, configFileName);

            if (!fs.existsSync(updateResourceInfo.path)) return;
            fs.renameSync(updateResourceInfo.path, configFilePath);

            const resInfo = updateResourceInfo.resourceId.split('-');
            let resourceMapId, resourceInfoId;
            try {
                resourceMapId = Number.parseInt(resInfo[0]);
                resourceInfoId = Number.parseInt(resInfo[1]);

                if (resourceInfoId < this.resourcesMap[resourceMapId].data.length) {
                    this.resourcesMap[resourceMapId].data[resourceInfoId].path = configFilePath;
                    this.resourcesMap[resourceMapId].data[resourceInfoId].name =
                        updateResourceInfo.configId +
                        ',' +
                        updateResourceInfo.pageId +
                        ',' +
                        updateResourceInfo.folderId;
                    this.resourcesMap[resourceMapId].data[resourceInfoId].isDelete = false;
                    this.resourcesMap[resourceMapId].data[resourceInfoId].version =
                        this.resourcesMap[resourceMapId].data[resourceInfoId].version === 0xffffffff
                            ? 1
                            : this.resourcesMap[resourceMapId].data[resourceInfoId].version + 1;
                }
            } catch (err) {
                console.log('deleteConfig failed to get ', resourceId, ' err: ' + JSON.stringify(err));
            }
        });
        saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);

        if (!this.deviceConfigChangeListener) return;

        this.deviceConfigChangeListener(resourceId, currentConfigId, currentPage, currentFolder);
    }

    getDefaultResourceInfo(resourceType) {
        if (!resourceType) {
            return [];
        }
        const typeResources = this.getAllResourceInfoByType(resourceType);
        if (!typeResources || typeResources.length === 0) {
            return [];
        }
        const typeResourcesDefaultInfo = typeResources.filter(config => {
            return config.isDefault && !config.isDelete;
        });

        if (!typeResourcesDefaultInfo || typeResourcesDefaultInfo.length < 1) return [];

        return typeResourcesDefaultInfo;
    }

    markConfigAsDefault(resourceId, isDefault) {
        const resourceInfo = this.getResourceInfo(resourceId);
        if (null === resourceInfo || resourceInfo.isDelete) {
            console.log('markConfigAsDefault for config not exist');
            return false;
        }

        const resInfo = resourceId.split('-');
        let resourceMapId;
        try {
            resourceMapId = Number.parseInt(resInfo[0]);
        } catch (err) {
            console.log('getResourceInfo failed to get ', resourceId, ' err: ', err);
            return false;
        }

        console.log('markConfigAsDefault for config: ', resourceInfo.name);

        this.resourcesMap[resourceMapId].data = this.resourcesMap[resourceMapId].data.map(resourceInfo => {
            if (resourceInfo.resourceType === Constants.RESOURCE_TYPE_DEVICE_CONFIG && !resourceInfo.isDelete) {
                if (resourceId === resourceInfo.id) {
                    resourceInfo.isDefault = isDefault;
                } else {
                    resourceInfo.isDefault = false;
                }
            }
            return resourceInfo;
        });

        console.log('markConfigAsDefault after modify config: ', JSON.stringify(this.resourcesMap));

        saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);
        return true;
    }

    addResource(
        resourcePath,
        resourceName,
        resourceType = Constants.RESOURCE_TYPE_ICON,
        resourceDBId = RESOURCE_DB.STANDARD_EXTRA
    ) {
        const newResourcePath = path.join(this.extraResourcesPath, resourceName);
        try {
            fs.copyFileSync(resourcePath, newResourcePath);
        } catch (err) {
            console.log('ResourceManager:Failed to copy file from: ', resourcePath, ' err: ', err);
            return '-1';
        }

        const nextId = this.resourcesMap[resourceDBId].data.length;

        if (nextId >= 0xffffffff) {
            console.log('ResourceManager:Max resources reached cannot add anymore !!!!!!!!');
            return '-1';
        }

        this.resourcesMap[resourceDBId].data.push({
            id: 1 + '-' + nextId,
            name: resourceName,
            path: newResourcePath,
            isDelete: false,
            isDefault: false,
            resourceType: resourceType,
            version: 1,
        });

        saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);

        return 1 + '-' + nextId;
    }

    batchAddExternalResource(resourceInfoList) {
        const resIdList = [];
        for (let i = 0; i < resourceInfoList.length; i++) {
            const resourceInfo = resourceInfoList[i];

            const resId = this.addExternalResource(
                resourceInfo.resourcePath,
                resourceInfo.resourceName,
                resourceInfo.resourceType,
                resourceInfo.resourceDBId,
                resourceInfo.extraData,
                i + 1 === resourceInfoList.length
            );

            if (resId !== '-1') {
                resIdList.push(resId);
            }
        }

        return resIdList;
    }

    addExternalResource(
        resourcePath,
        resourceName,
        resourceType = Constants.RESOURCE_TYPE_ICON,
        resourceDBId = RESOURCE_DB.STANDARD_EXTRA,
        extraData,
        doUpdateFile = true
    ) {
        if (!this.resourcesMap[resourceDBId]) {
            this.resourcesMap[resourceDBId] = {
                data: [],
            };
        } else if (!this.resourcesMap[resourceDBId].data) {
            this.resourcesMap[resourceDBId].data = [];
        }

        let nextId = this.resourcesMap[resourceDBId].data.length;

        const oldResourceInfo = this.resourcesMap[resourceDBId].data.filter(
            resourceInfo => resourceInfo.path === resourcePath && resourceInfo.name === resourceName
        );

        const haveOldResource = oldResourceInfo && oldResourceInfo.length !== 0;

        console.log('ResourceManager: addExternalResource: haveOldResource: ' + haveOldResource);

        if (!haveOldResource && nextId >= 0xffffffff) {
            console.log('ResourceManager:Max resources reached cannot add anymore !!!!!!!!');
            return '-1';
        }

        if (haveOldResource) {
            const oldResourceDetail = oldResourceInfo[0];
            const resIdInfo = oldResourceDetail.id.split('-');
            const resourceInfoId = Number.parseInt(resIdInfo[1]);

            nextId = resourceInfoId;

            this.resourcesMap[resourceDBId].data[resourceInfoId].path = resourcePath;
            this.resourcesMap[resourceDBId].data[resourceInfoId].name = resourceName;
            this.resourcesMap[resourceDBId].data[resourceInfoId].isDelete = false;
            this.resourcesMap[resourceDBId].data[resourceInfoId].version =
                this.resourcesMap[resourceDBId].data[resourceInfoId].version === 0xffffffff
                    ? 1
                    : this.resourcesMap[resourceDBId].data[resourceInfoId].version + 1;
            this.resourcesMap[resourceDBId].data[resourceInfoId].extraData = extraData;
        } else {
            this.resourcesMap[resourceDBId].data.push({
                id: resourceDBId + '-' + nextId,
                name: resourceName,
                path: resourcePath,
                isDelete: false,
                isDefault: false,
                resourceType: resourceType,
                version: 1,
                extraData: extraData,
            });
        }

        if (doUpdateFile) {
            saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);
        }

        return resourceDBId + '-' + nextId;
    }

    replaceResource(resourceId, resourcePath, resourceName) {
        const resInfo = resourceId.split('-');
        let resourceMapId, resourceInfoId;
        try {
            resourceMapId = Number.parseInt(resInfo[0]);
            resourceInfoId = Number.parseInt(resInfo[1]);
        } catch (err) {
            console.log('getResourceInfo failed to get ', resourceId, ' err: ', err);
            return false;
        }

        if (resourceInfoId >= this.resourcesMap[resourceMapId].data.length) {
            return false;
        }

        if (this.resourcesMap[resourceMapId].data[resourceInfoId].isDefault) {
            console.log('ResourceManager:Default resource not allow to replace');
            return false;
        }

        // If file exist move to tmp file first
        const filePath = this.resourcesMap[resourceMapId].data[resourceInfoId].path;
        const tempPath = filePath + '.tmp';
        if (fs.existsSync(filePath)) {
            try {
                fs.copyFileSync(filePath, tempPath);
                fs.unlinkSync(filePath);
            } catch (err) {
                console.log('ResourceManager:Failed to copy resource to tmp file at : ', filePath);
                return false;
            }
        }

        const newResourcePath = path.join(this.extraResourcesPath, resourceName);
        try {
            fs.copyFileSync(resourcePath, newResourcePath);
        } catch (err) {
            // If copy new resource file failed. Move back tmp file
            fs.copyFileSync(tempPath, filePath);
            fs.unlinkSync(tempPath);
            console.log('ResourceManager:Failed to copy file from: ', resourcePath, ' err: ', err);
            return false;
        }

        this.resourcesMap[resourceMapId].data[resourceInfoId].path = newResourcePath;
        this.resourcesMap[resourceMapId].data[resourceInfoId].name = resourceName;
        this.resourcesMap[resourceMapId].data[resourceInfoId].isDelete = false;
        this.resourcesMap[resourceMapId].data[resourceInfoId].generateTime = new Date().getTime();
        this.resourcesMap[resourceMapId].data[resourceInfoId].version =
            this.resourcesMap[resourceMapId].data[resourceInfoId].version === 0xffffffff
                ? 1
                : this.resourcesMap[resourceMapId].data[resourceInfoId].version + 1;

        try {
            fs.unlinkSync(tempPath);
        } catch (err) {
            console.log('ResourceManager:Failed to remove tmp file: ', tempPath, ' err: ', err);
        }

        saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);

        return true;
    }

    batchDeleteResource(resourceIdList) {
        for (let i = 0; i < resourceIdList.length; i++) {
            this.deleteResource(resourceIdList[i], i + 1 === resourceIdList.length);
        }
    }

    deleteResource(resourceId, doUpdateStoreFile = true) {
        const resInfo = resourceId.split('-');
        let resourceMapId, resourceInfoId;
        try {
            resourceMapId = Number.parseInt(resInfo[0]);
            resourceInfoId = Number.parseInt(resInfo[1]);
        } catch (err) {
            console.log('getResourceInfo failed to get ', resourceId, ' err: ', err);
            return false;
        }

        if (resourceInfoId >= this.resourcesMap[resourceMapId].data.length) {
            return false;
        }

        if (this.resourcesMap[resourceMapId].data[resourceInfoId].isDefault) {
            console.log('ResourceManager:Default resource not allow to delete');
            return false;
        }

        const filePath = this.resourcesMap[resourceMapId].data[resourceInfoId].path;

        if (!fs.existsSync(filePath)) {
            console.log('ResourceManager:Resource not exist at ', filePath);
            return false;
        }

        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.log('ResourceManager:Failed to delete resource at : ', filePath);
            return false;
        }

        this.resourcesMap[resourceMapId].data[resourceInfoId].isDelete = true;

        if (doUpdateStoreFile) {
            saveResourcesConfig(this.resourcesConfigPath, this.resourcesMap);
        }

        return true;
    }

    getRelatedSrcPath(resourcePath, fileAccessPath = false) {
        if (!resourcePath.startsWith('@/')) {
            return resourcePath;
        }

        const newResPath = resourcePath.replace('@/', '');

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            return fileAccessPath ? '' : 'file://' + path.join(this.defaultInstallPath, '/../../../../public/', newResPath);
        } else {
            return fileAccessPath ? '' : 'file://' + path.join(this.defaultInstallPath, '..', DEFAULT_RESOURCE_PATH, '..', newResPath);
        }
    }

    getNodeModuleResourceRelatedPath(pathInfo) {
        if (!pathInfo.startsWith('@')) {
            return pathInfo;
        }

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            return 'file://' + path.join(this.defaultInstallPath, '/../../../../node_modules/', pathInfo);
        } else {
            return 'file://' + path.join(this.defaultInstallPath, '..', NODE_MODULES_PATH, pathInfo);
        }
    }

    async getMDIIconResIdByName(mdiIconName) {
        const mdiIcons = require('@mdi/svg/meta.json');
        if (mdiIcons.length > 0) {
            let existMDIIconInfo = mdiIcons.find(iconInfo => iconInfo.name === mdiIconName);

            console.log('ResourceManager: getMDIIconResIdByName: existMDIIconInfo: ' + JSON.stringify(existMDIIconInfo));

            if (!existMDIIconInfo) {
               const similarMDIIcons = mdiIcons.filter(iconInfo => iconInfo.name.startsWith(mdiIconName + '-') || iconInfo.name.endsWith('-' + mdiIconName));

               if (!similarMDIIcons || similarMDIIcons.length === 0) {
                   return '-1';
               }

               existMDIIconInfo = similarMDIIcons[0];
            }

            return await this.getConvertedIconId({
                id: '@mdi/svg/svg/' + existMDIIconInfo.name + '.svg',
                name: existMDIIconInfo.name,
                tags: existMDIIconInfo.tags,
                resourceType: 'MDI_ICON'
            });
        }
    }

    async getConvertedIconId(mdiIconInfo) {
        const iconResources = this.getAllExternalResourceInfoByType(Constants.RESOURCE_TYPE_ICON);
        const existMDIIconInfo = iconResources.find(resourceInfo => resourceInfo.extraData === mdiIconInfo.id);

        if (existMDIIconInfo) return existMDIIconInfo.id;

        const svgFilePath = this.getNodeModuleResourceRelatedPath(mdiIconInfo.id);

        const iconSVGData = this.readFileToStr(svgFilePath.replace('file://', ''));

        if (iconSVGData === '') return '-1';

        const svgDocument = new DOMParser().parseFromString(iconSVGData, 'image/svg+xml');
        const svgElement = svgDocument.getElementsByTagName('svg');
        if (svgElement) {
            svgElement[0].setAttribute('fill', 'white');
            svgElement[0].setAttribute('style', 'width: 170px; height: 170px');
        }

        // 序列化修改后的SVG数据
        const serializer = new XMLSerializer();
        const finalSVGData = serializer.serializeToString(svgDocument);

        console.log('ResourceManager: getConvertedIconId: mdiIconInfo: ' + JSON.stringify(mdiIconInfo) + ' finalSVGData: ' + finalSVGData);

        const extraIconStorePath = path.join(this.userDataPath, ICON_INSTALL_PATH, 'MDI_ICONS');

        if (!fs.existsSync(extraIconStorePath)) {
            fs.mkdirSync(extraIconStorePath, { recursive: true });
        }
        const newIconSavePath = path.join(extraIconStorePath, mdiIconInfo.name + '.png');

        await sharp(Buffer.from(finalSVGData))
            .resize(170, 170)  // 调整最终图标的大小
            .modulate({
                saturation: 0, // 降低饱和度到0，使图像变为灰度
                brightness: 2  // 提高亮度，使图像变为白色
            })
            .png()
            .toFile(newIconSavePath);

        return this.addExternalResource(newIconSavePath, mdiIconInfo.name, Constants.RESOURCE_TYPE_ICON, RESOURCE_DB.STANDARD_EXTRA, mdiIconInfo.id, true);
    }

    addIconPack(filePath = '') {
        return new Promise((resolve, reject) => {
            const that = this;

            const iconResTempName = randomString(24);

            const extraIconStorePath = path.join(that.userDataPath, ICON_INSTALL_PATH, iconResTempName);

            const unzipper = new DecompressZip(filePath);

            unzipper.on('error', function (err) {
                console.log('ResourceManager: addIconPack: Caught an error during unzip.', err);
                shelljs.rm('-rf', extraIconStorePath);
                reject(err);
            });

            unzipper.on('extract', async function () {
                console.log('ResourceManager: addIconPack: Finished extracting');

                let iconsStoredPath = extraIconStorePath;

                const files = fs.readdirSync(iconsStoredPath);

                let haveDeeperDir = false;

                for (let i = 0; i < files.length; i++) {
                    const filePath = path.join(iconsStoredPath, files[i]);
                    const stats = fs.statSync(filePath);

                    if (stats.isDirectory()) {
                        haveDeeperDir = true;
                        iconsStoredPath = filePath;
                    } else {
                        haveDeeperDir = false;
                        iconsStoredPath = extraIconStorePath;
                        break;
                    }
                }

                if (haveDeeperDir) {
                    const filePathInfo = that._getFilePathSplitInfo(iconsStoredPath);
                    let newIconsPath = path.join(iconsStoredPath, '../..', filePathInfo[filePathInfo.length - 1]);
                    console.log(
                        'ResourceManager: addIconPack: have deeper dir: moving from iconsStoredPath: ',
                        iconsStoredPath,
                        ' To: ',
                        newIconsPath
                    );

                    if (fs.existsSync(newIconsPath)) {
                        shelljs.mv(iconsStoredPath, path.join(newIconsPath, '..'));
                    } else {
                        shelljs.mv(iconsStoredPath, newIconsPath);
                    }

                    shelljs.rm('-rf', extraIconStorePath);
                    iconsStoredPath = newIconsPath;
                }

                const manifestFilePath = path.join(iconsStoredPath, 'manifest.json');
                const iconfontFilePath = path.join(iconsStoredPath, 'iconfont.json');
                console.log(
                    'ResourceManager: addIconPack: manifestFilePath: ',
                    manifestFilePath,
                    ' iconfontFilePath: ',
                    iconfontFilePath
                );

                if (fs.existsSync(manifestFilePath)) {
                    const manifestInfo = JSON.parse(that.readFileToStr(manifestFilePath));
                    const importRet = await that._doStreamDeckIconImport(manifestInfo, iconsStoredPath);
                    if (!importRet) {
                        shelljs.rm('-rf', iconsStoredPath);
                        reject('Install failed');
                        return;
                    }

                    resolve({
                        iconPackName: manifestInfo.Name,
                    });
                } else if (fs.existsSync(iconfontFilePath)) {
                    const iconfontInfo = JSON.parse(that.readFileToStr(iconfontFilePath));
                    const importRet = await that._doIconFontIconImport(iconfontInfo, iconsStoredPath);

                    if (!importRet) {
                        shelljs.rm('-rf', iconsStoredPath);
                        reject('Install failed');
                        return;
                    }

                    resolve({
                        iconPackName: iconfontInfo.name,
                    });
                } else {
                    shelljs.rm('-rf', extraIconStorePath);
                    reject('Invalid icon pack');
                }
            });

            unzipper.on('progress', function (fileIndex, fileCount) {
                console.log('ResourceManager: addIconPack: Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
            });

            unzipper.extract({
                path: extraIconStorePath,
                filter: function (file) {
                    return file.type !== 'SymbolicLink';
                },
            });
        });
    }

    getExternalIconPackInfoList() {
        if (!fs.existsSync(this.externalIconsConfigPath)) return [];

        const iconPackList = JSON.parse(fs.readFileSync(this.externalIconsConfigPath, 'utf-8'));

        if (iconPackList.length === 0) return [];
        const finalIconList = [];
        iconPackList.forEach(iconPackInfo => {
            iconPackInfo.iconList = this.getAllExternalResourceInfoByType(
                iconPackInfo.iconPackType,
                RESOURCE_DB.EXTERNAL_IMPORT
            );
            finalIconList.push(iconPackInfo);
        });

        return finalIconList;
    }

    getExternalResourceByName(resourceName) {
        return this.resourcesMap[RESOURCE_DB.STANDARD_EXTRA].data.find(
            resourceInfo => !resourceInfo.isDelete && resourceInfo.resourceType === Constants.RESOURCE_TYPE_ICON && resourceInfo.name === resourceName
        );
    }

    getAppIconInfo(appPath) {
        const that = this;
        return new Promise((resolve, reject) => {
            const fileNameWithExt = path.basename(appPath);
            const fileNameWithoutExt = path.parse(fileNameWithExt).name;

            const appIconInfo = that.getExternalResourceByName(fileNameWithoutExt + '.png');
            if (appIconInfo) {
                resolve(appIconInfo);
                return;
            }

            app.getFileIcon(appPath, { size: "large" })
                .then(icon => {
                    const parentDir = path.join(that.userDataPath, ICON_INSTALL_PATH, 'CustomSelect');
                    const outputPath = path.join(parentDir, `${fileNameWithoutExt}.png`);
                    if (!fs.existsSync(parentDir)) {
                        fs.mkdirSync(parentDir, { recursive: true });
                    }
                    console.log('ResourceManager: getAppIconInfo: AppIcon Path: ', outputPath);
                    fs.writeFile(outputPath, icon.toPNG(), err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const iconId = that.addExternalResource(outputPath, `${fileNameWithoutExt}.png`);

                        resolve(that.getResourceInfo(iconId))
                    });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    deleteExternalIconPack(iconPackType) {
        const externalIconList = this.getAllExternalResourceInfoByType(iconPackType, RESOURCE_DB.EXTERNAL_IMPORT);

        if (externalIconList.length > 0) {
            const deleteResIdList = externalIconList.map(iconInfo => iconInfo.id);
            this.batchDeleteResource(deleteResIdList);
        }

        let externalIconPackList = this.getExternalIconPackInfoList();

        if (externalIconPackList.length === 0) return;

        const externalIconPackInfo = externalIconPackList.find(
            iconPackInfo => iconPackInfo.iconPackType === iconPackType
        );

        shelljs.rm('-rf', externalIconPackInfo.iconPackPath);

        externalIconPackList = externalIconPackList.filter(iconPackInfo => iconPackInfo.iconPackType !== iconPackType);

        fs.writeFileSync(this.externalIconsConfigPath, JSON.stringify(externalIconPackList));
    }

    getPluginSettings(activeProfileId, keyCode, multiActionIdx) {
        const configDetailList = this.getConfigInfo(activeProfileId);

        if (configDetailList === null) {
            return undefined;
        }

        const configData = configDetailList.find(configInfo => configInfo.keyCode === keyCode);
        if (!configData) {
            return undefined;
        }

        let actionsList = [];
        if (configData.config.type === 'multiActions') {
            if (multiActionIdx < 0 || (multiActionIdx) >=  configData.config.subActions.length) {
                return undefined;
            }
            actionsList = configData.config.subActions[multiActionIdx].config.actions;
        } else {
            actionsList = configData.config.actions;
        }

        const savedPluginSettings = actionsList.find(actionInfo => actionInfo.type === 'pluginSettings');

        if (!savedPluginSettings || savedPluginSettings.value === '') {
            return undefined;
        }
        return JSON.parse(savedPluginSettings.value);
    }

    setPluginSettings(activeProfileId, keyCode, multiActionIdx, settingsData) {
        const configDetailList = this.getConfigInfo(activeProfileId);

        if (configDetailList === null) {
            return;
        }

        const finalConfigDetailList = configDetailList.map(configData => {
            if (configData.keyCode !== keyCode) {
                return configData;
            }

            if (configData.config.type === 'multiActions') {
                if (multiActionIdx < 0 || multiActionIdx >= configData.config.subActions.length) {
                    return configData;
                }

                const oldActionsInfo = configData.config.subActions[multiActionIdx].config.actions;

                configData.config.subActions[multiActionIdx].config.actions = this._updatePluginActionSetting(oldActionsInfo, settingsData);

            } else if (configData.isPlugin) {
                const oldActionsInfo = configData.config.actions;

                configData.config.actions = this._updatePluginActionSetting(oldActionsInfo, settingsData);
            }

            return configData;
        });

        console.log('ResourcesManager: setPluginSettings: finalConfigDetailList: ' + JSON.stringify(finalConfigDetailList));

        this.updateConfigInfo(activeProfileId, finalConfigDetailList);
    }

    _updatePluginActionSetting(oldActionsInfo, pluginSettings) {
        let havePluginSettings = false;
        const newActionsInfo = oldActionsInfo.map(actionInfo => {
            if (actionInfo.type !== 'pluginSettings') {
                return actionInfo;
            }

            havePluginSettings = true;
            actionInfo.value = JSON.stringify(pluginSettings);

            return actionInfo;
        });

        if (!havePluginSettings) {
            newActionsInfo.push({
                type: 'pluginSettings',
                value: JSON.stringify(pluginSettings)
            });
        }

        console.log('ResourcesManager: _updatePluginActionSetting: havePluginSettings: ' + havePluginSettings + ' newActionsInfo: ' + JSON.stringify(newActionsInfo));


        return newActionsInfo;
    }

    async _doStreamDeckIconImport(manifestInfo, iconStorePath) {
        const iconInfosFilePath = path.join(iconStorePath, 'icons.json');

        console.log(
            'ResourceManager: _doStreamDeckIconImport: iconStorePath: ',
            iconStorePath,
            ' iconInfosFilePath: ',
            iconInfosFilePath
        );

        if (!fs.existsSync(iconInfosFilePath)) {
            console.log('ResourceManager: _doStreamDeckIconImport: iconInfosFilePath not exit: ', iconInfosFilePath);
            return false;
        }

        const iconsInfo = JSON.parse(this.readFileToStr(iconInfosFilePath));

        const installedIconRequestList = [];
        const regExp = new RegExp(' ', 'g');

        let installedIconList = [];

        const iconType = 'ExternalIcon_' + manifestInfo.Name.replace(regExp, '_');

        try {
            for (let i = 0; i < iconsInfo.length; i++) {
                const iconDetail = iconsInfo[i];
                let iconPath = path.join(iconStorePath, '/icons/', iconDetail.path);
                if (iconDetail.path.endsWith('.svg')) {
                    const svgData = this.readFileToStr(iconPath);

                    const newIconPath = iconPath.replace('.svg', '.png');

                    await sharp(Buffer.from(svgData)).png().toFile(newIconPath);

                    iconPath = newIconPath;
                }
                installedIconRequestList.push({
                    resourcePath: iconPath,
                    resourceName: iconDetail.name,
                    resourceType: iconType,
                    resourceDBId: RESOURCE_DB.EXTERNAL_IMPORT,
                    extraData: iconDetail.tags,
                });
            }

            installedIconList = this.batchAddExternalResource(installedIconRequestList);

            if (installedIconList.length === 0) {
                console.log('ResourceManager: _doStreamDeckIconImport: No icons imported.');
                return false;
            }
            let externalIconConfig = [];
            if (fs.existsSync(this.externalIconsConfigPath)) {
                externalIconConfig = JSON.parse(fs.readFileSync(this.externalIconsConfigPath, 'utf-8'));
            }

            externalIconConfig = externalIconConfig.filter(
                iconPackInfo => iconPackInfo.iconGroupName !== manifestInfo.Name
            );

            externalIconConfig.push({
                iconPackPath: iconStorePath,
                iconGroupName: manifestInfo.Name,
                iconGroupDisplay: 'file://' + path.join(iconStorePath, manifestInfo.Icon),
                iconPackType: iconType,
            });

            fs.writeFileSync(this.externalIconsConfigPath, JSON.stringify(externalIconConfig));
        } catch (err) {
            if (installedIconList.length > 0) {
                this.batchDeleteResource(installedIconList);
            }
            console.log('ResourceManager: _doStreamDeckIconImport: Detected Error: ', err);

            return false;
        }

        return true;
    }

    async _doIconFontIconImport(iconfontInfo, iconsStoredPath) {
        const iconfontFilePath = path.join(iconsStoredPath, 'iconfont.ttf');
        console.log('ResourceManager: _doIconFontIconImport: iconfontFilePath: ', iconfontFilePath);
        const fontCarrier = require('font-carrier');

        const font = fontCarrier.transfer(iconfontFilePath);

        const glyphs = font.allGlyph();

        if (!glyphs) return false;

        const iconsSavePath = path.join(iconsStoredPath, 'icons');

        if (!fs.existsSync(iconsSavePath)) {
            fs.mkdirSync(iconsSavePath, { recursive: true });
        }
        const regExp = new RegExp(' ', 'g');
        const iconType = 'ExternalIcon_' + iconfontInfo.name.replace(regExp, '_');

        const installedIconRequestList = [];
        let installedIconList = [];

        try {
            // console.log('ResourceManager: _doIconFontIconImport: font: ', glyphs);

            font.output({
                path: iconsSavePath,
                types: ['svg']
            });

            for (let unicode in glyphs) {
                const glyph = glyphs[unicode];
                // console.log('ResourceManager: _doIconFontIconImport: glyphs.unicode: ', unicode, ' glyph.options: ', glyph.options);
                if (!glyph.options.name || !glyph.options.unicode) {
                    continue;
                }

                const fileName = `icon-${glyph.options.name}.png`;

                const iconFilePath = path.join(iconsSavePath, fileName);

                const svgContent = font.getSvg(unicode);

                await sharp(Buffer.from(svgContent))
                    .resize(170, 170)  // 调整最终图标的大小
                    .png()
                    .toFile(iconFilePath);

                installedIconRequestList.push({
                    resourcePath: iconFilePath,
                    resourceName: fileName,
                    resourceType: iconType,
                    resourceDBId: RESOURCE_DB.EXTERNAL_IMPORT,
                });
            }

            installedIconList = this.batchAddExternalResource(installedIconRequestList);

            if (installedIconList.length === 0) {
                console.log('ResourceManager: _doIconFontIconImport: No icons imported.');
                return false;
            }
            let externalIconConfig = [];
            if (fs.existsSync(this.externalIconsConfigPath)) {
                externalIconConfig = JSON.parse(fs.readFileSync(this.externalIconsConfigPath, 'utf-8'));
            }

            externalIconConfig = externalIconConfig.filter(
                iconPackInfo => iconPackInfo.iconGroupName !== iconfontInfo.name
            );

            externalIconConfig.push({
                iconPackPath: iconsStoredPath,
                iconGroupName: iconfontInfo.name,
                iconGroupDisplay: '@/icon/custom_icon.png',
                iconPackType: iconType,
            });

            fs.writeFileSync(this.externalIconsConfigPath, JSON.stringify(externalIconConfig));
        } catch (err) {
            if (installedIconList.length > 0) {
                this.batchDeleteResource(installedIconList);
            }
            console.log('ResourceManager: _doStreamDeckIconImport: Detected Error: ', err);

            return false;
        }

        return true;
    }

    _deletePluginIcon(iconId) {
        if (!iconId) return;

        this.deleteResource(iconId);
    }

    _getFilePathSplitInfo(filePath) {
        if (process.platform === 'win32') {
            return filePath.split('\\');
        } else {
            return filePath.split('/');
        }
    }

    _addNextPageButtonToPrevConfig(configId, pageId) {
        if (pageId < 2) return;

        const keyConfigs = this.getAllResourceInfoByType(Constants.RESOURCE_TYPE_DEVICE_CONFIG);

        // If not have previous page key config skip
        const prevConfigResInfo = keyConfigs.find(config => {
            return config.name === configId + ',' + (Number(pageId) - 1) + ',1';
        });

        if (!prevConfigResInfo) return;

        let prevConfigDetail = this.getConfigInfo(prevConfigResInfo.id);
        if (prevConfigDetail === null) return;
        console.log('ResourceManager: _addNextPageButtonToPrevConfig: prevConfigDetail: ' + JSON.stringify(prevConfigDetail));

        // If have pageDown action skip
        const nextPageKeyConfig = prevConfigDetail.filter(configInfo => configInfo.config.type === 'pageDown');
        if (nextPageKeyConfig && nextPageKeyConfig.length > 0) return;

        let nextPageConfigAdd = false;

        let finalConfigDetail = [];
        for (let i = prevConfigDetail.length - 1; i >= 0; i--) {
            let keyConfigData = prevConfigDetail[i];
            // console.log(
            //     'ResourceManager: _addNextPageButtonToPrevConfig: checking for keyConfigData: ' +
            //         JSON.stringify(keyConfigData)
            // );
            if (!nextPageConfigAdd && keyConfigData.config.type === '') {
                console.log(
                    'ResourceManager: _addNextPageButtonToPrevConfig: add next page action to : ' +
                        keyConfigData.keyCode
                );
                nextPageConfigAdd = true;
                keyConfigData = {
                    keyCode: keyConfigData.keyCode,
                    childrenName: 'nextPage',
                    config: {
                        type: 'pageDown',
                        title: {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: 0,
                        },
                        icon: '0-8',
                        actions: [],
                    },
                };
            }

            finalConfigDetail.push(keyConfigData);
        }
        console.log('ResourceManager: _addNextPageButtonToPrevConfig: After convert nextPageConfigAdd : ' + nextPageConfigAdd, ' finalArray: ' + JSON.stringify(finalConfigDetail));

        if (!nextPageConfigAdd) return;

        this.updateConfigInfo(prevConfigResInfo.id, finalConfigDetail);
    }

    _removeInvalidPageAction(deviceConfigResourceList, currentPageId, maxPageId) {
        deviceConfigResourceList.forEach(configResourceInfo => {
            // eslint-disable-next-line
            const [configId, pageId, folderId] = configResourceInfo.name.split(',');

            if (Number(folderId) !== 1) return;

            let updatedKeyConfigDetail = [];
            let filerConfigType = '';

            // Remove the pageUp key config for previous page
            if (currentPageId === maxPageId && Number(pageId) + 1 === currentPageId) {
                filerConfigType = 'pageDown';
            } else if (currentPageId === 1 && (Number(pageId) - 1) === currentPageId) { // Remove the pageDown key config for previous page
                filerConfigType = 'pageUp';
            }

            console.log('ResourceManager: _removeInvalidPageAction for filerConfigType: ', filerConfigType);

            // No need filter for middle page deletion
            if (filerConfigType === '') {
                return;
            }

            const configDetail = this.getConfigInfo(configResourceInfo.id);
            if (configDetail === null) return;

            let haveUpdate = false;
            updatedKeyConfigDetail = configDetail.map(keyConfigInfo => {
                if (keyConfigInfo.config.type !== filerConfigType) {
                    return keyConfigInfo;
                }
                haveUpdate = true;
                // Remove pageUp action in previous page
                return {
                    keyCode: keyConfigInfo.keyCode,
                    childrenName: '',
                    config: {
                        type: '',
                        title: {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: 0,
                        },
                        icon: '',
                        actions: [],
                    },
                };
            });

            console.log('ResourceManager: _removeInvalidPageAction after filter have update: ', haveUpdate, ' updatedKeyConfigDetail: ', updatedKeyConfigDetail);

            // No update check for next configResourceInfo
            if (!haveUpdate) {
                return;
            }

            this.updateConfigInfo(configResourceInfo.id, updatedKeyConfigDetail);
        });
    }

    _addPrevPageToConfig(configData) {
        const prevPageKeyConfig = configData.filter(configInfo => configInfo.config.type === 'pageUp');
        if (prevPageKeyConfig && prevPageKeyConfig.length > 0) return configData;

        let maxRow = 2;
        configData.forEach(configItem => {
            const rowColInfo = configItem.keyCode.split(',');
            const currentRow = Number(rowColInfo[0]);
            if (currentRow > maxRow) {
                maxRow = currentRow;
            }
        });

        console.log('ResourceManager: _addPrevPageToConfig : maxRow: ' + maxRow + ' configData: ' + JSON.stringify(configData));

        return configData.map(configInfo => {
            if (configInfo.keyCode === (maxRow + ',1')) {
                console.log('ResourceManager: _addPrevPageToConfig: Adding pageUp action to ' + configInfo.keyCode);

                return {
                    keyCode: configInfo.keyCode,
                    childrenName: 'previousPage',
                    config: {
                        type: 'pageUp',
                        title: {
                            text: '',
                            pos: 'bot',
                            size: 8,
                            color: '#FFFFFF',
                            display: true,
                            style: 'bold|italic|underline',
                            resourceId: 0
                        },
                        icon: '0-7',
                        actions: []
                    }
                }
            }
            return configInfo;
        });
    }

    async base64ToPng(base64String, filename) {
        const regex = /^data:(.*);base64,(.*)$/;
        const match = base64String.match(regex);
        const isSvg = base64String.startsWith('data:image/svg+xml;charset=utf8,');
        if (!match && !isSvg) {
            throw new Error('Unknown image type!!!!!');
        }

        let parentDir;
        if (process.platform === 'win32') {
            parentDir = filename.substring(0, filename.lastIndexOf('\\'));
        } else {
            parentDir = filename.substring(0, filename.lastIndexOf('/'));
        }

        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        let base64Data = base64String.substring(base64String.indexOf(',') + 1);
        let buffer;
        if (isSvg) {
            base64Data = removeTextAttributes(base64Data);
            base64Data = decodeURIComponent(base64Data);
            console.log('ResourceManager:Modifyed SVGDATA: ', base64Data);
            buffer = Buffer.from(base64Data);
        } else {
            base64Data = match[2];
            buffer = Buffer.from(base64Data, 'base64');
        }

        await sharp(buffer).png().toFile(filename);
    }

    async svgToPng(svgFilePath, exportFilename) {
        let parentDir;
        if (process.platform === 'win32') {
            parentDir = exportFilename.substring(0, exportFilename.lastIndexOf('\\'));
        } else {
            parentDir = exportFilename.substring(0, exportFilename.lastIndexOf('/'));
        }

        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        const svgData = fs.readFileSync(svgFilePath);
        await sharp(Buffer.from(svgData)).png().toFile(exportFilename);
    }
}

function removeTextAttributes(svgString) {
    const regex = /<text([^>]+)>/g;
    const replacedString = svgString.replace(regex, (match, p1) => {
        const attributes = p1.replace(/ stroke="[^"]*"/, '');
        return `<text ${attributes}>`;
    });
    return replacedString;
}

function saveResourcesConfig(configFilePath, configData) {
    // console.log('saveResourcesConfig for to: ', configFilePath, ' Data: ', configData);
    fs.writeFileSync(configFilePath, JSON.stringify(configData));
}

export default ResourcesManager;
