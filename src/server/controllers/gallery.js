
const fs = require('fs')
const path = require('path')

module.exports = function (app) {


  var Controller = {}
  var Internal = {}

  Internal.getFiles = function (path) {
    if (fs.existsSync(path)) {
      return fs.readdirSync(path);
    } else {
      return [];
    }
  };

  Internal.normalize = function (string) {
    const normalized = string.replace(/\s/g, '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalized;
  }

  Internal.fieldFiles = function (id, tablename) {
    // var fotosCamera = app.config.fieldDataDir + '/fotos_camera/' + id
    const fotosCamera = app.config.fieldDir + "fotos_camera/" + tablename + "/" + id;
    const fotosDrone = app.config.fieldDir + "fotos_drone/" + tablename + "/" + id;
    const videosDrone = app.config.fieldDir + "videos_drone/" + tablename + "/" + id;

    return {
      videos_drone: Internal.getFiles(videosDrone),
      fotos_drone: Internal.getFiles(fotosDrone),
      fotos_camera: Internal.getFiles(fotosCamera)
    };
  };

  Controller.fieldData = function (request, response) {


    const { id, category, filename, tablename } = request.params;

    const filepath = app.config.fieldDir + "/" + category + "/" + tablename + "/" + id + "/" + filename;
    // const filepath = app.config.fieldDir + "/" + category + "/" + tablename + "/" + 1 + "/" + filename;

    response.sendFile(filepath);
  };

  Controller.field = function (request, response) {

    const { id, tablename } = request.query;

    const files = Internal.fieldFiles(id, tablename);
    // const files = Internal.fieldFiles(1, tablename);

    response.send(files);
    response.end();

  }

  Controller.tags = function (request, response) {
    const tags = request.queryResult['tags'];
    let formattedTags = [];
    if (Array.isArray(tags)) {
      const groupedTags = tags.reduce((r, a) => {
        if (a.col.includes('tag_')) {
          r['tags'] = r['tags'] || [];
          r['tags'].push(a);
        } else {
          r[a.col] = r[a.col] || [];
          r[a.col].push(a);
        }
        return r;
      }, Object.create(null));

      for (let [key, value] of Object.entries(groupedTags)) {
        formattedTags.push({
          label: key,
          value: key,
          items: value.map(tag => { return { tag: tag.tag, column: tag.col } })
        })
      }

      let itemTags = formattedTags[2];
      itemTags.items.sort((a, b) => Internal.normalize(a.tag) - Internal.normalize(b.tag));
      formattedTags.splice(2, 1);
      formattedTags.unshift(itemTags)

      response.send(formattedTags)
      response.end();
    } else {
      response.status(400).json({ msg: 'Error on search tags' })
      response.end();
    }
  }

  Controller.image = function (request, response) {
    const { id, type, filename } = request.params;
    const filePath = type === 'thumb' ? app.config.hotsiteDir + "thumb/" + id + ".jpg" : app.config.hotsiteDir + id + ".jpg";
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      response.send(file);
      response.end();
    } else {
      response.status(404).send({ error: 'File not found' });
      response.end();
    }
  }

  Controller.images = function (request, response) {
    const images = request.queryResult['images'];
    if (Array.isArray(images)) {
      response.send(images)
      response.end();
    } else {
      response.status(400).send({ error: 'Error on search images' });
      response.end();
    }
  }

  return Controller;

}