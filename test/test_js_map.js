"use strict";

var assert = require("assert");
var sass = require("node-sass");
var sassUtils = require("../lib")(sass);

describe("js map", function () {
  it("can be constructed", function (done) {
    var map = new sassUtils.SassMap();
    done();
  });

  it("can be constructed", function (done) {
    var map = new sassUtils.SassMap();
    done();
  });

  it("has a length", function (done) {
    var map = new sassUtils.SassMap();
    assert.equal(0, map.size);
    done();
  });

  it("can map sass value to other sass values", function (done) {
    var map = new sassUtils.SassMap();
    var value = sass.types.String("hi");
    map.set(sass.types.Number(2, "px"), value);
    assert.equal(value, map.get(sass.types.Number(2, "px")));
    assert.equal(1, map.size);
    done();
  });

  it("can clear", function (done) {
    var map = new sassUtils.SassMap();
    map.set(sass.types.Number(2, "px"), sass.types.String("hi"));
    assert.equal(1, map.size);
    map.clear();
    assert.equal(0, map.size);
    done();
  });

  it("can remove keys", function (done) {
    var map = new sassUtils.SassMap();
    assert.equal(false, map.delete(sass.types.Number(2, "px")));
    map.set(sass.types.Number(2, "px"), sass.types.String("hi"));
    assert.equal(1, map.size);
    assert.equal(true, map.delete(sass.types.Number(2, "px")));
    assert.equal(0, map.size);
    assert.equal(undefined, map.get(sass.types.Number(2, "px")));
    done();
  });
  it("can check for a key", function(done) {
    var map = new sassUtils.SassMap();
    assert.equal(false, map.has(sass.types.Number(2, "px")));
    map.set(sass.types.Number(2, "px"), sass.types.String("hi"));
    assert.equal(true, map.has(sass.types.Number(2, "px")));
    done();
  });
  it("has entries", function(done) {
    var map = new sassUtils.SassMap();
    var k = sass.types.Number(2, "px");
    var v = sass.types.String("hi");
    map.set(k, v);
    var entryIterator = map.entries();
    var pair = entryIterator.next().value;
    assert.equal(k, pair[0]);
    assert.equal(v, pair[1]);
    assert(entryIterator.next().done);
    done();
  });
  it("has keys", function(done) {
    var map = new sassUtils.SassMap();
    var k = sass.types.Number(2, "px");
    var v = sass.types.String("hi");
    map.set(k, v);
    var iterator = map.keys();
    var key = iterator.next().value;
    assert.equal(k, key);
    assert(iterator.next().done);
    done();
  });
  it("has values", function(done) {
    var map = new sassUtils.SassMap();
    var k = sass.types.Number(2, "px");
    var v = sass.types.String("hi");
    map.set(k, v);
    var iterator = map.values();
    var value = iterator.next().value;
    assert.equal(v, value);
    assert(iterator.next().done);
    done();
  });
  it("can be iterated with forEach", function(done) {
    var map = new sassUtils.SassMap();
    var k = sass.types.Number(2, "px");
    var v = sass.types.String("hi");
    map.set(k, v);
    map.forEach(function(key, value, m) {
      assert.equal(k, key);
      assert.equal(v, value);
      assert.equal(map, m);
    });
    done();
  });
});
