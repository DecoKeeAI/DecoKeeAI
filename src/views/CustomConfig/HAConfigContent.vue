/*
* Copyright 2024 DecoKee
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Additional Terms for DecoKee:
*
* 1. Communication Protocol Usage
*    DecoKee is provided subject to a commercial license and subscription
*    as described in the Terms of Use (http://www.decokee.com/about/terms.html).
*
*    The components of this project related to the communication protocol
*    (including but not limited to protocol specifications, implementation code, etc.)
*    are restricted from commercial use, as such use would violate the project's usage policies.
*    There are no restrictions for non-commercial uses.
*
*    (a) Evaluation Use
*        An evaluation license is offered that provides a limited,
*        evaluation license for internal and non-commercial use.
*
*        With a paid-up subscription you can incorporate new releases,
*        updates and patches for the software into your products.
*        If you do not have an active subscription, you cannot apply patches
*        from the software to your products.
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
<template>
    <div style="height: 100%" class="ha-settings-container">
        <el-scrollbar>
            <el-form label-width="200px" size="mini" style="height: 100%; padding-top: 12px">
                <el-form-item :label="$t('homeAssistantConfig.serverAddr') + ': '">
                    <el-input v-model="serverAddr" placeholder="http(s)://" style="width: 191px" />
                </el-form-item>
                <el-form-item :label="$t('homeAssistantConfig.apiKey') + ': '">
                    <el-input v-model="haAPIKey" style="width: 191px" />
                </el-form-item>
                <el-form-item :label="$t('homeAssistantConfig.connectionStatus') + ': '">
                    <span>{{ haConnectionStatus ? $t('homeAssistantConfig.connected') : $t('homeAssistantConfig.disconnected') }}</span>
                    <el-button
                        size="mini"
                        style="margin-left: 12px;"
                        type="primary"
                        @click="handleConnectButtonClicked"
                    >
                        {{ haConnectionStatus ? $t('homeAssistantConfig.reconnect') : $t('homeAssistantConfig.connect') }}
                    </el-button>
                </el-form-item>
                <el-form-item :label="$t('homeAssistantConfig.configableEntity') + ': '">
                    <el-radio-group v-model="selectEntityTab" size="mini" @input="handleSelectEntityTabChanged">
                        <el-radio-button label="room">{{ $t('homeAssistantConfig.selectByRoom') }}</el-radio-button>
                        <el-radio-button label="entity">{{ $t('homeAssistantConfig.selectByEntity') }}</el-radio-button>
                    </el-radio-group>
                    <el-tree
                        style="background: #3b3b3b; margin-top: 12px; width: 90%; color: white"
                        ref="entitySelectionTree"
                        :data="entitySelectionList"
                        show-checkbox
                        :highlight-current="false"
                        node-key="id"
                        :default-checked-keys="defaultSelectedEntities"
                        :props="defaultProps">
                    </el-tree>
                </el-form-item>
                <el-button
                    size="mini"
                    style="margin-left: 45%; margin-bottom: 50px"
                    type="primary"
                    @click="handleSaveHAConfigClicked"
                >
                    {{ $t('save') }}
                </el-button>
            </el-form>
        </el-scrollbar>
    </div>
</template>

<script>

import {deepCopy} from "@/utils/ObjectUtil";
import {DEFAULT_OPEN_TO_AI_DOMAINS} from "@/main/ai/ConstantData";
import {ipcRenderer} from "electron";

export default {
    name: 'HAConfigContent',
    components: {
    },
    props: {
        configedEntities: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            haConnectionStatus: false,
            serverAddr: '',
            haAPIKey: '',

            domainEntityList: [],
            roomSelectionList: [],

            selectEntityTab: 'entity',

            entitySelectionList: [],
            defaultSelectedEntities: [],

            defaultProps: {
                children: 'children',
                label: 'label'
            },

            entityToIdMap: {}
        };
    },
    created() {
        this.$nextTick(() => {
            this.haAPIKey = window.store.storeGet('haConfig.accessToken', '');
            this.serverAddr = window.store.storeGet('haConfig.hassUrl', '');
            this.haConnectionStatus = window.generalAIManager.HAManager.checkConnection();
            this.setupHASelections();
        });
    },
    methods: {
        setupHASelections() {
            console.log('HAConfigContent: setupHASelections: this.configedEntities: ', this.configedEntities);

            this.entityToIdMap = {}

            let entityId = 1;

            const roomGroupList = window.generalAIManager.HAManager.getAllEntitiesByGroup('room');
            const tempRoomGroupList = roomGroupList.map(roomEntity => {
                const tempId = entityId;
                entityId += 1;
                this.entityToIdMap[roomEntity.roomName] = tempId;

                const entityOptions = roomEntity.entities.map(entity => {
                    const tempEntityId = entityId;

                    if (this.configedEntities === undefined) {
                        const domain = entity.entity_id.split('.')[0];
                        if (DEFAULT_OPEN_TO_AI_DOMAINS.indexOf(domain) !== -1) {
                            this.defaultSelectedEntities.push(tempEntityId);
                        }
                    } else {
                        if (this.configedEntities.indexOf(entity.entity_id) !== -1) {
                            this.defaultSelectedEntities.push(tempEntityId);
                        }
                    }

                    this.entityToIdMap[entity.entity_id] = tempEntityId;
                    entityId += 1;
                    return {
                        id: tempEntityId,
                        value: entity.entity_id,
                        label: entity.attributes.friendly_name
                    };
                });
                return {
                    id: tempId,
                    value: roomEntity.roomName,
                    label: roomEntity.roomName,
                    children: entityOptions
                };
            });

            const otherEntityListIdx = tempRoomGroupList.findIndex(roomInfo => roomInfo.label === 'Other');
            if (otherEntityListIdx !== -1) {
                const item = tempRoomGroupList.splice(otherEntityListIdx, 1)[0]; // 移除指定索引的项
                tempRoomGroupList.push(item); // 将该项添加到列表的最后
            }
            this.roomSelectionList = tempRoomGroupList;

            const tempDomainEntityList = window.generalAIManager.HAManager.getAllEntitiesByGroup('domain');

            this.domainEntityList = tempDomainEntityList.map(domainEntity => {
                const domainId = entityId;
                this.entityToIdMap[domainEntity.domain] = domainId;

                entityId += 1;

                const entityOptions = domainEntity.entities.map(entity => {
                    let tempEntityId = this.entityToIdMap[entity.entity_id];
                    if (tempEntityId === undefined) {
                        tempEntityId = entityId;
                        entityId += 1;
                    }

                    if (this.configedEntities === undefined) {
                        if (DEFAULT_OPEN_TO_AI_DOMAINS.indexOf(domainEntity.domain) !== -1) {
                            this.defaultSelectedEntities.push(tempEntityId);
                        }
                    } else {
                        if (this.configedEntities.indexOf(entity.entity_id) !== -1) {
                            this.defaultSelectedEntities.push(tempEntityId);
                        }
                    }

                    return {
                        id: tempEntityId,
                        value: entity.entity_id,
                        label: entity.attributes.friendly_name
                    };
                });
                return {
                    id: domainId,
                    value: domainEntity.domain,
                    label: domainEntity.domain,
                    children: entityOptions
                };
            });

            this.handleSelectEntityTabChanged('room');

        },
        handleConnectButtonClicked() {
            window.generalAIManager.HAManager.updateConfig({
                hassUrl: this.serverAddr,
                accessToken: this.haAPIKey,
            });

            setTimeout(() => {
                this.haConnectionStatus = window.generalAIManager.HAManager.checkConnection();
            }, 1000);
        },
        handleSelectEntityTabChanged(val) {
            console.log('HomeAssistantConfig: selectEntityTabChanged: ', val);
            this.selectEntityTab = val;

            if (this.selectEntityTab === 'room') {
                this.entitySelectionList = deepCopy(this.roomSelectionList);
            } else {
                this.entitySelectionList = deepCopy(this.domainEntityList)
            }
        },
        handleSaveHAConfigClicked() {
            const selectedEntities = [];
            this.$refs.entitySelectionTree.getCheckedNodes().forEach(selectedItem => {
                if (!selectedItem.value.includes('.') && selectedItem.children !== undefined) {
                    return;
                }
                selectedEntities.push(selectedItem.value);
            });

            if (selectedEntities.length === 0) return;

            ipcRenderer.invoke('ha-entity-selected', { selectedEntities: selectedEntities });
        }
    },
};
</script>

<style lang="less" scoped>
.ha-settings-container {
    display: flex;
    flex-direction: column;
    height: 380px;
    /* 添加 max-height 属性 */
    max-height: 100%;
    background: transparent;

    .el-scrollbar {
        width: 100%;
        height: 100%;
    }
}

.el-scrollbar /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
}

.scrollbar-menu:last-child {
    margin-bottom: 0 !important;
}
</style>
