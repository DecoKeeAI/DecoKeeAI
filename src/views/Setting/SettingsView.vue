<template>
    <div style="height: 100%">
        <TitleBar
            v-if="isWin32"
            :do-full-hide="true"
            :show-maximize="false"
            :show-minimize="false"
            :title="$t('settings.title')"
        />
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
            <SettingsContent />
        </div>
    </div>
</template>

<script>
import TitleBar from '@/views/Components/TitleBar';
import SettingsContent from '@/views/Setting/SettingsContent';

export default {
    name: 'SettingsView',
    components: {
        TitleBar,
        SettingsContent,
    },
    data() {
        return {
            isWin32: true,
        };
    },
    mounted() {
        console.log('Current Platform: ', window.platform);
        this.isWin32 = window.platform === 'win32';
    },
    methods: {},
};
</script>

<style scoped></style>
