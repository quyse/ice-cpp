/* Файл, управляющий запуском сторонних программ.
 * Допускает одновременный запуск ограниченного количества процессов.
 */

var config = require('./config');

var maxRunningProcesses = config.maxRunningProcesses;
var currentRunningProcesses = 0;

// очередь на запуск
var queue = [];

/** Запланировать запуск процесса.
 */
var invoke = exports.invoke = function(callback) {
	var launch = function() {
		callback(function() {
			currentRunningProcesses--;
			update();
		});
	};
	queue.push(launch);
	update();
};

/** Запустить процессы, если можно
 */
var update = function() {
	while (queue.length > 0 && currentRunningProcesses < maxRunningProcesses) {
		currentRunningProcesses++;
		queue.shift()();
	}
};
