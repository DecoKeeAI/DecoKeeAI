import { Menu } from 'electron'

class MenuManager {
  constructor (appManager) {
    this.appManager = appManager
    this.windowManager = appManager.windowManager
  }

  AppTrayMenu () {

    const that = this;
    // Menu template
    const template = [
      {
        key: '1',
        label: '恢复窗口', // 支持多国语言 / support multi-languauge
        click: () => {
          if (!that.windowManager.mainWindow.win) {
            that.windowManager.mainWindow.createWindow()
          }

          /* 执行electron窗口对象方法
           Execute electron window method */
          that.windowManager.mainWindow.win.show()
          that.windowManager.mainWindow.win.moveTop()
        }
      },
      {
        key: '2',
        label: '退出',
        click: () => {
          that.appManager.quitApp();
        }
      }
    ]
    return Menu.buildFromTemplate(template)
  }
}

export default MenuManager
