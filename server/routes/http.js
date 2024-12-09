module.exports = function(app) {
    const http = app.controllers.http;

    app.post('/service/http/get', http.get);
}