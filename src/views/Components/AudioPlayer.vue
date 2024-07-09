<template>
    <div></div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { Howl } from 'howler';
import Constants from '../../utils/Constants';

export default {
    name: 'AudioPlayer',
    data() {
        return {
            audioPlayers: [],
        };
    },
    created() {
        console.log('AudioPlayer created');
        ipcRenderer.on('DoAudioAction', (event, args) => {
            console.log('AudioPlayer Received DoAudioAction: ', args);
            this.doAudioPlay(args.playerId, args.audioAction, args.audioFade);
        });
        ipcRenderer.on('LoadAudio', (event, args) => {
            console.log('AudioPlayer Received LoadAudio: ', args);
            this.loadAudioData(args.requestId, args.soundPath, args.volume);
        });
        ipcRenderer.on('DestroyPlayer', (event, args) => {
            console.log('AudioPlayer Received DestroyPlayer: ', args);
            this.destroyAudioPlayer(args.playerId);
        });
    },
    methods: {
        doAudioPlay(playerId, audioAction, audioFade) {
            if (playerId >= this.audioPlayers.length) return;

            if (!this.audioPlayers[playerId].playerReady) return;

            console.log(
                'doAudioPlay: playerId: ' +
                    playerId +
                    ' playerReady: ' +
                    this.audioPlayers[playerId].playerReady +
                    ' audioAction: ' +
                    audioAction +
                    ' audioFade: ' +
                    audioFade
            );

            const player = this.audioPlayers[playerId].player;
            const volume = this.audioPlayers[playerId].volume;

            const audioFadeInfo = audioFade.split('-');
            const audioFadeAction = parseInt(audioFadeInfo[0]);
            const audioFadeTime = parseInt(audioFadeInfo[1]);
            switch (audioFadeAction) {
                default:
                case Constants.AUDIO_FADE_NONE:
                    break;
                case Constants.AUDIO_FADE_IN:
                    player.once('play', () => {
                        player.fade(0, volume, audioFadeTime);
                    });
                    break;
                case Constants.AUDIO_FADE_OUT:
                    player.fade(volume, 0, audioFadeTime);
                    break;
                case Constants.AUDIO_FADE_IN_OUT:
                    if (player.playing()) {
                        player.fade(volume, 0, audioFadeTime);
                    } else {
                        player.once('play', () => {
                            player.fade(0, volume, audioFadeTime);
                        });
                    }
                    break;
            }

            switch (audioAction) {
                case Constants.AUDIO_ACTION_PLAY_STOP:
                    if (player.playing()) {
                        if (
                            audioFadeAction === Constants.AUDIO_FADE_NONE ||
                            audioFadeAction === Constants.AUDIO_FADE_IN
                        ) {
                            player.stop();
                        } else {
                            player.once('fade', () => {
                                player.stop();
                            });
                        }
                    } else {
                        player.play();
                    }
                    break;
                case Constants.AUDIO_ACTION_PLAY_ADD:
                    player.play();
                    break;
                case Constants.AUDIO_ACTION_PLAY_RESTART:
                    if (
                        audioFadeAction === Constants.AUDIO_FADE_NONE ||
                        audioFadeAction === Constants.AUDIO_FADE_IN
                    ) {
                        if (player.playing()) {
                            player.stop();
                            player.once('stop', () => {
                                player.play();
                            });
                        } else {
                            player.play();
                        }
                    } else {
                        if (player.playing()) {
                            player.once('fade', () => {
                                player.stop();
                            });
                            player.once('stop', () => {
                                player.play();
                            });
                        } else {
                            player.play();
                        }
                    }
                    break;
                case Constants.AUDIO_ACTION_PLAY_LOOP:
                    if (player.playing()) {
                        if (
                            audioFadeAction === Constants.AUDIO_FADE_NONE ||
                            audioFadeAction === Constants.AUDIO_FADE_IN
                        ) {
                            player.stop();
                        } else {
                            player.once('fade', () => {
                                player.stop();
                            });
                        }
                    } else {
                        player.play();
                        if (!player.loop()) {
                            player.loop(true);
                        }
                    }
                    break;
                case Constants.AUDIO_ACTION_STOP_ALL:
                    if (
                        audioFadeAction === Constants.AUDIO_FADE_NONE ||
                        audioFadeAction === Constants.AUDIO_FADE_IN
                    ) {
                        player.stop();
                    } else {
                        player.once('fade', () => {
                            player.stop();
                        });
                    }
                    break;
            }
        },
        loadAudioData(requestId, soundPath, volume) {
            console.log(
                'loadAudioData: requestId: ' +
                    requestId +
                    ' soundPath: ' +
                    soundPath +
                    ' volume: ' +
                    volume
            );
            const filePath = window.resourcesManager.getRelatedSrcPath(soundPath);

            const configVolume = parseFloat((volume / 100.0).toFixed(2));
            const audioPlayer = new Howl({
                src: [filePath],
                volume: configVolume,
                onload: function () {
                    console.log('loadAudioData: audio loaded: ', filePath);
                },
                onloaderror: function (id, msg) {
                    console.log('loadAudioData: audio load error: ', id, ' msg: ', msg);
                },
            });
            const nextPlayerId = this.audioPlayers.length;

            audioPlayer.on('play', () => {
                ipcRenderer.send('AudioPlayStart', {
                    requestId: requestId,
                    playerId: nextPlayerId,
                    duration: audioPlayer.duration() * 1000,
                });
            });
            audioPlayer.on('stop', () => {
                ipcRenderer.send('AudioPlayStop', {
                    requestId: requestId,
                    playerId: nextPlayerId,
                });
            });
            audioPlayer.on('end', () => {
                ipcRenderer.send('AudioPlayStop', {
                    requestId: requestId,
                    playerId: nextPlayerId,
                });
            });

            audioPlayer.once('load', () => {
                ipcRenderer.send('PlayerReady', {
                    requestId: requestId,
                    playerId: nextPlayerId,
                    duration: audioPlayer.duration() * 1000,
                    soundPath: soundPath
                });
            });

            this.audioPlayers.push({
                playerReady: true,
                player: audioPlayer,
                volume: configVolume,
            });
        },
        destroyAudioPlayer(playerId) {
            console.log(
                'destroyAudioPlayer: playerId: ' +
                    playerId +
                    ' audioPlayers.length: ' +
                    this.audioPlayers.length
            );

            if (playerId >= this.audioPlayers.length) return;

            if (!this.audioPlayers[playerId].playerReady) return;

            this.audioPlayers[playerId].player.off('play');
            this.audioPlayers[playerId].player.off('stop');
            this.audioPlayers[playerId].player.off('end');

            this.audioPlayers[playerId].playerReady = false;
            this.audioPlayers[playerId].player.unload();
        },
    },
};
</script>

<style lang="less"></style>
