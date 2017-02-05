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
var platforms = require("vui-platforms");
var symonyms = require("vui-custom-values-with-synonyms");

var utterance_helper = {};
utterance_helper.randomTags = [];
utterance_helper.tagValues = [];

utterance_helper.validateUtterances = function(utterances, app){
  if(typeof utterances == "undefined"){
    console.log("utterances argument is undefined");
    return false;
  }
  if(typeof utterances == "string"){
    utterances = [utterances];
  }
  if(Array.isArray(utterances)){
    var result = [];
    for(var i = 0; i < utterances.length; i++){
      var scratch = utterance_helper.unfoldUtteranceString(utterances[i], app);
      if(Array.isArray(scratch)){
        for(var j = 0; j < scratch.length; j++){
          result.push(scratch[j]);
        }
      }
      else {
        result.push(scratch);
      }
    }
    result.sort();
    for(var i = 0; i < result.length - 1; i++){
      if(result[i] == result[i+1]){
        console.log("utterances contain duplicates, e.g.: " + result[i]);
        return false;
      }
    }
  }

  return true;
}

utterance_helper.unfoldUtteranceString = function(utterance, app){
  utterance_helper.randomTags = [];
  utterance_helper.tagValues = [];

  var replaceResult = utterance.replace(/\{[^\{\}\=\|\+]+\}/g, utterance_helper._replacerSlot);
  var currentString = replaceResult;

  replaceResult = currentString.replace(/\{\=[^\{\}\|\+]+\}/g, utterance_helper._replacerIdentifier);
  currentString = replaceResult;

  replaceResult = currentString.replace(/\{\+[^\{\}\|\=]+\}/g, utterance_helper._replacerCustomSlotType);
  currentString = replaceResult;

  replaceResult = currentString.replace(/\{[^\{\}]+\}/g, utterance_helper._replacerOptionList);
  currentString = replaceResult;

  utterance_helper._replaceCustonTypesWithValues(app);

  utterance_helper._normalizeTags(utterance_helper.randomTags, utterance_helper.tagValues);

  // Finally, replace all tags with self contained tags
  currentString = utterance_helper._replaceNestedTagsWithValues(currentString, utterance_helper.randomTags, utterance_helper.tagValues);

  return currentString;
}

utterance_helper.exportIntentUtteranceStrings = function(intentName, utterances, platform, app){
  if(platform == platforms.ALEXA){
    if(typeof utterances == "undefined"){
      return;
    }
    if(typeof utterances == "string"){
      utterances = [utterances];
    }
    if(Array.isArray(utterances)){
      var result = [];
      for(var i = 0; i < utterances.length; i++){
        var scratch = utterance_helper.unfoldUtteranceString(utterances[i], app);
        if(Array.isArray(scratch)){
          for(var j = 0; j < scratch.length; j++){
            result.push(intentName + " " + scratch[j]);
          }
        }
        else {
          result.push(intentName + " " + scratch);
        }
      }
      return result;
    }
  }
  // If it's neither a string nor an array then return nothing
  return;
}

utterance_helper._replaceCustonTypesWithValues = function(app) {
  for(var i = 0; i < utterance_helper.tagValues.length; i++){
    var scratchValue = utterance_helper.tagValues[i];
    if(typeof scratchValue == "string" && scratchValue.substring(0,2) == "{+" && scratchValue.substring(scratchValue.length - 1) == "}"){
      var customTypeName = scratchValue.substring(2, scratchValue.length - 1);
      // Trim leading and trailing spaces
      customTypeName = customTypeName.trim();
      var customTypeValues = app.getCustomSlotTypeValues(customTypeName);
      utterance_helper.tagValues[i] = customTypeValues;
    }
  }
}

utterance_helper._replacerSlot = function(match, offset, string) {
  var tag = utterance_helper._generateNewTagName();
  utterance_helper.randomTags.push(tag);
  utterance_helper.tagValues.push(match);
  return tag;
}

utterance_helper._replacerCustomSlotType = function(match, offset, string) {
  var tag = utterance_helper._generateNewTagName();
  utterance_helper.randomTags.push(tag);
  utterance_helper.tagValues.push(match);
  return tag;
}

