module.exports = function (app) {
    const map = app.controllers.map;
    const dataInjector = app.middleware.dataInjector;
    
    app.get('/service/map/layers/own', map.own_layers)
    app.get('/service/map/layers/mapbiomas', map.mapbiomas_layers)
    app.get('/service/map/limits/own', map.own_limits)
    app.get('/service/map/basemaps/own', map.own_basemaps)

    //app.get('/service/map/descriptor', map.descriptor);

    app.get('/service/map/extent', dataInjector, map.extent);
    app.get('/service/map/search', dataInjector, map.search);
    app.get('/service/map/searchregion', dataInjector);
    app.get('/service/map/getowsdomain', map.host);
    app.get('/service/map/cdgeocmu', dataInjector);
    app.get('/service/map/cars', dataInjector);
    app.get('/service/map/ucs', dataInjector);
}