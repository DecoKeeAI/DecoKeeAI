<template>
    <div style="height: 100%">
        <TitleBar
            v-if="isWin32"
            :do-full-hide="true"
            :show-maximize="false"
            :show-minimize="false"
            :title="configPageTitle"
        />
        <div
            id="content"
            :style="{
                backgroundColor: '#2d2d2d',
                height: '100%',
                position: 'absolute',
                top: '0',
                marginTop: isWin32 ? '32px' : 0,
                width: '100%',
            }"
        >
            <HAConfigContent v-if="contentIdx === 1" :configed-entities="extraData" />
        </div>
    </div>
</template>

<script>
import TitleBar from '@/views/Components/TitleBar';
import HAConfigContent from "@/views/CustomConfig/HAConfigContent.vue";
import { ipcRenderer } from 'electron';
import Constants from "@/utils/Constants";

export default {
    name: 'CustomConfigView',
    components: {
        TitleBar,
        HAConfigContent,
    },
    data() {
        return {
            isWin32: true,
            configPageTitle: '',
            contentIdx: 0,
            extraData: undefined
        };
    },
    mounted() {
        this.isWin32 = window.platform === 'win32';
    },
    destroyed() {
        this.configPageTitle = '';
    },
    created() {
        const that = this;
        ipcRenderer.on('show-custom-config-view', (event, args) => {
            console.log('CustomConfigView: Received: show-custom-config-view: ', args.configPage);
            that.extraData = args.extraData;
            switch (args.configPage) {
                case Constants.CUSTOM_CONFIG_PAGE_HA:
                    that.configPageTitle = that.$t('customConfig.haSettingsTitle');
                    that.contentIdx = Constants.CUSTOM_CONFIG_PAGE_HA;
                    break;
            }
        });
    },
    methods: {},
};
</script>

<style scoped></style>
