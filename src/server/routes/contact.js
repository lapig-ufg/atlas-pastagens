module.exports = function(app) {

    const dataInjector = app.middleware.dataInjector;
    const contactController = app.controllers.contact;

    app.post('/service/contact/create', dataInjector, contactController.create);
}