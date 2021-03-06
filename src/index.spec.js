const { load_config } = require("./index");

describe("load_config", () => {
  describe("should correctly load config with", () => {
    test("array", async () => {
      const config = await load_config("../configs/test/array.conf");

      expect(config.group.setting).toEqual(["array", "of", "values"]);
    });
    test("boolean", async () => {
      const config = await load_config("../configs/test/boolean.conf");

      expect(config.groupTrue.setting1).toEqual(true);
      expect(config.groupTrue.setting2).toEqual(true);
      expect(config.groupTrue.setting3).toEqual(1);
      expect(config.groupFalse.setting1).toEqual(false);
      expect(config.groupFalse.setting2).toEqual(false);
      expect(config.groupFalse.setting3).toEqual(0);
    });
    test("comment", async () => {
      const config = await load_config("../configs/test/comment.conf");

      expect(config.group.setting).toEqual(123);
    });
    test("multiline", async () => {
      const configWithoutOverride = await load_config("../configs/test/multiline.conf");
      const configWithOverride = await load_config("../configs/test/multiline.conf", ["override"]);

      expect(configWithoutOverride.group.setting1).toEqual("/tmp/");
      expect(configWithoutOverride.group.setting2).toEqual("a string");
      expect(configWithoutOverride.group.setting3).toEqual(false);

      expect(configWithOverride.group.setting1).toEqual("/srv/tmp/");
      expect(configWithOverride.group.setting2).toEqual("a string");
      expect(configWithOverride.group.setting3).toEqual(false);
    });
    test("number", async () => {
      const config = await load_config("../configs/test/number.conf");

      expect(config.group.setting).toEqual(26214400);
    });
    test("path", async () => {
      const config = await load_config("../configs/test/path.conf");

      expect(config.group.setting).toEqual("/tmp/");
    });
    test("path-override", async () => {
      const configWithoutOverride = await load_config("../configs/test/path-override.conf");
      const configWithOverride = await load_config("../configs/test/path-override.conf", ["override"]);

      expect(configWithoutOverride.group.setting).toEqual(undefined);
      expect(configWithOverride.group.setting).toEqual("/srv/var/tmp/");
    });
    test("string", async () => {
      const config = await load_config("../configs/test/string.conf");

      expect(config.group.setting).toEqual("a string");
    });
    test("no spaces between setting key and value", async () => {
      const config = await load_config("../configs/test/no-space-settings.conf");

      expect(config.group.setting1).toEqual(26214400);
      expect(config.group.setting2).toEqual("a string");
      expect(config.group.setting3).toEqual(["array", "of", "values"]);
    });
    test("varied spaces between setting key and value", async () => {
      const config = await load_config("../configs/test/varied-space-settings.conf");

      expect(config.group.setting1).toEqual(true);
      expect(config.group.setting2).toEqual(true);
      expect(config.group.setting3).toEqual(true);
    });
  });

  describe("should fail when loading config with", () => {
    test("incomplete setting", async () => {
      await expect(() => load_config("../configs/test/invalid/incomplete.conf")).rejects.toThrow();
    });
    test("missing group before setting", async () => {
      await expect(() => load_config("../configs/test/invalid/missing-group.conf")).rejects.toThrow();
    });
  });
});
