"use strict";

function arrayIterator(array) {
  array = array.concat();
  var nextIndex = 0;

  return {
    next: function(){
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {done: true};
    }
  };
}

function unitStr(numeratorUnits, denominatorUnits) {
  var result = numeratorUnits.join("*");
  if (denominatorUnits.length > 0) {
    result = result + "/" + denominatorUnits.join("*");
  }
  return result;
}

function parseUnitsFromArgs(numeratorUnits, denominatorUnits) {
  var result = {};
  if (typeof numeratorUnits === "string" && typeof denominatorUnits === "undefined") {
    if (numeratorUnits === "") {
      result.numeratorUnits = [];
      result.denominatorUnits = [];
    } else {
      var numAndDenom = numeratorUnits.split("/");
      result.numeratorUnits = numAndDenom[0].split("*");
      result.denominatorUnits = numAndDenom.length > 1 ? numAndDenom[1].split("*") : [];
    }
  } else if (typeof numeratorUnits === "string") {
    result.numeratorUnits = numeratorUnits === "" ? [] : [numeratorUnits];
  } else {
    result.numeratorUnits = numeratorUnits || [];
  }
  if (typeof denominatorUnits === "string") {
    result.denominatorUnits = denominatorUnits === "" ? [] : [denominatorUnits];
  } else if (!result.denominatorUnits) {
    result.denominatorUnits = denominatorUnits || [];
  }
  return result;
}

