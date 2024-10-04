var config = require('../config.js')()

const UtilsLang = require('../utils/language');

module.exports = function (app) {
    const config = app.config;

    const Internal = {};

    const Uploader = {};

    const jsonPath = path.join(__dirname, '..', 'assets', 'lang', 'language.json');
    const languageJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    Internal.acceptedFiles = [
        "dbf",
        "map",
        "prj",
        "qlx",
        "shp",
        "shx",
        "sld",
        "qpj",
        "cpg",
        "qix",
        "kml",
        "sbx",
        "sbn",
        "geojson",
        "xml"
    ];
    Internal.spatialFiles = ["shp", "kml", "geojson"];

    Internal.clearCache = function (data, callback) {
        return callback(true, data);
    };

    Internal.finish = function (finished, geoJson) {
        if (finished) {
            let area = Internal.validGeometry(geoJson);

            if(area){
                geoJson = repro.toWgs84(geoJson, undefined, epsg);

                let token = Internal.saveToPostGis(geoJson);
                geoJson.token = token;
                geoJson.area = area;
                if (gjv.valid(geoJson)) {
                    Internal.response.status(200).send(JSON.stringify(geoJson));
                    fs.unlinkSync(Internal.tmpPath);
                } else {
                    Internal.response.status(400).send(languageJson['upload_messages']['invalid_geojson'][Internal.language]);
                    fs.unlinkSync(Internal.tmpPath);
                    console.error("ERROR: ")
                }

            }
            
        }
    };
    
    Internal.doRequest = function (request, response) {
        /** Reset Variables */
        Internal.targetFilesName = null;
        Internal.dirTarget = null;
        Internal.tmpPath = null;

        Internal.language = request.param("lang");

        Internal.app_origin = request.param("app");

        Internal.response = response;

        if (request.files.shapefile.length > 0) {
            Internal.tmpPath = request.files.shapefile[0].path;
        } else {
            response.status(400).send(languageJson['upload_messages']['has_not_spatial_file'][Internal.language]);
            console.error(
                "FILE: ",
                request.files.shapefile,
                " | ERROR: ",
                languageJson['upload_messages']['has_not_spatial_file'][Internal.language],
            );
            return;
        }

        const src = fs.createReadStream(Internal.tmpPath);

        const zip = src.pipe(unzipper.Parse({ forceStream: true }));

        Internal.extractFiles(zip, Internal.toGeoJson);
    };

    Uploader.getGeoJson = function (request, response) {
        Internal.doRequest(request, response);
    };

    return Uploader;
};
