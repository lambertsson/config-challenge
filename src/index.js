const fs = require("fs");

const newLineRegExp = new RegExp(/\n/);
const groupKeyRegExp = new RegExp(/\[(.+)\]/);
const overrideRegExp = new RegExp(/\<(.+)\>/);
const overrideKeyRegExp = new RegExp(/(\S+)\</);
const settingsRegExp = new RegExp(/(\S+.=.\S+)/, "g");

const isEmptyLine = (string) => string === "";
const removeComment = (string) => string.split(";")[0];
const hasOverride = (string) => overrideRegExp.test(string);

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

const load_config = (path, overrides = []) => {
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

          settings.forEach((settingString) => {
            if (hasOverride(settingString)) {
              const settingObject = getOverrideSettingObject(settingString);
              const isOverrideEnabled = overrides.includes(settingObject.override);
              if (isOverrideEnabled) {
                undecidedOverrides.push({ groupKey: currentGroupKey, ...settingObject });
              }
            } else {
              const settingObject = getSettingObject(settingString);
              config[currentGroupKey][settingObject.key] = settingObject.value;
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
        if (hasHighestPriority) config[setting.groupKey][setting.key] = setting.value;
      });
    } catch (error) {
      console.log("Could not parse config file", error);
    }

    console.log(config);
  });
};

load_config("../configs/example.conf", ["production", "staging"]);
