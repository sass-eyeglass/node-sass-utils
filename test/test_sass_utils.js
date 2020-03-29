"use strict";

var assert = require("assert");
var testutils = require("./testutils");

describe("sass utils clean", function () {
  testutils.withEachSass(function (sass, sassName, sassUtils) {
    describe("using " + sassName, function () {
      it("should stringify null", function (done) {
        assert.equal("null", sassUtils.sassString(sass.types.Null.NULL));
        done();
      });
      it("should stringify true", function (done) {
        assert.equal("true", sassUtils.sassString(sass.types.Boolean.TRUE));
        done();
      });
      it("should stringify false", function (done) {
        assert.equal("false", sassUtils.sassString(sass.types.Boolean.FALSE));
        done();
      });
      it("should stringify numbers", function (done) {
        assert.equal("10", sassUtils.sassString(new sass.types.Number(10)));
        done();
      });
      it("should stringify numbers with units", function (done) {
        assert.equal("10px", sassUtils.sassString(new sass.types.Number(10, "px")));
        done();
      });
      it("should stringify strings", function (done) {
        assert.equal("foo", sassUtils.sassString(new sass.types.String("foo")));
        done();
      });
      it("should stringify quoted strings", function (done) {
        assert.equal('"foo"', sassUtils.sassString(new sass.types.String('"foo"')));
        done();
      });
      it("should stringify empty lists", function (done) {
        var l = new sass.types.List(0);
        assert.equal("()", sassUtils.sassString(l));
        done();
      });
      it("should stringify lists of 1 element", function (done) {
        var l = new sass.types.List(1);
        l.setValue(0, new sass.types.Number(5, "px"));
        assert.equal("(5px,)", sassUtils.sassString(l));
        done();
      });
      it("should stringify lists", function (done) {
        var l = new sass.types.List(3);
        l.setValue(0, new sass.types.Number(5, "px"));
        l.setValue(1, sass.types.Boolean.TRUE);
        l.setValue(2, new sass.types.String("'asdf'"));
        assert.equal("(5px, true, 'asdf')", sassUtils.sassString(l));
        done();
      });
      it("should stringify space delimited lists", function (done) {
        var l = new sass.types.List(3);
        l.setSeparator(false);
        l.setValue(0, new sass.types.Number(5, "px"));
        l.setValue(1, sass.types.Boolean.TRUE);
        l.setValue(2, new sass.types.String("'asdf'"));
        assert.equal("(5px true 'asdf')", sassUtils.sassString(l));
        done();
      });
      it("should stringify empty maps", function (done) {
        var m = new sass.types.Map(0);
        assert.equal("()", sassUtils.sassString(m));
        done();
      });
      it("should stringify maps", function (done) {
        var m = new sass.types.Map(1);
        m.setKey(0, new sass.types.Number(2, "px"));
        m.setValue(0, new sass.types.Color(30, 127, 0, 1.0));
        assert.equal("(2px: rgba(30, 127, 0, 1))", sassUtils.sassString(m));
        done();
      });
      it("null unquotes as null", function (done) {
        var n = sass.types.Null.NULL;
        assert.equal("null", sassUtils.typeOf(n));
        assert.equal("null", sassUtils.typeOf(sassUtils.unquote(n)));
        done();
      });
      it("knows simplified type names (as returned by sass's type-of function)", function (done) {
        assert.equal("null", sassUtils.typeOf(sass.types.Null.NULL));
        assert.equal("bool", sassUtils.typeOf(sass.types.Boolean.TRUE));
        assert.equal("number", sassUtils.typeOf(new sass.types.Number(2, "px")));
        assert.equal("string", sassUtils.typeOf(new sass.types.String("foo")));
        assert.equal("list", sassUtils.typeOf(new sass.types.List(0)));
        assert.equal("map", sassUtils.typeOf(new sass.types.Map(0)));
        done();
      });
      it("null unquotes as null", function (done) {
        var n = sass.types.Null.NULL;
        assert.equal("null", sassUtils.typeOf(n));
        assert.equal("null", sassUtils.typeOf(sassUtils.unquote(n)));
        done();
      });
      it("can check for null", function (done) {
        assert.equal(true, sassUtils.isNull(sass.types.Null.NULL));
        assert.equal(false, sassUtils.isNull(sass.types.Boolean.TRUE));
        assert.equal(false, sassUtils.isNull(new sass.types.Number(2, "px")));
        assert.equal(false, sassUtils.isNull(new sass.types.String("foo")));
        assert.equal(false, sassUtils.isNull(new sass.types.List(0)));
        assert.equal(false, sassUtils.isNull(new sass.types.Map(0)));
        done();
      });
      it("can check for falsy values", function (done) {
        assert.equal(true, sassUtils.isFalsy(sass.types.Null.NULL));
        assert.equal(true, sassUtils.isFalsy(sass.types.Boolean.FALSE));
        assert.equal(false, sassUtils.isFalsy(sass.types.Boolean.TRUE));
        assert.equal(false, sassUtils.isFalsy(new sass.types.Number(0)));
        assert.equal(false, sassUtils.isFalsy(new sass.types.String("")));
        assert.equal(false, sassUtils.isFalsy(new sass.types.List(0)));
        assert.equal(false, sassUtils.isFalsy(new sass.types.Map(0)));
        done();
      });
      it("handles empty maps", function (done) {
        var emptyList = new sass.types.List(0);
        var emptyMap = new sass.types.List(0);
        assert(sassUtils.isEmptyMap(emptyList));
        assert(sassUtils.isEmptyMap(emptyMap));
        assert(sassUtils.isType(emptyList, "map"));
        assert(sassUtils.isType(emptyMap, "map"));
        sassUtils.assertType(emptyList, "map");
        sassUtils.assertType(emptyMap, "map");
        assert.equal("map", sassUtils.typeOf(sassUtils.handleEmptyMap(emptyList)));
        done();
      });
      // it("can convert to and from js maps", function(done) {
      //   var map = new Map();
      //   map.set(new sass.types.String("foo"), new sass.types.Color(0, 0, 0));
      //   map.set(new sass.types.String("bar"), new sass.types.Number(2, "px"));
      //   var sassMap = sassUtils.fromJSMap(map);
      //   assert.equal("foo", sassMap.getKey(0).getValue());
      //   assert.equal("bar", sassMap.getKey(1).getValue());
      //   var newMap = sassUtils.toJSMap(sassMap);
      //   assert.equal(2, newMap.get(new sass.types.String("bar")).getValue());
      //   done();
      // });
    });
  });
});
