"use strict";

var stringFunctions = {
  "number": function(n) {
    return "" + n.getValue() + n.getUnit();
  },
  "string": function(s) {
    return s.getValue();
  },
  "color": function(c) {
    return "rgba(" + c.getR() + ", " + c.getG() + ", " + c.getB() + ", " + c.getA() + ")";
  },
  "bool": function(b) {
    return b.getValue() ? "true" : "false";
  },
  "list": function(l) {
    var rv = "(";
    var sep = l.getSeparator() ? ", " : " ";
    for (var i = 0; i < l.getLength(); i++) {
      if (i > 0) {
        rv += sep;
      }
      rv += this.sassString(l.getValue(i));
    }
    if (l.getLength() === 1 && l.getSeparator()) {
      rv += ",";
    }
    return rv + ")";
  },
  "map": function(m) {
    var rv = "(";
    var first = true;
    for (var i = 0; i < m.getLength(); i++) {
      if (first) {
        first = false;
      } else {
        rv += ", ";
      }
      rv += this.sassString(m.getKey(i));
      rv += ": ";
      rv += this.sassString(m.getValue(i));
    }
    return rv + ")";
  },
  "null": function(_n) {
    return "null";
  },
  "error": function(e) {
    return "ERROR!";
  }
};

var UNQUOTE_RE = /^("|')(.*)\1$/;

module.exports = function(sass) {
  var types = {
    "number": sass.types.Number,
    "string": sass.types.String,
    "color": sass.types.Color,
    "bool": sass.types.Boolean,
    "list": sass.types.List,
    "map": sass.types.Map,
    "null": sass.types.Null,
    "error": sass.types.Error
  };
  var utils = {
    isEmptyMap: function(object) {
      return (this.typeOf(object) === "list" ||
              this.typeOf(object) === "map") &&
             object.getLength() === 0;
    },
    // Converts empty list to an empty map, everything else is passed through.
    handleEmptyMap: function(object) {
      if (this.isEmptyMap(object)) {
        return new sass.types.Map(0);
      } else {
        return object;
      }
    },
    // Convert a Sass Map to a Sass JS Map
    toJSMap: function(sassMap) {
      console.warn("WARNING: toJSMap is deprecated. Call castToJs instead.");
      return this.castToJs(sassMap);
    },
    // Convert a Sass JS Map to a Sass Map
    toSassMap: function(jsMap) {
      console.warn("WARNING: toJSMap is deprecated. Call castToJs instead.");
      return this.castToSass(jsMap);
    },
    unquote: function(string) {
      if (this.isNull(string)) {
        return string;
      }
      this.assertType(string, "string");
      return new sass.types.String(string.getValue().replace(UNQUOTE_RE, "$2"));
    },
    isNull: function(value) {
      return this.typeOf(value) === "null";
    },
    isFalsy: function(value) {
      return this.typeOf(value) === "null" || this.typeOf(value) === "bool" && !value.getValue();
    },
    unitless: function(number) {
      this.assertType(number, "number");
      return number.getUnit() === "";
    },
    typeOf: function(value) {
      if (value.typeOf) {
        return value.typeOf();
      } else {
        return this.typeOfConstructor(value.constructor);
      }
    },
    typeOfConstructor: function(constructor) {
      if (constructor.utilSassType) {
        return constructor.utilSassType;
      } else {
        constructor.utilSassType = constructor.name.replace("Sass", "").toLowerCase();
        if (constructor.utilSassType === "boolean") {
          constructor.utilSassType = "bool";
        }
        return constructor.utilSassType;
      }
    },
    sassConstructor: function(typeString) {
      return types[typeString];
    },
    sassString: function(value) {
      if (value.sassString) {
        return value.sassString();
      } else {
        return stringFunctions[this.typeOf(value)].call(this, value);
      }
    },
    isType: function(value, type) {
      if (type === "map" && this.isEmptyMap(value)) {
        return true;
      } else {
        return this.typeOf(value) === type;
      }
    },
    assertType: function(value, type) {
      if (!this.isType(value, type)) {
        throw new Error("Expected " + type + " but got " + this.toString(value));
      }
    },
    assertSassValue: function(value) {
      if (value.constructor.name.slice(0, 4) !== "Sass") {
        throw new Error("Not a legal Sass value: " + JSON.stringify(value));
      }
    },
    infect: function() {
      var util = this;

      var sassStringMethod = function() {
        var strFunction = stringFunctions[util.typeOf(this)];
        return strFunction.call(util, this);
      };

      var isNullMethod = function() {
        return util.typeOfConstructor(this.constructor) === "null";
      };

      var isFalsyMethod = function() {
        return util.isFalsy.call(util, this);
      };

      for (var type in sass.types) {
        var constructor = sass.types[type];
        constructor.prototype.sassString = sassStringMethod;
        constructor.prototype.isNull = isNullMethod;
        constructor.prototype.isFalsy = isFalsyMethod;
      }
    },
    disinfect: function() {
      for (var type in sass.types) {
        var constructor = sass.types[type];
        delete constructor.prototype.sassString;
        delete constructor.prototype.isNull;
        delete constructor.prototype.isFalsy;
      }
    }
  };
  utils.SassDimension = require("./sass_dimension")(sass);
  utils.SassJsMap = require("./sass_js_map")(utils, sass);

  var coercion = require("./coercion.js")(sass, utils.SassJsMap, utils.SassDimension);
  utils.castToSass = coercion.castToSass;
  utils.castToJs = coercion.castToJs;
  utils.mapToObject = coercion.mapToObject;

  return utils;
};
