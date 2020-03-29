"use strict";

var assert = require("assert");
var testutils = require("./testutils");

describe("numeric dimension", function () {
  testutils.withEachSass(function (_sass, sassName, sassUtils) {
    describe("using " + sassName, function () {
      it("can be constructed", function (done) {
        var dimension = new sassUtils.SassDimension(10);
        assert(dimension);
        assert.equal(dimension.value, 10);
        done();
      });

      it("can have normal units", function (done) {
        var dimension = new sassUtils.SassDimension(10, "px");
        assert.equal(dimension.value, 10);
        assert.deepEqual(dimension.numeratorUnits, ["px"]);
        assert.deepEqual(dimension.denominatorUnits, []);
        done();
      });
      it("can have complex units", function (done) {
        var dimension = new sassUtils.SassDimension(10, "px*px/em");
        assert.equal(dimension.value, 10);
        assert.deepEqual(dimension.numeratorUnits, ["px", "px"]);
        assert.deepEqual(dimension.denominatorUnits, ["em"]);
        done();
      });
      it("simplifies complex units", function (done) {
        var dimension = new sassUtils.SassDimension(10, "px*px/em*px");
        assert.equal(dimension.value, 10);
        assert.deepEqual(dimension.numeratorUnits, ["px"]);
        assert.deepEqual(dimension.denominatorUnits, ["em"]);
        done();
      });
      it("adds same units", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "px");
        var sum = d1.add(d2);
        assert.equal(sum.value, 20);
        assert.deepEqual(sum.numeratorUnits, ["px"]);
        done();
      });
      it("subtracts same units", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "px");
        var difference = d1.subtract(d2);
        assert.equal(difference.value, 0);
        assert.deepEqual(difference.numeratorUnits, ["px"]);
        done();
      });
      it("multiplies with units", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "px");
        var product = d1.multiply(d2);
        assert.equal(product.value, 100);
        assert.deepEqual(product.numeratorUnits, ["px", "px"]);
        done();
      });
      it("divides with units", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "px");
        var quotient = d1.divide(d2);
        assert.equal(quotient.value, 1);
        assert(quotient.unitless());
        done();
      });
      it("unitless values coerce to have units", function (done) {
        var d1 = new sassUtils.SassDimension(10);
        assert(d1.unitless());
        var converted = d1.convertTo("px");
        assert.equal(converted.unitStr(), "px");
        var converted2 = d1.convertTo("px*rem/s");
        assert.equal(converted2.unitStr(), "px*rem/s");
        done();
      });
      it("errors for addition of incompatible units", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "s");
        assert.throws(function () {
          d1.add(d2);
        }, /Cannot convert s to px/);
        done();
      });
      it("errors for difference of incompatible units", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "s");
        assert.throws(function () {
          d1.subtract(d2);
        }, /Cannot convert s to px/);
        done();
      });
      it("has strict comparisons", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(-10, "px");
        assert.equal(d1.compareTo(d2), 1);
        assert.equal(d2.compareTo(d1), -1);
        assert.equal(d1.gt(d2), true);
        assert.equal(d1.lt(d2), false);
        done();
      });
      it("has equality comparisons", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        var d2 = new sassUtils.SassDimension(10, "px");
        assert.equal(d1.compareTo(d2), 0);
        assert.equal(d2.eq(d1), true);
        assert.equal(d1.gte(d2), true);
        assert.equal(d1.lte(d2), true);
        done();
      });
      it("can output a sass string", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        assert.equal(d1.sassString(), "10px");
        done();
      });
      it("is a number type", function (done) {
        var d1 = new sassUtils.SassDimension(10, "px");
        assert.equal(d1.typeOf(), "number");
        done();
      });
    });
  });
});
