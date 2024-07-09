import PluginWebWindow from "@/main/windows/PluginWebWindow";
import NativePluginLoader from "@/main/DeviceControl/Connections/NativePluginLoader";

export const PLUGIN_TYPE = {
    WEB_PROCESS: 'WEB_PROCESS',
    NATIVE_PROCESS: 'NATIVE_PROCESS'
}

export default class PluginAdapter {
    constructor(appManager, pluginType, pluginDetails) {
        console.log('PluginAdapter: constructor: pluginType: ' + pluginType);

        switch (pluginType) {
            case PLUGIN_TYPE.WEB_PROCESS:
                this.processInstance = new PluginWebWindow(appManager, pluginDetails);
                break;
            case PLUGIN_TYPE.NATIVE_PROCESS:
                this.processInstance = new NativePluginLoader(appManager, pluginDetails);
                break;
        }
    }

    destroyPlugin() {
        if (!this.processInstance) return;

        this.processInstance.destroy();
    }

}
