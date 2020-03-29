"use strict";

var iteratorSymbol = global.Symbol ? Symbol.iterator : "@@iterator";

// Iterates over a sass map or a sass js map.
// callback is invoked with two arguments for
// each map entry: value, key
function iterateMap(map, callback) {
  if (map.getKey) {
    for (var i = 0; i < map.getLength(); i++) {
      var key = map.getKey(i);
      var value = map.getValue(i);
      callback(value, key);
    }
  } else {
    map.forEach(callback);
  }
}

function defaultConflictHandler(key, newValue, oldValue) {
  return newValue;
}

module.exports = function(sassUtils, sass) {
  function Coerce(map) {
    this.map = map;
  }

  // The Sass Map object allows arbitrary Sass values to be used as keys
  // in a js Map. It has the exact same interface as the Map builtin.
  function SassJsMap(sassMap) {
    this.sassKeys = new Map();
    this.sassValues = new Map();
    if (sassMap) {
      this.update(sassMap);
    }
    this.constructor = SassJsMap;

    this.coerce = new Coerce(this);
  }

  var coercion = require("./coercion.js")(sass, SassJsMap, sassUtils.SassDimension);

  function internalKey(obj) {
    return sassUtils.typeOf(obj) + ":" + sassUtils.sassString(obj);
  }

  SassJsMap.prototype = {
    update: function(map, conflictHandler) {
      conflictHandler = conflictHandler || defaultConflictHandler;
      var thisMap = this;
      iterateMap(map, function(value, key) {
        if (thisMap.has(key)) {
          value = conflictHandler(key, value, thisMap.get(key));
        }
        thisMap.set(key, value);
      });
    },
    deepUpdate: function(map, conflictHandler) {
      conflictHandler = conflictHandler || defaultConflictHandler;
      var thisMap = this;
      iterateMap(map, function(value, key) {
        if (thisMap.has(key)) {
          var oldValue = thisMap.get(key);
          if (sassUtils.typeOf(value) === "map" &&
              sassUtils.typeOf(oldValue) === "map") {
            if (oldValue.constructor.name !== "SassJsMap") {
              oldValue = new SassJsMap(oldValue);
            }
            oldValue.deepUpdate(value, conflictHandler);
            value = oldValue;
          } else {
            value = conflictHandler(key, value, oldValue);
          }
        }
        thisMap.set(key, value);
      });
    },
    toSassMap: function() {
      var m = new sass.types.Map(this.size);
      var i = 0;
      this.forEach(function(value, key) {
        if (key.toSassMap) {
          key = key.toSassMap();
        }
        if (value.toSassMap) {
          value = value.toSassMap();
        }
        m.setKey(i, key);
        m.setValue(i, value);
        i += 1;
      });
      return m;
    },
    toSass: function() {
      return this.toSassMap();
    },
    clear: function() {
      this.sassKeys.clear();
      this.sassValues.clear();
      return this;
    },
    set: function(key, value) {
      sassUtils.assertSassValue(key);
      sassUtils.assertSassValue(value);
      var ik = internalKey(key);
      this.sassKeys.set(ik, key);
      this.sassValues.set(ik, value);
      return this;
    },
    get: function(key) {
      var ik = internalKey(key);
      return this.sassValues.get(ik);
    },
    delete: function(key) {
      var ik = internalKey(key);
      if (this.sassKeys.has(ik)) {
        this.sassKeys.delete(ik);
        this.sassValues.delete(ik);
        return true;
      } else {
        return false;
      }
    },
    has: function(key) {
      var ik = internalKey(key);
      return this.sassKeys.has(ik);
    },
    entries: function() {
      return this[iteratorSymbol]();
    },
    keys: function() {
      return this.sassKeys.values();
    },
    values: function() {
      return this.sassValues.values();
    },
    forEach: function(callback, thisArg) {
      var it = this.entries();
      var v = it.next();
      while (!v.done) {
        if (thisArg) {
          callback.call(thisArg, v.value[1], v.value[0], this);
        } else {
          callback(v.value[1], v.value[0], this);
        }
        v = it.next();
      }
    },
    sassString: function() {
      var rv = "(";
      var first = true;
      this.forEach(function(v, k) {
        if (first) {
          first = false;
        } else {
          rv += ", ";
        }
        rv += sassUtils.sassString(k);
        rv += ": ";
        rv += sassUtils.sassString(v);
      });
      return rv + ")";
    },
    typeOf: function() {
      return "map";
    }
  };

  SassJsMap.prototype[iteratorSymbol] = function() {
    var map = this;
    var keyIterator = this.sassKeys[iteratorSymbol]();
    return {
      next: function() {
        var nextKey = keyIterator.next();
        if (nextKey.done) {
          return {value: undefined, done: true};
        } else {
          var ik = nextKey.value[0];
          var key = nextKey.value[1];
          return {value: [key, map.sassValues.get(ik)], done: false};
        }
      }
    };
  };

  Object.defineProperty(SassJsMap.prototype, "size", {
    get: function () {
      return this.sassKeys.size;
    }
  });

  Coerce.prototype = {
    get: function(key) {
      return coercion.castToJs(this.map.get(coercion.castToSass(key)));
    },
    set: function(key, value) {
      return this.map.set(coercion.castToSass(key), coercion.castToSass(value));
    }
  };

  return SassJsMap;
};
