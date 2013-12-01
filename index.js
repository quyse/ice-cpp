#!/usr/bin/env node
/* Скрипт для компиляции C++ проектов.
 */

var config = require('./config');
var ice = require('ice');
require('./rules');

// запустить компиляцию целей
for ( var i = 0; i < config.targets.length; ++i)
	ice.make(config.targets[i]);
