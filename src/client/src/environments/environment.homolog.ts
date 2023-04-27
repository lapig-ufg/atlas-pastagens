let commitId = ''
try{
  const config = require('../../../../version.json');
  console.log(config)
  commitId = config.commitId
}catch{
  console.log('Not version')
}

export const environment = {
  APP_NAME: 'Atlas das Pastagens',
  production: true,
  GTAG: '',
  OWS_API: 'https://ows-homolog.lapig.iesa.ufg.br/api',
  OWS: 'https://ows-homolog.lapig.iesa.ufg.br',
  OWS_O1: "https://o5.lapig.iesa.ufg.br/ows",
  OWS_O2: "https://o6.lapig.iesa.ufg.br/ows",
  OWS_O3: "https://o7.lapig.iesa.ufg.br/ows",
  OWS_O4: "https://o8.lapig.iesa.ufg.br/ows",
  APP_URL: 'https://atlasdev.lapig.iesa.ufg.br',
  LAPIG_JOBS: 'https://jobs.lapig.iesa.ufg.br',
  LAPIG_DOWNLOAD_API: 'https://download.lapig.iesa.ufg.br',
  MAX_AREA: 9500,
  COMMIT_ID:commitId
};
