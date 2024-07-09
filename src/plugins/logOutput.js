const logger = require('electron-log');

let logSavePath = '';
let resetLogFileTaskId = -1;
let currentLogFile = '';

export function setLogSavePath(folderPath) {
    logSavePath = folderPath;

    logger.transports.file.level = 'debug';
    logger.transports.file.maxSize = 10 * 1024 * 1024; // 最大不超过50M
    logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'; // 设置文件内容格式
    let date = new Date();
    date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    logger.transports.file.fileName = date + '.log'; // 创建文件名格式为 '时间.log' (2023-02-01.log)

    let sep = '\\';
    if (process.platform !== 'win32') {
        sep = '/';
    }
    currentLogFile = logSavePath + sep + 'logs' + sep + date + '.log';
    logger.transports.file.file = currentLogFile;
    console.log('Changing path to ' + currentLogFile);
    // logger.transports.file.init();

    const todayStartTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
    const tmrStartTime = todayStartTime + 24*60*60*1000;
    const resetTime = tmrStartTime - Date.now();
    console.log("today time: " + todayStartTime);
    console.log("tmr time: " + tmrStartTime);
    console.log("Reset time: " + resetTime);

    if (resetLogFileTaskId !== -1) {
        clearTimeout(resetLogFileTaskId);
    }

    resetLogFileTaskId = setTimeout(() => {
        setLogSavePath(folderPath);
    }, resetTime);
}

// 可以将文件放置到指定文件夹中，例如放到安装包文件夹中
// 指定日志文件夹位置

// 有六个日志级别error, warn, info, verbose, debug, silly。默认是silly
export default {
    getLogFilePath() {
        return currentLogFile;
    },
    info(...param) {
        logger.info(JSON.stringify(param));
    },
    warn(...param) {
        logger.warn('%c %s', 'color: yellow', JSON.stringify(param));
    },
    error(...param) {
        logger.error('%c %s', 'color: red', JSON.stringify(param));
    },
    debug(...param) {
        logger.debug(JSON.stringify(param));
    },
    verbose(...param) {
        logger.verbose(JSON.stringify(param));
    },
    silly(...param) {
        logger.silly(JSON.stringify(param));
    }
}
