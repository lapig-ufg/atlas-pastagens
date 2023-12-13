module.exports = function(app) {

    const dataInjector = app.middleware.dataInjector;
    const contactController = app.controllers.contact;
    const reCaptcha = app.middleware.reCaptcha;

    app.post('/service/contact/create', reCaptcha, dataInjector, contactController.create);
}