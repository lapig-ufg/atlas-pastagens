module.exports = function (app) {
  var Internal = {};
  var Query = {};

  Query.defaultParams = {
    type: "bioma",
    region: "Cerrado",
  };

  Query.extent = function (params) {
    return [
      {
        source: "general",
        id: "extent",
        sql: "SELECT geom_json as geojson FROM regions_geom WHERE type=${type} AND unaccent(value) ilike unaccent(${key}) LIMIT 1",
        mantain: true,
      },
    ];
  };

  Query.search = function () {
    return [
      {
        source: "general",
        id: "search",
        sql:
          "With priority_search AS (" +
          " SELECT distinct concat_ws(' - ', text , uf) as text, value, type, 1 AS priority FROM regions_geom " +
          "WHERE unaccent(text) ILIKE unaccent(${key})  AND type NOT in ('country') " +
          "UNION ALL " +
          "SELECT distinct concat_ws(' - ', text , uf) as text, value, type, 2 AS priority FROM regions_geom " +
          "WHERE unaccent(text) ILIKE unaccent(${key}%) AND type NOT in ('country') ) " +
          "select * from priority_search order by priority asc limit 10",
        mantain: true,
      },
    ];
  };

  Query.searchregion = function () {
    return [
      {
        source: "general",
        id: "search",
        sql: "SELECT text, value, type FROM regions_geom WHERE unaccent(value) ILIKE unaccent(${key}) AND type = (${type}) LIMIT 10",
        mantain: true,
      },
    ];
  };

  Query.cdgeocmu = function () {
    return [
      {
        source: "general",
        id: "search",
        sql: "SELECT text, value, type, cd_geocmu FROM regions WHERE cd_geocmu=${key} LIMIT 10",
        mantain: true,
      },
    ];
  };

  Query.cars = function () {
    return [
      {
        source: "lapig",
        id: "search",
        sql: "SELECT cod_car as text, area_ha, ST_AsGeoJSON(geom) as geojson FROM geo_car_imovel WHERE unaccent(cod_car) ILIKE unaccent(${key}%) order by area_ha DESC LIMIT 10",
        mantain: true,
      },
    ];
  };

  Query.ucs = function (params) {
    var key = params["key"];
    return [
      {
        source: "general",
        id: "search",
        sql:
          "SELECT nome || ' - ' || uf as text, uf, cd_geocmu, ST_AsGeoJSON(geom) as geojson FROM ucs WHERE unaccent(nome) ILIKE unaccent('%" +
          key +
          "%') order by nome ASC LIMIT 10",
        mantain: true,
      },
    ];
  };

  return Query;
};
