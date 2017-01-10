/* Файл содержит процедуры, специфичные для компиляции под Linux.
 */

var config = require('./config');

var toolchain = config.toolchain = config.toolchain || 'emcc';

// компилятор: emcc

var emccCommand = process.platform == 'win32' ? 'emcc.bat' : 'emcc';

var compileOptions;
switch(toolchain) {
case 'emcc':
	exports.compileCommand = emccCommand;
	compileOptions = {
		all: [ // опции для обоих конфигураций
		'-fmessage-length=0', // отключить перенос слишком длинных строк
		'-Wall', // показывать все (большинство) предупреждений
		'-c', // не выполнять линковку
		'-ffast-math', // быстрая арифметика с плавающей точкой
		'-s', 'DOUBLE_MODE=0', // no reads of unaligned doubles
		'-s', 'PRECISE_I64_MATH=0',
		],
		debug: [ // опции для отладочной конфигурации
		'-O0', // без оптимизации
		'-D_DEBUG', // макрос _DEBUG
		'-g4', // debug info
		'-s', 'SAFE_HEAP=1',
		'-s', 'ABORTING_MALLOC=1',
		],
		release: [ // опции для релизной конфигурации
		'-O2', // полная оптимизация
		'--llvm-lto', '1', // link-time optimization
		'-D_RELEASE', // макрос _RELEASE
		]
	};
	break;
default:
	throw 'unknown toolchain: ' + toolchain;
}
exports.setCompileOptions = function(objectFile, compiler) {
	var args = config.getOptions(compileOptions, compiler.configuration);
	if(compiler.cppMode) {
		args.push('-std=c++0x'); // C++ 11
		args.push('-fvisibility=hidden'); // hide symbols which not explicitly visible
		args.push('-fvisibility-inlines-hidden'); // hide inline symbols
	}
	for ( var i = 0; i < compiler.includeDirs.length; ++i) {
		args.push('-I');
		args.push(compiler.includeDirs[i]);
	}
	for ( var i = 0; i < compiler.macros.length; ++i)
		args.push('-D' + compiler.macros[i]);
	args.push('-o');
	args.push(objectFile);
	args.push(compiler.sourceFile);

	if(compiler.strict)
		args.push('-Werror'); // превращать предупреждения в ошибки

	return args;
};
exports.objectExt = '.o';

switch(toolchain) {
case 'emcc':
	exports.linkCommand = emccCommand;
	// http://gcc.gnu.org/onlinedocs/gcc-3.3/gcc/Link-Options.html
	var linkOptions = {
		all: [ // опции для обоих конфигураций
		'-fmessage-length=0', // отключить перенос слишком длинных строк
		'-Wall', // показывать большинство ошибок
		'-Werror', // превращать предупреждения в ошибки
		],
		debug: [ // опции для отладочной конфигурации
		'-g4', // debug info
		'-s', 'SAFE_HEAP=1',
		'-s', 'ABORTING_MALLOC=1',
		],
		release: [ // опции для релизной конфигурации
		'-O2', // оптимизация
		'--llvm-lto', '1', // link-time optimization
		]
	};
	break;
default:
	throw 'unknown toolchain: ' + toolchain;
}
exports.setLinkOptions = function(executableFile, linker) {
	var args = config.getOptions(linkOptions, linker.configuration);
	return args.concat(linker.objectFiles, linker.staticLibraries, linker.dynamicLibraries.map(function(v) {
		return '-l' + v;
	}), '-o', executableFile);
};
exports.executableExt = '.js';
exports.dllExt = '.js';

exports.composeCommand = emccCommand;
var composeOptions = {
	all: [ // опции для обоих конфигураций
	'-fmessage-length=0', // отключить перенос слишком длинных строк
	'-Wall', // показывать большинство ошибок
	'-Werror', // превращать предупреждения в ошибки
	],
	debug: [ // опции для отладочной конфигурации
	'-g4', // debug info
	'-s', 'SAFE_HEAP=1',
	'-s', 'ABORTING_MALLOC=1',
	],
	release: [ // опции для релизной конфигурации
	]
};
exports.setComposeOptions = function(libraryFile, composer) {
	var args = config.getOptions(composeOptions, composer.configuration);
	return args.concat('-o', libraryFile, composer.objectFiles);
};
var libraryExt = exports.libraryExt = '.bc';
