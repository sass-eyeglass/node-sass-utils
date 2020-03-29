"use strict";

var assert = require("assert");
var testutils = require("./testutils");

describe("sass utils coercion", function () {
  testutils.withEachSass(function (sass, sassName, sassUtils) {
    describe("using " + sassName, function () {

      it("casts strings", function (done) {
        var sassStr = sassUtils.castToSass("foo");
        assert.equal(sassStr.getValue(), "foo");
        assert.equal(sassUtils.castToJs(sassStr), "foo");
        done();
      });

      it("casts numbers", function (done) {
        var sassNumber = sassUtils.castToSass(2);
        assert.equal(sassNumber.getValue(), 2);
        assert(sassUtils.unitless(sassNumber));
        var jsNumber = sassUtils.castToJs(sassNumber);
        assert.equal(jsNumber.value, 2);
        assert.equal(jsNumber.unitStr(), "");
        assert(jsNumber.unitless());
        done();
      });

      it("casts undefined", function (done) {
        var sassNull = sassUtils.castToSass(undefined);
        assert.equal(sassNull, sass.types.Null.NULL);
        done();
      });

      it("casts null", function (done) {
        var sassNull = sassUtils.castToSass(null);
        assert.equal(sassNull, sass.types.Null.NULL);
        assert.equal(sassUtils.castToJs(sassNull), null);
        done();
      });

      it("casts booleans", function (done) {
        var sassTrue = sassUtils.castToSass(true);
        var sassFalse = sassUtils.castToSass(false);
        assert.equal(sassTrue, sass.types.Boolean.TRUE);
        assert.equal(sassFalse, sass.types.Boolean.FALSE);
        assert.equal(sassUtils.castToJs(sassTrue), true);
        assert.equal(sassUtils.castToJs(sassFalse), false);
        done();
      });

      it("casts maps", function (done) {
        var jsMap = new sassUtils.SassJsMap();
        jsMap.coerce.set("foo", false);
        assert.equal(jsMap.coerce.get("foo"), false);
        var sassMap = sassUtils.castToSass(jsMap);
        assert.equal(sassMap.getKey(0).getValue(), "foo");
        assert.equal(sassMap.getValue(0).getValue(), false);
        var jsMapAgain = sassUtils.castToJs(sassMap);
        assert.equal(jsMapAgain.coerce.get("foo"), false);
        done();
      });

      it("casts lists", function (done) {
        var jsList = ["one", "two", "three"];
        var sassList = sassUtils.castToSass(jsList);
        assert.equal(sassList.getValue(0).getValue(), "one");
        assert.equal(sassUtils.sassString(sassList), "(one, two, three)");
        var l = ["one", "two", "three"];
        l.separator = true;
        assert.deepEqual(sassUtils.castToJs(sassList), l);
        done();
      });

      it("passes through sass values", function (done) {
        var sassNull = sass.types.Null.NULL;
        var sassTrue = sass.types.Boolean.TRUE;
        var sassNumber = new sass.types.Number(2, "px");
        var sassString = new sass.types.String("foo");
        var sassList = new sass.types.List(1);
        sassList.setValue(0, sassTrue);
        var sassMap = new sass.types.Map(1);
        sassMap.setKey(0, sassString);
        sassMap.setValue(0, sassTrue);

        assert.equal(sassUtils.castToSass(sassNull), sassNull);
        assert.equal(sassUtils.castToSass(sassTrue), sassTrue);
        assert.equal(sassUtils.castToSass(sassNumber), sassNumber);
        assert.equal(sassUtils.castToSass(sassList), sassList);
        assert.equal(sassUtils.castToSass(sassMap), sassMap);
        done();
      });

      it("can coerce anything that has a toSass() method.", function (done) {
        var aNumber = {
          v: 2,
          u: "px",
          toSass: function () {
            return new sass.types.Number(this.v, this.u);
          }
        };
        var n = sassUtils.castToSass(aNumber);
        assert.equal(n.getValue(), 2);
        assert.equal(n.getUnit(), "px");
        done();
      });

      it("can coerce numbers", function (done) {
        var sassnum = new sass.types.Number(2, "px");
        var dim = sassUtils.castToJs(sassnum);
        assert.equal(dim.value, 2);
        assert.equal(dim.unitStr(), "px");
        var sassnumagain = sassUtils.castToSass(dim);
        assert.equal(sassnumagain.getValue(), 2);
        assert.equal(sassnumagain.getUnit(), "px");
        done();
      });

      it("can coerce objects", function (done) {
        var object = {
          foo: "apple",
          bar: "something",
          nested: {
            key: "value"
          }
        };

        var map = sassUtils.castToSass(object);

        var keys = [];
        for (var i = 0; i < map.getLength(); i++) {
          keys.push(map.getKey(i).getValue());
        }

        assert.deepEqual(keys.sort(), ["bar", "foo", "nested"]);

        assert.equal(map.getKey(2).getValue(), "nested");
        assert.equal(map.getValue(2).getKey(0).getValue(), "key");
        assert.deepEqual(sassUtils.mapToObject(map), object);
        done();
      });
    });
  });
});
