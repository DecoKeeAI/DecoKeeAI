<template>
    <div style="height: 100%">
        <TitleBar
            v-if="isWin32"
            :do-full-hide="true"
            :show-minimize="false"
            :title="$t('iconLib.title')"
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
            <IconSelectContent />
        </div>
    </div>
</template>

<script>
import TitleBar from '@/views/Components/TitleBar';
import IconSelectContent from '@/views/IconSelect/IconSelectContent';

export default {
    name: 'IconSelectView',
    components: {
        TitleBar,
        IconSelectContent,
    },
    data() {
        return {
            isWin32: true,
        };
    },
    mounted() {
        this.isWin32 = window.platform === 'win32';
    },
    methods: {},
};
</script>

<style lang="less"></style>
