const fs = require("fs");

const isEmptyLine = (string) => string === "";
const removeComment = (string) => string.split(";")[0];

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

    console.log(groupedLines);
  });
};

load_config("../configs/example.conf");
