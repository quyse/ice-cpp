var config = require('./config');
var child_process = require('child_process');
var invoking = require('./invoking');

/** запустить процесс
 */
var launchProcess = function(command, args, callback) {
	invoking.invoke(function(end) {
		var childProcess = child_process.spawn(command, args, {
			env: config.env
		});

		var err = '';
		childProcess.stdout.on('data', function(data) {
			err += data;
		});
		childProcess.stderr.on('data', function(data) {
			err += data;
		});

		childProcess.on('exit', function(code) {
			callback(code == 0 ? null : err);
			end();
		});
	});
};

/** Скомпилировать объектный файл.
 */
exports.compile = function(cppFile, objectFile, callback) {
	var args = config.compileOptions;
	args = config.platformModule.setCompileFiles(args, cppFile, objectFile);

	launchProcess(config.platformModule.compileCommand, args, callback);
};

/** Слинковать исполняемый файл.
 */
exports.link = function(objectFiles, targetFile, callback) {
	var args = config.linkOptions;
	args = config.platformModule.setLinkFiles(args, objectFiles, targetFile);

	launchProcess(config.platformModule.linkCommand, args, callback);
};

exports.compose = function(objectFiles, targetFile, callback) {
	var args = config.composeOptions;
	args = config.platformModule.setComposeFiles(args, objectFiles, targetFile);

	launchProcess(config.platformModule.composeCommand, args, callback);
};
