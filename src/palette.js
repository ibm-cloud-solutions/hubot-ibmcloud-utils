/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

/**
 * The primary colors that we use in the bot, where they are supported
 */
const COLORS = {
	normal: '#555',
	positive: '#008571',
	negative: '#ef4e38'
};

// Aliases
COLORS.running = COLORS.positive;
COLORS.started = COLORS.positive;
COLORS.stopped = COLORS.negative;

Object.defineProperty(COLORS, 'random', {
	get: () => {
		return `#${randomHex()}${randomHex()}${randomHex()}`;
	}
});

function randomHex() {
	return ('0' + Math.floor(Math.random() * 255).toString(16)).substr(-2);
}

module.exports = COLORS;
