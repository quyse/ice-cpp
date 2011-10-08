/* Файл содержит процедуры, специфичные для компиляции под Windows через MS C++ Compiler 2010.
 */

exports.compileCommand = 'cl';
// http://msdn.microsoft.com/en-us/library/19z1t1wy.aspx
exports.compileOptions = {
	all: [ // опции для обоих конфигураций
	'/c', // не выполнять линковку
	'/EHs', // модель исключений: catch перехватывает только C++-исключения
	'/arch:SSE2', // использовать SSE2
	'/fp:fast', // быстрая арифметика с плавающей точкой
	'/GR-', // отключить RTTI
	'/W3', // уровень предупреждений
	],
	debug: [ // опции для отладочной конфигурации
	'/D_DEBUG', // макрос _DEBUG
	'/Od', // без оптимизации
	'/MDd', // стандартная библиотека C/C++ - Multithreaded Debug DLL
	'/Zi', // отладочная информация в pdb, без Edit&Continue
	],
	release: [ // опции для релизной конфигурации
	'/D_RELEASE', // макрос _RELEASE
	'/O2', // оптимизация для скорости
	'/MT', // стандартная библиотека C/C++ - Multithreaded Static
	'/GL', // whole program optimization
	'/Gy', // function-level linking
	]
};
exports.setCompileFiles = function(args, cppFile, objectFile) {
	return args.concat('/Fo' + objectFile, cppFile);
};
exports.objectExt = '.obj';

exports.linkCommand = 'link';
// http://msdn.microsoft.com/en-us/library/y0zzbyt4.aspx
exports.linkOptions = {
	all: [ // опции для обоих конфигураций
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
exports.setLinkFiles = function(args, objectFiles, targetFile) {
	return args.concat('/OUT:' + targetFile, objectFiles);
};
exports.executableExt = '.exe';

exports.composeCommand = 'lib';
// http://msdn.microsoft.com/en-us/library/7ykb2k5f.aspx
exports.composeOptions = {
	all: [ // опции для обоих конфигураций
	'/WX', // считать предупреждения ошибками
	],
	debug: [ // опции для отладочной конфигурации
	],
	release: [ // опции для релизной конфигурации
	'/LCTG', // whole program optimization
	]
};
exports.setComposeFiles = function(args, objectFiles, targetFile) {
	return args.concat('/OUT:' + targetFile, objectFiles);
};
exports.libraryExt = '.lib';

exports.addMacro = function(args, macro) {
	return args.concat('/D' + macro);
};

exports.addIncludeDir = function(args, dir) {
	return args.concat('/I', dir);
};
