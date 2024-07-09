<template>
    <div id="app-bar">
        <div id="app-title">
            {{ title }}
        </div>
        <div id="app-action">
            <div
                v-if="customAction.show"
                class="app-action-button"
                @click="$emit('customActionClick')"
            >
                <svg-icon :name="customAction.icon" color="white" style="font-size: 18px" />
            </div>
            <div v-if="showMinimize" class="app-action-button" @click="win.minimize()">
                <svg-icon
                    color="white"
                    name="minimize"
                    style="font-size: 18px; vertical-align: baseline"
                />
            </div>
            <div v-if="showMaximize" class="app-action-button" @click="autoMaximize()">
                <svg-icon color="white" name="fullscreen" style="font-size: 18px" />
            </div>
            <div v-if="showClose" class="app-action-button button-red" @click="handleCloseAction">
                <svg-icon color="white" name="close" style="font-size: 18px" />
            </div>
        </div>
    </div>
</template>

<script>
const remote = require('@electron/remote');

export default {
    name: 'TitleBar',
    props: {
        customAction: {
            type: Object,
            default: function () {
                return {
                    show: false,
                    icon: '',
                };
            },
        },
        title: {
            type: String,
            default: '',
        },
        showMinimize: {
            type: Boolean,
            default: true,
        },
        showMaximize: {
            type: Boolean,
            default: true,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        doFullHide: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            win: remote.getCurrentWindow(),
            originSize: true,
        };
    },
    methods: {
        handleCloseAction() {
            this.win.hide();
            if (this.doFullHide) {
                this.win.close();
            }
        },
        autoMaximize() {
            if (this.originSize && this.win.isMaximized()) {
                this.originSize = !this.originSize;
            }
            if (this.originSize) {
                this.win.maximize();
            } else {
                this.win.restore();
            }
            this.originSize = !this.originSize;
            this.$emit('windowMaxChange', !this.originSize);
        },
    },
};
</script>

<style lang="less" scoped>
#app-title {
    flex: 1;
    padding: 7px 15px;
    font-size: 12px;
    line-height: 18px;
}

#app-bar {
    background-color: #263238;
    color: #b2ccd6;
    display: flex;
    // 如果你想让某区域可以拖动，将其设为drag
    // 但是设为drag的区域无法被点击，请注意
    // 可以设置为no-drag来恢复点击
    // If you want to make a region draggable, set it to drag
    // But the area set as drag cannot be clicked, please note
    // can be set to no-drag to resume clicks
    -webkit-app-region: drag;
    height: 32px;
    position: absolute;
    top: 0;
    width: 100%;
}

#app-action {
    padding: 0;
    font-size: 16px;
    display: flex;
    -webkit-app-region: no-drag;
    align-items: center;
    line-height: 34px;
}

.app-action-button {
    padding: 0 8px;
    color: #fff;
    transition: 0.2s ease;
    opacity: 0.7;
}

.app-action-button:hover {
    background-color: #436677;
    opacity: 1;
}

.app-action-button:active {
    background-color: #3a4a52;
}

.button-red:hover {
    background-color: red;
}

.button-red:active {
    background-color: #c11818;
}
</style>
