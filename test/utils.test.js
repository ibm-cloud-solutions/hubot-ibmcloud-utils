/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
'use strict';

const expect = require('chai').expect;
const palette = require('../src/palette');
const utils = require('../src/utils');

// Passing arrow functions to mocha is discouraged: https://mochajs.org/#arrow-functions
// return promises from mocha tests rather than calling done() - http://tobyho.com/2015/12/16/mocha-with-promises/
describe('Test utility functions', function() {

	context('test palette', function() {
		it('should respond value', function() {
			expect(palette.normal).to.equal('#555');
			expect(palette.positive).to.equal('#008571');
			expect(palette.negative).to.equal('#ef4e38');
			expect(palette.running).to.equal('#008571');
			expect(palette.started).to.equal('#008571');
			expect(palette.stopped).to.equal('#ef4e38');
			expect(palette.available).to.equal('#008571');
			expect(palette.intermediate).to.equal('#DAA038');
			expect(palette.training).to.equal('#DAA038');
			expect(palette.random).to.be.a.string;
		});
	});

	context('test utils', function() {
		it('check for slack adapter', function() {
			let robot = {
				adapterName: 'slack'
			};
			let check = utils.isSlack(robot);
			expect(check).to.equal(true);
		});

		it('check for facebook adapter', function() {
			let robot = {
				adapterName: 'fb'
			};
			let check = utils.isFacebook(robot);
			expect(check).to.equal(true);
		});

		it('test byte conversion for 0 bytes', function() {
			let result = utils.bytesToSize(0);
			expect(result).to.equal('0B');
		});

		it('test byte conversion for 1 bytes', function() {
			let result = utils.bytesToSize(1, 1);
			expect(result).to.equal('1B');
		});

		it('test format memory for 0 MB', function() {
			let result = utils.formatMemory(0, 1);
			expect(result).to.equal('0MB');
		});

		it('test format memory for 1 MB', function() {
			let result = utils.formatMemory(1, 1);
			expect(result).to.equal('1.0MB');
		});

		it('test generated regex for numbered list of 7', function() {
			let result = utils.generateRegExpForNumberedList(7);
			expect('@hubot 5').to.match(result);
			expect('5').to.match(result);
			expect('8').to.not.match(result);
		});

		it('test generated regex for numbered list of 15', function() {
			let result = utils.generateRegExpForNumberedList(15);
			expect('@hubot 15').to.match(result);
			expect('5').to.match(result);
			expect('16').to.not.match(result);
		});

		it('test generated regex for numbered list of 45', function() {
			let result = utils.generateRegExpForNumberedList(45);
			expect('@hubot 45').to.match(result);
			expect('5').to.match(result);
			expect('46').to.not.match(result);
		});

		it('test generated regex for numbered list of 88', function() {
			let result = utils.generateRegExpForNumberedList(88);
			expect('@hubot 88').to.match(result);
			expect('5').to.match(result);
			expect('89').to.not.match(result);
		});

		it('test generated regex returns an Error, if outside upper bound of allowed range', function() {
			let result = utils.generateRegExpForNumberedList(100);
			expect(result).to.be.an.instanceOf(Error);
		});

		it('test generated regex returns an Error, if outside lower bound of allowed range', function() {
			let result = utils.generateRegExpForNumberedList(-1);
			expect(result).to.be.an.instanceOf(Error);
		});

		it('test removing bot name from string', function() {
			let testString = '@hubot How are you doing today?';
			let result = utils.stripBotName('hubot', testString);
			expect(result).to.equal('How are you doing today?');
		});

		it('test removing multiple bot names from string', function() {
			let testString = '@hubot How are you doing today? hubot';
			let result = utils.stripBotName('hubot', testString);
			expect(result).to.equal('How are you doing today?');
		});

		it('test removing multiple bot names with typical variance seen in slack from string', function() {
			let testString = '@hubot @hubot: hubot HUBOT: How are you doing today?';
			let result = utils.stripBotName('hubot', testString);
			expect(result).to.equal('How are you doing today?');
		});

		it('test checking for bot being addressed in slack message', function() {
			let robot = {
				adapterName: 'slack'
			};
			let testString = '@hubot How are you doing today?';
			let result = utils.checkBotAddressedInMessage('hubot', testString, robot);
			expect(result).to.equal(true);
		});

		it('test checking for bot being addressed incorrectly in slack message', function() {
			let robot = {
				adapterName: 'slack'
			};
			let testString = '@huboty How are you doing today?';
			let result = utils.checkBotAddressedInMessage('hubot', testString, robot);
			expect(result).to.not.equal(true);
		});

		it('test checking for bot name in console message', function() {
			let robot = {
				adapterName: ''
			};
			let testString = 'hubot How are you doing today?';
			let result = utils.checkBotAddressedInMessage('hubot', testString, robot);
			expect(result).to.equal(true);
		});
	});

	context('test conversation utils', function() {

		let res;
		let robot = {
			name: 'hubot',
			emit: function(target, message) {}
		};

		it('test expected response', function(done) {
			let switchBoard = {
				startDialog: function(res) {
					let dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot Y';
							let match = message.match(regex);
							// only test expected response
							if (String(regex) !== '/.*/i') {
								func({match: match});
							}
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			let prompt = {};
			let regex = /(Y)/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test expected unexpected response', function(done) {
			let count = 0;
			let switchBoard = {
				startDialog: function(res) {
					let dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot blah';
							let match = message.match(regex);
							if (match === null) {
								return;
							}
							// unexpected response will cause the addChoice
							// function to be called in an infinite loop
							if (++count > 1) {
								done();
								return;
							}
							func({match: match});
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			let prompt = {};
			let regex = /(Y)/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex);
		});

		it('test expected exit response', function(done) {
			let res;
			let switchBoard = {
				startDialog: function(res) {
					let dialog = {
						addChoice: function(regex, func) {
							let message = 'exit';
							let match = message.match(regex);
							if (match === null) {
								return;
							}
							func({match: match});
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			let prompt = {};
			let regex = /(Y)/i;

			// catch rejected promise from 'exit' flow
			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex)
			.catch((err) => {
				done();
			});
		});

		it('test confirmed response `yes`', function(done) {
			let switchBoard = {
				startDialog: function(res) {
					let dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot yes';
							let match = message.match(regex);
							if (String(regex) === '/.*/i' || match === null) {
								return;
							}
							func({match: match});
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			let prompt = 'Test question (Yes or No)';
			let negativeResponse = 'no';
			utils.getConfirmedResponse(res, robot, switchBoard, prompt, negativeResponse).then(() => {
				done();
			});
		});

		it('test confirmed response `no`', function(done) {
			let switchBoard = {
				startDialog: function(res) {
					let dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot no';
							let match = message.match(regex);
							if (String(regex) === '/.*/i' || match === null) {
								return;
							}
							func({match: match});
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			let prompt = 'Test question (Yes or No)';
			let negativeResponse = 'no';
			utils.getConfirmedResponse(res, robot, switchBoard, prompt, negativeResponse)
			.catch((err) => {
				done();
			});
		});

		it('test confirmed response `unexpected response`', function(done) {
			let count = 0;
			let switchBoard = {
				startDialog: function(res) {
					let dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot blah';
							let match = message.match(regex);
							if (match === null) {
								return;
							}
							if (++count > 1) {
								done();
								return;
							}
							func({match: match});
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			let prompt = 'Test question (Yes or No)';
			let negativeResponse = 'no';
			utils.getConfirmedResponse(res, robot, switchBoard, prompt, negativeResponse);
		});
	});
});
