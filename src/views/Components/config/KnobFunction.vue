<template>
    <div class="box-knob">
        <div
            :class="{ draggableHighlight: dragPos === 'left', clickHighlight: clickPos === 'left' }"
            class="leftKnob common"
            @click="
                $emit('currentKnob', 'left', newLeftData);
                currentClick('left');
            "
            @mouseenter="mouseEnter('left')"
            @mouseleave="mouseLeave('left')"
        >
            <UnitControl
                v-if="newLeftData?.config"
                :icon="newLeftData.config.icon"
                :itemData="newLeftData"
            ></UnitControl>
        </div>
        <div
            :class="{
                draggableHighlight: dragPos === 'center',
                clickHighlight: clickPos === 'center',
            }"
            class="centerKnob common"
            @click="
                $emit('currentKnob', 'center', newCeneterData);
                currentClick('center');
            "
            @mouseenter="mouseEnter('center')"
            @mouseleave="mouseLeave('center')"
        >
            <!-- <el-image class="leftImg" :src='leftImg'></el-image>
            <el-image class="rightImg" :src='rightImg'></el-image> -->
            <UnitControl
                v-if="newCeneterData?.config"
                :icon="newCeneterData.config.icon"
                :itemData="newCeneterData"
            >
            </UnitControl>
        </div>

        <div
            :class="{
                draggableHighlight: dragPos === 'right',
                clickHighlight: clickPos === 'right',
            }"
            class="rightKnob common"
            @click="
                $emit('currentKnob', 'right', newRightData);
                currentClick('right');
            "
            @mouseenter="mouseEnter('right')"
            @mouseleave="mouseLeave('right')"
        >
            <UnitControl
                v-if="newRightData?.config"
                :icon="newRightData.config.icon"
                :itemData="newRightData"
            ></UnitControl>
        </div>

        <el-button
            class="out"
            type="text"
            @click="
                $emit('outKnobBtn', false);
                $emit('changeClickPos', '');
            "
            >退出
        </el-button>
    </div>
</template>

<script>
import UnitControl from '@/views/Components/UnitControl.vue';
import { deepCopy } from '@/utils/ObjectUtil';

export default {
    components: {
        UnitControl,
    },
    props: {
        leftData: {
            type: Object,
        },
        rightData: {
            type: Object,
        },
        ceneterData: {
            type: Object,
        },
        isknobDraggable: {
            type: Boolean,
        },
        dragPos: {
            type: String,
        },
        clickPos: {
            type: String,
        },
    },
    watch: {
        leftData(newVal) {
            this.newLeftData = deepCopy(newVal);
        },
        rightData(newVal) {
            this.newRightData = deepCopy(newVal);
        },
        ceneterData(newVal) {
            this.newCeneterData = deepCopy(newVal);
        },
    },
    data() {
        return {
            newLeftData: {},
            newRightData: {},
            newCeneterData: {},
            knobDraggable: '',
            // leftImg: '',
            // rightImg: ''
        };
    },
    created() {
        // 初始化配置文件
        this.newLeftData = deepCopy(this.leftData);
        this.newRightData = deepCopy(this.rightData);
        this.newCeneterData = deepCopy(this.ceneterData);

        // this.leftImg = window.resourcesManager.getRelatedSrcPath('@/left.png');
        // this.rightImg = window.resourcesManager.getRelatedSrcPath('@/right.png');
    },

    methods: {
        currentClick(pos) {
            this.$emit('changeClickPos', pos);
        },
        mouseEnter(pos) {
            this.$emit('changeDragPos', pos);
            switch (pos) {
                case 'left':
                    this.$emit('knobValue', 'left', true);

                    break;
                case 'center':
                    this.$emit('knobValue', 'center', true);

                    break;
                case 'right':
                    this.$emit('knobValue', 'right', true);

                    break;
            }
            if (this.isknobDraggable) {
                this.isClicked = '';
            }
        },
        mouseLeave(pos) {
            switch (pos) {
                case 'left':
                    this.$emit('knobValue', 'left', false);
                    break;

                case 'center':
                    this.$emit('knobValue', 'center', false);
                    break;
                case 'right':
                    this.$emit('knobValue', 'right', false);
                    break;
            }
        },
    },
};
</script>

<style lang="less" scoped>
.box-knob {
    position: relative;
    border-bottom: 2px solid #222;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px 70px;
}

.leftKnob,
.rightKnob {
    overflow: hidden;
    width: 100px;
    height: 100px;
    border: 2px dotted #474747;
    margin-top: 100px;
}

.common {
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.centerKnob {
    overflow: hidden;
    position: relative;
    width: 163px;
    height: 163px;
    border: 1px solid #474747;
    border-radius: 163px;
    margin: 0 20px;
}

.leftImg {
    position: absolute;
    left: 0;
    top: 0;
}

.out {
    position: absolute;
    right: 30px;
    bottom: 0;
}

.draggableHighlight {
    border: 2px solid #909399;
}

.clickHighlight {
    border: 2px solid #0078ff;
}
</style>
