module.exports = function (app) {

    const dataInjector = app.middleware.dataInjector;
    const controllers = app.controllers.gallery;

    app.get('/service/gallery/field/', controllers.field);
    app.get('/service/gallery/field/:category/:tablename/:id/:filename', controllers.fieldData);
    app.get('/service/gallery/tags', dataInjector, controllers.tags);
    app.get('/service/gallery/:type/:id/:filename', controllers.image);
    app.post('/service/gallery/images', dataInjector, controllers.images);
}