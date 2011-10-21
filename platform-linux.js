/* Файл содержит процедуры, специфичные для компиляции под Linux через GCC.
 */

exports.compileCommand = 'g++';
exports.compileOptions = {
	all: [ // опции для обоих конфигураций
	'-fmessage-length=0', // отключить перенос слишком длинных строк
	'-Wall', // показывать все (большинство) предупреждений
	'-Werror', // превращать предупреждения в ошибки
	'-c', // не выполнять линковку
	'-ffast-math', // быстрая арифметика с плавающей точкой
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
exports.setCompileFiles = function(args, cppFile, objectFile) {
	return args.concat('-o', objectFile, cppFile);
};
exports.objectExt = '.o';

exports.linkCommand = 'g++';
// http://gcc.gnu.org/onlinedocs/gcc-3.3/gcc/Link-Options.html
exports.linkOptions = {
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
exports.setLinkFiles = function(args, objectFiles, targetFile) {
	return args.concat(objectFiles, '-o', targetFile);
};
exports.executableExt = '';

exports.composeCommand = 'ar';
exports.composeOptions = {
	all: [ // опции для обоих конфигураций
	'-r', // добавлять файлы с заменой
	],
	debug: [ // опции для отладочной конфигурации
	],
	release: [ // опции для релизной конфигурации
	]
};
exports.setComposeFiles = function(args, objectFiles, targetFile) {
	return args.concat(targetFile, objectFiles);
};
var libraryExt = exports.libraryExt = '.a';

exports.addMacro = function(args, macro) {
	return args.concat('-D' + macro);
};

exports.addIncludeDir = function(args, dir) {
	return args.concat('-I', dir);
};

exports.addDynamicLibrary = function(args, library) {
	return args.concat('-l' + library);
};

exports.addStaticLibrary = function(args, library) {
	return args.concat(library + libraryExt);
};
