const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname + "/client/index.js"),
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js", // string
  },
};
