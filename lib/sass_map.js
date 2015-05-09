"use strict";

module.exports = function(sassUtils) {
  // The Sass Map object allows arbitrary Sass values to be used as keys
  // in a js Map. It has the exact same interface as the Map builtin.
  function SassMap() {
    this.sass_keys = new Map();
    this.sass_values = new Map();
  }

  function internalKey(obj) {
    return sassUtils.typeOf(obj) + ":" + sassUtils.sassString(obj);
  }

  SassMap.prototype = {
    clear: function() {
      this.sass_keys.clear();
      this.sass_values.clear();
      return this;
    },
    set: function(key, value) {
      var ik = internalKey(key);
      this.sass_keys.set(ik, key);
      this.sass_values.set(ik, value);
      return this;
    },
    get: function(key) {
      var ik = internalKey(key);
      return this.sass_values.get(ik);
    },
    delete: function(key) {
      var ik = internalKey(key);
      if (this.sass_keys.has(ik)) {
        this.sass_keys.delete(ik);
        this.sass_values.delete(ik);
        return true;
      } else {
        return false;
      }
    },
    has: function(key) {
      var ik = internalKey(key);
      return this.sass_keys.has(ik);
    },
    entries: function() {
      return this[Symbol.iterator]();
    },
    keys: function() {
      return this.sass_keys.values();
    },
    values: function() {
      return this.sass_values.values();
    },
    forEach: function(callback, thisArg) {
      var it = this.entries();
      var v = it.next();
      while (!v.done) {
        if (thisArg) {
          callback.call(thisArg, v.value[0], v.value[1], this);
        } else {
          callback(v.value[0], v.value[1], this);
        }
        v = it.next();
      }
    }
  };

  SassMap.prototype[Symbol.iterator] = function() {
    var map = this;
    var keyIterator = this.sass_keys[Symbol.iterator]();
    return {
      next: function() {
        var nextKey = keyIterator.next();
        if (nextKey.done) {
          return {value: undefined, done: true};
        } else {
          var ik = nextKey.value[0];
          var key = nextKey.value[1];
          return {value: [key, map.sass_values.get(ik)], done: false};
        }
      }
    };
  };

  Object.defineProperty(SassMap.prototype, "size", {
    get: function () {
      return this.sass_keys.size;
    }
  });

  return SassMap;
};
