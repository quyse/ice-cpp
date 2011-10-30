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
exports.setCompileOptions = function(args, objectFile, compiler) {
	args = args.concat();
	for ( var i = 0; i < compiler.includeDirs.length; ++i) {
		args.push('-I');
		args.push(compiler.includeDirs[i]);
	}
	for ( var i = 0; i < compiler.macros.length; ++i)
		args.push('-D' + compiler.macros[i]);
	args.push('-o');
	args.push(objectFile);
	args.push(compiler.sourceFile);
	return args;
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
exports.setLinkOptions = function(args, executableFile, linker) {
	return args.concat(linker.objectFiles, linker.dynamicLibraries.map(function(v) {
		return '-l' + v;
	}), linker.staticLibraries, '-o', targetFile);
};
exports.executableExt = '.exe';

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
exports.setComposeOptions = function(args, libraryFile, composer) {
	return args.concat(libraryFile, composer.objectFiles);
};
var libraryExt = exports.libraryExt = '.a';
