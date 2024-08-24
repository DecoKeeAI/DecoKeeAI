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
    <div>
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
            <template v-if="haConnectionStatus">
                <el-form-item :label="$t('homeAssistantConfig.selectEntity') + ': '">
                    <el-radio-group v-model="selectEntityTab" size="small">
                        <el-radio-button label="room">{{ $t('homeAssistantConfig.selectByRoom') }}</el-radio-button>
                        <el-radio-button label="entity">{{ $t('homeAssistantConfig.selectByEntity') }}</el-radio-button>
                    </el-radio-group>
                    <div style="margin-top: 12px">
                        <el-cascader
                            v-if="selectEntityTab === 'room'"
                            v-model="selectedEntityInfoByRoom"
                            :options="roomSelectionList"
                            :show-all-levels="false"
                            :placeholder="$t('pleaseSelect')"
                            filterable
                            @change="handleEntitySelectedByRoom"
                        ></el-cascader>
                        <el-cascader
                            v-else
                            v-model="selectedEntityInfoByDomain"
                            :show-all-levels="false"
                            :options="entitySelectionList"
                            :placeholder="$t('pleaseSelect')"
                            filterable
                            @change="handleEntitySelectedByDomain"
                        ></el-cascader>
                    </div>
                </el-form-item>
                <el-form-item
                    v-if="serviceActionSelectionList.length > 0"
                    :label="$t('homeAssistantConfig.selectServiceAction') + ': '">
                    <div>
                        <el-select
                            v-model="selectedServiceAction"
                            :placeholder="$t('pleaseSelect')"
                            clearable
                            size="mini"
                            @change="handleServiceActionSelected"
                        >
                            <el-option
                                v-for="item in serviceActionSelectionList"
                                :key="item.serviceType"
                                :label="item.serviceName"
                                :value="item.serviceType"
                            ></el-option>
                        </el-select>
                    </div>
                </el-form-item>
                <template v-if="availableServiceDataFields.length > 0">
                    <el-form-item
                        v-for="configField in availableServiceDataFields"
                        :key="configField.fieldType"
                        :label="configField.fieldName + ': '"
                        :value="configField.fieldType"
                    >
                        <el-input-number
                            v-if="configField.fieldValueType === 'number'"
                            v-model="selectedConfigInfo.service_data[configField.fieldType]"
                            :max="configField.fieldValueTypeData.max"
                            :min="configField.fieldValueTypeData.min"
                            controls-position="right"
                            size="mini"
                            style="width: 191px"
                            @change="val => handleNumberValueFieldChanged(val, configField.fieldType)"
                        />
                        <el-select
                            v-else-if="configField.fieldValueType === 'select'"
                            v-model="selectedConfigInfo.service_data[configField.fieldType]"
                            :placeholder="$t('pleaseSelect')"
                            clearable
                            size="mini"
                            @change="val => handleSelectValueFieldChanged(val, configField.fieldType)"
                        >
                            <el-option
                                v-for="item in configField.fieldValueTypeData.options"
                                :key="item"
                                :label="item"
                                :value="item"
                            ></el-option>
                        </el-select>
                        <el-switch
                            v-else-if="configField.fieldValueType === 'boolean'"
                            v-model="selectedConfigInfo.service_data[configField.fieldType]"
                            @change="val => handleBooleanValueFieldChanged(val, configField.fieldType)"
                        />
                        <el-input
                            v-else
                            v-model="selectedConfigInfo.service_data[configField.fieldType]"
                            style="width: 191px"
                            @input="val => handleTextValueFieldChange(val, configField.fieldType)"
                        />
                    </el-form-item>
                </template>
                <el-form-item
                    v-if="availableDisplayItems.length > 0"
                    :label="$t('homeAssistantConfig.displayInfo') + ': '">

                    <el-radio-group
                        v-model="selectedDisplayItem"
                        size="small"
                        @input="handleCustomDisplaySwitchChanged">
                        <el-radio-button label="icon">{{ $t('homeAssistantConfig.iconDisplay') }}</el-radio-button>
                        <el-radio-button label="default">{{ $t('homeAssistantConfig.defaultDisplay') }}</el-radio-button>
                        <el-radio-button label="custom">{{ $t('homeAssistantConfig.customDisplay') }}</el-radio-button>
                    </el-radio-group>
                    <div
                        style="width: 500px"
                        v-if="selectedDisplayItem === 'custom'"
                    >
                        <span>{{ $t('homeAssistantConfig.fontSize') }}: </span><el-slider v-model="customDisplayTextSize" :max="70" :min="10" class="block" style="width: 150px; margin: 0 10px" @change="handleCustomDisplayTextSizeChanged"></el-slider>
                        <div
                            v-for="displayItem in availableDisplayItems"
                            :key="displayItem.displayItemKey"
                            style="display: flex; margin-bottom: 5px">
                            <el-checkbox
                                style="color: white; flex: 1"
                                :checked="displayItem.checked"
                                :label="displayItem.displayItemKey"
                                @change="val => handleCustomDisplayItemCheckedChange(val, displayItem.displayItemKey)">
                            </el-checkbox>
                            <el-input
                                style="flex: 1"
                                :placeholder="$t('homeAssistantConfig.displayAlias')"
                                v-model="displayItem.displayAlias"
                                @input="val => handleCustomDisplayAliasChange(val, displayItem.displayItemKey)"
                            ></el-input>
                        </div>
                    </div>
                </el-form-item>
                <el-button
                    size="mini"
                    style="margin-left: 68%; margin-bottom: 12px"
                    type="primary"
                    @click="handleSaveHAConfigClicked"
                >
                    {{ $t('save') }}
                </el-button>
            </template>
        </el-form>
    </div>
