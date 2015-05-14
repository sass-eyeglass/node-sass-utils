# node-sass-utils

This package provides helpers for working with the Sass values that `node-sass`
passes to javascript functions that are exposed as sass functions.

## Basic Usage

```js
var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

// standard invocation: methods on the sassUtils object
function mySassFunction(arg1) {
  console.log(sassUtils.sassString(arg1));
  return arg1;
}

```

The `sassUtils` object provides many useful helper methods.

Many of the Sass Utility functions are more naturally instance methods
of the sass types. The sass utilities can infect the Sass types.


```js
var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

sassUtils.infect();

function mySassFunction(arg1) {
  console.log(arg1.sassString());
  return arg1;
}
```

However library authors really should not mess around with core objects.
If you really need to, you can disinfect the sass types:

```js
var sass = require("node-sass");
var sassUtils = require("node-sass-utils")(sass);

function mySassFunction(arg1) {
  sassUtils.infect();
  console.log(arg1.sassString());
  sassUtils.disinfect();
  return arg1;
}
```

## API

### `sassUtils.assertType(value, typeName)`

Raises an error unless the sass value is not of the type specified. The
type should be a javascript string as would be returned by `sassUtils.typeOf`.

### `sassUtils.isFalsy(value)`

Returns true if the value is a sass null or boolean false.

### `sassUtils.isNull(value)`

Returns true if the value is a sass null.

### `sassUtils.sassString(value)`

Returns a javascript string that is the sass value as represented in a
Sass file.

### `sassUtils.typeOf(value)`

Returns a javascript string that is the sass type name of value (as
returned by the sass `type-of`. One of the following: `"bool"`,
`"color"`, `"list"`, `"map"`, `"null"`, `"number"`, `"string"`

### `sassUtils.typeOfConstructor(constructor)`

Like `sassUtils.typeOf` except it takes a sass value constructor
(`sass.types.Xyz` or `sassValue.constructor`) instead of a sass value itself.

### `sassUtils.unquote(value)`

Returns a new sass string after unquoting it. Returns a sass null if passed
a sass null. All other types raise an error.

### `new sassUtils.SassMap([sassMap])`

Returns a new javascript Map that is capable of maping sass objects as
keys to sass objects as values. The API of a sass map is identical to the
[Javascript Map][map_type] builtin type.

Additional Methods:

* `map.update(otherMap[, conflictHandler])` - adds the keys and values from `otherMap` into
  `map`. If the same key is present in both maps, the value from `otherMap`
  is used. `conflictHandler` is a function that accepts three arguments:
  `key`, `newValue` (from `otherMap`), and `oldValue` (from `map`). The
  function should return a value to be set into `map` for `key`. E.g. It
  could always pick the `oldValue`, or it could pick the maximum, or
  create an average, etc. `otherMap` can be a standard SassMap or a
  SassJsMap.

* `map.deepUpdate(otherMap[, conflictHandler])` - like `update` except when
  the values for the same key are both maps, the update recurses into
  those maps. Values that are Sass maps will be converted to SassJsMap instances if
  they are updated with another map.

* `map.toSassMap()` - converts a SassJsMap to a SassMap suitable for
  returning from a custom js function. If any value in the map is a SassJsMap it
  will also be converted.

* `map.sassString()` - returns a string for this map as it would be
  typed in a sass file.

* `map.typeOf()` - returns `"map"`.

**Note:** It is highly discouraged to use SassJsMap values as a key in
 another map. The behavior is very unpredictable if the map is mutated.

Usage Example:

```
var sass = require("node-sass");
var someSassColorLibrary = require("some-color-library");
var sassUtils = require("node-sass-utils")(sass);
function someCustomSassFunction(sassMap) {
  var map = new sassUtils.SassJsMap();
  var color = map.get(sass.types.String("color"));
  map.set(sass.types.String("background-color"),
          someSassColorLibrary.darken(color, 0.20))
  return map.toSassMap();
}
```


## Instance API

These methods are only available after calling
`sassUtils.infect(sass.types)`.

### `isFalsy()`

Returns true if the instance is a sass null or boolean false.

### `isNull()`

Returns true if the instance is a sass null.

### `sassString()`

Returns a javascript string that is the instance as represented in a
Sass file.

## Installation

```
$ npm install --save node-sass-utils
```

[map_type]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
