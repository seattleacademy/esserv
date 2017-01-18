module.exports = function (ctx, req, res) {
	ctx.counter++;
	res.status(200);
	res.type('html');
	res.write(`Hello World!\n\nThis page has been viewed ${ctx.counter} times (incluing this one)! <img src="testimg.png"/>`);
	res.end();
}

module.exports.ctx = { counter: 0 };
module.exports.setup = function (ctx, prev) {
	console.log(`Setup, c: ${ctx.counter}, pdt: ${prev._dt}, dt: ${this._dt}`);
}

module.exports.teardown = function (ctx, next) {
	console.log(`Teardown, c: ${ctx.counter}, dt: ${this._dt}, ndt: ${next._dt}`);
}
