"use strict";

var getSassType = require("./util").getSassType;
var isSassType = require("./util").isSassType;

module.exports = function(sass, SassJsMap, SassDimension) {
  function defaultMapCaster(sassMap) {
    return new SassJsMap(sassMap);
  }

  return {
    castToSass: function (jsValue) {
      if (jsValue && (typeof jsValue.toSass === "function")) {
        // string -> unquoted string
        return jsValue.toSass();
      } else if (typeof jsValue === "string") {
        // string -> unquoted string
        return new sass.types.String(jsValue);
      } else if (typeof jsValue === "boolean") {
        // boolean -> boolean
        return jsValue ? sass.types.Boolean.TRUE : sass.types.Boolean.FALSE;
      } else if (typeof jsValue === "undefined" || jsValue === null) {
        // undefined/null -> null
        return sass.types.Null.NULL;
      } else if (typeof jsValue === "number") {
        // Js Number -> Unitless Number
        return new sass.types.Number(jsValue);
      } else if (jsValue && jsValue.constructor.name === "Array") {
        // Array -> List
        var list = new sass.types.List(jsValue.length);
        for (var i = 0; i < jsValue.length; i++) {
          list.setValue(i, this.castToSass(jsValue[i]));
        }
        var isComma = typeof jsValue.separator === "undefined" ? true : jsValue.separator;
        list.setSeparator(isComma);
        return list;
      } else if (jsValue === sass.types.Null.NULL) {
        // no-op if sass.types.Null.NULL
        return jsValue;
      } else if (jsValue && isSassType(jsValue)) {
        // these are sass objects that we don't coerce
        return jsValue;
      } else if (typeof jsValue === "object") {
        var keys = [];
        for (var k in jsValue) {
          if (jsValue.hasOwnProperty(k)) {
            keys[keys.length] = k;
          }
        }
        var map = new sass.types.Map(keys.length);
        for (var m = 0; m < keys.length; m++) {
          var key = keys[m];
          map.setKey(m, new sass.types.String(key));
          map.setValue(m, this.castToSass(jsValue[key]));
        }
        return map;
      } else {
        // WTF
        throw new Error("Don't know how to coerce: " + jsValue.toString());
      }
    },
    castToJs: function(sassValue, mapCaster) {
      if (!mapCaster) {
        mapCaster = defaultMapCaster;
      }
      if (!sassValue) {
        return sassValue;
      }
      // Explicitly test for values as the constructors are private
      if (sassValue === sass.types.Null.NULL) {
        return null;
      } else if (sassValue === sass.types.Boolean.TRUE) {
        return true;
      } else if (sassValue === sass.types.Boolean.FALSE) {
        return false;
      }

      var someSassType = getSassType(sassValue);

      switch (someSassType) {
        case "string":
          return sassValue.getValue();
        case "bool":
          return sassValue.getValue();
        case "null":
          return null;
        case "number":
          return new SassDimension(sassValue.getValue(), sassValue.getUnit());
        case "map":
          return mapCaster(sassValue);
        case "list":
          var array = new Array(sassValue.getLength());
          for (var i = 0; i < sassValue.getLength(); i++) {
            array[i] = this.castToJs(sassValue.getValue(i));
          }
          array.separator = sassValue.getSeparator();
          return array;
        default:
          return sassValue;
      }
      return sassValue;
    },
    /* This function should only be called when the keys are all
     * strings. All the map values will be cast to js values.  */
    mapToObject: function(sassMap) {
      var obj = {};
      var l = sassMap.getLength();
      for (var i = 0; i < l; i++) {
        var k = sassMap.getKey(i);
        var v = sassMap.getValue(i);
        obj[k.getValue()] = this.castToJs(v, this.mapToObject.bind(this));
      }
      return obj;
    }
  };
};
