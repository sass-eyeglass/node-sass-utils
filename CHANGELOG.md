# CHANGELOG

## 1.1.3

* Adds support for dart-sass.

## 1.1.0

Empty maps appear as empty lists (the two are indistiguishable in
SassScript syntax until they contain a value). This release adds the
following handling for empty maps.

* `sassUtils.handleEmptyMap`: converts an empty list to an empty map.
* `sassUtils.isEmptyMap`: checks if the object is an empty list or empty map.
* `sassUtils.isType`: will now return true if the value is an empty list
  and the type is "map".
* `sassUtils.assertType`: will no longer raise if the value is an empty list
  and the type is "map".

## 1.0.0

Implemented generic javascript <=> sass type conversions where the
javascript objects are full featured and native javascript types where
it makes sense instead of the ultra-simple data-transfer objects that
node-sass provides.

## 0.2.0

* Added `sassUtils.SassJsMap` class that conforms to the JS Map API but
  also allows arbitrary Sass values as keys and values. This makes
  node-sass's Maps much easier to work with.

## 0.1.0

Initial Release.
