/* Скрипт, конфигурирующий компиляцию.
 */

var fs = require('fs');

/**
 * добавить завершающий /, если нет
 */
var ensureDir = exports.ensureDir = function(dir) {
	if (dir.length > 0 && dir[dir.length - 1] != '/')
		return dir + '/';
	return dir;
};

// дополнительные переменные окружения
exports.env = process.env;

// платформа, под которую компилируем
exports.platform = process.env.PLATFORM || process.platform;
// компилятор, которым компилируем (undefined - компилятор по умолчанию)
exports.toolchain = process.env.TOOLCHAIN;

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
		exports.env[i] = env[i];
};

// список целей
var targets = exports.targets = [];

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
		case '-platform':
			if (++i >= args.length)
				throw new Error('platform not specified for -platform');
			exports.platform = args[i];
			break;
		default:
			throw new Error('unknown option: ' + arg);
		}
	}
	// иначе цель
	else
		targets.push(arg);
}

var platform = exports.platform;

var platformModule = exports.platformModule = require('./platform-' + platform);

var getOptions = exports.getOptions = function(options, configuration) {
	return options.all.concat(options[configuration]);
};

exports.objectExt = platformModule.objectExt;
exports.executableExt = platformModule.executableExt;
exports.dllExt = platformModule.dllExt;
exports.libraryExt = platformModule.libraryExt;

exports.maxRunningProcesses = 4;

// обработать таргеты
for(var i = 0; i < targets.length; ++i) {
	// если вида type:file, то добавить расширение, соответствующее типу цели
	var target = targets[i];
	var a = /^([^\:]+)\:(.+)$/.exec(target);
	if (a) {
		target = a[2];
		switch (a[1]) {
		case 'exe':
		case 'executable':
			target += exports.executableExt;
			break;
		case 'dll':
		case 'so':
			target += exports.dllExt;
			break;
		case 'a':
		case 'lib':
		case 'library':
			target += exports.libraryExt;
			break;
		case 'o':
		case 'obj':
		case 'object':
			target += exports.objectExt;
			break;
		default:
			throw new Error('invalid target type: ' + a[1]);
		}
		targets[i] = target;
	}
}
