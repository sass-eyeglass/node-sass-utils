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
