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
var expect = require("chai").expect;
var utterances = require("../index.js");
var utterance_helper = require("../utterance_helper.js");
var platforms = require("../node_modules/vui-platforms/index.js");
var synonyms = require("../node_modules/vui-custom-values-with-synonyms/index.js");

describe("vui-advanced-utterances", function() {
  describe("unfoldUtteranceString", function() {
    var app = {};
    utterances.addUtterancesToApp(app);
    synonyms.addSynonymsToApp(app);

    it("verify that we are getting back the correct result when the input is a simple string", function() {
      expect(app.unfoldUtteranceString("simple string")).to.equal("simple string");
    });

    it("verify that we are getting back the correct result when the input is a string that has a single slot element", function() {
      expect(app.unfoldUtteranceString("simple string {SampleSlot} in it")).to.equal("simple string {SampleSlot} in it");
    });

    app.addCustomInputType("fruit",
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

    it("verify that we are getting back the correct result when the input has custom input type inside a simple string", function() {
      var result = app.unfoldUtteranceString("simple string containing {+fruit} in it", app);
      expect(result.length).to.equal(3);
      expect(result[0]).to.equal("simple string containing apple in it");
      expect(result[1]).to.equal("simple string containing golden delicious in it");
      expect(result[2]).to.equal("simple string containing banana in it");
    });

    it("verify that we are getting back the correct result when the input is a string that has two slot elements", function() {
      expect(app.unfoldUtteranceString("simple string {SampleSlot} in it {SecondSlot} too")).to.equal("simple string {SampleSlot} in it {SecondSlot} too");
    });

    it("verify that we are getting back the correct result when the input is a string javascript function call", function() {
      expect(app.unfoldUtteranceString("simple string {=new Date().toString().substring(0, 15)} in it")).to.equal("simple string " + (new Date().toString().substring(0, 15)) + " in it");
    });

    global.identifier1 = "my identifier 1";
    it("verify that we are getting back the correct result when the input has an {=identifier1} inside a simple string", function() {
      expect(app.unfoldUtteranceString("simple string with {=identifier1} in it")).to.equal("simple string with my identifier 1 in it");
    });

    it("verify that we are getting back the correct result when the input has an option list inside a simple string", function() {
      var result = app.unfoldUtteranceString("simple string with {my|option| list } in it");
      expect(result.length).to.equal(3);
      expect(result[0]).to.equal("simple string with my in it");
      expect(result[1]).to.equal("simple string with option in it");
      expect(result[2]).to.equal("simple string with  list  in it");
    });

    it("verify that we are getting back the correct result when the input has an {=['apple','banana']} inside a simple string", function() {
      var result = app.unfoldUtteranceString("simple string with {=['apple','banana']} in it");
      expect(result.length).to.equal(2);
      expect(result[0]).to.equal("simple string with apple in it");
      expect(result[1]).to.equal("simple string with banana in it");
    });

    it("verify that we are getting back the correct result when the input has an {=2>3?'wrong':'right'} inside a simple string", function() {
      var result = app.unfoldUtteranceString("simple string that has {=2>3?'wrong':'right'} in it");
      expect(result).to.equal("simple string that has right in it");
    });

    global.identifier2 = "my identifier 2";
    it("verify that we are getting back the correct result when the input has a nested option list inside a simple string", function() {
      var result = app.unfoldUtteranceString("simple string with {my|{OptionSlot}|{=identifier2}| list } in it");
      expect(result.length).to.equal(4);
      expect(result[0]).to.equal("simple string with my in it");
      expect(result[1]).to.equal("simple string with {OptionSlot} in it");
      expect(result[2]).to.equal("simple string with my identifier 2 in it");
      expect(result[3]).to.equal("simple string with  list  in it");
    });

    global.identifier3 = ['sublist item 1', 'sublist item 2'];
    it("verify that we are getting back the correct result when the input has a nested option list inside a simple string", function() {
      var result = app.unfoldUtteranceString("simple string with an option list that has {my|{OptionSlot}|{=identifier3}| list } in it");
      expect(result.length).to.equal(5);
      expect(result[0]).to.equal("simple string with an option list that has my in it");
      expect(result[1]).to.equal("simple string with an option list that has {OptionSlot} in it");
      expect(result[2]).to.equal("simple string with an option list that has sublist item 1 in it");
      expect(result[3]).to.equal("simple string with an option list that has sublist item 2 in it");
      expect(result[4]).to.equal("simple string with an option list that has  list  in it");
    });

  });

  describe("exportIntentUtteranceStrings", function() {
    var app = {};
    utterances.addUtterancesToApp(app);
    synonyms.addSynonymsToApp(app);

    it("verify that we are getting back the correct result when exporting to Alexa and the input is an array of a simple string and an option list inside a simple string", function() {
      var result = app.exportIntentUtteranceStrings("SampleIntent", ["simple one liner", "simple string with an option list that has {my|option|list} in it"], platforms.ALEXA);
      expect(result.length).to.equal(4);
      expect(result[0]).to.equal("SampleIntent simple one liner");
      expect(result[1]).to.equal("SampleIntent simple string with an option list that has my in it");
      expect(result[2]).to.equal("SampleIntent simple string with an option list that has option in it");
      expect(result[3]).to.equal("SampleIntent simple string with an option list that has list in it");
    });
  });

  describe("validateUtterances", function() {
    var app = {};
    utterances.addUtterancesToApp(app);
    synonyms.addSynonymsToApp(app);

    it("verify that we are correctly identifying valid utterances", function() {
      var result = app.validateUtterances(["simple one liner", "simple string with an option list that has {my|option|list} in it"]);
      expect(result).to.equal(true);
    });
    it("verify that we are correctly identifying invalid duplicate utterances", function() {
      var result = app.validateUtterances(["simple one liner", "simple string with an option list that has {my|option|list} in it", "simple one liner"]);
      expect(result).to.equal(false);
    });
  });

  describe("cartesianProduct", function() {
    var array1 = [];
    var array2 = [];
    utterance_helper._cartesianProduct(array1, array2);

    it("verify that we are getting back the correct cartesian product when both arrays are empty", function() {
      expect(array1.length).to.equal(0);
    });

    var array3 = [];
    var array4 = [", part two"];
    utterance_helper._cartesianProduct(array3, array4);
    it("verify that we are getting back the correct cartesian product when first array is empty", function() {
      expect(array3.length).to.equal(0);
    });

    var array5 = ["part one"];
    var array6 = [", part two"];
    utterance_helper._cartesianProduct(array5, array6);
    it("verify that we are getting back the correct cartesian product when both arrays have one entry", function() {
      expect(array5.length).to.equal(1);
      expect(array5[0]).to.equal("part one, part two");
    });

    var array7 = ["part one A", "part one B"];
    var array8 = [", part two"];
    utterance_helper._cartesianProduct(array7, array8);
    it("verify that we are getting back the correct cartesian product when first array has two entries and the second one has one entry.", function() {
      expect(array7.length).to.equal(2);
      expect(array7[0]).to.equal("part one A, part two");
      expect(array7[1]).to.equal("part one B, part two");
    });

    var array9 = ["part one A", "part one B"];
    var array10 = [", part two a", ", part two b"];
    utterance_helper._cartesianProduct(array9, array10);
    it("verify that we are getting back the correct cartesian product when both arrays have two entries.", function() {
      expect(array9.length).to.equal(4);
      expect(array9[0]).to.equal("part one A, part two a");
      expect(array9[1]).to.equal("part one B, part two a");
      expect(array9[2]).to.equal("part one A, part two b");
      expect(array9[3]).to.equal("part one B, part two b");
    });

    var array11 = ["I said ", "You said ", "They said "];
    var array12 = ["tomato", "potato", "banana"];
    utterance_helper._cartesianProduct(array11, array12);
    it("verify that we are getting back the correct cartesian product when both arrays have three entries.", function() {
      expect(array11.length).to.equal(9);
      expect(array11[0]).to.equal("I said tomato");
      expect(array11[1]).to.equal("You said tomato");
      expect(array11[2]).to.equal("They said tomato");
      expect(array11[3]).to.equal("I said potato");
      expect(array11[4]).to.equal("You said potato");
      expect(array11[5]).to.equal("They said potato");
      expect(array11[6]).to.equal("I said banana");
      expect(array11[7]).to.equal("You said banana");
      expect(array11[8]).to.equal("They said banana");
    });

    var array13 = ["I said ", "You said ", "They said ", "Everybody said "];
    var array14 = ["tomato", "potato", "banana"];
    utterance_helper._cartesianProduct(array13, array14);
    it("verify that we are getting back the correct cartesian product when first array has 4 entries and second array has 3 entries.", function() {
      expect(array13.length).to.equal(12);
      expect(array13[0]).to.equal("I said tomato");
      expect(array13[1]).to.equal("You said tomato");
      expect(array13[2]).to.equal("They said tomato");
      expect(array13[3]).to.equal("Everybody said tomato");
      expect(array13[4]).to.equal("I said potato");
      expect(array13[5]).to.equal("You said potato");
      expect(array13[6]).to.equal("They said potato");
      expect(array13[7]).to.equal("Everybody said potato");
      expect(array13[8]).to.equal("I said banana");
      expect(array13[9]).to.equal("You said banana");
      expect(array13[10]).to.equal("They said banana");
      expect(array13[11]).to.equal("Everybody said banana");
    });

  });
});
