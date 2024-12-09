const fs = require("fs");
const path = require("path");
const lang = require("./language");
const Group = require("../models/group");
const Layer = require("../models/layer");
const got = require("got");

module.exports = function (app) {
  var Controller = {};
  var Internal = {};

  Controller.getLayers = function (language, layertypes) {
    var folder_path = "./descriptor/groups";

    const jsonsInDir = fs
      .readdirSync(folder_path)
      .filter((file) => path.extname(file) === ".json");

    var groups = [];
    var order = Internal.getGroupsOrder();

    order.forEach((element) => {
      jsonsInDir.forEach((file) => {
        if (
          new String(file)
            .toLowerCase()
            .includes(new String(element).toLowerCase())
        ) {
          try {
            const fileData = fs.readFileSync(
              path.join(folder_path, file),
              "utf8"
            );

            const json = JSON.parse(fileData.toString());

            json.forEach(function (item, index) {
              var group = new Group(
                language,
                item,
                layertypes
              ).getGroupInstance();

              groups.push(group);
            });
          } catch (e) {
            console.error("[DESCRIPTOR] Error while fetching layers.\n\n", e);
          }
        }
      });
    });

    return groups;
  };

  Controller.getBasemaps = function (language, layertypes) {
    var folder_path = "./descriptor/basemaps";
    const jsonsInDir = fs
      .readdirSync(folder_path)
      .filter((file) => path.extname(file) === ".json");

    var basemaps = [];

    jsonsInDir.forEach((file) => {
      try {
        const fileData = fs.readFileSync(path.join(folder_path, file), "utf8");
        const json = JSON.parse(fileData.toString());

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
        const fileData = fs.readFileSync(path.join(folder_path, file), "utf8");
        const json = JSON.parse(fileData.toString());

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

  Internal.getGroupsOrder = function () {
    return [
      "pasture",
      "campo",
      "inspecao_visual",
      "agropecuaria",
      "areas_declaradas",
      "infraestrutura",
      "areas_especiais",
      "imagens",
    ];
  };

  return Controller;
};
