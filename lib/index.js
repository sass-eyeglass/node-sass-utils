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
    for (var i = 0; i < m.getLength(); i++) {
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
  return {
    toJSMap: function(sassMap) {
      var m = new Map();
      var length = sassMap.getLength();
      for (var i = 0; i < length; i++) {
        m.set(sassMap.getKey(i), sassMap.getValue(i));
      }
      return m;
    },
    fromJSMap: function(jsMap) {
      var m = sass.types.Map(jsMap.size);
      var i = 0;
      jsMap.forEach(function(value, key) {
        m.setKey(i, key);
        m.setValue(i, jsMap.get(key));
        i += 1;
      });
      return m;
    },
    unquote: function(string) {
      if (this.isNull(string)) {
        return string;
      }
      this.assertType(string, "string");
      return sass.types.String(string.getValue().replace(UNQUOTE_RE, "$2"));
    },
    isNull: function(value) {
      return this.typeOf(value) === "null";
    },
    isFalsy: function(value) {
      return this.typeOf(value) === "null" || this.typeOf(value) === "bool" && !value.getValue();
    },
    typeOf: function(value) {
      return this.typeOfConstructor(value.constructor);
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
      return stringFunctions[this.typeOf(value)].call(this, value);
    },
    isType: function(value, type) {
      return this.typeOf(value) === type;
    },
    assertType: function(value, type) {
      if (!this.isType(value, type)) {
        throw new Error("Expected " + type + " but got " + this.toString(value));
      }
    },
    infect: function(sassTypes) {
      var util = this;

      var sassStringMethod = function() {
        var strFunction = stringFunctions[util.typeOfConstructor(this.constructor)];
        return strFunction.call(util, this);
      };

      var isNullMethod = function() {
        return util.typeOfConstructor(this.constructor) === "null";
      };

      var isFalsyMethod = function() {
        return util.isFalsy.call(util, this);
      };

      for (var type in sassTypes) {
        var constructor = sassTypes[type];
        constructor.prototype.sassString = sassStringMethod;
        constructor.prototype.isNull = isNullMethod;
        constructor.prototype.isFalsy = isFalsyMethod;
      }
    },
    disinfect: function(sassTypes) {
      for (var type in sassTypes) {
        var constructor = sassTypes[type];
        delete constructor.prototype.sassString;
        delete constructor.prototype.isNull;
        delete constructor.prototype.isFalsy;
      }

    }

  };
};
