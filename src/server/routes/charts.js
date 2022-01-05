module.exports = function (app) {

    var dataInjector = app.middleware.dataInjector;
    var charts = app.controllers.charts;

    app.get('/service/charts/resumo', dataInjector, charts.handleResumo);
    app.get('/service/charts/area1', dataInjector, charts.handleArea1Data);
    app.get('/service/charts/area2', dataInjector, charts.handleArea2Data);
    app.get('/service/charts/area3', dataInjector, charts.handleArea3Data);
    app.get('/service/charts/areatable', dataInjector, charts.handleTableRankings);

}