'use strict';

module.exports = require('@cfware/nyc')
	.fullCoverage()
	.require('esm')
	.settings;
