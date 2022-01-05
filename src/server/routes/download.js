module.exports = function(app) {
    const downloader = app.controllers.download;
    app.post('/service/download', downloader.downloadGeoFile);
}