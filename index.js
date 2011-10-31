#!/usr/bin/env node
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

// список целей
var targets = [];

// обработать аргументы
// аргументы, начинающиеся на дефис - параметры
var args = process.argv.slice(2);
for ( var i = 0; i < args.length; ++i) {
	var arg = args[i];
	// если параметр
	if (arg.length > 0 && arg[0] == '-') {
		switch (arg) {
		case '-env':
			if (++i >= args.length)
				throw new Error('env file not specified for -env');
			addEnvFile(args[i]);
			break;
		default:
			throw new Error('unknown option: ' + arg);
		}
	}
	// иначе цель
	else {
		// если вида type:file, то добавить расширение, соответствующее типу цели
		var target = arg;
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
				throw new Error('invalid target type: ' + a[1]);
			}
		}
		targets.push(target);
	}
}

// запустить компиляцию целей
for ( var i = 0; i < targets.length; ++i)
	ice.make(targets[i]);
