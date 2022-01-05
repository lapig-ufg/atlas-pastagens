module.exports = function(app) {

    var dataInjector = app.middleware.dataInjector;
    var controllers = app.controllers.example;

    app.get('/service/example/largest', dataInjector, controllers.largest);


}