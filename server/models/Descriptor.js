const lang = require('../utils/language');

module.exports = class Descriptor {

    groups;
    options;
    
    constructor(groups, options) {}

    #getOwnLayers = function (language, layertypes) {
        var folder_path = "./descriptor/groups";

        const jsonsInDir = fs
            .readdirSync(folder_path)
            .filter((file) => path.extname(file) === ".json");

        var groups = [];

        Internal.getGroupsOrder().forEach((element) => {
            jsonsInDir.forEach((file) => {
                var isIncluded = new String(file).toLowerCase().includes(new String(element).toLowerCase())

                if (isIncluded) {
                    try {
                        const data = fs.readFileSync(path.join(folder_path, file), "utf8");
                        const json = JSON.parse(data.toString());

                        json.forEach(function (item, index) {
                            var group = new Group(language, item, layertypes).getGroupInstance();

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
}