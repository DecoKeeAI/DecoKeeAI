<template>
    <div style="height: 100%">
        <div id="tab-action">
            <div
                v-for="(item, index) in menuItems"
                :key="index"
                :class="
                    activeItem === item.title ? 'tab-action-button-active' : 'tab-action-button'
                "
                @click="itemClicked(item)"
            >
                {{ $t(item.title) }}
            </div>
        </div>
        <slot name="content" style="height: 100%" />
    </div>
</template>

<script>
export default {
    name: 'TabMenu',
    props: {
        menuItems: {
            type: Array,
            default: () => [],
            required: true,
        },
        defaultActive: {
            type: String,
            default: '',
            required: true,
        },
    },
    data() {
        return {
            activeItem: this.defaultActive,
        };
    },
    methods: {
        itemClicked(item) {
            this.activeItem = item.title;
            this.$emit('menuItemClicked', item);
        },
    },
};
</script>

<style lang="less">
#tab-action {
    padding: 0;
    font-size: 16px;
    display: flex;
    -webkit-app-region: no-drag;
    text-align: center;
    height: 30px;
    margin-top: 5px;
    margin-bottom: 1px;
}

.tab-action-button {
    color: #fff;
    transition: 0.2s ease;
    opacity: 0.5;
    line-height: 28px;
    width: 100px;
    border-top: transparent solid;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.tab-action-button-active {
    color: #fff;
    transition: 0.2s ease;
    line-height: 28px;
    width: 100px;
    background-color: #3a4a52;
    border-top: transparent solid;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.tab-action-button:hover {
    background-color: #436677;
    opacity: 1;
}
</style>
