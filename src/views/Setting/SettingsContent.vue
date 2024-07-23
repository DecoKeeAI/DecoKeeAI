<template>
    <div style="height: 100%">
        <TabMenu
            ref="tabMenu"
            :default-active="defaultActiveMenu"
            :menu-items="menuItems"
            style="height: 100%"
            @menuItemClicked="handleClick"
        >
            <div class="settings-container" slot="content">
                <el-scrollbar>
                    <GeneralSettings v-if="activeMenu === 1" />
                    <DeviceSettings v-else-if="activeMenu === 2" />
                    <ProfileConfig v-else-if="activeMenu === 3" />
                    <AISettings v-else-if="activeMenu === 4" />
                    <PluginConfig v-else-if="activeMenu === 5" />
                </el-scrollbar>
            </div>
        </TabMenu>
    </div>
</template>

<script>
import TabMenu from '@/views/Components/TabMenu';
import GeneralSettings from '@/views/Setting/GeneralSettings';
import DeviceSettings from '@/views/Setting/DeviceSettings';
import ProfileConfig from '@/views/Setting/ProfileConfig';
import AISettings from '@/views/Setting/AISettings';
import PluginConfig from '@/views/Setting/PluginConfig';
import { ipcRenderer } from 'electron';

export default {
    name: 'SettingsContent',
    components: {
        TabMenu,
        GeneralSettings,
        DeviceSettings,
        ProfileConfig,
        AISettings,
        PluginConfig,
    },
    data() {
        return {
            menuItems: [
                {
                    id: 1,
                    title: 'settings.generalSetting',
                },
                {
                    id: 2,
                    title: 'settings.deviceSetting',
                },
                {
                    id: 3,
                    title: 'settings.profileConfig',
                },
                {
                    id: 4,
                    title: 'settings.aiConfig',
                },
                {
                    id: 5,
                    title: 'settings.pluginConfig',
                },
            ],
            defaultActiveMenu: 'settings.generalSetting',
            activeMenu: 1,
        };
    },
    created() {
        const that = this;
        ipcRenderer.on('change-tab', (event, args) => {
            console.log('SettingContent: received change tab: ', args);

            that.$refs.tabMenu.itemClicked(that.menuItems[args.tabId - 1]);
        });
    },
    methods: {
        handleClick(item) {
            console.log('Tab Select: ', item);
            this.activeMenu = item.id;
        },
    },
};
</script>

<style lang="less" scoped>
.settings-container {
    display: flex;
    flex-direction: column;
    height: 380px;
    /* 添加 max-height 属性 */
    max-height: 100%;
    background: #3a4a52;

    .el-scrollbar {
        width: 100%;
        height: 100%;
    }

    .handleMenu {
        height: 30px;
        line-height: 30px;
        background: #2f3a41;
        padding: 0 10px;
    }
}

.el-scrollbar /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
}

.scrollbar-menu:last-child {
    margin-bottom: 0 !important;
}
</style>
