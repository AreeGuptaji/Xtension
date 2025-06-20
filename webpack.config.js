const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");

module.exports = {
  entry: {
    background: "./src/background/background.js",
    content: "./src/content/content.js",
    popup: "./src/popup/popup.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "src/[name]/[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "manifest.json" },
        { from: "src/popup/popup.html", to: "src/popup/popup.html" },
        { from: "src/content/content.css", to: "src/content/content.css" },
        // Copy assets if they exist
        ...(fs.existsSync("./assets")
          ? [{ from: "assets", to: "assets" }]
          : []),
        // Create icon files from the main icon
        { from: "icon.png", to: "assets/icon16.png" },
        { from: "icon.png", to: "assets/icon32.png" },
        { from: "icon.png", to: "assets/icon48.png" },
        { from: "icon.png", to: "assets/icon128.png" },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".json"],
  },
  mode: "development",
};
