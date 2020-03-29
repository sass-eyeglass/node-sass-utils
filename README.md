# node-sass-utils

This package provides helpers for working with the Sass values that `node-sass`
passes to javascript functions that are exposed as sass functions.

Because the `dart-sass` (aka `sass` on npm) implementation mostly adheres to the `node-sass` implementation, this package has been tested to work with both.

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

### `sassUtils.isEmptyMap(value)`

Returns true if the value is an empty map or an empty list.

### `sassUtils.handleEmptyMap(value)`

Returns an empty map if passed an empty list. Otherwise, returns the
value passed in.

### `sassUtils.castToSass(jsValue)`

Returns a corresponding sass value for the given javascript value.

* `undefined` - cast to sass `null`.
* `null` - cast to sass `null`.
* `true` - cast to sass `true`.
* `false` - cast to sass `false`.
* number - cast to a unitless sass number.
* string - cast to unquoted sass string.
* array - cast to sass comma delimited list (set array.separator to
  false to cast to a space delimited list)
* `SassJsMap` - cast to sass map.
* `SassDimension` - cast to sass number.
* object - cast to sass map where the keys are strings and the values
  are cast recursively.
* `function` - cannot be cast.

### `sassUtils.castToJs(jsValue)`

The following Sass types can be coerced:

* `null` - Sass null is converted to JS null. JS undefined will also be
converted to Sass null.
* `boolean` - Sass boolean values are converted to and from JS Booleans.
* `string` - converted to a javascript string.
* `number` - converted to a SassDimension.
* `map` - Sass Maps are converted to and from SassJsMap objects.
* `list` - Sass Lists are converted to and from JS Arrays. The sass
  lists are always comma delimited when coerced from JS.


### `class SassDimension`

#### Properties:

  - `value`: The numeric part of a dimensional value
  - `numeratorUnits`: Array of units in the numerator.
  - `denominatorUnits`: Array of units in the denominator.

#### Constructor:

  -` new SassDimension(10, "px")`: Most commonly there is just a
    single unit in the numerator.
  - `new SassDimension(10, "px/s")`: Units can be passed in the same
    form as they are returned from the unitStr() method.
  - `new SassDimension(10, "px", "s")`: Single numerator and
    denominator units can be passed as strings instead of arrays
    of one unit.
  - `new SassDimension(10, ["px"], ["s"])`: numerator and denominator
    units can be passed as arrays where each index is a single units.

#### Methods:
  * Arithmetic Methods:
    - `d1.add(d2`): computes the sum d1 + d2. The units of d1 and d2
      must be the same or convertable. The result is returned using
      the units of d1.
    - `d1.subtract(d2)`: computes the difference d1 - d2. The units of d1 and d2
      must be the same or convertable. The result is returned using
      the units of d1.
    - `d1.multiply(d2)`: computes the product d1 * d2. The numerator
      units are combined as are the denominator units.
    - `d1.divide(d2)`: computes the quotient d1 / d2. The numerator
      units of d1 are combined with the denominatorUnits of d2 and
      the denominator units of d1 and combined with the numerator
      units of d2.
  * Comparison Methods:
    - `d1.compareTo(d2)`: return positive if d1 is greater than d2,
      negative if d1 is less than d2, and zero if equal.
    - `d1.lt(d2)`: returns true when d1 is strictly less than d2. The
      units of d1 and d2 must be the same or comparable.
    - `d1.lte(d2)`: returns true when d1 is less than or equal to d2.
      The units of d1 and d2 must be the same or comparable.
    - `d1.gt(d2)`: returns true when d1 is strictly greater than d2.
      The units of d1 and d2 must be the same or comparable.
    - `d1.gte(d2)`: returns true when d1 is greater than or equal to
      d2. The units of d1 and d2 must be the same or comparable.
    - `d1.eq(d2)`: returns true when d1 is greater than or equal to
      d2. The units of d1 and d2 must be the same or comparable.
  * Misc Methods:
    - `d.unitStr()`: output the units of this number in the form
      n1*n2(*...)/d1*d2(*...)
    - `d.sassString()`: Returns a sass representation of this number.
    - `d.convertTo(numeratorUnits, denominatorUnits)`: returns a new
      number converted to the given units or throws an error if
      they cannot be converted. This method can accept any of the
      same inputs that the constructor can be passed for units.

### `new sassUtils.SassJsMap([sassMap])`

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

Coercion:

A sassJsMap provides a `coerce` property that automatically coerces
arguments and their return values.

The following Sass types can be coerced:

* `null` - Sass null is converted to JS null. JS undefined will also be
converted to Sass null.
* `boolean` - Sass boolean values are converted to and from JS Booleans.
* `map` - Sass Maps are converted to and from SassJsMap objects.
* `list` - Sass Lists are converted to and from JS Arrays. The sass
  lists are always comma delimited when coerced from JS.



* `map.coerce.get()` - allows you to get string keys without creating a
  sass objects and then unboxing them. This only works for the following
  sass types
  sassJsMaps.
* `map.coerce.set()` - string keys and values are automatically converted
  to sass strings.


**Note:** It is highly discouraged to use SassJsMap values as a key in
 another map. The behavior is very unpredictable if the map is mutated.

Usage Example:

```
var sass = require("node-sass");
var someSassColorLibrary = require("some-color-library");
var sassUtils = require("node-sass-utils")(sass);
function someCustomSassFunction(sassMap) {
  var map = new sassUtils.SassJsMap();
  var color = map.get(new sass.types.String("color"));
  map.set(new sass.types.String("background-color"),
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
