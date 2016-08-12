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
			var res = {
				reply: function(msg) {}
			};
			var robot = {
				name: 'hubot'
			};
			var switchBoard = {
				startDialog: function(res) {
					var dialog = {
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
			var prompt = {};
			var regex = /Y*/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test expected unexpected response', function(done) {
			var res = {
				reply: function(msg) {}
			};
			var robot = {
				name: 'hubot'
			};
			var switchBoard = {
				startDialog: function(res) {
					var dialog = {
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
			var prompt = {};
			var regex = /Y*/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test expected exit response', function(done) {
			var res = {
				reply: function(msg) {}
			};
			var robot = {
				name: 'hubot'
			};
			var switchBoard = {
				startDialog: function(res) {
					var dialog = {
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
			var prompt = {};
			var regex = /Y*/i;

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then(() => {
				done();
			});
		});

		it('test confirmed response `yes`', function(done) {
			var res = {
				reply: function(msg) {
					return 'yes';
				}
			};

			var switchBoard = {
				startDialog: function(res) {
					var dialog = {
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
			var prompt = 'Test question (Yes or No)';
			var negativeResponse = 'no';
			utils.getConfirmedResponse(res, switchBoard, prompt, negativeResponse).then(() => {
				done();
			});
		});


		it('test confirmed response `no`', function(done) {
			var res = {
				reply: function(msg) {
					return 'no';
				}
			};
			var switchBoard = {
				startDialog: function(res) {
					var dialog = {
						addChoice: function(regex, func) {
							message = 'hubot no';
							func(message);
						},
						resetChoices: function(){},
						emit: function(){}
					};
					return dialog;
				}
			};
			var prompt = 'Test question (Yes or No)';
			var negativeResponse = 'no';
			utils.getConfirmedResponse(res, switchBoard, prompt, negativeResponse)
			.then(() => {}, () => {
				done();
			});
		});

	});

});
