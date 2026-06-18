module.exports = function (app) {
    const fs = require('fs')
    const path = require('path')
    const multer = require('multer')
    const config = app.config;

    // { recursive: true } cria a pasta se não existir e ignora silenciosamente se já existir, evitando erro em restarts do container
    fs.mkdirSync(config.uploadDir, { recursive: true });

    const upload = multer({
        dest: config.uploadDir,

        fileFilter: function (req, file, cb) {

            var filetypes = /kmz|zip/;
            var mimetype = filetypes.test(file.mimetype);
            var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

            if (mimetype && extname) {
                return cb(null, true);
            }

            cb("File upload only supports the following filetypes (.kmz or .zip ).");
        }
    });

    /** Permissible loading a single file, 
    the value of the attribute "name" in the form of "shapefile". **/
    const filesAccepted = upload.fields([{ name: 'shapefile', maxCount: 1 }]);

    return filesAccepted;

};