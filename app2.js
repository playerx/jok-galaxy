/*
 *   Jok.ge - Pusher Service
 *  -------------------------
 *   პორტალის მომხმარებლების კომუნიკაცია, თამაშების შეთავაზება და აქტური
 *   ონლაინ მეგობრების შესახებ ინფორმაციის მიწოდება
 *  -------------------------
 *   It's node time :)
 */


process.env.ENV = 'production';


/* [Modules Import] */
var http = require('http')
  , express = require('express')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path')



var $ = {
    get: function(url, cb) {

        if (!cb) cb = function() {};

        var options = {
          hostname: 'api.jok.ge',
          port: 80,
          path: url,
          method: 'GET'
        };

        var req = http.request(options, function(res) {

            var data = '';

            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function (chunk) {
                try{
                    cb(JSON.parse(data));
                }
                catch(err) { cb(); }
            });
        });

        req.on('error', function(e) {
          cb();
        });

        req.end();
    }
}



/* [Configuration] */
app.configure(function(){
    app.set('port', process.env.PORT || 9003);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    // app.use(express.logger('dev'));
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '')));
    
    // io.enable('browser client minification');
    // io.enable('browser client gzip');          // gzip the file
    io.enable('browser client etag');          // apply etag caching logic based on version number
    
    io.set('log level', 0);                    // reduce logging
    io.set('heartbeat timeout', 15);
    io.set('heartbeat interval', 10);
    io.set('close timeout', 20);
    io.set('polling duration', 10);
    io.set('authorization', function (handshakeData, callback) {

        var ipaddress = handshakeData.address.address;
        var sid = handshakeData.query.sid;


        $.get('/user/' + sid + '/getinfo?ipaddress=' + ipaddress, function(result) {
            if (!result || !result.IsSuccess) {
                callback(null, false);
            }

            handshakeData.UserID = result.UserID;

            callback(null, true);
        });
    });

    io.set('transports', [
        // 'websocket',
        // 'flashsocket',
        'xhr-polling',
        // 'htmlfile',
        'jsonp-polling'
    ]);
});

app.configure('development', function(){
    app.use(express.errorHandler());
});






/* Routing */
app.get('/', function(req, res) {
    try {
        res.render('index', { 
            title: 'Express', 
            sid: req.query.sid, 
            room: req.query.room 
        });
    } catch(ex) {
        res.end(JSON.stringify(ex));
    }
});



var clients = {};

/* [Service] */
io.on('connection', function(socket){
    
    var userid = socket.handshake.UserID;
    var clientid = Math.random().toString().replace("0.", "");

    clients[clientid] = socket;

    ws.gameServer.onconnect(clientid, '');

    console.log('connected!', userid, clientid);



    socket.on('data_message', function(message) {

        ws.gameServer.onmessage(clientid, message);
    });
    
    socket.on('disconnect', function() {
        console.log('disconnect');

        if (clientid in clients) {
            delete clients[clientid];
        }

        ws.gameServer.ondisconnect(clientid, '', '');
    });
});














var Game = require('./jsfiles-loader').Game
var urlParser = require('url');
var http = require('http');

var port = process.env.PORT || 9003;


var $ = {
    get: function(url, cb) {

        if (!cb) cb = function() {};

        var options = {
          hostname: 'api.jok.ge',
          port: 80,
          path: url,
          method: 'GET'
        };

        var req = http.request(options, function(res) {

            var data = '';

            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function (chunk) {
                try{
                    cb(JSON.parse(data));
                }
                catch(err) { cb(); }
            });
        });

        req.on('error', function(e) {
          cb();
        });

        req.end();
    }
}

/* Wrapper instance to get Game.Server */
var ws = {
    isInitialized: false,
    initialize: function() {
        if (ws.isInitialized) return;


        new Game.Server(ws).start();
    },
    addApplication: function(gameServer) {
        ws.gameServer = gameServer;
        ws.isInitialized = true;

        if (ws.gameServer.onidle) {
            setInterval(ws.gameServer.onidle.bind(ws.gameServer), 1000 / 60 /*FPS*/);
        }
    },
    send: function(id, data) {
        if (!(id in clients)) { return; }

        // console.log('sending', id, data)

        clients[id].emit('data_message', data);
    },
    setDebug: function() {

    },
    updateScore: function(dead_id, killer_id) {

        if (!(killer_id in clients)) { return; }
        var userid = clients[killer_id].userid;

        $.get('/game/' + userid + '/GalaxyRatingAdd?secret=sercet');
    }
}
ws.initialize();





/* Start */
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});