utterance_helper._replacerIdentifier = function(match, offset, string) {
  var tag = utterance_helper._generateNewTagName();
  utterance_helper.randomTags.push(tag);
  utterance_helper.tagValues.push(eval(match.substring(2, match.length - 1)));
  return tag;
}

utterance_helper._replacerOptionList = function(match, offset, string) {
  var tag = utterance_helper._generateNewTagName();
  // Parse | separated list into an array
  var splitArray = (match.substring(1, match.length - 1)).split("|");
  utterance_helper.randomTags.push(tag);
  utterance_helper.tagValues.push(splitArray);
  return tag;
}

utterance_helper._generateNewTagName = function(){
  var tag = "<@" + Math.floor((Math.random() * 100000000) + 1) + ">";
  while(utterance_helper.randomTags.indexOf(tag) >= 0){
    tag = "<@" + Math.floor((Math.random() * 100000000) + 1) + ">";
  }
  return tag;
}

utterance_helper._getTagValue = function(tagValue, tags, tagValues){
  for(var i = 0; i < tags.length; i++){
    if(tags[i] == tagValue){
      return tagValues[i];
    }
  }
  return; // Undefined
}
utterance_helper._findFirstTag = function(source){
  if(typeof source == "undefined"){
    return;
  }
  var tagStart = source.indexOf("<@");
  if(tagStart < 0){
    return;
  }
  var tagEnd = source.indexOf(">", tagStart);
  if(tagEnd < 0){
    return;
  }
  var foundTag = source.substring(tagStart, tagEnd + 1);
  return foundTag;
}

/**
* Call this function to process all the tags and ensure that they don't
* contain any embedded tags.
* Note that when we start each value is either a string or a string array.
* After we are done, each tag is still either a string or a string array.
* @param {tags} - array of tag names.
* @param {values} - array of tag values.
*/
utterance_helper._normalizeTags = function(tags, values){
  for(var i = 0; i < tags.length; i++){
    var result = utterance_helper._normalizeTag(values[i], tags, values);
    values[i] = result;
  }
}

utterance_helper._normalizeTag = function(tagValue, tags, values){
  if(Array.isArray(tagValue)){
    var returnValue = utterance_helper._normalizeArrayTag(tagValue, tags, values);
    return returnValue;
  }
  var returnValue = utterance_helper._normalizeStringTag(tagValue, tags, values);
  return returnValue;
}

utterance_helper._normalizeArrayTag = function(tagValue, tags, values){
  var result = [];
  for(var i = 0; i < tagValue.length; i++){
    var subResult = utterance_helper._normalizeStringTag(tagValue[i], tags, values);
    if(Array.isArray(subResult)){
      result = result.concat(subResult);
    }
    else {
      result.push(subResult);
    }
  }
  return result;
}

utterance_helper._normalizeStringTag = function(tagValue, tags, values){
  var result = [];
  var foundTag = utterance_helper._findFirstTag(tagValue);
  while(typeof foundTag != "undefined"){
    var scratchValue = utterance_helper._getTagValue(foundTag, tags, values);
    if(Array.isArray(scratchValue)){
      // We do the first round of computations - replace the first value - then
      // call _normalizeArrayTag()
      var tagStart = tagValue.indexOf(foundTag);
      var afterTagIndex = tagStart + foundTag.length;
      var firstHalf = tagValue.substring(0, tagStart);
      var secondHalf = tagValue.substring(afterTagIndex);
      var returnValue = [firstHalf];
      returnValue = utterance_helper._cartesianProduct(returnValue, scratchValue);
      returnValue = utterance_helper._cartesianProduct(returnValue, [secondHalf]);
      return utterance_helper._normalizeArrayTag(returnValue, tags, values);
    }
    else {
      tagValue = tagValue.replace(foundTag, scratchValue);
    }
    foundTag = utterance_helper._findFirstTag(tagValue);
  }
  return tagValue;
}

