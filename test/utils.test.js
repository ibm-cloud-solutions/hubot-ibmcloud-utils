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


		it('test expected response', function(done) {
			const res = {
				reply: function(msg) {}
			};
			const robot = {
				name: 'hubot'
			};
			const switchBoard = {
				startDialog: function(res) {
					const dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot Y';
							func(message);
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			const prompt = {};
			const regex = /Y*/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test expected unexpected response', function(done) {
			const res = {
				reply: function(msg) {}
			};
			const robot = {
				name: 'hubot'
			};
			const switchBoard = {
				startDialog: function(res) {
					const dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot blah';
							func(message);
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			const prompt = {};
			const regex = /Y*/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test expected exit response', function(done) {
			const res = {
				reply: function(msg) {}
			};
			const robot = {
				name: 'hubot'
			};
			const switchBoard = {
				startDialog: function(res) {
					const dialog = {
						addChoice: function(regex, func) {
							let message = 'exit';
							func(message);
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			const prompt = {};
			const regex = /Y*/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test confirmed response `yes`', function(done) {
			const res = {
				reply: function(msg) {
					return 'yes';
				}
			};

			const switchBoard = {
				startDialog: function(res) {
					const dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot yes';
							func(message);
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			const prompt = 'Test question (Yes or No)';
			const negativeResponse = 'no';
			utils.getConfirmedResponse(res, switchBoard, prompt, negativeResponse).then(() => {
				done();
			});
		});


		it('test confirmed response `no`', function(done) {
			const res = {
				reply: function(msg) {
					return 'no';
				}
			};
			const switchBoard = {
				startDialog: function(res) {
					const dialog = {
						addChoice: function(regex, func) {
							let message = 'hubot no';
							func(message);
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			const prompt = 'Test question (Yes or No)';
			const negativeResponse = 'no';
			utils.getConfirmedResponse(res, switchBoard, prompt, negativeResponse)
			.then(() => {}, () => {
				done();
			});
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
	});

});
