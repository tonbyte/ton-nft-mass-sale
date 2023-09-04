const { override, addWebpackPlugin } = require('customize-cra')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = override(addWebpackPlugin(new NodePolyfillPlugin()))