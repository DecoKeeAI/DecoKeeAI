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
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { getDeltaList } from '@/utils/Utils';

export default {
    name: 'AppViewCaptureHelper',
    data() {
        return {
            monitorWindowList: [],
            streamCaptureList: []
        };
    },
    created() {
        const that = this;
        ipcRenderer.on('UpdateWindowMonitorIds', (event, args) => {
            const newWindowIds = args.windowIds;

            const deltaWindowIdInfo = getDeltaList(that.monitorWindowList, newWindowIds, (a, b) => a === b);

            console.log('AppViewCaptureHelper: Received UpdateWindowMonitorIds: deltaWindowIdInfo', deltaWindowIdInfo, ' args.windowIds: ', args.windowIds);

            that.monitorWindowList = newWindowIds;

            if (deltaWindowIdInfo.newList.length === 0 && deltaWindowIdInfo.removedList.length === 0) return;

            deltaWindowIdInfo.removedList.forEach(removeWindowId => {
                that.stopCapture(removeWindowId);
            });

            deltaWindowIdInfo.newList.forEach(newWindowId => {
                that.startCapture(newWindowId);
            });
        });
    },
    methods: {
        async startCapture(windowId) {
            const videoElement = document.createElement('video');
            const canvasElement = document.createElement('canvas');
            const canvasContext = canvasElement.getContext('2d');

            videoElement.style.display = 'none'; // 或者使用 visibility: 'hidden'

            const constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: windowId,
                        maxWidth: 200,
                        maxHeight: 200,
                        minFrameRate: 1,  // 最低帧率
                        maxFrameRate: 1   // 最高帧率
                    },
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            videoElement.play();

            const steamCaptureInfo = {
                windowId: windowId,
                windowStream: stream,
                videoElement: videoElement,
                canvasElement: canvasElement,
                canvasContext: canvasContext,
                streamPushTask: setInterval(() => {
                    if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) return;

                    canvasElement.width = videoElement.videoWidth;
                    canvasElement.height = videoElement.videoHeight;

                    // 绘制当前视频帧到画布
                    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

                    console.log('canvasElement.width: ', canvasElement.width, ' canvasElement.height: ', canvasElement.height);
                    // 将画布内容转换为JPEG Blob
                    canvasElement.toBlob((blob) => {
                        if (blob) {
                            // console.log('Blob size:', blob.size); // 输出 Blob 大小以验证数据

                            blob.arrayBuffer().then(arrayBuffer => {
                                // console.log('JPEG裸数据的ArrayBuffer:', new Int8Array(arrayBuffer));
                                ipcRenderer.invoke('send-window-data', {
                                    windowId: windowId,
                                    windowData: new Uint8Array(arrayBuffer)
                                });
                            }).catch(err => {
                                console.error('Error: ArrayBuffer err', err);
                            });

                        } else {
                            console.error('Error: Blob is empty');
                        }
                    }, 'image/jpeg', 0.5); // 第二个参数是MIME类型，第三个参数是图像质量
                }, 1000)
            };

            this.streamCaptureList.push(steamCaptureInfo);
            this.monitorWindowList.push(windowId);
        },
        stopCapture(windowId) {
            const streamCaptureInfo = this.streamCaptureList.find(streamInfo => streamInfo.windowId === windowId);
            if (streamCaptureInfo === undefined) return;

            clearInterval(streamCaptureInfo.streamPushTask);

            streamCaptureInfo.windowStream.getTracks().forEach(track => track.stop());

            // 清理 canvasContext
            streamCaptureInfo.canvasContext.clearRect(0, 0, streamCaptureInfo.canvasElement.width, streamCaptureInfo.canvasElement.height);

            // 移除 DOM 元素（如果已经添加到 DOM 中）
            if (streamCaptureInfo.videoElement.parentNode) {
                document.body.removeChild(streamCaptureInfo.videoElement);
            }
            if (streamCaptureInfo.canvasElement.parentNode) {
                document.body.removeChild(streamCaptureInfo.canvasElement);
            }


            this.streamCaptureList = this.streamCaptureList.filter(streamInfo => streamInfo.windowId !== windowId);
        },
    },
};
</script>

<style lang="less" scoped></style>
