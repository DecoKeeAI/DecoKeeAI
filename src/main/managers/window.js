import MainWindow from '../windows/mainWindow'
import SettingWindow from "@/main/windows/SettingWindow";
import AIAssistantWindow from "@/main/windows/AIAssistantWindow";
import IconSelectWindow from "@/main/windows/IconSelectWindow";
import CustomConfigWindow from "@/main/windows/CustomConfigWindow";
import HtmlToImageConverterWindow from "@/main/windows/HtmlToImageConverterWindow";

class WindowManager {
  constructor (appManager) {
    this.mainWindow = new MainWindow(null, appManager)
    this.settingWindow = new SettingWindow(null, appManager)
    this.aiAssistantWindow = new AIAssistantWindow(null, appManager)
    this.iconSelectWindow = new IconSelectWindow(null, appManager)
    this.customConfigWindow = new CustomConfigWindow(null, appManager)
    this.htmlToImageConverterWindow = new HtmlToImageConverterWindow()

    this.windowList = [];
    this.windowList.push(this.settingWindow);
    this.windowList.push(this.aiAssistantWindow);
    this.windowList.push(this.iconSelectWindow);
    this.windowList.push(this.mainWindow);
    this.windowList.push(this.customConfigWindow);
  }

  /* Create all windows
    创建所有窗口 */
  createAllWindows () {
    this.mainWindow.createWindow()
    this.settingWindow.createWindow(this.mainWindow.win)
    this.aiAssistantWindow.createWindow()
    this.iconSelectWindow.createWindow(this.mainWindow.win)
    this.customConfigWindow.createWindow(this.mainWindow.win)
    this.htmlToImageConverterWindow.createWindow();
  }

  sendUpgradeProgress(progress) {
    console.log('WindowManger: sendUpgradeProgress')
    if (this.mainWindow.isVisible()) {
      this.mainWindow.sendUpgradeProgress(progress);
    }
    if (this.settingWindow.isVisible()) {
      this.settingWindow.sendUpgradeProgress(progress);
    }
  }

  sendUpgradeComplete() {
    console.log('WindowManger: sendUpgradeComplete')
    if (this.mainWindow.isVisible()) {
      this.mainWindow.sendUpgradeComplete();
    }
    if (this.settingWindow.isVisible()) {
      this.settingWindow.sendUpgradeComplete();
    }
  }
}

export default WindowManager
