"use strict";

var assert = require("assert");
var testutils = require("./testutils");

describe("sass utils infection of types", function () {
  testutils.withEachSass(function (sass, sassName, sassUtils) {
    describe("using " + sassName, function () {

      before(function () {
        sassUtils.infect();
      });
      after(function () {
        sassUtils.disinfect();
      });
      it("null.sassString()", function (done) {
        assert.equal("null", sass.types.Null.NULL.sassString());
        done();
      });
      it("boolean.sassString()", function (done) {
        assert.equal("true", sass.types.Boolean.TRUE.sassString());
        done();
      });
      it("number.sassString()", function (done) {
        assert.equal("10", sassUtils.sassString(new sass.types.Number(10)));
        done();
      });
      it("string.sassString()", function (done) {
        assert.equal("foo", sassUtils.sassString(new sass.types.String("foo")));
        done();
      });
      it("list.sassString()", function (done) {
        var l = new sass.types.List(0);
        assert.equal("()", l.sassString());
        done();
      });
      it("map.sassString()", function (done) {
        var m = new sass.types.Map(0);
        assert.equal("()", m.sassString());
        done();
      });
      it("value.isNull()", function (done) {
        assert.equal(true, sass.types.Null.NULL.isNull());
        assert.equal(false, sass.types.Boolean.TRUE.isNull());
        assert.equal(false, new sass.types.Number(2, "px").isNull());
        assert.equal(false, new sass.types.String("foo").isNull());
        assert.equal(false, new sass.types.List(0).isNull());
        assert.equal(false, new sass.types.Map(0).isNull());
        done();
      });
      it("value.isFalsy()", function (done) {
        assert.equal(true, sass.types.Null.NULL.isFalsy());
        assert.equal(true, sass.types.Boolean.FALSE.isFalsy());
        assert.equal(false, sass.types.Boolean.TRUE.isFalsy());
        assert.equal(false, new sass.types.Number(0).isFalsy());
        assert.equal(false, new sass.types.String("").isFalsy());
        assert.equal(false, new sass.types.List(0).isFalsy());
        assert.equal(false, new sass.types.Map(0).isFalsy());
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
