// Description:
//	Utility methods used by other scripts.
//
// Author:
//	clanzen
//
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

// --------------------------------------------------------------
// i18n (internationalization)
// It will read from a peer messages.json file.  Later, these
// messages can be referenced throughout the module.
// --------------------------------------------------------------
var i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	// Add more languages to the list of locales when the files are created.
	directory: __dirname + '/messages',
	defaultLocale: 'en',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');


module.exports = {

	SLACK_MSG_LIMIT: 3500, // listed as 4000 in slack RTM API

	// -------------------------------------------------------
	// some handy regex
	// -------------------------------------------------------
	CONFIRM: /(yes|ye|yeah|yep|yo|y|yee|yeehaw|sure|sur|giddy-up)/i,
	DENY: /(no|nah|nuh-uh|neep|nawp|nope|nop|gasp|never)/i,

	// -------------------------------------------------------
	// Return if an element is in the array
	// -------------------------------------------------------
	bytesToSize: function(bytes, numChars) {
		if (numChars == null) {
			numChars = 3;
		}
		var sizes = ['B', 'K', 'M', 'G', 'T'];
		if (bytes === 0) return '0B';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
		return (bytes / Math.pow(1024, i)).toPrecision(numChars) + sizes[i];
	},

	/**
	 * Pretty prints megabyte values up to the specified precision.
	 * @param {Number} mbs the number of megabytes
	 * @param {Number} [precision=1] the number of decimal places to display
	 * @returns {String} The megabytes represented as a string
	 */
	formatMemory: function(mbs, precision) {
		if (mbs === 0) {
			return '0MB';
		}

		const sizes = ['MB', 'GB', 'TB'];
		const factor = Math.floor(Math.log(mbs) / Math.log(1000));
		return `${(mbs / Math.pow(1000, factor)).toFixed(precision || 1)}${sizes[factor]}`;
	},

	// -------------------------------------------------------
	// Recurse until the expected match is made.
	// -------------------------------------------------------
	getExpectedResponse: function(res, robot, switchBoard, prompt, regex) {
		let dialog = switchBoard.startDialog(res);
		return new Promise((resolve, reject) => {
			function getResponse() {
				// Present the user with a prompt for input.
				res.reply(prompt);

				// Control the response when the timeout expires.
				dialog.dialogTimeout = function(msg) {
					res.reply(i18n.__('conversation.timed.out'));
				};

				// Handle the expected response.
				dialog.addChoice(regex, (msg) => {
					// Must strip out potential leading bot name, if/when addressed.
					// This need only apply to msg[1].
					if (msg.match[1] && msg.match[1].indexOf(robot.name) !== -1) {
						// The robot was addressed.  Get the next token.
						msg.match[1] = msg.match[1].substring(msg.match[1].indexOf(' ') + 1);
					}

					// force dialog removal
					dialog.resetChoices();
					dialog.emit('timeout');

					resolve(msg);
				});

				// Handle an unexpected response.
				dialog.addChoice(/.*/i, (msg) => {
					var choice = null;
					var input = msg.match[0].split(' ');
					// Check if the user addressed the bot.
					if (msg.match[0] && msg.match[0].indexOf(robot.name) !== -1) {
						// The robot was addressed.  Get the next token.
						choice = input[1];
					}
					else {
						// The robot was not addressed.  Get the first token.
						choice = input[0];
					}

					// Allow the user to leave the dialog.
					if (choice === 'exit') {
						// force dialog removal
						dialog.resetChoices();
						dialog.emit('timeout');
						reject();
					}
					else {
						res.reply(i18n.__('conversation.try.again.or.exit'));
						getResponse();
					}
				});
			};
			getResponse();
		});
	},

	// -------------------------------------------------------
	// Recurse until the expected match for yes/no is made.
	// -------------------------------------------------------
	getConfirmedResponse: function(res, switchBoard, prompt, negativeResponse) {
		let that = this;
		let dialog = switchBoard.startDialog(res);
		return new Promise((resolve, reject) => {
			function getResponse() {
				// Present the user with a prompt for input.
				res.reply(prompt);
				// Control the response when the timeout expires.
				dialog.dialogTimeout = function(msg) {
					res.reply(i18n.__('conversation.timed.out'));
				};
				// Handle a confirmation.
				dialog.addChoice(that.CONFIRM, (msg) => {
					// force dialog removal
					dialog.resetChoices();
					dialog.emit('timeout');
					resolve();
				});
				// Handle a rejection.
				dialog.addChoice(that.DENY, (msg) => {
					res.reply(negativeResponse);
					// force dialog removal
					dialog.resetChoices();
					dialog.emit('timeout');
					reject();
				});
				// Handle an unexpected response.
				dialog.addChoice(/.*/i, (msg) => {
					res.reply(i18n.__('conversation.try.again.yes.no'));
					getResponse();
				});
			};
			getResponse();
		});
	},

	/*
	 * This will generate a regular expression that will only match input from 1 - maxNum
	 * Currently only supports lists up to 99
	 */
	generateRegExpForNumberedList: function(maxNum) {
		let regex = '';
		let singleDigit = '[1-9]';
		let doubleDigitFullRange = '';
		let doubleDigitPartialRange = '';

		// check < 1 or > 99
		if (maxNum < 1 || maxNum > 99) {
			console.log('out of range, we currently only support lists from 1 - 99');
			return;
		}

		// check for single digit maxNum
		if (maxNum < 10) {
			regex = `^([1-${maxNum}])$`;
			return regex;
		}

		// convert to string
		let maxNumString = String(maxNum);
		// get first digit of maxNum
		let firstDigit = Number(maxNumString.charAt(0));
		// get second digit of maxNum
		let secondDigit = Number(maxNumString.charAt(1));


		if (firstDigit === 1) {
			// construct double digit partial range
			doubleDigitPartialRange = `1[0-${secondDigit}]`;
			regex = `^(${singleDigit}|${doubleDigitPartialRange}?)\$`;
		}
		else {
			// construct double digit full range and partial range
			doubleDigitFullRange = `[1-${firstDigit - 1}][0-9]`;
			doubleDigitPartialRange = `${firstDigit}[0-${secondDigit}]`;
			regex = `^(${singleDigit}|${doubleDigitFullRange}?|${doubleDigitPartialRange}?)\$`;
		}

		return regex;
	},

	/*
	 * true if we are certain the robot is running in slack, else false.
	 */
	isSlack: function(robot) {
		return (robot && robot.adapterName && robot.adapterName.toLowerCase().indexOf('slack') > -1);
	},

	/*
	 * true if we are certain the robot is running in slack, else false.
	 */
	isFacebook: function(robot) {
		return (robot && robot.adapterName && robot.adapterName.toLowerCase() === 'fb');
	}
};
