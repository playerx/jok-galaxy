
var fs = require('fs')

/* mininal DOM environment */
var nullElm = {
	style: {},
	appendChild: function() {},
	getContext: function() {}
}
var window = {};
var location = {};
var document = {
	createElement: function() { return nullElm; }
};

var navigator = {userAgent:""};
var createjs = {};
global.setTimeout = function() {};

/* read all javascript files */
var html = fs.readFileSync(__dirname + '/index.html', 'utf-8');


var scripts = html.match(/js\/.*?\.js/g);
var totalScript = '';
for (var i=0;i<scripts.length;i++) {

    if (scripts[i].indexOf('jquery.min.js') > 0 ||
    	scripts[i].indexOf('jquery.cookie.js') > 0 ||
        scripts[i].indexOf('preloadjs-0.2.0.js') > 0 ||
        scripts[i].indexOf('setup.js') > 0) continue;

	console.log('loading: ' + scripts[i]);

	try {
		var scr = fs.readFileSync(__dirname + "/" + scripts[i], 'utf-8');
		totalScript += scr;
		eval(scr);
	} catch (e) {
		console.log(e);
	}
}
/* */

HAF.Engine.prototype.draw = function() { }


exports.Game = Game;
exports.Player = Player;