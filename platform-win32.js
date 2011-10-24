/* Файл содержит процедуры, специфичные для компиляции под Windows через MS C++ Compiler 2010.
 */

exports.compileCommand = 'cl';
// http://msdn.microsoft.com/en-us/library/19z1t1wy.aspx
exports.compileOptions = {
	all: [ // опции для обоих конфигураций
	'/nologo', // без тупой строки
	'/c', // не выполнять линковку
	'/EHs', // модель исключений: catch перехватывает только C++-исключения
	'/arch:SSE2', // использовать SSE2
	'/fp:fast', // быстрая арифметика с плавающей точкой
	'/GR-', // отключить RTTI
	'/W3', // уровень предупреждений
	'/D_CRT_SECURE_NO_WARNINGS', // отключить лишние предупреждения
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
	]
};
exports.setCompileOptions = function(args, objectFile, compiler) {
	args = args.concat();
	for ( var i = 0; i < compiler.includeDirs.length; ++i) {
		args.push('/I');
		args.push(compiler.includeDirs[i]);
	}
	for ( var i = 0; i < compiler.macros.length; ++i)
		args.push('/D' + compiler.macros[i]);
	args.push('/Fo' + objectFile);
	args.push(compiler.sourceFile);
	return args;
};
exports.objectExt = '.obj';

exports.linkCommand = 'link';
// http://msdn.microsoft.com/en-us/library/y0zzbyt4.aspx
exports.linkOptions = {
	all: [ // опции для обоих конфигураций
	'/NOLOGO', // без тупой строки
	'/INCREMENTAL:NO', // отключить инкрементную линковку
	'/WX', // считать предупреждения ошибками
	],
	debug: [ // опции для отладочной конфигурации
	'/DEBUG', // включить отладочную информацию
	],
	release: [ // опции для релизной конфигурации
	'/LCTG', // whole program optimization
	'/OPT:REF', // удалять неиспользуемые функции
	]
};
exports.setLinkOptions = function(args, executableFile, linker) {
	return args.concat('/OUT:' + executableFile, linker.objectFiles, linker.dynamicLibraries, linker.staticLibraries);
};
exports.executableExt = '.exe';

exports.composeCommand = 'lib';
// http://msdn.microsoft.com/en-us/library/7ykb2k5f.aspx
exports.composeOptions = {
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
exports.setComposeOptions = function(args, libraryFile, composer) {
	return args.concat('/OUT:' + libraryFile, composer.objectFiles);
};
exports.libraryExt = '.lib';