</template>

<script>
import {deepCopy} from "@/utils/ObjectUtil";

export default {
    name: 'HomeAssistantConfig',
    components: {},
    props: {
        haConfigs: {
            type: String,
            required: true,
        },
    },
    watch: {
        haConfigs: {
            deep: true,
            handler(newVal) {
                console.log('HomeAssistantConfig: HA config data changed newVal: ', newVal);
                if (newVal !== undefined) {
                    this.setUpConfigInfo(newVal);
                }
            },
        },
    },
    data() {
        return {
            serverAddr: '',
            haAPIKey: '',
            haConnectionStatus: false,
            roomSelectionList: [],
            domainEntityList: [],
            entitySelectionList: [],
            selectEntityTab: 'entity',
            selectedEntityInfoByRoom: [],
            selectedEntityInfoByDomain: [],
            selectedConfigInfo: {
                entity_id: undefined,
                service: undefined,
                service_data: undefined,
                custom_display_type: 'default',
                custom_display_settings: {
                    fontSize: 40
                },
                custom_display_detail: []
            },

            domainServices: {},
            serviceActionSelectionList: [],
            selectedServiceAction: '',
            availableServiceDataFields: [],

            selectedDisplayItem: 'default',
            availableDisplayItems: [],
            customDisplayTextSize: 40
        };
    },
    created() {
        this.$nextTick(() => {
            this.haAPIKey = window.store.storeGet('haConfig.accessToken', '');
            this.serverAddr = window.store.storeGet('haConfig.hassUrl', '');
            this.setUpConfigInfo(this.haConfigs);
            this.haConnectionStatus = window.generalAIManager.HAManager.checkConnection();
        });
    },
    beforeDestroy() {},
    methods: {
        setUpConfigInfo(haConfigData) {
            console.log('HomeAssistantConfig: setUpConfigInfo: ', haConfigData);

            let configData = {};
            if (haConfigData !== '') {
                configData = JSON.parse(haConfigData);
            }

            this.selectEntityTab = 'entity';
            this.availableServiceDataFields = [];
            this.selectedServiceAction = '';
            this.serviceActionSelectionList = [];
            this.domainServices = [];
            this.availableDisplayItems = [];
            this.selectedEntityInfoByDomain = [];
            this.selectedEntityInfoByRoom = [];
            this.selectedConfigInfo = deepCopy({
                entity_id: undefined,
                service: undefined,
                service_data: undefined,
                custom_display_type: 'default',
                custom_display_settings: {
                    fontSize: 40
                },
                custom_display_detail: []
            });
            this.roomSelectionList = [];
            this.entitySelectionList = [];
            this.domainEntityList = [];
            this.customDisplayTextSize = 40;

            this.domainEntityList = window.generalAIManager.HAManager.getAllEntitiesByGroup('domain');

            this.entitySelectionList = this.domainEntityList.map(domainEntity => {
                const entityOptions = domainEntity.entities.map(entity => {
                    return {
                        value: entity.entity_id,
                        label: entity.attributes.friendly_name,
                    };
                });
                return {
                    value: domainEntity.domain,
                    label: domainEntity.domain,
                    children: entityOptions,
                };
            });

            console.log('HomeAssistantConfig: setUpConfigInfo: this.entitySelectionList', this.entitySelectionList);

            const roomGroupList = window.generalAIManager.HAManager.getAllEntitiesByGroup('room');
            const tempRoomGroupList = roomGroupList.map(roomEntity => {
                const entityOptions = roomEntity.entities.map(entity => {
                    return {
                        value: entity.entity_id,
                        label: entity.attributes.friendly_name,
                    };
                });
                return {
                    value: roomEntity.roomName,
                    label: roomEntity.roomName,
                    children: entityOptions,
                };
            });

            const otherEntityListIdx = tempRoomGroupList.findIndex(roomInfo => roomInfo.label === 'Other');
            if (otherEntityListIdx !== -1) {
                const item = tempRoomGroupList.splice(otherEntityListIdx, 1)[0]; // 移除指定索引的项
                tempRoomGroupList.push(item); // 将该项添加到列表的最后
            }
            this.roomSelectionList = tempRoomGroupList;

            if (configData.entity_id !== undefined) {
                this.selectedConfigInfo.entity_id = configData.entity_id;
                const selectedDomain = this.selectedConfigInfo.entity_id.split('.')[0]
                this.selectedEntityInfoByDomain = [
                    selectedDomain,
                    this.selectedConfigInfo.entity_id,
                ];
                this.getRelatedServicesByDomain(selectedDomain);
            }

            if (configData.service !== undefined) {
                this.selectedConfigInfo.service = configData.service;
                this.selectedServiceAction = configData.service;
                this.handleServiceActionSelected();
            }

            if (configData.custom_display_type !== undefined) {
                this.selectedConfigInfo.custom_display_type = configData.custom_display_type;
                this.selectedDisplayItem = configData.custom_display_type;
            }

            if (configData.custom_display_detail !== undefined) {
                this.selectedConfigInfo.custom_display_detail = configData.custom_display_detail;
            }

            if (configData.custom_display_settings !== undefined) {
                this.selectedConfigInfo.custom_display_settings = configData.custom_display_settings;

                this.customDisplayTextSize = configData.custom_display_settings.fontSize;
            }

            if (configData.service_data !== undefined && configData.service_data.length !== '') {
                this.selectedConfigInfo.service_data = deepCopy(configData.service_data);
                this.getEntityRelatedDisplayableItems();
            }
        },
        handleEntitySelectedByRoom() {
            const selectedDomain = this.selectedEntityInfoByRoom[1].split('.')[0];
            this.selectedConfigInfo.entity_id = this.selectedEntityInfoByRoom[1];
            this.selectedServiceAction = '';
            this.getEntityRelatedDisplayableItems();
            this.getRelatedServicesByDomain(selectedDomain);
            console.log(
                'HomeAssistantConfig: handleEntitySelectedByRoom: ',
                this.selectedEntityInfoByRoom,
                ' selectedDomain: ',
                selectedDomain
            );
        },
        handleEntitySelectedByDomain() {
            const selectedDomain = this.selectedEntityInfoByDomain[1].split('.')[0];
            this.selectedConfigInfo.entity_id = this.selectedEntityInfoByDomain[1];
            this.selectedServiceAction = '';
            this.getEntityRelatedDisplayableItems();
            this.getRelatedServicesByDomain(selectedDomain);

            console.log(
                'HomeAssistantConfig: handleEntitySelectedByDomain: ',
                this.selectedEntityInfoByDomain,
                ' selectedDomain',
                selectedDomain
            );
        },
        getRelatedServicesByDomain(domain) {
            if (domain === '') return;

            this.domainServices = window.generalAIManager.HAManager.getRelatedService(domain);
            console.log('HomeAssistantConfig: getRelatedServicesByDomain: relatedServices', this.domainServices);

            if (this.domainServices === undefined) return;

            this.serviceActionSelectionList = Object.keys(this.domainServices).map(serviceType => {
                return {
                    serviceType: serviceType,
                    serviceName: this.domainServices[serviceType].name,
                };
            });
        },
        getEntityRelatedDisplayableItems() {
            const entityAvailableDisplayItems = window.generalAIManager.HAManager.getEntityRelatedDisplayableFields(this.selectedConfigInfo.entity_id);
            this.availableDisplayItems = entityAvailableDisplayItems.map(availableItem => {
                const displayItemConfig = this.selectedConfigInfo.custom_display_detail.find(displayConfig => displayConfig.displayItemKey === availableItem);

                return {
                    displayItemKey: availableItem,
                    checked: displayItemConfig !== undefined,
                    displayAlias: displayItemConfig !== undefined ? displayItemConfig.displayAlias : '',
                }
            });
        },
        handleServiceActionSelected() {
            console.log('HomeAssistantConfig: handleServiceActionSelected: ', this.selectedServiceAction);
            this.selectedConfigInfo.service = this.selectedServiceAction;

            if (this.selectedServiceAction === undefined || this.selectedServiceAction === '') {
                this.availableServiceDataFields = [];
                this.selectedConfigInfo.service_data = {};
                this.selectedConfigInfo.service = undefined;
                return;
            }

            const serviceDataConfigFields = this.domainServices[this.selectedServiceAction].fields;
            console.log(
                'HomeAssistantConfig: handleServiceActionSelected: serviceDataConfigFields: ',
                serviceDataConfigFields
            );

            this.availableServiceDataFields = Object.keys(serviceDataConfigFields).map(configField => {
                const fieldValueType = Object.keys(serviceDataConfigFields[configField].selector)[0];
                return {
                    fieldType: configField,
                    fieldName: serviceDataConfigFields[configField].name,
                    fieldValueType: fieldValueType,
                    fieldRequired: serviceDataConfigFields[configField].required === true,
                    fieldValueTypeData: fieldValueType
                        ? serviceDataConfigFields[configField].selector[fieldValueType]
                        : undefined,
                };
            });
            this.selectedConfigInfo.service_data = {};
            this.availableServiceDataFields.forEach(fieldItem => {
                if (!fieldItem.fieldRequired) return;
                switch (fieldItem.fieldValueType) {
                    case 'number':
                        this.selectedConfigInfo.service_data[fieldItem.fieldType] = fieldItem.fieldValueTypeData.min;
                        break;
                    case 'boolean':
                        this.selectedConfigInfo.service_data[fieldItem.fieldType] = false;
                        break;
                    case 'select':
                        this.selectedConfigInfo.service_data[fieldItem.fieldType] =
                            fieldItem.fieldValueTypeData.options[0];
                        break;
                    case 'text':
                        this.selectedConfigInfo.service_data[fieldItem.fieldType] = '';
                        break;
                }
            });
            console.log(
                'HomeAssistantConfig: handleServiceActionSelected: this.availableServiceDataFields: ',
                this.availableServiceDataFields,
                ' this.selectedConfigInfo: ',
                this.selectedConfigInfo
            );
        },
        handleNumberValueFieldChanged(val, field) {
            this.selectedConfigInfo.service_data[field] = val;
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleSelectValueFieldChanged(val, field) {
            this.selectedConfigInfo.service_data[field] = val;
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleBooleanValueFieldChanged(val, field) {
            this.selectedConfigInfo.service_data[field] = val;
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleCustomDisplaySwitchChanged(val) {
            this.selectedDisplayItem = val;
            this.selectedConfigInfo.custom_display_type = val;
            if (!this.selectedConfigInfo.custom_display_type) {
                this.selectedConfigInfo.custom_display_detail = [];
            }
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleTextValueFieldChange(val, field) {
            this.selectedConfigInfo.service_data[field] = val;
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleConnectButtonClicked() {
            window.generalAIManager.HAManager.updateConfig({
                hassUrl: this.serverAddr,
                accessToken: this.haAPIKey
            }, true);

            setTimeout(() => {
                this.haConnectionStatus = window.generalAIManager.HAManager.checkConnection();
            }, 1000);
        },
        handleSaveHAConfigClicked() {
            this.$emit('configUpdated', this.selectedConfigInfo)
        },
        handleCustomDisplayTextSizeChanged(val) {
            this.customDisplayTextSize = val;
            this.selectedConfigInfo.custom_display_settings.fontSize = val;
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleCustomDisplayItemCheckedChange(val, displayItemKey) {

            this.availableDisplayItems = this.availableDisplayItems.map(itemInfo => {
                if (itemInfo.displayItemKey === displayItemKey) {
                    itemInfo.checked = val;
                }
                return itemInfo;
            });

            if (!val) {
                this.selectedConfigInfo.custom_display_detail = deepCopy(
                    this.selectedConfigInfo.custom_display_detail.filter(displayItem => displayItem.displayItemKey !== displayItemKey)
                );

                this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);

                return;
            }

            this.selectedConfigInfo.custom_display_detail.push({
                displayItemKey: displayItemKey,
                displayAlias: ''
            });
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        },
        handleCustomDisplayAliasChange(val, displayItemKey) {
            let oldConfigInfo = this.selectedConfigInfo.custom_display_detail.find(displayConfig => displayConfig.displayItemKey === displayItemKey);
            if (oldConfigInfo === undefined) {
                this.availableDisplayItems = this.availableDisplayItems.map(itemInfo => {
                    if (itemInfo.displayItemKey === displayItemKey) {
                        itemInfo.checked = true;
                    }
                    return itemInfo;
                });

                this.selectedConfigInfo.custom_display_detail.push({
                    displayItemKey: displayItemKey,
                    displayAlias: val
                });
                this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
                return;
            }

            this.selectedConfigInfo.custom_display_detail = deepCopy(
                this.selectedConfigInfo.custom_display_detail.map(displayItem => {
                    if (displayItem.displayItemKey !== displayItemKey) {
                        return displayItem;
                    }
                    const newDisplayItem = Object.assign({}, displayItem);
                    newDisplayItem.displayAlias = val;
                    return newDisplayItem;
                })
            );
            this.selectedConfigInfo = deepCopy(this.selectedConfigInfo);
        }
    },
};
</script>

<style scoped></style>
