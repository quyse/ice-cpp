var config = require('./config');
var ice = require('ice');
var fs = require('fs');
var actions = require('./actions');

/** считать файл-список
 */
var readListFile = function(fileName, file, callback) {
	fs.readFile(fileName, 'utf8', function(err, data) {
		if (err)
			file.error(err);
		else {
			var a = data.split(/\s+/);
			var b = [];
			for ( var i = 0; i < a.length; ++i)
				if (a[i].length > 0)
					b.push(a[i]);
			callback(b);
		}
	});
};

/** найти все включения #include в исходнике
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

/** кэш непосредственных зависимостей заголовочных файлов
 */
var cachedHeaderDependencies = {};
/** найти все зависимости для заголовочного файла
 */
var getHeaderDeps = function(headerFile, callback) {
	if (cachedHeaderDependencies[headerFile] === undefined) {
		findIncludeDeps(config.srcDir + headerFile, function(err, headerFiles) {
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
/** найти все зависимости для cpp-файла
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

			if (resultSet[headerFile] === undefined) {
				if (headerFile != cppFile)
					file.dep(config.srcDir + headerFile);
				resultSet[headerFile] = true;

				getHeaderDeps(headerFile, function(err, files) {
					if (err)
						file.error(err);
					else {
						headerQueue = headerQueue.concat(files);
						step();
					}
				});
			} else
				step();
		} else
			callback();
	};
	step();
};

// obj/file.o <= file.cpp
ice.rule(new RegExp('^(?:.*\\/)??([^\\/]+)' + ice.utils.regexpEscape(config.objectExt) + '$'), function(a, file) {
	var objFile = a[0];
	var cppFileTitle = a[1] + '.cpp';
	var cppFile = config.srcDir + cppFileTitle;
	file.dep(cppFile);
	file.waitDeps(function() {
		getCppHeaderDeps(cppFileTitle, file, function() {
			file.waitDeps(function() {
				actions.compile(cppFile, objFile, function(err) {
					if (err)
						file.error(err);
					else
						file.ok();
				});
			});
		});
	}, true);
});

// правило для библиотеки
ice.rule(new RegExp('^(.*\\/)??(([^\\/]+)' + ice.utils.regexpEscape(config.libraryExt) + ')$'), function(a, file) {
	var dir = a[1] || '';
	var libraryFile = dir + a[2];
	var listFile = a[3] + '.lst';

	readListFile(listFile, file, function(files) {
		files = files.map(function(v) {
			return config.objDir + v + config.objectExt;
		});
		file.dep.apply(file, files);
		file.waitDeps(function() {
			actions.compose(files, libraryFile, function(err) {
				if (err)
					file.error(err);
				else
					file.ok();
			});
		});
	});
});

// правило для исполняемых файлов
ice.rule(new RegExp('^(.*\\/)??(([^\\/\\.]+)' + ice.utils.regexpEscape(config.executableExt) + ')$'), function(a, file) {
	var dir = a[1] || '';
	var executableFile = dir + a[2];
	var listFile = a[3] + '.lst';

	readListFile(listFile, file, function(files) {
		files = files.map(function(v) {
			return config.objDir + v + config.objectExt;
		});
		file.dep.apply(file, files);
		file.waitDeps(function() {
			actions.link(files, executableFile, function(err) {
				if (err)
					file.error(err);
				else
					file.ok();
			});
		});
	});
});
