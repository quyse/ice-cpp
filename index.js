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
// если задан файл с переменными окружения
if (args[1])
	addEnvFile(args[1]);

// цель компиляции
// если вида type:file, то добавить расширение, соответствующее типу цели
var target = args[0];

var a = /^([^\:]+)\:(.+)$/.exec(target);
if (a) {
	target = a[2];
	switch (a[1]) {
	case 'exe':
	case 'executable':
		target += config.executableExt;
		break;
	case 'a':
	case 'lib':
	case 'library':
		target += config.libraryExt;
		break;
	case 'o':
	case 'obj':
	case 'object':
		target += config.objectExt;
		break;
	default:
		throw new Error('Invalid target type: ' + a[1]);
	}
}

ice.make(target);
