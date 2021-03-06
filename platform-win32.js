/* Файл содержит процедуры, специфичные для компиляции под Windows через MS C++ Compiler 2010.
 */

var config = require('./config');

var toolchain = config.toolchain = config.toolchain || 'msvc';

exports.compileCommand = 'cl';
// http://msdn.microsoft.com/en-us/library/19z1t1wy.aspx
var compileOptions = {
	all: [ // опции для обоих конфигураций
	'/nologo', // без тупой строки
	'/c', // не выполнять линковку
	'/EHsc', // модель исключений: catch перехватывает только C++-исключения
	'/arch:SSE2', // использовать SSE2
	'/fp:fast', // быстрая арифметика с плавающей точкой
	'/W3', // уровень предупреждений
	'/D_CRT_SECURE_NO_WARNINGS', // отключить лишние предупреждения
	'/D_SCL_SECURE_NO_WARNINGS', // отключить лишние предупреждения
	'/wd4297', // не предупреждать об исключениях в деструкторах
	],
	debug: [ // опции для отладочной конфигурации
	'/D_DEBUG', // макрос _DEBUG
	'/Od', // без оптимизации
	'/MDd', // стандартная библиотека C/C++ - Multithreaded Debug DLL
	'/Z7', // отладочная информация в obj, без Edit&Continue
	],
	release: [ // опции для релизной конфигурации
	'/D_RELEASE', // макрос _RELEASE
	'/O2', // оптимизация для скорости
	'/MT', // стандартная библиотека C/C++ - Multithreaded Static
	'/GL', // whole program optimization
	'/Gy', // function-level linking
	'/Z7', // отладочная информация в obj, без Edit&Continue, для сервера крашей
	]
};
exports.setCompileOptions = function(objectFile, compiler) {
	var args = config.getOptions(compileOptions, compiler.configuration);
	for ( var i = 0; i < compiler.includeDirs.length; ++i) {
		args.push('/I');
		args.push(compiler.includeDirs[i]);
	}
	for ( var i = 0; i < compiler.macros.length; ++i)
		args.push('/D' + compiler.macros[i]);
	args.push('/Fo' + objectFile);
	args.push(compiler.sourceFile);

	if(compiler.strict)
		args.push('/WX'); // считать все предупреждения ошибками

	return args;
};
exports.objectExt = '.obj';

exports.linkCommand = 'link';
// http://msdn.microsoft.com/en-us/library/y0zzbyt4.aspx
var linkOptions = {
	all: [ // опции для обоих конфигураций
	'/NOLOGO', // без тупой строки
	'/INCREMENTAL:NO', // отключить инкрементную линковку
	'/WX', // считать предупреждения ошибками
	],
	debug: [ // опции для отладочной конфигурации
	'/DEBUG', // включить отладочную информацию
	],
	release: [ // опции для релизной конфигурации
	'/DEBUG', // включить отладочную информацию (для сервера крашей)
	'/LTCG', // whole program optimization
	'/OPT:REF', // удалять неиспользуемые функции
	]
};
exports.setLinkOptions = function(executableFile, linker) {
	var args = config.getOptions(linkOptions, linker.configuration);
	if(linker.dll)
		args.push('/DLL');
	if(linker.defFile)
		args.push('/DEF:' + linker.defFile);
	return args.concat('/OUT:' + executableFile, linker.objectFiles, linker.dynamicLibraries, linker.staticLibraries, linker.resFiles);
};
exports.executableExt = '.exe';
exports.dllExt = '.dll';

exports.composeCommand = 'lib';
// http://msdn.microsoft.com/en-us/library/7ykb2k5f.aspx
var composeOptions = {
	all: [ // опции для обоих конфигураций
	'/NOLOGO', // без тупой строки
	'/WX', // считать предупреждения ошибками
	],
	debug: [ // опции для отладочной конфигурации
	],
	release: [ // опции для релизной конфигурации
	'/LCTG', // whole program optimization
	]
};
exports.setComposeOptions = function(libraryFile, composer) {
	var args = config.getOptions(composeOptions, composer.configuration);
	return args.concat('/OUT:' + libraryFile, composer.objectFiles);
};
exports.libraryExt = '.lib';

exports.compileResourceCommand = 'rc';
// https://msdn.microsoft.com/en-us/library/windows/desktop/aa381055
var compileResourceOptions = {
	all: [ // опции для обоих конфигураций
	],
	debug: [ // опции для отладочной конфигурации
	],
	release: [ // опции для релизной конфигурации
	]
};
exports.setResourceOptions = function(resourceFile, resourcer) {
	var args = config.getOptions(compileResourceOptions, resourcer.configuration);
	return args.concat('/fo', resourceFile, resourcer.resourceFile);
};
exports.rcExt = '.rc';
exports.resExt = '.res';
