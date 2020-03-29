"use strict";

var assert = require("assert");
var testutils = require("./testutils");

describe("sass js map", function () {
  testutils.withEachSass(function (sass, sassName, sassUtils) {
    describe("using " + sassName, function () {
      it("can be constructed", function (done) {
        var map = new sassUtils.SassJsMap();
        assert(map);
        done();
      });

      it("can be constructed from a Sass map", function (done) {
        var sassMap = new sass.types.Map(2);
        sassMap.setKey(0, new sass.types.String("a"));
        sassMap.setValue(0, new sass.types.Number(1));
        sassMap.setKey(1, new sass.types.String("b"));
        sassMap.setValue(1, new sass.types.Number(2));
        var map = new sassUtils.SassJsMap(sassMap);
        assert.equal(map.size, 2);
        assert.equal(map.get(new sass.types.String("a")).getValue(), 1);
        assert.equal(map.get(new sass.types.String("b")).getValue(), 2);
        done();
      });

      it("doesn't allow illegal keys", function (done) {
        try {
          var map = new sassUtils.SassJsMap();
          map.set("hi", new sass.types.String("bye"));
        } catch (e) {
          assert.equal(e.message, 'Not a legal Sass value: "hi"');
          done();
          return;
        }
        assert(false, "did not raise");
      });

      it("doesn't allow illegal values", function (done) {
        try {
          var map = new sassUtils.SassJsMap();
          map.set(new sass.types.String("hi"), "bye");
        } catch (e) {
          assert.equal(e.message, 'Not a legal Sass value: "bye"');
          done();
          return;
        }
        assert(false, "did not raise");
      });

      it("has a length", function (done) {
        var map = new sassUtils.SassJsMap();
        assert.equal(0, map.size);
        done();
      });

      it("can map sass value to other sass values", function (done) {
        var map = new sassUtils.SassJsMap();
        var value = new sass.types.String("hi");
        map.set(new sass.types.Number(2, "px"), value);
        assert.equal(value, map.get(new sass.types.Number(2, "px")));
        assert.equal(1, map.size);
        done();
      });

      it("can clear", function (done) {
        var map = new sassUtils.SassJsMap();
        map.set(new sass.types.Number(2, "px"), new sass.types.String("hi"));
        assert.equal(1, map.size);
        map.clear();
        assert.equal(0, map.size);
        done();
      });

      it("can remove keys", function (done) {
        var map = new sassUtils.SassJsMap();
        assert.equal(false, map.delete(new sass.types.Number(2, "px")));
        map.set(new sass.types.Number(2, "px"), new sass.types.String("hi"));
        assert.equal(1, map.size);
        assert.equal(true, map.delete(new sass.types.Number(2, "px")));
        assert.equal(0, map.size);
        assert.equal(undefined, map.get(new sass.types.Number(2, "px")));
        done();
      });
      it("can check for a key", function (done) {
        var map = new sassUtils.SassJsMap();
        assert.equal(false, map.has(new sass.types.Number(2, "px")));
        map.set(new sass.types.Number(2, "px"), new sass.types.String("hi"));
        assert.equal(true, map.has(new sass.types.Number(2, "px")));
        done();
      });
      it("has entries", function (done) {
        var map = new sassUtils.SassJsMap();
        var k = new sass.types.Number(2, "px");
        var v = new sass.types.String("hi");
        map.set(k, v);
        var entryIterator = map.entries();
        var pair = entryIterator.next().value;
        assert.equal(k, pair[0]);
        assert.equal(v, pair[1]);
        assert(entryIterator.next().done);
        done();
      });
      it("has keys", function (done) {
        var map = new sassUtils.SassJsMap();
        var k = new sass.types.Number(2, "px");
        var v = new sass.types.String("hi");
        map.set(k, v);
        var iterator = map.keys();
        var key = iterator.next().value;
        assert.equal(k, key);
        assert(iterator.next().done);
        done();
      });
      it("has values", function (done) {
        var map = new sassUtils.SassJsMap();
        var k = new sass.types.Number(2, "px");
        var v = new sass.types.String("hi");
        map.set(k, v);
        var iterator = map.values();
        var value = iterator.next().value;
        assert.equal(v, value);
        assert(iterator.next().done);
        done();
      });
      it("can be iterated with forEach", function (done) {
        var map = new sassUtils.SassJsMap();
        var k = new sass.types.Number(2, "px");
        var v = new sass.types.String("hi");
        map.set(k, v);
        map.forEach(function (value, key, m) {
          assert.equal(k, key);
          assert.equal(v, value);
          assert.equal(map, m);
        });
        done();
      });
      it("can update from a sass js map", function (done) {
        var map = new sassUtils.SassJsMap();
        var k = new sass.types.String("hi");
        var v = new sass.types.Number(2, "px");
        map.set(k, v);
        var anotherMap = new sassUtils.SassJsMap();
        anotherMap.update(map);
        var iterator = anotherMap.values();
        var value = iterator.next().value;
        assert.equal(v, value);
        assert(iterator.next().done);
        done();
      });

      it("can deep update a map", function (done) {
        var map1 = new sassUtils.SassJsMap();
        var k = new sass.types.String("top-level");
        var v = new sass.types.Map(1);
        v.setKey(0, new sass.types.String("a"));
        v.setValue(0, new sass.types.Number(1));
        map1.set(k, v);

        var map2 = new sassUtils.SassJsMap();
        var k2 = new sass.types.String("top-level");
        var v2 = new sass.types.Map(2);
        v2.setKey(0, new sass.types.String("a"));
        v2.setValue(0, new sass.types.Number(2));
        v2.setKey(1, new sass.types.String("b"));
        v2.setValue(1, new sass.types.Number(3));
        map2.set(k2, v2);

        map1.deepUpdate(map2);
        var submap = map1.get(new sass.types.String("top-level"));
        var replaced = submap.get(new sass.types.String("a"));
        var added = submap.get(new sass.types.String("b"));
        assert.equal(replaced.getValue(), 2);
        assert.equal(added.getValue(), 3);
        assert.equal(map1.sassString(), "(top-level: (a: 2, b: 3))");
        assert.equal(sassUtils.sassString(map1.toSassMap()), "(top-level: (a: 2, b: 3))");
        done();
      });

      it("can coerce for the get method", function () {
        var map = new sass.types.Map(1);
        var submap = new sass.types.Map(1);
        submap.setKey(0, new sass.types.String("two"));
        submap.setValue(0, new sass.types.Number(3, "px"));
        map.setKey(0, new sass.types.String("one"));
        map.setValue(0, submap);
        var jsmap = new sassUtils.SassJsMap(map);
        var t = jsmap.coerce.get("one");
        assert.equal(3, t.coerce.get("two").value);
      });

      it("can coerce for the set method", function () {
        var map = new sassUtils.SassJsMap();
        map.coerce.set("foo", "bar");
        var value = map.get(new sass.types.String("foo"));
        assert.equal("bar", value.getValue());
      });
    });
  });
});
