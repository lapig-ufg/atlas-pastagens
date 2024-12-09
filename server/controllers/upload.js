const axios = require("axios");

const fs = require('fs');

const FormData = require("form-data");

module.exports = function (app) {
  const api = "https://task.lapig.iesa.ufg.br/api/task/savegeom";

  const Internal = {};

  const Uploader = {};

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
    "xml",
  ];

  Internal.spatialFiles = ["shp", "kml", "geojson"];

  Uploader.saveDrawedGeom = function (request, response) {
    const accessToken = request.auth_token.access_token;

    axios
      .post(`${api}/geojson`, request.body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((taskResponse) => {
        if (taskResponse.status === 200) {
          response.status(201).send({ token: taskResponse.data.task_id });
        } else {
          console.error("Falha ao enviar o GeoJSON.", taskResponse);
        }
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send({ message: error });
      });
  };

  Uploader.saveUploadedFile = function (request, response) {
    const accessToken = request.auth_token.access_token;

    let name = request.body.name;
    let email = request.body.email;

    const formData = new FormData();

    /* TODO: Tentar:
      1) Tentar recuperar binario direto do request.
      2) Muter não criar arquivo e mandar direto pra frente.
      3) Muter criar arquivo no temp.
    */
    formData.append('files', fs.createReadStream(request.file.path), request.file.originalname);

    axios
      .post(
        `${api}/file?name=${name}&email=${email}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((taskResponse) => {
        if (taskResponse.status === 200) {
          fs.unlinkSync(request.file.path);

          response.status(201).send({ token: taskResponse.data.task_id });
        } else {
          console.error("Falha ao enviar o GeoJSON.", taskResponse);
        }
      })
      .catch((error) => {
        console.error(error);

        fs.unlinkSync(request.file.path);

        response.status(500).send({ message: error });
      });
  };

  return Uploader;
};
