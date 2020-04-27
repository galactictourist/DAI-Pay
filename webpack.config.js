const path = require("path");

module.exports = {
  mode: "production",
  entry: "client/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js", // string
  },
};
