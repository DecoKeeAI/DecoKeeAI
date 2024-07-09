import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

/* 读取语言文件夹下所有的翻译文件及内容
Read all translation files and content in the language folder */
function loadLocaleMessages () {
    const locales = require.context('../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
    const messages = {}
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i)
        if (matched && matched.length > 1) {
            const locale = matched[1]
            messages[locale] = locales(key)
        }
    })
    return messages
}

/**
 * i18n Render
 * @param key
 * @returns rendered string
 */
export function i18nRender (key) {
    return i18n.t(key)
}

export function setI18nLanguage(lang) {
    i18n.locale = lang
    return lang
}

const i18n = new VueI18n({
    locale: 'zh',
    fallbackLocale: 'zh',
    /* 可以在vue页面中使用 console.log(this.$i18n.messages) 看到读取到的翻译内容
    You can use console.log (this.$i18n.messages) in the vue page to see the translations read */
    messages: loadLocaleMessages()
})

export default i18n;
