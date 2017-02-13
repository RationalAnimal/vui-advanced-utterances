/*
MIT License

Copyright (c) 2017 Ilya Shubentsov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
'use strict'
var utterances = {};
var utterance_helper = require("./utterance_helper.js");

utterances.addUtterancesToApp = function(app){
  if(app.utterancesAlreadyAdded == true){
    return;
  }
  app.utterancesAlreadyAdded = true;

  /**
  * Call this function to parse the string containing various embedded elements.
  * Here are the currently supported elements:
  * {SlotName} - this is an element containing the name of a slot. This stays
  * unchanged in the final output.
  * {element1|element2|elementn} - this is a list of options.  It is to be
  * replaced by an array, which will subsequently be part of a cartesian product
  * with the rest of the line.
  * {=javascript code} - this is to be replaced by the results of evaluating
  * javascript code.  Simple examples would be a variable name or a literal
  * string or literal array.
  * @param {string} utterance - the utterance to "unfold".
  */
  app.unfoldUtteranceString = function(utterance){
    return utterance_helper.unfoldUtteranceString(utterance, this);
  }

  /**
  * Call this function to export utterances for a particular platform and a
  * particular intent.
  * @param {string} intent - intent name
  * @param {array} utterances - string array of utterances
  * @param {string} platform - platform name, found in vui-platforms module
  */
  app.exportIntentUtteranceStrings = function(intentName, utterances, platform){
    return utterance_helper.exportIntentUtteranceStrings(intentName, utterances, platform, this);
  }

  /**
  * Call this function to validate utterances.
  * @param {array} utterances - string array of utterances
  */
  app.validateUtterances = function(utterances){
    return utterance_helper.validateUtterances(utterances, this);
  }
}
module.exports = utterances;
