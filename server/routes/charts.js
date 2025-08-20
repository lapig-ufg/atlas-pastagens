module.exports = function (app) {

    var dataInjector = app.middleware.dataInjector;
    var charts = app.controllers.charts;

    app.get('/service/charts/resumo', dataInjector, charts.handleResumo);
    app.get('/service/charts/pastureGraph', dataInjector, charts.handlePastureGraphData);
}