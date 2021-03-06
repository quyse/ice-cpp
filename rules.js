var config = require('./config');
var ice = require('ice');
var fs = require('fs');
var actions = require('./actions');
var Configurator = require('./configurator');

var getPath = function(fileName) {
	return /^(.+\/)?.+$/.exec(fileName)[1] || '';
};

/**
 * найти все включения #include в исходнике
 */
var findIncludeDeps = function(fileName, callback) {
	fs.readFile(fileName, 'utf8', function(err, data) {
		if (err)
			callback(err, null);
		else {
			var re = /\s*\#\s*include\s*\"(.+)\"/gm;
			var a, arr = [];
			while (a = re.exec(data))
				arr.push(a[1]);
			callback(null, arr);
		}
	});
};

/**
 * кэш непосредственных зависимостей заголовочных файлов
 */
var cachedHeaderDependencies = {};
/**
 * найти все зависимости для заголовочного файла
 */
var getHeaderDeps = function(headerFile, callback) {
	if (cachedHeaderDependencies[headerFile] === undefined) {
		findIncludeDeps(headerFile, function(err, headerFiles) {
			if (err)
				callback(err, null);
			else {
				cachedHeaderDependencies[headerFile] = headerFiles;
				callback(null, headerFiles);
			}
		});
	} else
		callback(null, cachedHeaderDependencies[headerFile]);
};
/**
 * найти все зависимости для cpp-файла
 */
var getCppHeaderDeps = function(cppFile, file, callback) {
	// список заголовочных файлов на просмотр зависимостей
	var headerQueue = [];
	// сет результирующего списка зависимостей
	var resultSet = {};

	// такой хак: первый файл в очереди - сам cpp
	headerQueue.push(cppFile);

	var i = 0;
	var step = function() {
		if (i < headerQueue.length) {
			var headerFile = headerQueue[i++];

			// получить путь до файла
			var path = getPath(headerFile);

			if (resultSet[headerFile] === undefined) {
				resultSet[headerFile] = true;

				getHeaderDeps(headerFile, function(err, files) {
					if (err) {
						// игнорировать ошибку; просто зависимости не добавятся
						// file.error(err);
					} else {
						if (headerFile != cppFile)
							file.dep(headerFile);
						for ( var i = 0; i < files.length; ++i)
							headerQueue.push(path + files[i]);
					}
					step();
				});
			} else
				step();
		} else
			callback();
	};
	step();
};

// obj/file.o <= file.cpp
ice.rule(new RegExp('^(.+)' + ice.utils.regexpEscape(config.objectExt) + '$'), function(a, file) {
	// имя объектного файла без расширения
	var objectFile = a[1];

	var configurator = Configurator.getForFile(objectFile);
	var compiler = new actions.Compiler();
	configurator.configurator.configureCompiler(configurator.fullToRelative(objectFile), compiler);
	compiler.toFull(configurator);
	file.dep(compiler.sourceFile);
	file.waitDeps(function() {
		getCppHeaderDeps(compiler.sourceFile, file, function() {
			file.waitDeps(function() {
				var args = config.platformModule.setCompileOptions(objectFile + config.objectExt, compiler);

				actions.launchProcess(config.platformModule.compileCommand, args, function(err) {
					if (err)
						file.error(err);
					else
						file.ok();
				});
			});
		});
	}, true);

});

// правило для исполняемых файлов и DLL
ice.rule(new RegExp('^(.+)(' + ice.utils.regexpEscape(config.executableExt) + '|' + ice.utils.regexpEscape(config.dllExt) + ')$'), function(a, file) {
	// имя исполняемого файла без расширения
	var executableFile = a[1];

	var configurator = Configurator.getForFile(executableFile);
	var linker = new actions.Linker();
	linker.dll = (a[2] == config.dllExt);
	configurator.configurator.configureLinker(configurator.fullToRelative(executableFile), linker);
	linker.toFull(configurator);
	for ( var i = 0; i < linker.objectFiles.length; ++i)
		file.dep(linker.objectFiles[i]);
	for ( var i = 0; i < linker.staticLibraries.length; ++i)
		file.dep(linker.staticLibraries[i]);
	for ( var i = 0; i < linker.resFiles.length; ++i)
		file.dep(linker.resFiles[i]);
	if(linker.defFile)
		file.dep(linker.defFile);
	file.waitDeps(function() {
		var args = config.platformModule.setLinkOptions(a[0], linker);

		actions.launchProcess(config.platformModule.linkCommand, args, function(err) {
			if (err)
				file.error(err);
			else
				file.ok();
		});
	});
});

// правило для библиотеки
ice.rule(new RegExp('^(.*)' + ice.utils.regexpEscape(config.libraryExt) + '$'), function(a, file) {
	// имя файла библиотеки без расширения
	var libraryFile = a[1];

	var configurator = Configurator.getForFile(libraryFile);
	var composer = new actions.Composer();
	configurator.configurator.configureComposer(configurator.fullToRelative(libraryFile), composer);
	if(composer.skip) {
		file.ok(true);
		return;
	}
	composer.toFull(configurator);
	for ( var i = 0; i < composer.objectFiles.length; ++i)
		file.dep(composer.objectFiles[i]);
	file.waitDeps(function() {
		var args = config.platformModule.setComposeOptions(libraryFile + config.libraryExt, composer);

		actions.launchProcess(config.platformModule.composeCommand, args, function(err) {
			if (err)
				file.error(err);
			else
				file.ok();
		});
	});
});

// .res <= .rc
if(config.rcExt && config.resExt) ice.rule(new RegExp('^(.+)' + ice.utils.regexpEscape(config.resExt) + '$'), function(a, file) {
	// имя ресурсного файла без расширения
	var resourceFile = a[1];

	var configurator = Configurator.getForFile(resourceFile);
	var resourcer = new actions.Resourcer();
	configurator.configurator.configureResourcer(configurator.fullToRelative(resourceFile), resourcer);
	resourcer.toFull(configurator);
	file.dep(resourcer.resourceFile);
	file.waitDeps(function() {
		getCppHeaderDeps(resourcer.resourceFile, file, function() {
			file.waitDeps(function() {
				var args = config.platformModule.setResourceOptions(resourceFile + config.resExt, resourcer);

				actions.launchProcess(config.platformModule.compileResourceCommand, args, function(err) {
					if (err)
						file.error(err);
					else
						file.ok();
				});
			});
		});
	}, true);

});
