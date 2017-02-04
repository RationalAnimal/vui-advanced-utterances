# vui-advanced-utterances

npm module that provides ability to add VUI utterance generation functionality to any javascript object.

# Installation

```shell
	npm install vui-advanced-utterances --save
```
or, if you don't want to run unit tests on it:

```shell
	npm install vui-advanced-utterances --save --production
```

# Summary

This project provides an npm module to add VUI utterance generation functionality to any javascript object.
Once this functionality is added then the utterances can be added.
Then you can generate utterances directly from code for import into, for example, Amazon Alexa console when defining a skill.

While the primary purpose is to add this functionality to other VUI related objects, this is NOT necessary and is purely driven by usefulness.
Most of these functions can be added to ANY object and they don't require that the target class has anything to do with VUI.
However, if you wish to use custom slot types unfolding then you must use these functions with objects that understand
intents and custom slot values.

# Examples

## Simple string
To generate a simple utterance string simply pass that string in:

```javascript
var utterances = require("vui-advanced-utterances");
var app = {};
utterances.addUtterancesToApp(app);
var result = app.unfoldUtteranceString("simple string");
console.log(result);
```

will produce:

````javascript
simple string
````

## Named Slot
To generate an utterance string that contains a named slot in it simply pass in that string
with the slot name in {}:

```javascript
var utterances = require("vui-advanced-utterances");
var app = {};
utterances.addUtterancesToApp(app);
var result = app.unfoldUtteranceString("simple string containing {MySlotName} in it");
console.log(result);
```

will produce:

````javascript
simple string containing {MySlotName} in it
````

## Unfolded Custom Slot
To include custom slot type values in an utterance simply pass in a string with
the custom type name in {+ }:

```javascript
var utterances = require("vui-advanced-utterances");
var synonyms = require("vui-custom-values-with-synonyms");

var app = {};
utterances.addUtterancesToApp(app);
synonyms.addSynonymsToApp(app);
app.addCustomSlot("fruit",
	{values: [
		{
			text: "apple"
		},
		{
			text: "golden delicious",
			mapTo: "apple"
		},
		{
			text: "banana"
		}
	]}
);
var result = app.unfoldUtteranceString("simple string containing {+fruit} in it");
console.log(result);
```

will produce:

````javascript
simple string containing apple in it
simple string containing golden delicious in it
simple string containing banana in it
````

## Evaluated javascript
To generate an utterance string that contains value(s) obtained by evaluating javascript
simply pass in the javascript to be evaluated enclosed in {= }.  The javascript must evaluate to
a string or an array of strings and must not contain { or }:
```javascript
var utterances = require("vui-advanced-utterances");
var app = {};
utterances.addUtterancesToApp(app);
var result = app.unfoldUtteranceString("simple string containing {=new Date().toString()} in it");
console.log(result);
```

will produce:

````javascript
simple string containing Fri Feb 03 2017 16:45:12 GMT-0500 (EST) in it
````

Note that if the expression inside {= } produces an array of strings, it will be
treated as if you've included an options list, i.e. {option|option|option...}

## Option list
To generate a list of utterance strings that differ only in inclusion of different
options simply pass in that string with the options in {} separated by | :

```javascript
var utterances = require("vui-advanced-utterances");
var app = {};
utterances.addUtterancesToApp(app);
var result = app.unfoldUtteranceString("simple string containing {blue pill|red pill} in it");
console.log(result);
```

will produce:

````javascript
simple string containing blue pill in it
simple string containing red pill in it
````

## Nested specifications

If you want to, you can include (nest) various special expressions within the
others that allow it (e.g. option list):

````javascript
"{option 1|{=['option 2','option 3']}|{Option4Slot}}"
````

will produce:

````javascript
option 1
option 2
option 3
{Option4Slot}
````

## Intent utterances
To generate the text suitable for uploading to Alexa development console use
unfoldIntentUtteranceStrings() function, passing to it the name of the Intent
and the array of utterances to be unfolded.

````javascript
var app = {};
utterances.addUtterancesToApp(app);

var result = app.unfoldIntentUtteranceStrings("SampleIntent", ["simple one liner", "simple string with an option list that has {my|option|list} in it"]);
console.log(result);
````
will produce:

````javascript
SampleIntent simple one liner
SampleIntent simple string with an option list that has my in it
SampleIntent simple string with an option list that has option in it
SampleIntent simple string with an option list that has list in it
````
