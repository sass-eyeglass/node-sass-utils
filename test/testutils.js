"use strict";

var nodeSass = require("node-sass");
var dartSass = require("sass");
var utils = require("../lib");
var nodeSassUtils = utils(nodeSass);
var dartSassUtils = utils(dartSass);
module.exports = {
  withEachSass: function(cb) {
    cb(nodeSass, "node-sass", nodeSassUtils);
    cb(dartSass, "dart-sass", dartSassUtils);
  }
};
