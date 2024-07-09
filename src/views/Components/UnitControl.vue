<template>
    <div>
        <div v-if="itemData?.config.type" class="subBox">
            <IconHolder :icon-size="iconSize" :icon-src="icon" />
            <p v-if="itemData?.config.title.display" :style="fontStyle">
                {{ itemData.config.title.text }}
            </p>
        </div>
    </div>
</template>
<script>
import IconHolder from './IconHolder';

export default {
    name: 'UnitControl',
    components: { IconHolder },
    props: {
        IconSrc: {
            type: String,
            required: false,
        },
        itemData: {
            type: Object,
            required: false,
        },
        icon: {
            type: String,
        },
    },
    watch: {
        itemData: {
            handler(newVal) {
                // console.log('UnitControl ItemDataChange: ', newVal);
                if (newVal) {
                    this.calcPosition();
                }
            },
            deep: true,
        },
    },
    created() {
        this.calcPosition();
    },
    data() {
        return {
            // iconSize: {
            //   width: 40 + 'px',
            //   height: 40 + 'px',
            // },
            iconSize: {
                minWidth: 40 + 'px',
                minHeight: 40 + 'px',
                width: '100%',
                height: '100%',
            },
            fontStyle: {
                position: 'absolute',
                bottom: 12 + 'px',
            },
        };
    },
    methods: {
        calcPosition() {
            const newPos = this.itemData.config?.title.pos;
            const newStyle = this.itemData.config?.title.style;
            this.fontStyle = {
                position: 'absolute',
                color: this.itemData.config.title.color,
                fontSize: this.itemData.config.title.size + 'px',
                fontWeight: newStyle.includes('bold') ? 900 : 400,
                fontStyle: newStyle.includes('italic') ? 'italic' : 'normal',
                textDecoration: newStyle.includes('underline') ? 'underline' : 'none',
            };

            switch (newPos) {
                case 'top':
                    this.fontStyle.top = '12px';
                    break;
                case 'bot':
                    this.fontStyle.bottom = '12px';
                    break;
            }
        },
    },
};
</script>
<style lang="less" scoped>
.subBox {
    box-sizing: border-box;
    position: relative;
    background: #000;
    height: 106px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
</style>
