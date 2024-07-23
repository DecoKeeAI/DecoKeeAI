const path = require('path')

module.exports = {
    assetsDir: 'assets',
    chainWebpack: (config) => {
        // 修改file对svg的处理，不让它处理
        const fileRule = config.module.rule('file');
        fileRule.uses.clear();
        fileRule
            .test(/\.svg$/)
            .exclude.add(path.resolve(__dirname, 'src/assets'))
            .end()
            .use('file-loader')
            .loader('file-loader');
    },
    pluginOptions: {
        externals: {
            "node-hid": 'commonjs node-hid',
            "font-carrier": 'commonjs font-carrier',
            "clipboard": 'commonjs clipboard',
            "html-docx-js": 'commonjs html-docx-js'
        },
        electronBuilder: {
            externals: [
                "font-carrier",
                "clipboard",
                "html-docx-js"
            ],
            customFileProtocol: "./",
            nodeIntegration: true,
            chainWebpackMainProcess: (config) => {
                config.output.filename('background.js');
            },
            builderOptions: {
                buildDependenciesFromSource: true,
                npmRebuild: false,
                appId: "com.decokee.decokeeai",
                productName: "DecoKeeAI",
                copyright: "Copyright © 2024 DecoKee",
                asar: false,
                win: {
                    icon: "./public/app.png",
                    requestedExecutionLevel: 'requireAdministrator',
                    target: [
                        {
                            target: "nsis"
                        }
                    ]
                },
                linux: {
                    icon: "./public/app.png",
                    target: [
                        "tar.gz"
                    ]
                },
                nsis: {
                    oneClick: false,
                    perMachine: true,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true, // 创建桌面图标
                    createStartMenuShortcut: true, // 创建开始菜单图标
                    artifactName: "${productName}_Setup_${version}.${ext}"
                    //"installerIcon": "./public/app.ico",
                    //"uninstallerIcon": "./public/app.ico"
                }
            }
        },
        // i18n config
        i18n: {
            locale: 'zh',
            fallbackLocale: 'zh',
            localeDir: 'locales',
            enableInSFC: false
        }
    }
}
