// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
let commitId = ''

console.debug = function() {};

// TODO: Create LAPIG logo and version information.
/*try{
  const config = require('../../../version.json');
  console.log(config)
  commitId = config.commitId
}catch{
  console.log('Not version')
}*/

export const environment = {
  APP_NAME: 'Atlas das Pastagens',
  production: false,
  GTAG: '',
  OWS_API: 'https://ows.lapig.iesa.ufg.br/api',
  OWS: 'https://ows.lapig.iesa.ufg.br',
  OWS_O1: "https://o1.lapig.iesa.ufg.br/ows",
  OWS_O2: "https://o2.lapig.iesa.ufg.br/ows",
  OWS_O3: "https://o3.lapig.iesa.ufg.br/ows",
  OWS_O4: "https://o4.lapig.iesa.ufg.br/ows",
  APP_URL: 'https://atlasdev.lapig.iesa.ufg.br',
  LAPIG_JOBS: 'https://jobs.lapig.iesa.ufg.br',
  LAPIG_DOWNLOAD_API: 'https://download.lapig.iesa.ufg.br',
  LAPIG_CONTENT_HUB: 'https://content-hub.lapig.iesa.ufg.br',
  TASK_API: 'https://task.lapig.iesa.ufg.br/api',
  S3: "https://s3.lapig.iesa.ufg.br/storage/",
  MAX_AREA: 9500,
  COMMIT_ID:commitId,
  recaptcha: {
    siteKey: '6Lf_jygpAAAAAO-8ArU28R6EszgO2WhCArk06nPm',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.