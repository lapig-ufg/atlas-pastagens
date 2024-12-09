require('dotenv').config();
const cluster = require('cluster');

let numCPUs = 48;

if (cluster.isMaster) {

    if (process.env.NODE_ENV == 'dev') {
        numCPUs = 2
    }

    for (let i = 0; i < numCPUs; i++) {
        let ENV_VAR = {}
        if (i == 0) {
            ENV_VAR = { 'PRIMARY_WORKER': 1 }
        }

        let worker = cluster.fork(ENV_VAR);
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });

} else {
    require('./app.js');
}