const express = require('express'),
    load = require('express-load'),
    util = require('util'),
    path = require('path'),
    compression = require('compression'),
    requestTimeout = require('express-timeout'),
    responseTime = require('response-time'),
    bodyParser = require('body-parser'),
    parseCookie = require('cookie-parser'),
    cors = require('cors');

const app = express();
const http = require('http').Server(app);
const cookie = parseCookie('LAPIG')

load('config.js', { 'verbose': false })
    .then('database')
    .then('middleware')
    .into(app);


app.database.client.init(function () {
    app.use(cookie);

    app.use((req, res, next) => {
        //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
        res.header("Access-Control-Allow-Origin", "*");
        //Quais são os métodos que a conexão pode realizar na API
        res.header("Access-Control-Allow-Methods", '*');
        app.use(cors());
        next();
    });

    app.use(compression());
    app.use(express.static(app.config.clientDir));

    app.get('*', function (request, response, next) {
        if (!request.url.includes('api') && !request.url.includes('service')) {
            response.sendFile(path.resolve(app.config.clientDir + '/index.html'));
        } else {
            next();
        }
    });

    app.set('views', __dirname + '/templates');
    app.set('view engine', 'ejs');

    app.use(requestTimeout({
        'timeout': 2000 * 60 * 60,
        'callback': function (err, options) {
            let response = options.res;
            if (err) {
                util.log('Timeout: ' + err);
            }
            response.end();
        }
    }));

    app.use(responseTime());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '1gb' }));

    app.use(function (error, request, response, next) {
        console.log('ServerError: ', error.stack);
        next();
    });

    load('controllers')
        .then('routes')
        .then('utils')
        .into(app);


    app.database.client.init_general(function () { });


    const httpServer = http.listen(app.config.port, function () {
        console.log('%s Server @ [port %s] [pid %s]', app.config.appName, app.config.port, process.pid.toString());
    });

    [`exit`, `uncaughtException`].forEach((event) => {
        if (event === 'uncaughtException') {
            process.on(event, (e) => { })
        } else {
            process.on(event, (e) => {
                httpServer.close(() => process.exit())
            })
        }

    })
})
