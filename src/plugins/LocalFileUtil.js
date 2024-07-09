const fs = require('fs');
const path = require('path');

export function readConfigFile(folderPath, configId, page, folder) {
    const configFilePath = path.join(folderPath, "/Configs/DeviceConfig" + configId, "KeyConfig" + page + "-" + folder + ".json");
    console.log("readConfigFile for configId: ", configId, " page: ", page, " folder: ", folder, " Path: ", configFilePath);

    if (!fs.existsSync(configFilePath)) {
        return null;
    }

    const configData = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
    console.log("readConfigFile Data: ", configData);
    return configData;
}

export function saveConfigFile(folderPath, configId, page, folder, configData) {
    const configFolderPath = path.join(folderPath, "/Configs/DeviceConfig" + configId);
    if (!fs.existsSync(configFolderPath)) {
        fs.mkdirSync(configFolderPath, { recursive: true });
    }

    const configFilePath = path.join(configFolderPath, "KeyConfig" + page + "-" + folder + ".json");
    console.log("saveConfigFile for configId: ", configId, " page: ", page, " folder: ", folder, " Path: ", configFilePath);
    fs.writeFileSync(configFilePath, JSON.stringify(configData));
}
