const appRoot = require('app-root-path');
const env = process.env;

module.exports = function (app) {
    let config = {
        "appName": "Atlas das Pastagens",
        "appRoot": appRoot,
        "clientDir": appRoot + env.CLIENT_DIR,
        "langDir": appRoot + env.LANG_DIR,
        "logDir": appRoot + env.LOG_DIR,
        "baseFilesDir": appRoot + env.PLATAFORMS_FOLDER_LOCALHOST,
        "fieldDir": appRoot + env.PLATAFORMS_FOLDER_LOCALHOST + env.FIELD_DIR,
        "uploadDir": appRoot + env.PLATAFORMS_FOLDER_LOCALHOST + env.UPLOAD_DIR,
        "downloadDir": appRoot + env.PLATAFORMS_FOLDER_LOCALHOST + env.DOWNLOAD_DIR,
        "hotsiteDir": env.HOTSITE_DIR, //folders to HotSite Gallery
        "pg_lapig": {
            "user": env.PG_USER,
            "host": env.PG_HOST,
            "database": env.PG_DATABASE_LAPIG,
            "password": env.PG_PASSWORD,
            "port": env.PG_PORT,
            "debug": env.PG_DEBUG,
            "max": 20,
            "idleTimeoutMillis": 0,
            "connectionTimeoutMillis": 0,
        },
        "pg_general": {
            "user": env.PG_USER,
            "host": env.PG_HOST,
            "database": env.PG_DATABASE_GENERAL,
            "password": env.PG_PASSWORD,
            "port": env.PG_PORT,
            "debug": env.PG_DEBUG,
            "max": 20,
            "idleTimeoutMillis": 0,
            "connectionTimeoutMillis": 0,
        },
        "port": env.PORT,
        "ows_host": env.OWS_HOST
    };

    if (env.NODE_ENV === 'prod') {
        config["baseFilesDir"] = env.APP_PRODUCAO
        config["fieldDir"] = env.APP_PRODUCAO + env.FIELD_DIR
        config["uploadDir"] = env.APP_PRODUCAO + env.UPLOAD_DIR
        config["downloadDir"] = env.APP_PRODUCAO + env.DOWNLOAD_DIR
        config["hotsiteDir"] = env.APP_PRODUCAO + env.HOTSITE_DIR
    }

    return config;

}
