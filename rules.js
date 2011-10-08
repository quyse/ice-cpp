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

/** найти заголовочные файлы в исходнике
 */
var findIncludeDeps = function(fileName, file, callback) {
	fs.readFile(fileName, 'utf8', function(err, data) {
		if (err)
			file.error(err);
		else {
			var re = /\s*#\s*include\s*\"(.+)\"/gm;
			var a;
			while (a = re.exec(data))
				file.dep(config.srcDir + a[1]);
			callback();
		}
	});
};

// .hpp
ice.rule(new RegExp('^' + ice.utils.regexpEscape(config.srcDir) + '(.+\\.hpp)$'), function(a, file) {
	var hppFile = config.srcDir + a[1];
	findIncludeDeps(hppFile, file, function() {
		file.waitDeps(function() {
			file.ok();
		});
	});
});

// obj/file.o <= file.cpp
ice.rule(new RegExp('^(?:.*\\/)??([^\\/]+)' + ice.utils.regexpEscape(config.objectExt) + '$'), function(a, file) {
	var objFile = a[0];
	var cppFile = config.srcDir + a[1] + '.cpp';
	file.dep(cppFile);
	file.waitDeps(function() {
		findIncludeDeps(cppFile, file, function() {
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
