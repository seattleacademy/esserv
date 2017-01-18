var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

//var www = path.resolve(process.env.WWW_ROOT || '/home');
var context = new Map();
var emptyHandler = function(ctx, req, res, next) { return next(); };

app.use(bodyParser.json());

app.use(function(req, res, next) {
	if (path.extname(req.path) !== '.es') return next();
	//var name = path.join(www, req.path);
	var name = require.resolve(req.path);

	var prev = require.cache[name] ? require.cache[name].exports : emptyHandler;
	var handler = emptyHandler;

	delete require.cache[require.resolve(name)];

	fs.exists(name, function (exists) {
		if (exists) handler = require(name);

		if (!context.has(name)) {
			context.set(name, handler.ctx || Object.create(null));
		}
		var ctx = context.get(name);

		var logstream = fs.createWriteStream(name + '.log');

		var _outwrite = process.stdout.write;
		var _errwrite = process.stderr.write;

		process.stdout.write = process.stderr.write = logstream.write.bind(logstream);

		if (typeof prev.teardown === 'function') prev.teardown(ctx, handler);
		if (typeof handler.setup === 'function') handler.setup(ctx, prev);

		_outwrite.call(process.stdout, 'Serving: ' + name);
		logstream.write('test');

		if (typeof handler === 'function') return handler.call(this, ctx, req, res, next);
		else if (typeof handler.handler === 'function') return handler.handler.call(this, ctx, req, res, next);
		else { throw new Error('Cannot call handler! Make sure you\'re exporting a function or an object with a .handle method'); }

		process.stdout.write = _outwrite;
		process.stderr.write = _errwrite;
		logstream.flush();
		logstream.end();
	}.bind(this));
});

app.use(express.static('/var/www'));

app.listen(process.env.PORT || 8395, '0.0.0.0');
