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

import {
    callService,
    createConnection,
    createLongLivedTokenAuth,
    ERR_CANNOT_CONNECT,
    ERR_INVALID_AUTH,
    getServices,
    getStates,
    subscribeEntities,
} from 'home-assistant-js-websocket';
const { Mutex } = require('async-mutex');


const HA_CONNECTION_STATE = {
    CONNECTED: 1,
    DISCONNECTED: 2
}

export default class HAManager {
    constructor(appManager, config) {
        this.appManager = appManager;
        this.HAConfigData = config;
        this.HAConfigData.accessToken = appManager.storeManager.storeGet('haConfig.accessToken', '');
            // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwNTMwZTIzMzg2NGY0YmIwOGEzMzY1NTUwZTg1NDcwMCIsImlhdCI6MTcyMDE0NDI5NCwiZXhwIjoyMDM1NTA0Mjk0fQ.erd0C2BDLPXjUUW10Q8XHkN-odEHcmXkXgRf1JRM3EQ';
        // this.HAConfigData.hassUrl = 'https://axsf.duckdns.org';
        this.HAConfigData.hassUrl = appManager.storeManager.storeGet('haConfig.hassUrl', '');
        globalThis.WebSocket = require('ws');
        this.HAConnectionState = HA_CONNECTION_STATE.DISCONNECTED;
        this._initData();

        this.monitorEntityCallbackMap = new Map();
        this.mutexLock = new Mutex();
    }

    updateConfig(configInfo) {
        if (configInfo === undefined) {
            return;
        }

        if (
            this.HAConfigData.hassUrl === configInfo.hassUrl &&
            this.HAConfigData.accessToken === configInfo.accessToken
        )
            return;

        if (this.HAConnection !== undefined && this.HAConnectionState === HA_CONNECTION_STATE.CONNECTED) {
            this.HAConnection.close();
            this.HAConnection.removeEventListener('disconnected', this._handleHADisconnected);
            this.HAConnection.removeEventListener('ready', this._handleHAConnectionReady);
            this.HAConnection.removeEventListener('reconnect-error', this._handleHAReconnectError);
        }

        this.HAConfigData = configInfo;

        this.allEntities = [];
        this.allServices = [];
        this.appManager.storeManager.storeSet('haConfig.hassUrl', this.HAConfigData.hassUrl);
        this.appManager.storeManager.storeSet('haConfig.accessToken', this.HAConfigData.accessToken);

        this._initData();
    }

    checkConnection() {
        return this.HAConnection !== undefined && this.HAConnectionState === HA_CONNECTION_STATE.CONNECTED;
    }

    getAllHAEntities() {
        if (!this.checkConnection()) {
            return [];
        }

        return this.allEntities;
    }

    getAllEntitiesByGroup(groupBy = 'domain') {
        if (!this.checkConnection()) {
            return [];
        }

        if (this.allEntities.length === 0) return [];

        if (groupBy === 'domain') {
            const domainGroupList = Object.values(this.allEntities).reduce((acc, entity) => {
                const domain = entity.entity_id.split('.')[0];
                if (!acc[domain]) {
                    acc[domain] = [];
                }
                acc[domain].push(entity);
                return acc;
            }, {});

            return Object.keys(domainGroupList).map(domain => ({
                domain: domain,
                entities: domainGroupList[domain].map(entity => ({
                    entity_id: entity.entity_id,
                    state: entity.state,
                    attributes: entity.attributes
                })),
            })).sort((a, b) => {
                if (a.domain < b.domain) {
                    return -1;
                }
                if (a.domain > b.domain) {
                    return 1;
                }
                return 0;
            });
        }

        // Group by room
        const roomGroupList = Object.values(this.allEntities).reduce((acc, entity) => {
            let roomInfo = entity.attributes.home_room;
            if (!roomInfo) {
                roomInfo = 'Other';
            }
            if (!acc[roomInfo]) {
                acc[roomInfo] = [];
            }
            acc[roomInfo].push(entity);
            return acc;
        }, {});

        return Object.keys(roomGroupList).map(roomName => ({
            roomName: roomName,
            entities: roomGroupList[roomName].map(entity => ({
                entity_id: entity.entity_id,
                state: entity.state,
                attributes: entity.attributes
            })),
        })).sort((a, b) => {
            if (a.roomName < b.roomName) {
                return -1;
            }
            if (a.roomName > b.roomName) {
                return 1;
            }
            return 0;
        });
    }

