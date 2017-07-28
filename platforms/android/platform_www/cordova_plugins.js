cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "runs": true
    },
    {
        "file": "plugins/com.jp.plugin.facebook/www/facebook.js",
        "id": "com.jp.plugin.facebook.Facebook_Plugin",
        "clobbers": [
            "facebook"
        ]
    },
    {
        "file": "plugins/phonegap-facebook-plugin/facebookConnectPlugin.js",
        "id": "phonegap-facebook-plugin.FacebookConnectPlugin",
        "clobbers": [
            "facebookConnectPlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.1",
    "cordova-plugin-console": "1.0.2",
    "com.jp.plugin.facebook": "1.0.1",
    "phonegap-facebook-plugin": "0.12.0"
};
// BOTTOM OF METADATA
});