<template>
    <div>
        <div>
            <el-form label-width="200px" size="mini">
                <el-form-item :label="$t('deviceName')">
                    <el-select v-model="deviceName">
                        <el-option
                            v-for="item in deviceArr"
                            :key="item.serialNumber"
                            :label="item.label"
                            :value="item.serialNumber"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item :label="$t('version')">
                    <span>{{ currentVersion ? currentVersion : '--' }}</span>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
// import IconHolder from '@/views/Components/IconHolder'

export default {
    name: 'DeviceSettings',
    components: {
        // IconHolder
    },
    data() {
        return {
            deviceName: window.store.storeGet('mainscreen.deviceName') || '',
            deviceArr: [],
            serialNumber: '',
            currentVersion: '',
        };
    },
    created() {
        this.$nextTick(() => {
            window.addEventListener('focus', () => {
                this.loadDevicesInfo();
            });
        });
        this.loadDevicesInfo();
    },
    methods: {
        loadDevicesInfo() {
            if (window.store.storeGet('mainscreen.deviceName') !== this.$t('selectDevice')) {
                this.deviceName = window.store.storeGet('mainscreen.deviceName');
            } else {
                this.deviceName = '';
            }
            this.getDeviceInfo();
        },
        getDeviceInfo() {
            this.deviceArr = [];
            const tempArr = window.appManager.deviceControlManager.getConnectedDevices();
            console.log('DeviceSetting： 获取连接的设备', tempArr);
            if (tempArr.length === 0) {
                this.currentVersion = '';
                this.deviceName = '';
                return;
            }

            for (let i = 0; i < tempArr.length; i++) {
                const serial = tempArr[i].serialNumber.substr(
                    tempArr[i].serialNumber.length - 4,
                    4
                );
                console.log('DeviceSetting：', serial);
                if (tempArr[i].connectionType === 'WS' || tempArr[i].connectionType === 'HID') {
                    this.deviceArr.push({
                        label: `DecoKee ${serial}`,
                        serialNumber: tempArr[i].serialNumber,
                    });
                }
            }
            const filterArr = this.deviceArr.filter(device => device.label === this.deviceName)[0];
            console.log('DeviceSetting： filterArr', filterArr);

            if (this.deviceName !== '' || this.deviceName !== this.$t('selectDevice')) {
                this.deviceName = filterArr.label;
            }
            this.currentVersion = window.appManager.deviceControlManager.getDeviceBasicConfig(
                filterArr.serialNumber
            ).appVersion;
            console.log('DeviceSetting： 当前设备版本', this.currentVersion);
        },
    },
};
</script>

<style lang="less" scoped>
/deep/ .el-form-item__label {
    color: #fff;
}

/deep/ .el-input__inner {
    background: #2e3a41;
}

.el-form {
    padding-top: 20px;
}

.brightness {
    display: flex;
    align-items: center;
}
</style>
