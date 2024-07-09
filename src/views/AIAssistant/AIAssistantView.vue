<template>
    <div style="height: 100%">
        <TitleBar v-if="isWin32" :show-maximize="false" :show-minimize="false" />
        <div
            id="content"
            :style="{
                height: '100%',
                position: 'absolute',
                top: '0',
                marginTop: isWin32 ? '32px' : 0,
                width: '100%',
            }"
        >
            <AIAssistantContent />
        </div>
        <AIAudioHandler />
    </div>
</template>

<script>
import TitleBar from '@/views/Components/TitleBar';
import AIAssistantContent from '@/views/AIAssistant/AIAssistantContent';
import AIAudioHandler from '@/views/AIAssistant/AIAudioHandler';
import {checkLocation} from "@/utils/Utils";

export default {
    name: 'AIAssistantView',
    components: {
        TitleBar,
        AIAssistantContent,
        AIAudioHandler,
    },
    data() {
        return {
            isWin32: true,
        };
    },
    mounted() {
        this.isWin32 = window.platform === 'win32';
    },
    created() {
        this.$nextTick(() => {
            checkLocation().then((res) => {
                console.log('CheckLocationInfo: ', res);
                if (res) {
                    window.store.storeSet('system.deviceLocationInfo', res);
                } else {
                    window.store.storeSet('system.deviceLocationInfo', undefined);
                }
            });
        })
    },
    methods: {},
};
</script>

<style lang="less"></style>
