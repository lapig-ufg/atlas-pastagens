const fs = require('fs');
const path = require('path')

module.exports = new function () {

    var Controller = {}
    var Internal = {}

    Controller.removeNullProperties = function (obj) {
        Object.keys(obj).forEach(key => {
            let value = obj[key];
            let hasProperties = value && Object.keys(value).length > 0;
            if (value === null) {
                delete obj[key];
            }
            else if ((typeof value !== "string") && hasProperties) {
                this.removeNullProperties(value);
            }
        });
        return obj;
    }


    return Controller;
}