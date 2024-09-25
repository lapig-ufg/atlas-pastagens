module.exports = function (app) {

	var filesAccepted = app.middleware.file;
	var uploader = app.controllers.upload;
	var dataInjector = app.middleware.dataInjector
	//const reCaptcha = app.middleware.reCaptcha;

	app.post('/service/upload/spatial-file', filesAccepted, uploader.getGeoJson);
	app.get('/service/upload/areainfo', dataInjector, uploader.areainfo);
	app.get('/service/upload/analysisarea', dataInjector, uploader.analysisarea);
	app.get('/service/upload/findgeojsonbytoken', dataInjector, uploader.findGeoJsonByToken);
	app.post('/service/upload/savegeom', uploader.saveDrawedGeom);
	app.get('/service/upload/getanalysis', dataInjector, uploader.getAnalysis);
	app.post('/service/upload/saveanalysis', dataInjector, uploader.saveAnalysis);
	app.get('/service/upload/pasture', dataInjector, uploader.pasture);
	app.get('/service/upload/pasturequality', dataInjector, uploader.pasturequality);
	app.get('/service/upload/pastureforjob', dataInjector, uploader.pastureForJob);
	app.get('/service/upload/pasturequalityforjob', dataInjector, uploader.pasturequalityForJob);
	app.get('/service/upload/carbonstock', dataInjector, uploader.carbonstock);
	app.get('/service/upload/getpastureyears', dataInjector, uploader.getPastureYears);
}
