/* Файл содержит процедуры, специфичные для компиляции под Linux.
 */

var config = require('./config');

var toolchain = config.toolchain = config.toolchain || 'clang';

// компиляторы: gcc и clang

var compileOptions;
switch(toolchain) {
case 'gcc':
	exports.compileCommand = 'gcc';
	compileOptions = {
		all: [ // опции для обоих конфигураций
		'-fmessage-length=0', // отключить перенос слишком длинных строк
		'-Wall', // показывать все (большинство) предупреждений
		'-Wno-unused-local-typedefs',
		'-Wno-unused-variable',
		'-c', // не выполнять линковку
		'-ffast-math', // быстрая арифметика с плавающей точкой
		'-fPIC', // перемещаемые адреса
		],
		debug: [ // опции для отладочной конфигурации
		'-O0', // без оптимизации
		'-D_DEBUG', // макрос _DEBUG
		'-ggdb', // отладочная информация в формате GDB (самая полная)
		],
		release: [ // опции для релизной конфигурации
		'-O3', // полная оптимизация
		'-D_RELEASE', // макрос _RELEASE
		]
	};
	break;
case 'clang':
	exports.compileCommand = 'clang';
	compileOptions = {
		all: [ // опции для обоих конфигураций
		'-fmessage-length=0', // отключить перенос слишком длинных строк
		'-Wall', // показывать все (большинство) предупреждений
		'-c', // не выполнять линковку
		'-ffast-math', // быстрая арифметика с плавающей точкой
		'-Wno-address-of-temporary', // разрешить брать адрес от временных объектов
		'-fcolor-diagnostics', // всегда выводить цветной вывод
		'-fPIC',
		'-Wno-unknown-pragmas',
		'-arch', 'i386', '-arch', 'x86_64', // универсальные бинарники
		],
		debug: [ // опции для отладочной конфигурации
		'-O0', // без оптимизации
		'-D_DEBUG', // макрос _DEBUG
		'-ggdb', // отладочная информация в формате GDB (самая полная)
		],
		release: [ // опции для релизной конфигурации
		'-O3', // полная оптимизация
		'-D_RELEASE', // макрос _RELEASE
		]	};
	break;
default:
	throw 'unknown toolchain: ' + toolchain;
}
exports.setCompileOptions = function(objectFile, compiler) {
	var args = config.getOptions(compileOptions, compiler.configuration);
	if(compiler.cppMode) {
		args.push(toolchain == 'clang' ? '-std=c++11' : '-std=c++0x'); // C++ 11
		args.push('-fvisibility=hidden'); // hide symbols which not explicitly visible
		args.push('-fvisibility-inlines-hidden'); // hide inline symbols
	} else {
		args.push(toolchain == 'clang' ? '-std=c11' : '-std=c11'); // C11
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
case 'gcc':
	exports.linkCommand = 'g++';
	// http://gcc.gnu.org/onlinedocs/gcc-3.3/gcc/Link-Options.html
	var linkOptions = {
		all: [ // опции для обоих конфигураций
		'-fmessage-length=0', // отключить перенос слишком длинных строк
		'-Wall', // показывать большинство ошибок
		'-Werror', // превращать предупреждения в ошибки
		],
		debug: [ // опции для отладочной конфигурации
		],
		release: [ // опции для релизной конфигурации
		'-s', // удалить всю отладочную информацию
		]
	};
	break;
case 'clang':
	exports.linkCommand = 'clang++';
	var linkOptions = {
		all: [ // опции для обоих конфигураций
		'-fmessage-length=0', // отключить перенос слишком длинных строк
		'-Wall', // показывать большинство ошибок
		'-Werror', // превращать предупреждения в ошибки
		'-fcolor-diagnostics', // всегда выводить цветной вывод
		'-arch', 'i386', '-arch', 'x86_64', // универсальные бинарники
		],
		debug: [ // опции для отладочной конфигурации
		],
		release: [ // опции для релизной конфигурации
		'-s', // удалить всю отладочную информацию
		]
	};
	break;
default:
	throw 'unknown toolchain: ' + toolchain;
}
exports.setLinkOptions = function(executableFile, linker) {
	var args = config.getOptions(linkOptions, linker.configuration);
	args = args.concat(linker.objectFiles, linker.staticLibraries, linker.dynamicLibraries.map(function(v) {
		return '-l' + v;
	}), linker.dynamicLibraryPaths.map(function(v) {
		return '-L' + v;
	}));
	if(linker.dll)
		args.push('-shared')
	args.push('-o');
	args.push(executableFile);
	return args;
};
exports.executableExt = '.exe';
exports.dllExt = '.so';

exports.composeCommand = 'ar';
var composeOptions = {
	all: [ // опции для обоих конфигураций
	'-r', // добавлять файлы с заменой
	'-s', // сгенерировать индекс, необходимо для универсальных бинарников
	],
	debug: [ // опции для отладочной конфигурации
	],
	release: [ // опции для релизной конфигурации
	]
};
exports.setComposeOptions = function(libraryFile, composer) {
	var args = config.getOptions(composeOptions, composer.configuration);
	return args.concat(libraryFile, composer.objectFiles);
};
var libraryExt = exports.libraryExt = '.a';
