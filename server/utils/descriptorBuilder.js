const path = require("path");

const fs = require("fs");
const Group = require("../models/group");
const Layer = require("../models/layer");

module.exports = function (app) {
  var Internal = {};
  var Controller = {};

  Controller.buildOwn = function (blob, type, lang) {
    const path = `./descriptor/${type}`
    const filesInDir = fs.readdirSync(path)
    const jsonsInDir = filesInDir.filter((file) => path.extname(file) === ".json");

    var result = [];

    jsonsInDir.forEach((file) => {
      try {
        const data = fs.readFileSync(path.join(path, file), "utf8");
        const json = JSON.parse(data.toString());

        json.forEach((item) => {
          var group = new Group(lang, item, blob).getGroupInstance();
          result.push(group);
        });

      } catch (e) {
        console.error("[DESCRIPTOR] Error while fetching layers.\n\n", e);
      }
    });

    return result;
  };

  Controller.getLayers = function (language, layertypes) {
    const jsonsInDir = fs
      .readdirSync("./descriptor/groups")
      .filter((file) => path.extname(file) === ".json");

    var data = [];

    jsonsInDir.forEach((groupFile) => {
      try {
        const data = fs.readFileSync(path.join(folder_path, groupFile), "utf8");
        const json = JSON.parse(data.toString());

        json.forEach(function (item, index) {
          var group = new Group(
            language, item, layertypes
          ).getGroupInstance();

          data.push(group);
        });
      } catch (e) {
        console.error("[DESCRIPTOR] Error while fetching layers.\n\n", e);
      }
    });

    return data;
  };

  Controller.getBasemaps = function (language, layertypes) {
    var folder_path = "./descriptor/basemaps";
    const jsonsInDir = fs
      .readdirSync(folder_path)
      .filter((file) => path.extname(file) === ".json");

    var basemaps = [];

    jsonsInDir.forEach((file) => {
      try {
        const data = fs.readFileSync(path.join(folder_path, file), "utf8");
        const json = JSON.parse(data.toString());

        json.forEach(function (item, index) {
          const layer = new Layer(language, item, null, layertypes);
          basemaps.push(layer.getLayerInstance());
        });
      } catch (e) {
        console.error("[DESCRIPTOR] Error while fetching basemaps.\n\n", e);
      }
    });

    return basemaps;
  };

  Controller.getLimits = function (language, layertypes) {
    const folder_path = "./descriptor/limits";
    const jsonsInDir = fs
      .readdirSync(folder_path)
      .filter((file) => path.extname(file) === ".json");

    var limits = [];

    jsonsInDir.forEach((file) => {
      try {
        const data = fs.readFileSync(path.join(folder_path, file), "utf8");
        const json = JSON.parse(data.toString());

        json.forEach(function (item, index) {
          const layer = new Layer(language, item, null, layertypes);
          limits.push(layer.getLayerInstance());
        });
      } catch (e) {
        console.error("[DESCRIPTOR] Error while fetching basemaps.\n\n", e);
      }
    });

    return limits;
  };

  return Controller;
};
