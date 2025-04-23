var cluster = require('cluster');

const totalNumCPUs = require('os').cpus().length ;
const CPU_PERCENT = parseFloat(process.env.CPU_PERCENT) || 0.2;

let numCPUs = Math.floor(totalNumCPUs * CPU_PERCENT);

numCPUs =  Math.max(2, numCPUs + numCPUs%2);

if (cluster.isMaster) {
  if(process.env.NODE_ENV !== 'prod') numCPUs = 2;
  
  console.log(`Total de works: ${numCPUs}`);

  for (var i = 0; i < numCPUs; i++) {
    var ENV_VAR = {}

    if(i == 0) {
    	ENV_VAR = { 'PRIMARY_WORKER': 1 }
    }

    var worker = cluster.fork(ENV_VAR);
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  require('./app.js');
}