    getEntitiesInfo(entityList = []) {
        if (entityList.length === 0) return [];

        return entityList.map(entityId => {
            const entityInfo = this.allEntities[entityId];

            return {
                entity_id: entityInfo.entity_id,
                state: entityInfo.state,
                attributes: entityInfo.attributes
            }
        });
    }

    getEntityInfo(entity_id) {
        if (entity_id === undefined || entity_id === '') return undefined;

        const entityInfo = this.allEntities[entity_id];

        if (entityInfo === undefined) return undefined;

        return {
            entity_id: entityInfo.entity_id,
            state: entityInfo.state,
            attributes: entityInfo.attributes
        }
    }

    getRelatedService(domain = '') {
        if (domain === '') {
            return this.allServices;
        }

        return this.allServices[domain];
    }

    getEntityRelatedDisplayableFields(entity_id) {
        if (!this.checkConnection()) {
            return [];
        }

        const entityInfo = this.allEntities[entity_id];

        const displayItems = [];
        Object.keys(entityInfo.attributes).forEach((attrName) => {
            if (entityInfo.attributes[attrName] instanceof Array
                || attrName === 'state_class' || attrName === 'model'
                || attrName === 'entity_class' || attrName === 'miot_type'
                || attrName === 'state_prope' || attrName === 'icon'
                || attrName === 'device_class' || attrName === 'supported_features'
                ) {
                return;
            }
            displayItems.push(attrName);
        });

        displayItems.unshift('state')

        return displayItems;
    }

    async sendCallService(entity_id, service, serviceData) {
        try {
            const HAConnection = await this._getHAConnector();
            const domain = entity_id.split('.')[0];

            console.log(
                `HAManager: _callService ${domain}.${service} with data:`,
                serviceData,
                ' entity_id: ',
                entity_id
            );
            return await callService(HAConnection, domain, service, serviceData, {
                entity_id: entity_id
            });

        } catch (error) {
            console.log('HAManager: _getAllServices Error: ', error);
        }
        return false;
    }

    async registerEntityStateChangeCallback(entity_id, monitorItems = [], onChangeCallback) {
        const monitorInfo = {
            monitorItems: monitorItems,
            callback: onChangeCallback
        }

        const release = await this.mutexLock.acquire();
        try {
            let monitorList = this.monitorEntityCallbackMap.get(entity_id);
            if (monitorList === undefined) {
                monitorList = [];
            }
            monitorList.push(monitorInfo);

            this.monitorEntityCallbackMap.set(entity_id, monitorList);
        } finally {
            release();
        }
    }

    async unregisterEntityStateChangeCallback(entity_id, monitorItems = [], onChangeCallback) {
        const release = await this.mutexLock.acquire();
        try {
            let monitorList = this.monitorEntityCallbackMap.get(entity_id);
            if (monitorList === undefined) {
                return;
            }

            monitorList = monitorList.filter(monitorInfo => monitorInfo.monitorItems === monitorItems && monitorInfo.callback === onChangeCallback);
            this.monitorEntityCallbackMap.set(entity_id, monitorList);
        } finally {
            release();
        }
    }

    async _initData() {
        await this._getAllServices();
        await this._getAllEntities();
    }

