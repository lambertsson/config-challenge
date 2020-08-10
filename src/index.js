const fs = require("fs");

const isEmptyLine = (string) => string === "";
const removeComment = (string) => string.split(";")[0];
const isSingleSettingsValue = (string) => string.indexOf("=") === string.lastIndexOf("=");

const getKeyValuePair = (line) => {
  const pair = line.split("=");
  return {
    key: pair[0].trim(),
    value: pair[1].trim(),
  };
};

const load_config = (path, overrides) => {
  fs.readFile(`${__dirname}/${path}`, function (err, data) {
    if (err) {
      throw err;
    }

    const rawLines = data.toString().split(/\n/);
    const groupLineRegExp = new RegExp("\\[(.+)\\]");
    const groupedLines = [];

    try {
      rawLines.forEach((line) => {
        if (groupLineRegExp.test(line)) {
          const groupName = line.match(groupLineRegExp)[1];
          groupedLines.push({
            name: groupName,
            lines: [],
          });
        } else {
          const lineWithoutComment = removeComment(line);
          if (!isEmptyLine(lineWithoutComment)) {
            groupedLines[groupedLines.length - 1].lines.push(lineWithoutComment.trim());
          }
        }
      });
    } catch (error) {
      console.log("Could not group lines in config file", error);
    }

    let config = {};
    groupedLines.forEach((group) => {
      config[group.name] = {};
      group.lines.forEach((settingsLine) => {
        if (isSingleSettingsValue(settingsLine)) {
          const settingsObject = getKeyValuePair(settingsLine);
          config[group.name][settingsObject.key] = settingsObject.value;
        }
      });
    });

    console.log(groupedLines);
    console.log("\n");
    console.log(config);
  });
};

load_config("../configs/example.conf");