/**
* Call to replace tag with its value within the utterance.
* @param {source} - either a single string or an array of strings.
* @param {tag} - tag that is contained within the source that needs to be
*   replaced with its value.
* @param {value} - the value to use as a replacement for the tag.
*/
utterance_helper._replaceTagWithValue = function(source, tag, value){
  if(typeof source == "string" && typeof value == "string"){
    var returnValue = source.replace(tag, value);
    return returnValue;
  }
  else if((Array.isArray(source) || typeof source == "[object Array]") && typeof value == "string"){
    for(var i = 0; i < source.length; i++){
      source[i] = source.replace(tag, value);
    }
    return source[i];
  }
  else if(typeof source == "string" && (Array.isArray(value) || typeof value == "[object Array]")){
    var tagStart = source.indexOf(tag);
    var afterTagIndex = tagStart + tag.length;
    var firstHalf = source.substring(0, tagStart);
    var secondHalf = source.substring(afterTagIndex);
    var returnValue = [firstHalf];
    returnValue = utterance_helper._cartesianProduct(returnValue, value);
    returnValue = utterance_helper._cartesianProduct(returnValue, [secondHalf]);
    return returnValue;
  }
  else if((Array.isArray(source) || typeof source == "[object Array]") && (Array.isArray(value) || typeof value == "[object Array]")){
    // Recursively compute this case
    for(var i = 0; i < source.length; i++){
      source[i] = utterance_helper._replaceTagWithValue(source[i], tag, value);
    }
  }
  return source;
}

/**
* Call this function to replace any occurrence of <@####> with their actual values.
* @param {source} - either a single string or an array of strings.
* @param {tags} - array of tags that might be contained within the source that needs to be
*   replaced with values.
* @param {values} - the array of values to use as replacements for the tags.
*/
utterance_helper._replaceNestedTagsWithValues = function(source, tags, values){
  if(Array.isArray(source) || typeof source == "[object Array]"){
    var resultArray = [];
    for(var i = 0; i < source.length; i++){
      var scratch = utterance_helper._replaceNestedTagsWithValues(source[i], tags, values);
      if(typeof scratch == "[object Array]"){
        resultArray.concat(scratch);
      }
      else {
        resultArray.push(scratch);
      }
    }
    return resultArray;
  }
  else {
    var foundTag = utterance_helper._findFirstTag(source);
    while(typeof foundTag != "undefined"){
      source = utterance_helper._replaceTagWithValue(source, foundTag, utterance_helper._getTagValue(foundTag, tags, values));
      foundTag = utterance_helper._findFirstTag(source);
    }
    return source;
  }
}

/**
* Call to produce a cartesian product of two string arrays, depositing the result in
* the first array.
* @param {array1} - first array to use in the cartesian product.  This is updated
* with the result.
* @param {array2} - second array to use in the cartesian product.
* @returns - array1
*/
utterance_helper._cartesianProduct = function(array1, array2){
  if(Object.prototype.toString.call(array1) !== '[object Array]' || Object.prototype.toString.call(array2) !== '[object Array]'){
    // Something went wrong, just return the first array without doing anything
  }
  else if(array1.length == 0){
    // Nothing to do here - the resulting array will be empty
  }
  else if(array2.length == 0){
    array1.length = 0;
  }
  else if(array2.length == 1){
    // This is a simple case, just append the only member of the second array to
    // each member of the first array
    var toAppend = array2[0];
    for(var i = 0; i < array1.length; i++){
      array1[i] += toAppend;
    }
  }
  else {// this is equivalent to if(array2.length > 1){
    // first add all the NEW rows to the first array, then update the initial rows of the first array
    var originalArray1Length = array1.length;
    for(var i = 1; i < array2.length; i++){
      for(var j = 0; j < originalArray1Length; j++){
        array1.push(array1[j] + array2[i]);
      }
    }
    // now update the initial rows of the first array to append contents of the first row of the second array
    var toAppend = array2[0];
    var toAppend = array2[0];
    for(var i = 0; i < originalArray1Length; i++){
      array1[i] += toAppend;
    }
  }
  return array1;
};


module.exports = utterance_helper;