    async _getHAConnector() {
        if (this.HAConnection !== undefined && this.HAConnectionState === HA_CONNECTION_STATE.CONNECTED) {
            return this.HAConnection;
        }

        const auth = createLongLivedTokenAuth(this.HAConfigData.hassUrl, this.HAConfigData.accessToken);

        let connection;
        try {
            connection = await createConnection({ auth });
        } catch (error) {
            if (error === ERR_CANNOT_CONNECT) {
                console.log('HAManager: _getHAConnector: ERR_CANNOT_CONNECT');
            } else if (error === ERR_INVALID_AUTH) {
                console.log('HAManager: _getHAConnector: ERR_INVALID_AUTH');
            }
            throw error;
        }
        this.HAConnectionState = HA_CONNECTION_STATE.CONNECTED;
        console.log('HAManager: _getHAConnector: Connected to HAServer');
        connection.addEventListener('disconnected', this._handleHADisconnected);
        connection.addEventListener('ready', this._handleHAConnectionReady);
        connection.addEventListener('reconnect-error', this._handleHAReconnectError);
        // To play from the console
        this.HAConnection = connection;
        return this.HAConnection;
    }

    _handleHADisconnected() {
        console.log('HAConnector: _handleHADisconnected:');
        this.HAConnectionState = HA_CONNECTION_STATE.DISCONNECTED;
    }

    _handleHAConnectionReady() {
        console.log('HAConnector: _handleHAConnectionReady:');
        this.HAConnectionState = HA_CONNECTION_STATE.CONNECTED;
    }

    _handleHAReconnectError() {
        console.log('HAConnector: _handleHAReconnectError:');
        this.HAConnectionState = HA_CONNECTION_STATE.DISCONNECTED;
    }

    async _getAllEntities() {
        try {
            const HAConnection = await this._getHAConnector();
            const entities = await getStates(HAConnection);

            this.allEntities = entities.reduce((acc, entity) => {
                acc[entity.entity_id] = entity;
                return acc;
            }, {});

            console.log('HAManager: _getAllEntities: Initial Entities: ', this.allEntities);
            console.log('HAManager: _getAllEntities: Initial groupedEntities: ', this.getAllEntitiesByGroup());
            this._setupEntitiesSubscription(HAConnection);
        } catch (error) {
            console.log('HAManager: _getAllEntities Error: ', error);
        }
    }

    async _getAllServices() {
        try {
            const HAConnection = await this._getHAConnector();
            this.allServices = await getServices(HAConnection);
            console.log('HAManager: _getAllEntities: Initial Services: ' + JSON.stringify(this.allServices));
        } catch (error) {
            console.log('HAManager: _getAllServices Error: ', error);
        }
    }

    _setupEntitiesSubscription(HAConnection) {
        const that = this;
        subscribeEntities(HAConnection, async entities => {
            for (let entity_id in entities) {
                that.allEntities[entity_id] = entities[entity_id];
                const newEntityDetail = entities[entity_id];
                const release = await that.mutexLock.acquire();

                try {
                    let monitorList = that.monitorEntityCallbackMap.get(entity_id);

                    if (monitorList === undefined) continue;

                    monitorList = monitorList.map((monitorInfo) => {

                        const monitorItems = monitorInfo.monitorItems;
                        if (monitorItems.length === 0) {
                            return monitorInfo;
                        }

                        const newMonitorInfo = Object.assign({}, monitorInfo);

                        let lastEntityData = monitorInfo.lastEntityData;
                        if (lastEntityData === undefined) {
                            lastEntityData = {};
                        }

                        const callbackItems = [];

                        monitorItems.forEach((monitorField) => {
                            if (monitorField === 'state') {
                                if (lastEntityData.state !== newEntityDetail.state) {
                                    callbackItems.push({
                                        fieldName: 'state',
                                        fieldValue: newEntityDetail.state
                                    });
                                }
                                lastEntityData.state = newEntityDetail.state;
                                return;
                            }

                            if (lastEntityData[monitorField] !== newEntityDetail.attributes[monitorField]) {
                                callbackItems.push({
                                    fieldName: monitorField,
                                    fieldValue: newEntityDetail.attributes[monitorField]
                                });
                            }
                            lastEntityData[monitorField] = newEntityDetail.attributes[monitorField];
                        });

                        newMonitorInfo.lastEntityData = lastEntityData;

                        if (callbackItems.length > 0) {
                            monitorInfo.callback(callbackItems);
                        }

                        return newMonitorInfo;
                    });

                    that.monitorEntityCallbackMap.set(entity_id, monitorList);
                } finally {
                    release();
                }
            }
        });
    }
}
