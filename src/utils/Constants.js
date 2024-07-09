const Constants = {
    RESOURCE_TYPE_ICON: 'Icon',
    RESOURCE_TYPE_DEVICE_CONFIG: 'DeviceConfig',
    RESOURCE_TYPE_TONE: 'AlertTone',
    RESOURCE_TYPE_GIF: 'GIF',
    RESOURCE_TYPE_PLUGIN_ICON: 'PluginIcon',

    ACTION_PAGE_UP: -1,
    ACTION_PAGE_DOWN: -2,

    AUDIO_ACTION_PLAY_STOP: 0,
    AUDIO_ACTION_PLAY_ADD: 1,
    AUDIO_ACTION_PLAY_RESTART: 2,
    AUDIO_ACTION_PLAY_LOOP: 3,
    AUDIO_ACTION_STOP_ALL: 4,

    AUDIO_FADE_NONE: 0,
    AUDIO_FADE_IN: 1,
    AUDIO_FADE_OUT: 2,
    AUDIO_FADE_IN_OUT: 3,

    ALERT_TYPE_STOP: 0,
    ALERT_TYPE_INVALID: 1,
    ALERT_TYPE_ALARM: 2,
    ALERT_TYPE_CHECKMARK: 3,

    ASSISTANT_SESSION_START: 'assistantSessionStart',
    ASSISTANT_SESSION_END: 'assistantSessionEnd',
    ASSISTANT_SESSION_ERROR: 'assistantSessionError',

    ASSISTANT_ANIMATION_ONGOING: 'assistantAnimationOnGoing',
    ASSISTANT_ANIMATION_PROCESSING: 'assistantAnimationProcessing',
    ASSISTANT_ANIMATION_IDLE: 'assistantAnimationIdle',
    ASSISTANT_TYPE_CHAT: 'assistantTypeChat',
    ASSISTANT_TYPE_KEY_CONFIG: 'assistantTypeKeyConfig',
}

export default Constants;
