const fs = require("fs");

const load_config = (path, overrides) => {
  fs.readFile(`${__dirname}/${path}`, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(data.toString());
  });
};

load_config("../configs/example.conf");
