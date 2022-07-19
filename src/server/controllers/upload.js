const unzipper = require("unzipper"),
    fs = require("fs"),
    path = require('path'),
    ogr2ogr = require("ogr2ogr"),
    geojsonArea = require('@mapbox/geojson-area');

var config = require('../config.js')()
const gjv = require("geojson-validation");
var epsg = require('epsg');
const repro = require("reproject")
const moment = require("moment");

const UtilsLang = require('../utils/language');

const { Pool, Client } = require('pg')
const pool = new Pool(config['pg_general'])

module.exports = function (app) {
    const config = app.config;

    const Internal = {};
    const Uploader = {};

    const jsonPath = path.join(__dirname, '..', 'assets', 'lang', 'language.json');
    const languageJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    /**
    Directory where the code will to put tmp files**/
    Internal.dirUpload = config.uploadDir;

    Internal.targetFilesName = null;
    Internal.dirTarget = null;
    Internal.tmpPath = null;
    Internal.language = null;
    Internal.response = {};
    Internal.geojson = {}
    Internal.app_origin = ''

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

        // fs.readdir(dir_upload, (err, files) => {
        // 	files = files.filter(file => file.includes(Internal.targetFilesName));
        // 	let len = files.length;
        // 	for (const file of files) {
        // 		fs.unlink(dir_upload + "/" + file, err => {
        // 			if (--len <= 0) {
        // 				callback(true, data);
        // 			}
        // 		});
        // 	}
        // });
    };



    Internal.validGeometry = function(geometry){
        geoJson = false
        if(geometry.length !== undefined){
            geometry = JSON.parse(geometry)
            geoJson = true
        }
        // TODO checked shapfile length and type feature
        if (geometry.features.length !== 1){
            Internal.response
            .status(400)
            .send(languageJson['upload_messages']['features_length_error'][Internal.language]);
        }
        else if (geometry.features[0]['geometry'].type !== "Polygon" ){
            Internal.response
            .status(400)
            .send(languageJson['upload_messages']['is_polygon_error'][Internal.language]);

        }else{
             //console.log(JSON.stringify(geometry.features[0]['geometry']))
            
             if(geoJson === false){
                const jsonWgs84 = repro.toWgs84(geometry, undefined, epsg);
                var area = geojsonArea.geometry(jsonWgs84.features[0]['geometry']);
            }else{
                
                var area = geojsonArea.geometry(geometry.features[0]['geometry']);
                
            }
            // area in Km²
            const MAX_AREA = process.env.MAX_AREA || 5000
            console.log(`: ${parseInt(area)}`)
            if(area <= (MAX_AREA * 1000000)){
                return area
            }else{
                Internal.response
                .status(400)
                .send(eval(languageJson['upload_messages']['very_large_area_error'][Internal.language]));
                return false
            }
           

        }
        return false
        
    }



    Internal.toGeoJson = function (shapfile, callback) {
        console.log('toGeoJson',shapfile)
        let geojson = ogr2ogr(shapfile,  {
            options: ["-t_srs", "EPSG:4326"],
        })
        
        geojson.exec(function (er, data) {
            if (er) {
                Internal.response
                    .status(400)
                    .send(languageJson['upload_messages']['cant_parse_file'][Internal.language]);
                console.error("FILE: ", shapfile, " | ERROR: ", er);
                fs.unlinkSync(Internal.tmpPath);
                return;
            } else {
                callback(data, Internal.finish);
            }
        });
    };

    Internal.extractFiles = async function (zip, callback) {
        let countShps = 0;
        try {
            for await (const entry of zip) {
                const arrayName = entry.path.split(".");
                const fileName = arrayName[0];
                const type = entry.type; // 'Directory' or 'File'
                const size = entry.vars.uncompressedSize; // There is also compressedSize;
                const extension = arrayName.pop();

                if (type == "Directory") continue;

                if (fileName.includes('MACOS')) continue;

                if (extension === 'shp') countShps++;

                if (countShps > 1) {
                    Internal.response.status(400).send(languageJson['upload_messages']['only_one_shp'][Internal.language]);
                    console.error("FILE: ", Internal.targetFilesName, languageJson['upload_messages']['only_one_shp'][Internal.language]);
                    return;
                }

                Internal.dirTarget =
                    Internal.dirUpload +
                    fileName
                        .split("/")
                        .pop()
                        .toLowerCase();

                if (!fs.existsSync(Internal.dirTarget)) {
                    fs.mkdirSync(Internal.dirTarget);
                }

                if (type == "File" && Internal.acceptedFiles.includes(extension)) {
                    let time = "";

                    if (extension == "kml") {
                        time = "-" + new Date().getTime();
                    }

                    let target_path =
                        Internal.dirTarget +
                        "/" +
                        fileName
                            .split("/")
                            .pop()
                            .toLowerCase() +
                        time +
                        "." +
                        extension;

                    let file = fs.createWriteStream(target_path);

                    entry.pipe(file);

                    if (Internal.spatialFiles.includes(extension)) {
                        Internal.targetFilesName = file.path;
                    }
                } else {
                    entry.autodrain();
                }
            }
        } catch (e) {
            Internal.response.status(400).send(languageJson['upload_messages']['cant_extract'][Internal.language]);
            console.error("FILE: ", Internal.targetFilesName, " | ERROR: ", e.stack);
            fs.unlinkSync(Internal.tmpPath);
        }

        if (!fs.existsSync(Internal.targetFilesName)) {
            Internal.response.status(400).send(languageJson['upload_messages']['no_spatial_file'][Internal.language]);
            fs.unlinkSync(Internal.tmpPath);
            console.error(
                "FILE: ",
                Internal.targetFilesName,
                " | ERROR: ",
                languageJson['upload_messages']['no_spatial_file'][Internal.language],
            );
            return;
        }

        if (Internal.targetFilesName.split(".").pop() == "geojson") {
            fs.readFile(Internal.targetFilesName, "utf8", function (err, data) {
                if (err) {
                    Internal.response
                        .status(400)
                        .send(languageJson['upload_messages']['cant_read_file'][Internal.language]);
                    fs.unlinkSync(Internal.tmpPath);
                    console.error("FILE: ", Internal.targetFilesName, " | ERROR: ", err);
                    return;
                }
                let area = Internal.validGeometry(geometry)
                if(area){
                    let geoJson = JSON.parse(data)
                    let token = Internal.saveToPostGis(geoJson);
                    geoJson.token = token;
                    geoJson.area = area;
                    if (gjv.valid(geoJson)) {
                        Internal.response.status(200).send(JSON.stringify(geoJson));
                        fs.unlinkSync(Internal.tmpPath);
                    } else {
                        Internal.response.status(400).send(languageJson['upload_messages']['invalid_geojson'][Internal.language]);
                        fs.unlinkSync(Internal.tmpPath);
                        console.error("FILE: ", Internal.targetFilesName, " | ERROR: ");
                    }
                }
            });
        } else {
            callback(Internal.targetFilesName, Internal.clearCache);
        }
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
                    console.error("ERROR: ");
                }

            }
            
        }
    };

    Internal.import_feature = function (token) {
        var data_atualizacao = new Date(moment().format('YYYY-MM-DD HH:mm'))

        if (Internal.geojson.type.toUpperCase() == 'FeatureCollection'.toUpperCase()) {
            for (const [index, feature] of Internal.geojson.features.entries()) {
                let geom = JSON.stringify((feature.geometry))
                Internal.insertToPostgis(token, geom, data_atualizacao)
            }
        } else
            if (Internal.geojson.type.toUpperCase() == 'Feature'.toUpperCase()) {
                let geom = JSON.stringify((Internal.geojson.geometry))
                Internal.insertToPostgis(token, geom, data_atualizacao)
            }
    };

    Internal.insertToPostgis = async function (token, geom, data_atualizacao) {

        let INSERT_STATEMENT = 'INSERT INTO upload_shapes (token, geom, data_insercao, app_origin) values ($1, ST_Transform(ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON($2)),4326), 4674), $3, $4) returning token;'

        let makeValid = 'update upload_shapes set geom = ST_MAKEVALID(geom) where token= $1'

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            /* for initial population*/
            var rowValues = [token, geom, data_atualizacao, Internal.app_origin]
            const res = await client.query(INSERT_STATEMENT, rowValues)
            //console.log(token + ' inserted.')

            var rowValuesValid = [token]
            const resValid = await client.query(makeValid, rowValuesValid)
            //console.log(token, " validado!")

            await client.query('COMMIT')
        } catch (e) {
            console.error("Doing rollback - ", e)
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }

    Internal.saveToPostGis = function (geojson) {
        let token = new Date().getTime()
        Internal.geojson = geojson;
        Internal.import_feature(token)

        return token;
    };

    Internal.doRequest = function (request, response) {
        /** Reset Variables */
        Internal.targetFilesName = null;
        Internal.dirTarget = null;
        Internal.tmpPath = null;

        Internal.language = request.param("lang");

        Internal.app_origin = request.param("app");

        Internal.response = response;

        /** When using data come in "request.files" regardless of the attribute "shapefile". **/
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

        /** The way to copy the uploaded file. **/
        const src = fs.createReadStream(Internal.tmpPath);

        const zip = src.pipe(unzipper.Parse({ forceStream: true }));

        Internal.extractFiles(zip, Internal.toGeoJson);
    };

    Uploader.getGeoJson = function (request, response) {
        Internal.doRequest(request, response);
    };

    Uploader.saveDrawedGeom = function (request, response) {
        let { geometry, app_origin } = request.body;
        Internal.app_origin = app_origin;
        Internal.response = response
        let area = Internal.validGeometry(geometry)
        if(area){
            let geoJson = JSON.parse(geometry)
            if (gjv.valid(geoJson)) {
                let token = Internal.saveToPostGis(geoJson)
                geoJson.area = area
                geoJson.token = token;
                response.status(200).send(geoJson);
                response.end()
            } else {
                Internal.response.status(400).send(languageJson['upload_messages']['invalid_geojson'][Internal.language]);
            }
        }

    };

    Uploader.areainfo = function (request, response) {

        try {

            var queryResult = request.queryResult['area_upload']
            let info_area = {
                area_upload: queryResult[0]['area_upload']
            }

            queryResult = request.queryResult['geojson_upload']
            info_area.geojson = queryResult[0]['geojson']

            queryResult = request.queryResult['regions_pershape']
            var regions = []

            queryResult.forEach(function (row) {

                regions.push({
                    'type': row['type'],
                    'name': row['text'] + (row['type'] == 'city' ? ' - ' + row['uf'] : ''),
                })
            });

            // Accepts the array and key
            const groupBy = (array, key) => {
                // Return the end result
                return array.reduce((result, currentValue) => {
                    // If an array already present for key, push it to the array. Else create an array and push the object
                    (result[currentValue[key]] = result[currentValue[key]] || []).push(
                        currentValue
                    );
                    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
                    return result;
                }, {}); // empty object is the initial value for result object
            };

            // Group by color as key to the person array
            const regionGroupedByType = groupBy(regions, 'type');

            const keysRegionsGrouped = Object.keys(regionGroupedByType);
            // console.log(keys);

            function getUniqueListBy(arr, key) {
                return [...new Map(arr.map(item => [item[key], item])).values()]
            }

            let uniqueRegionsGrouped = [];
            keysRegionsGrouped.forEach((key, index) => {
                uniqueRegionsGrouped.push({
                    [key]: getUniqueListBy(regionGroupedByType[key], 'name')
                })
                // console.log(`${key}: ${regionGroupedByType[key]} : ${getUniqueListBy(regionGroupedByType[key], 'name')}`);
            });


            var objUniqueRegionsGrouped = Object.assign({}, ...uniqueRegionsGrouped);


            let res = {
                regions_intersected: objUniqueRegionsGrouped,
                shape_upload: info_area
            }

            response.status(200).send(res);
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }

    };

    Uploader.findGeoJsonByToken = function (request, response) {
        try {
            var queryResult = request.queryResult['geojson_upload']
            let geojson = queryResult[0]['geojson']

            var queryResult2 = request.queryResult['area_upload']
            let token = queryResult2[0]['token']

            response.status(200).send({
                token: token,
                geojson: geojson
            });
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    }


    Uploader.analysisarea = function (request, response) {

        try {
            var queryResult = request.queryResult['queimadas']

            var queimadasByYear = []
            queryResult.forEach(function (row) {

                var year = Number(row['year'])
                var area = Number(row['area_queimada'])

                queimadasByYear.push({
                    'area_queimada': area,
                    'year': year
                })
            });

            // var queryResult = request.queryResult['pastagem']

            // var pastagemByYear = []
            // queryResult.forEach(function (row) {

            // 	var year = Number(row['year'])
            // 	var area = Number(row['area_pastagem'])

            // 	queimadasByYear.push({
            // 		'area_pastagem': area,
            // 		'year': year
            // 	})
            // });

            // Accepts the array and key
            const groupBy = (array, key) => {
                // Return the end result
                return array.reduce((result, currentValue) => {
                    // If an array already present for key, push it to the array. Else create an array and push the object
                    (result[currentValue[key]] = result[currentValue[key]] || []).push(
                        currentValue
                    );
                    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
                    return result;
                }, {}); // empty object is the initial value for result object
            };

            const groupByKey = (list, key, { omitKey = false }) => list.reduce((hash, {
                [key]: value,
                ...rest
            }) => ({
                ...hash,
                [value]: (hash[value] || []).concat(omitKey ? { ...rest } : {
                    [key]: value,
                    ...rest
                })
            }), {})

            // Group by color as key to the person array
            const areasGroupedByYear = groupByKey(queimadasByYear, 'year', { omitKey: true });
            // const areasGroupedByYear = groupBy(queimadasByYear, 'year');
            let arrayAreasGrouped = []
            for (let key of Object.keys(areasGroupedByYear)) {
                arrayAreasGrouped.push({
                    year: key,
                    // area_pastagem: areasGroupedByYear[key][0].hasOwnProperty('area_pastagem') ? areasGroupedByYear[key][0]['area_pastagem'] : areasGroupedByYear[key][1]['area_pastagem'],
                    area_queimada: areasGroupedByYear[key][0].hasOwnProperty('area_queimada') ? areasGroupedByYear[key][0]['area_queimada'] : null
                })
            }

            let graphQueimadasPastagem = {
                "title": "Dados",
                "type": "line",
                "pointStyle": 'rect',
                "options": {
                    title: {
                        display: false,
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            fontColor: "#85560c"
                        },
                        position: "bottom"
                    },
                    tooltips: {}
                },
                "data": {
                    labels: arrayAreasGrouped.map(e => e.year),
                    datasets: [
                        // {
                        // 	data: arrayAreasGrouped.map(e => e.area_pastagem),
                        // 	borderColor: 'rgb(231, 187, 2)',
                        // 	fill: false,
                        // 	label: "Area de Pastagem"
                        // },
                        {
                            data: arrayAreasGrouped.map(e => e.area_queimada),
                            borderColor: 'rgb(110, 101, 101)',
                            fill: false,
                            label: "Area Queimada"
                        }
                    ]
                }
            }


            queryResult = request.queryResult['terraclass']
            var terraclass = []

            queryResult.forEach(function (row) {

                var color = (row['color'])
                var lulc = (row['lulc'])
                var area = Number(row['area_lulc'])

                terraclass.push({
                    'color': color,
                    'lulc': lulc,
                    'area_lulc': area
                })
            });

            let graphTerraclass = {
                "title": "Terraclass",
                "type": "pie",
                "pointStyle": 'rect',
                "options": {
                    title: {
                        display: false,
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            fontColor: "#85560c"
                        },
                        position: "bottom"
                    },
                    tooltips: {}
                },
                "data": {
                    labels: terraclass.map(e => e.lulc),
                    datasets: [{
                        data: terraclass.map(e => e.area_lulc),
                        backgroundColor: terraclass.map(element => element.color),
                        hoverBackgroundColor: terraclass.map(element => element.color)
                    }]
                }
            }

            var queryResult = request.queryResult['prodes']

            var resultByYear = []
            queryResult.forEach(function (row) {

                var year = Number(row['year'])
                var area = Number(row['area_desmat'])

                resultByYear.push({
                    'area_desmat': area,
                    'year': year
                })
            });

            let res = {
                chart_pastagem_queimadas_peryear: graphQueimadasPastagem,
                table_pastagem_queimadas_peryear: arrayAreasGrouped,
                terraclass: graphTerraclass,
                prodes: resultByYear
            }

            response.status(200).send(res);
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    };



    Uploader.saveAnalysis = function (request, response) {

        let token = request.queryResult['store'];

        response.send(token);
        response.end()
    };

    Uploader.pasture = function (request, response) {

        try {

            var queryResult = request.queryResult['pastagem']

            var pastagemByYear = []
            queryResult.forEach(function (row) {

                var year = Number(row['year'])
                var area = Number(row['area_pastagem'])

                pastagemByYear.push({
                    'area_pastagem': area,
                    'year': year
                })
            });


            const groupByKey = (list, key, { omitKey = false }) => list.reduce((hash, {
                [key]: value,
                ...rest
            }) => ({
                ...hash,
                [value]: (hash[value] || []).concat(omitKey ? { ...rest } : {
                    [key]: value,
                    ...rest
                })
            }), {})

            // Group by color as key to the person array
            const areasGroupedByYear = groupByKey(pastagemByYear, 'year', { omitKey: true });
            let arrayAreasGrouped = []

            for (let key of Object.keys(areasGroupedByYear)) {
                arrayAreasGrouped.push({
                    year: key,
                    area_pastagem: areasGroupedByYear[key][0].hasOwnProperty('area_pastagem') ? areasGroupedByYear[key][0]['area_pastagem'] : areasGroupedByYear[key][1]['area_pastagem'],
                })
            }

            let graphPastagem = {
                "title": "Dados",
                "type": "line",
                "pointStyle": 'rect',
                "options": {
                    title: {
                        display: false,
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            fontColor: "#85560c"
                        },
                        position: "bottom"
                    },
                    tooltips: {}
                },
                "data": {
                    labels: arrayAreasGrouped.map(e => e.year),
                    datasets: [{
                        data: arrayAreasGrouped.map(e => e.area_pastagem),
                        borderColor: 'rgb(231, 187, 2)',
                        fill: false,
                        label: "Area de Pastagem"
                    }]
                }
            }

            let res = {
                table_peryear: arrayAreasGrouped,
                chart_peryear: graphPastagem,
            }

            response.status(200).send(res);
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    };

    Uploader.pasturequality = function (request, response) {

        try {

            var queryResult = request.queryResult['pasture_quality']

            var pastagemByYear = []
            queryResult.forEach(function (row) {

                var year = Number(row['year'])
                var area = Number(row['area_pastagem'])

                pastagemByYear.push({
                    'area_pastagem': area,
                    'year': year,
                    'classe': row['classe'],
                    'color': row['color']
                })
            });

            let graphPastagem = {
                "title": {
                    display: false
                },
                "type": "pie",
                "pointStyle": 'rect',
                "options": {
                    title: {
                        display: false,
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            fontColor: "#495057"
                        },
                        position: "bottom"
                    },
                    tooltips: {}
                },
                "data": {
                    labels: pastagemByYear.map(e => e.classe),
                    datasets: [{
                        data: pastagemByYear.map(e => parseFloat(e.area_pastagem)),
                        backgroundColor: pastagemByYear.map(element => element.color),
                        hoverBackgroundColor: pastagemByYear.map(element => element.color),
                        label: "Area de Pastagem"
                    }]
                }
            }

            let res = {
                table_peryear: pastagemByYear,
                chart_peryear: graphPastagem,
            }

            response.status(200).send(res);
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    };

    Uploader.carbonstock = function (request, response) {

        try {

            var queryResult = request.queryResult['pastagem']

            var pastagemByYear = []
            queryResult.forEach(function (row) {

                var year = Number(row['year'])
                var area = Number(row['area_pastagem'])

                pastagemByYear.push({
                    'area_pastagem': area,
                    'year': year
                })
            });


            const groupByKey = (list, key, { omitKey = false }) => list.reduce((hash, {
                [key]: value,
                ...rest
            }) => ({
                ...hash,
                [value]: (hash[value] || []).concat(omitKey ? { ...rest } : {
                    [key]: value,
                    ...rest
                })
            }), {})

            // Group by color as key to the person array
            const areasGroupedByYear = groupByKey(pastagemByYear, 'year', { omitKey: true });
            let arrayAreasGrouped = []

            for (let key of Object.keys(areasGroupedByYear)) {
                arrayAreasGrouped.push({
                    year: key,
                    area_pastagem: areasGroupedByYear[key][0].hasOwnProperty('area_pastagem') ? areasGroupedByYear[key][0]['area_pastagem'] : areasGroupedByYear[key][1]['area_pastagem'],
                })
            }

            let graphQueimadasPastagem = {
                "title": "Dados",
                "type": "line",
                "pointStyle": 'rect',
                "options": {
                    title: {
                        display: false,
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            fontColor: "#85560c"
                        },
                        position: "bottom"
                    },
                    tooltips: {}
                },
                "data": {
                    labels: arrayAreasGrouped.map(e => e.year),
                    datasets: [{
                        data: arrayAreasGrouped.map(e => e.area_pastagem),
                        borderColor: 'rgb(231, 187, 2)',
                        fill: false,
                        label: "Area de Pastagem"
                    },]
                }
            }

            let res = {
                chart_pastagem_peryear: graphQueimadasPastagem,
                table_pastagem_peryear: arrayAreasGrouped,
            }

            response.status(200).send(res);
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    };

    Uploader.getPastureYears = function (request, response) {
        try {

            queryResult = request.queryResult['pasture']

            let yearsObjects = {
                pasture: request.queryResult['pasture'].map(e => Number(e.year)),
                pasture_quality: request.queryResult['pasture_quality'].map(e => Number(e.year))
            };

            response.status(200).send(yearsObjects);
            response.end()

        } catch (err) {
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    }

    Uploader.pastureForJob = function (request, response) {
        const { year } = request.query;
        try {
            let queryResult = request.queryResult['pastureforjob'];
            let pastagemByYear = [];
            if (queryResult.length > 0) {
                pastagemByYear = []
                queryResult.forEach(function (row) {
                    const year = Number(row['year'])
                    const area = Number(row['area_pastagem'])
                    pastagemByYear.push({
                        'area_pastagem': area,
                        'year': year
                    })
                });
            } else {
                pastagemByYear.push( {
                    year: null,
                    area_pastagem: null
                })
            }
            response.status(200).send(pastagemByYear);
            response.end()

        } catch (err) {
            console.error(err)
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    };

    Uploader.pasturequalityForJob = function (request, response) {

        try {

            let queryResult = request.queryResult['pasturequalityforjob']
            let pastureQualityByYear = []

            if (queryResult.length > 0) {
                queryResult.forEach(function (row) {
                    const year = Number(row['year'])
                    const area = Number(row['area_pastagem'])

                    pastureQualityByYear.push({
                        'area_pastagem': area,
                        'year': year,
                        'classe': row['classe'],
                        'color': row['color']
                    })
                });
            }
            else {
                pastureQualityByYear.push({
                    'area_pastagem': null,
                    'year': null,
                    'classe': null,
                    'color': null
                })
            }

            response.status(200).send(pastureQualityByYear);
            response.end()

        } catch (err) {
            console.error(err)
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    };

    Uploader.getAnalysis = function (request, response) {
        const { lang, token, origin } = request.query;

        const language = lang;

        Internal.languageOb = UtilsLang().getLang(language).right_sidebar;
        const auxLang = UtilsLang().getLang(language).area
        let tempPastureQuality = [];
        try {

            queryResult = request.queryResult['return_analysis'];

            let res = false

            if (queryResult.length > 0) {
                res = JSON.parse(Buffer.from(queryResult[0].analysis, 'base64'));
            }

            if(res.pasture.length > 0){
                res.pasture = res.pasture.map(elem => {
                    elem.value = elem.area_pastagem;
                    delete elem.area_pastagem;
                    elem.label = elem.year;
                    delete elem.year;
                    elem.color = 'rgb(231, 187, 2)'
                    return elem;
                });
            }

            if(res.pasture_quality.length > 0){
                res.pasture_quality = res.pasture_quality.map(elem => {
                    return elem.map(item => {
                        item.value = item.area_pastagem;
                        delete item.area_pastagem;
                        item.label = item.year;
                        delete item.year;
                        tempPastureQuality.push(item)
                        return item
                    });
                });
                res.pasture_quality = [
                    ...tempPastureQuality.filter(item => {
                        return item.classe === 'Ausente'
                    }),
                    ...tempPastureQuality.filter(item => {
                        return item.classe === 'Intermediário'
                    }),
                    ...tempPastureQuality.filter(item => {
                        return item.classe === 'Severa'
                    })
                ];
            }

            // Ascending sort
            if(res.pasture.length > 0){
                res.pasture.sort((a, b) => (typeof a.label === 'string' || a.label instanceof String ? parseFloat(a.label) : Number(a.label)) - (typeof b.label === 'string' || b.label instanceof String ? parseFloat(b.label) : Number(b.label)));
            }

            if(res.pasture_quality.length > 0){
                res.pasture_quality.sort((a, b) => (typeof a.label === 'string' || a.label instanceof String ? parseFloat(a.label) : Number(a.label)) - (typeof b.label === 'string' || b.label instanceof String ? parseFloat(b.label) : Number(b.label)));
            }

            const chartResult = [
                {
                    "id": "pasture",
                    "idsOfQueriesExecuted": [
                        { idOfQuery: 'pasture', labelOfQuery: Internal.languageOb["area1_card"]["pastureAndLotacaoBovina"].labelOfQuery['pasture'] },
                    ],
                    "title": Internal.languageOb["area1_card"]["pastureAndLotacaoBovina"].title,
                    "getText": function () {
                        const text = auxLang.analyzed_area_pasture_text
                        return text
                    },
                    "type": 'line',
                    "options": {
                        legend: {
                            display: false
                        }
                    }
                },
                {
                    "id": "pasture_quality",
                    "idsOfQueriesExecuted": [
                        { idOfQuery: 'pasture_quality', labelOfQuery: Internal.languageOb["area1_card"]["pastureQuality"].labelOfQuery['pasture_quality'] },
                        // { idOfQuery: 'lotacao_bovina_regions', labelOfQuery: Internal.languageOb["area1_card"]["pastureAndLotacaoBovina"].labelOfQuery['lotacao_bovina_regions'] },
                    ],
                    "title": Internal.languageOb["area1_card"]["pastureQuality"].title,
                    "getText": function () {
                        const text = auxLang.analyzed_area_pasture_quality_text
                        return text
                    },
                    "type": 'line',
                    "options": {
                        legend: {
                            display: false
                        }
                    }
                },
            ]

            for (let chart of chartResult) {
                if(res[chart.id].length > 0){
                    chart['data'] = Internal.buildGraphResult(res[chart.id], chart)
                }else{
                    chart['data'] = null
                }

                chart['show'] = false

                if (chart['data']) {
                    chart['show'] = true
                    chart['text'] = chart.getText()
                } else {
                    chart['data'] = {};
                    chart['show'] = false;
                    chart['text'] = "erro."
                }
            }

            let finalObject = {
                regions_intersected: res.regions_intersected,
                shape_upload: res.shape_upload,
                pasture: chartResult.filter(e => e.id == 'pasture'),
                pasture_quality: chartResult.filter(e => e.id == 'pasture_quality')
            }

            if (typeof res === 'object' && res !== null)
                response.status(200).send(finalObject);
            else {
                response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            }
            response.end()

        } catch (err) {
            console.error(err);
            response.status(400).send(languageJson['upload_messages']['spatial_relation_error'][Internal.language]);
            response.end()
        }
    }


    Internal.buildGraphResult = function (queryInd, chartDescription) {
        var dataInfo = {}

        try {
            let arrayLabels = []
            let arrayData = []

            arrayLabels.push(...queryInd.map(a => (typeof a.label == 'number' ? Number(a.label) : String(a.label))))
            let colors = [...new Set(queryInd.map(a => a.color))]
            for (let query of chartDescription.idsOfQueriesExecuted) {
                if (chartDescription.type == 'line') {

                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            fill: false,
                            borderColor: [...new Set(queryInd.map(a => a.color))],
                            tension: .4
                        })
                    }
                    else {
                        for (const [keyLabelQuery, valueLabelQuery] of Object.entries(query.labelOfQuery)) {

                            arrayData.push({
                                label: valueLabelQuery,
                                data: [
                                    ...queryInd.filter(ob => {
                                        return  ob.classe == keyLabelQuery
                                    }).map(a =>  {
                                            return (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value))
                                        }
                                    )
                                ],
                                fill: false,
                                borderColor: [...new Set(queryInd.filter(a => a.classe == keyLabelQuery).map(ob => ob.color))],
                                tension: .4
                            })
                        }
                    }
                }
                else if (chartDescription.type == 'pie' || chartDescription.type == 'doughnut') {
                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            backgroundColor: [...new Set(queryInd.map(element => element.color))],
                            hoverBackgroundColor: [...new Set(queryInd.map(element => element.color))],
                        })
                    }
                    else {
                        arrayData.push({
                            label: query.idOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            backgroundColor: [...new Set(queryInd.map(element => element.color))],
                            hoverBackgroundColor: [...new Set(queryInd.map(element => element.color))],
                        })
                    }

                }
                else if (chartDescription.type == 'bar' || chartDescription.type == 'horizontalBar') {
                    if (typeof query.labelOfQuery === 'string') {
                        arrayData.push({
                            label: query.labelOfQuery,
                            data: [...queryInd.map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                            backgroundColor: [...new Set(queryInd.map(a => a.color))],
                        })
                    }
                    else {
                        for (const [keyLabelQuery, valueLabelQuery] of Object.entries(query.labelOfQuery)) {
                            arrayData.push({
                                label: valueLabelQuery,
                                data: [...queryInd.filter(ob => ob.classe == keyLabelQuery).map(a => (typeof a.value === 'string' || a.value instanceof String ? parseFloat(a.value) : Number(a.value)))],
                                backgroundColor: [...new Set(queryInd.filter(ob => ob.classe == keyLabelQuery).map(a => a.color))],
                            })
                        }
                    }
                }
            }
            dataInfo = {
                labels: [...new Set(arrayLabels)],
                datasets: [...arrayData]
            }

            // chart['indicators'] = queryInd.filter(val => {
            //     return parseFloat(val.value) > 10
            // })
        }
        catch (e) {
            dataInfo = null
        }

        return dataInfo;
    };


    return Uploader;
};