module.exports = function(sass) {

  /* class SassDimension
   *
   * Properties:
   *   - value: The numeric part of a dimensional value
   *   - numeratorUnits: Array of units in the numerator.
   *   - denominatorUnits: Array of units in the denominator.
   *
   * Constructor:
   *   - new SassDimension(10, "px"): Most commonly there is just a
   *     single unit in the numerator.
   *   - new SassDimension(10, "px/s"): Units can be passed in the same
   *     form as they are returned from the unitStr() method.
   *   - new SassDimension(10, "px", "s"): Single numerator and
   *     denominator units can be passed as strings instead of arrays
   *     of one unit.
   *   - new SassDimension(10, ["px"], ["s"]): numerator and denominator
   *     units can be passed as arrays where each index is a single units.
   * Methods:
   *   * Arithmetic Methods:
   *     - d1.add(d2): computes the sum d1 + d2. The units of d1 and d2
   *       must be the same or convertable. The result is returned using
   *       the units of d1.
   *     - d1.subtract(d2): computes the difference d1 - d2. The units of d1 and d2
   *       must be the same or convertable. The result is returned using
   *       the units of d1.
   *     - d1.multiply(d2): computes the product d1 * d2. The numerator
   *       units are combined as are the denominator units.
   *     - d1.divide(d2): computes the quotient d1 / d2. The numerator
   *       units of d1 are combined with the denominatorUnits of d2 and
   *       the denominator units of d1 and combined with the numerator
   *       units of d2.
   *   * Comparison Methods:
   *     - d1.compareTo(d2): return positive if d1 is greater than d2,
   *       negative if d1 is less than d2, and zero if equal.
   *     - d1.lt(d2): returns true when d1 is strictly less than d2. The
   *       units of d1 and d2 must be the same or comparable.
   *     - d1.lte(d2): returns true when d1 is less than or equal to d2.
   *       The units of d1 and d2 must be the same or comparable.
   *     - d1.gt(d2): returns true when d1 is strictly greater than d2.
   *       The units of d1 and d2 must be the same or comparable.
   *     - d1.gte(d2): returns true when d1 is greater than or equal to
   *       d2. The units of d1 and d2 must be the same or comparable.
   *     - d1.eq(d2): returns true when d1 is greater than or equal to
   *       d2. The units of d1 and d2 must be the same or comparable.
   *   * Misc Methods:
   *     - d.unitStr(): output the units of this number in the form
   *       n1*n2(*...)/d1*d2(*...)
   *     - d.sassString(): Returns a sass representation of this number.
   *     - d.typeOf(): Returns "number".
   *     - d.convertTo(numeratorUnits, denominatorUnits): returns a new
   *       number converted to the given units or throws an error if
   *       they cannot be converted.
   */
  function SassDimension(value, numeratorUnits, denominatorUnits) {
    this.value = value;
    var units = parseUnitsFromArgs(numeratorUnits, denominatorUnits);
    this.numeratorUnits = units.numeratorUnits;
    this.denominatorUnits = units.denominatorUnits;
    this.normalize();
  }

  SassDimension.prototype = {
    add: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return new SassDimension(this.value + other.value,
                               this.numeratorUnits, this.denominatorUnits);
    },
    subtract: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return new SassDimension(this.value - other.value,
                               this.numeratorUnits, this.denominatorUnits);
    },
    multiply: function(other) {
      return new SassDimension(this.value * other.value,
                               this.numeratorUnits.concat(other.numeratorUnits),
                               this.denominatorUnits.concat(other.denominatorUnits));
    },
    divide: function(other) {
      return new SassDimension(this.value / other.value,
                               this.numeratorUnits.concat(other.denominatorUnits),
                               this.denominatorUnits.concat(other.numeratorUnits));
    },
    // Returns a positive value if other is less
    // Returns a negative value if other is greater
    // Returns zero if other is equal
    compareTo: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return this.value > other.value ? 1 : (this.value < other.value ? -1 : 0);
    },
    gt: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return this.value > other.value;
    },
    gte: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return this.value >= other.value;
    },
    lt: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return this.value < other.value;
    },
    lte: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return this.value <= other.value;
    },
    eq: function(other) {
      other = other.convertTo(this.numeratorUnits, this.denominatorUnits);
      return this.value === other.value;
    },
    normalize: function() {
      if (this.denominatorUnits.length === 0) {
        return;
      }
      var it = arrayIterator(this.numeratorUnits);
      var sourceIndex = 0;
      var at = it.next();
      // TODO: handle units that are convertable
      while (!at.done) {
        var foundIndex = this.denominatorUnits.indexOf(at.value);
        if (foundIndex >= 0) {
          this.numeratorUnits.splice(sourceIndex, 1);
          this.denominatorUnits.splice(foundIndex, 1);
        }
        at = it.next();
        sourceIndex++;
      }
      this.numeratorUnits.sort();
      this.denominatorUnits.sort();
    },
    unitless: function() {
      return (this.numeratorUnits.length === 0 &&
              this.denominatorUnits.length === 0);
    },
    // This is a placeholder implemenation that works when the
    // numeratorUnits and denominatorUnits are the same as for this
    // number and when this number is unitless.
    convertTo: function(numeratorUnits, denominatorUnits) {
      var toUnits = parseUnitsFromArgs(numeratorUnits, denominatorUnits);
      numeratorUnits = toUnits.numeratorUnits;
      denominatorUnits = toUnits.denominatorUnits;
      if (this.unitless()) {
        return new SassDimension(this.value, numeratorUnits, denominatorUnits);
      }
      if (this.numeratorUnits.length !== numeratorUnits.length ||
          this.denominatorUnits.length !== denominatorUnits.length) {
        throw new Error("Cannot convert " + this.unitStr() +
                        " to " + unitStr(numeratorUnits, denominatorUnits));
      }
      for (var n = 0; n < this.numeratorUnits.length; n++) {
        if (this.numeratorUnits[n] !== numeratorUnits[n]) {
          throw new Error("Cannot convert " + this.unitStr() +
                          " to " + unitStr(numeratorUnits, denominatorUnits));
        }
      }
      for (var d = 0; d < this.denominatorUnits.length; d++) {
        if (this.denominatorUnits[d] !== denominatorUnits[d]) {
          throw new Error("Cannot convert " + this.unitStr() +
                          " to " + unitStr(numeratorUnits, denominatorUnits));
        }
      }
      return new SassDimension(this.value, this.numeratorUnits, this.denominatorUnits);
    },
    unitStr: function() {
      return unitStr(this.numeratorUnits, this.denominatorUnits);
    },
    sassString: function() {
      return "" + this.value + this.unitStr();
    },
    typeOf: function() {
      return "number";
    },
    toSass: function() {
      if (this.numeratorUnits.length > 1 || this.denominatorUnits.length > 0) {
        throw new Error("LibSass doesn't support complex units");
      }
      return new sass.types.Number(this.value, this.numeratorUnits[0] || "");
    }
  };

  return SassDimension;
};
