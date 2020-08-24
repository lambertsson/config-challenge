const fs = require("fs");
const DEBUG = false;

const arrayRegExp = new RegExp(/,/);
const newLineRegExp = new RegExp(/\n/);
const numberRegExp = new RegExp(/[0-9]+/);
const groupKeyRegExp = new RegExp(/\[(.+)\]/);
const overrideRegExp = new RegExp(/\<(.+)\>/);
const overrideKeyRegExp = new RegExp(/(\S+)\</);
const settingsRegExp = new RegExp(/(\S+[ ]*=[ ]*"[^"]*"|\S+[ ]*=[ ]*[^"]\S+|\S+[ ]*=[ ]*[0-9]+)/, "g");
const stringRegExp = new RegExp(/"(.*)"/);

const isEmptyLine = (string) => string === "";
const removeComment = (string) => string.split(";")[0];
const hasOverride = (string) => overrideRegExp.test(string);
const isBoolean = (string) => string === "no" || string === "yes" || string === "true" || string === "false";

const getSettingObject = (settingString) => {
  const pair = settingString.split("=");
  return {
    key: pair[0].trim(),
    value: pair[1].trim(),
  };
};

const getOverrideSettingObject = (settingString) => {
  const pair = settingString.split("=");
  const override = pair[0].match(overrideRegExp)[1];
  const key = pair[0].match(overrideKeyRegExp)[1];
  return {
    key,
    override,
    value: pair[1].trim(),
  };
};

const parseType = (value) => {
  if (isBoolean(value)) return value === "no" || value === "false" ? false : true;
  else if (stringRegExp.test(value)) return value.match(stringRegExp)[1];
  // Returns string
  else if (arrayRegExp.test(value)) return value.split(arrayRegExp);
  // Returns array of strings TODO: Might want to type array items individually
  else if (numberRegExp.test(value)) return Number.parseInt(value);
  // Returns number TODO: Might want to handle values bigger than integers
  else return value; // Returns value without typing, eg. for paths
};

const load_config = (path, overrides = []) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/${path}`, function (err, data) {
      if (err) {
        throw err;
      }

      const rawLines = data.toString().split(newLineRegExp);

      let config = {};
      let currentGroupKey = "";
      try {
        let undecidedOverrides = [];
        rawLines.forEach((line) => {
          if (groupKeyRegExp.test(line)) {
            currentGroupKey = line.match(groupKeyRegExp)[1];
            config[currentGroupKey] = {};
          } else {
            const lineWithoutComment = removeComment(line);

            if (isEmptyLine(lineWithoutComment)) return;

            const settings = lineWithoutComment.match(settingsRegExp);

            if (DEBUG) console.log("Line:", line, "gave settings:", settings);

            settings.forEach((settingString) => {
              if (hasOverride(settingString)) {
                const settingObject = getOverrideSettingObject(settingString);
                const isOverrideEnabled = overrides.includes(settingObject.override);
                if (isOverrideEnabled) {
                  undecidedOverrides.push({ groupKey: currentGroupKey, ...settingObject });
                }
              } else {
                const settingObject = getSettingObject(settingString);
                config[currentGroupKey][settingObject.key] = parseType(settingObject.value);
              }
            });
          }
        });

        // Decide what override value to use (might be several, but only with with highest priority)
        undecidedOverrides.forEach((setting) => {
          const settingsForSameGroupAndKey = undecidedOverrides.filter(
            (undecidedSetting) =>
              undecidedSetting.key === setting.key &&
              undecidedSetting.groupKey === setting.groupKey &&
              undecidedSetting.override !== setting.override
          );
          const hasHighestPriority = settingsForSameGroupAndKey.every(
            (otherSetting) => overrides.indexOf(setting.override) > overrides.indexOf(otherSetting.override)
          );
          if (hasHighestPriority) config[setting.groupKey][setting.key] = parseType(setting.value);
        });
      } catch (error) {
        reject(error);
        if (DEBUG) console.log("Could not parse config file", error);
      }
      resolve(config);
    });
  });
};

module.exports = { load_config };
