/* Скрипт для компиляции C++ проектов.
 */

var config = require('./config');
var ice = require('ice');
require('./rules');
var fs = require('fs');

var addEnvFile = function(envFile) {
	var data = fs.readFileSync(envFile, 'utf8');
	var re = /^(\w+)\=(.*)$/gm;
	var a, env = {};
	while (a = re.exec(data))
		env[a[1]] = a[2];
	addEnv(env);
};

var addEnv = exports.addEnv = function(env) {
	for ( var i in env)
		config.env[i] = env[i];
};

var args = process.argv.slice(2);
if (args.length < 1)
	throw new Error('not enough arguments');
if (args[1])
	addEnvFile(args[1]);
var target = args[0];
ice.make(target);
