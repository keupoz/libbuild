const colors = require('colors');

function t2s (n) {
	return n.toString().padStart(2, '0');
}

function deltaTime (startTime) {
	let delta = Date.now() - startTime;
	return delta > 1e3 ? delta * 1e-3 + 's' : delta + 'ms';
}

class Logger {
	constructor () {
		this.enabled = false;
	}
	
	get timestamp () {
		let date = new Date(),
		    h = t2s(date.getHours()),
		    m = t2s(date.getMinutes()),
		    s = t2s(date.getSeconds());
		
		return `[${h}:${m}:${s}]`;
	}
	
	log (...msg) {
		if (this.enabled) console.log(this.timestamp.blue.bold, ...msg);
	}
	
	error (...err) {
		if (this.enabled) {
			if (typeof err[0] == 'string') err[0] = err[0].red.bold;
			this.log(...err);
		} else throw err;
	}
	
	async task (start, end, task) {
		this.log(start);
		let startTime = Date.now(),
		    result;
		
		if (task[Symbol.toStringTag] === 'AsyncFunction') result = await task();
		else if (task instanceof Promise) result = await task;
		else result = task();
		
		let resultTime = deltaTime(startTime);
		this.log(end.replace('%s', resultTime.green.bold));
		
		return task;
	}
}

module.exports = new Logger();
