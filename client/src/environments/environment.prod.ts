let commitId = ''

// TODO: Create LAPIG logo and version information.
/*try{
  const config = require('../../../../version.json');
  console.log(config)
  commitId = config.commitId
}catch{
  console.log('Not version')
}*/

export const environment = {
  APP_NAME: 'Atlas das Pastagens',
  production: true,
  GTAG: 'G-6MKZ8HZF31',
  OWS_API: 'https://ows.lapig.iesa.ufg.br/api',
  OWS: 'https://ows.lapig.iesa.ufg.br',
  OWS_O1: "https://o1.lapig.iesa.ufg.br/ows",
  OWS_O2: "https://o2.lapig.iesa.ufg.br/ows",
  OWS_O3: "https://o3.lapig.iesa.ufg.br/ows",
  OWS_O4: "https://o4.lapig.iesa.ufg.br/ows",
  APP_URL: 'https://atlasdaspastagens.lapig.iesa.ufg.br',
  LAPIG_JOBS: 'https://jobs.lapig.iesa.ufg.br',
  LAPIG_CONTENT_HUB: 'https://content-hub.lapig.iesa.ufg.br',
  LAPIG_DOWNLOAD_API: 'https://download.lapig.iesa.ufg.br',
  S3: "https://s3.lapig.iesa.ufg.br/storage/",
  MAX_AREA: 9500,
  COMMIT_ID:commitId,
  recaptcha: {
    siteKey: '6Lf_jygpAAAAAO-8ArU28R6EszgO2WhCArk06nPm',
  },
};
