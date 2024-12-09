module.exports = function (app) {
	const multer = require('multer');
	const upload = multer({ dest: 'uploads/' });

	const controller = app.controllers.upload;
	const keyclock = app.middleware.keyclock;
	//const reCaptcha = app.middleware.reCaptcha;
	
	app.post('/service/upload/savegeom', keyclock, controller.saveDrawedGeom);
	app.post('/service/upload/savefile', upload.single('files'), keyclock, controller.saveUploadedFile);
}
