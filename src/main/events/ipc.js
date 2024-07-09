import { ipcMain, dialog } from 'electron'

class IpcEvents {
  create (appManager) {
    this.appManager = appManager

    /* 翻译器函数
    Translator function */

    // ipc通信示例 / ipc demo
    ipcMain.on('showDialog', (sys, msg) => {
      dialog.showMessageBox({
        type: 'info',
        title: '收到消息！',

        // 在任何能调用翻译器函数的地方都能使用多语言
        // Multi-language support where translator functions are available
        message: 'IPC 收到消息',
        detail: msg
      })
    })
  }
}

export default new IpcEvents()
