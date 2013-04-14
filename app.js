
process.env.ENV = 'production';

var Game = require('./jsfiles-loader')



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

		clients[id].send(data);
	},
	setDebug: function() {

	}
}
ws.initialize();




/* Web Server */
var WebSocketServer = require('websocket').server;
var static = require('node-static');
var file = new(static.Server)('./');


server = require('http').createServer(function(req, res) {

    req.on('data', function(data) {
    })

    req.on('end', function() {
        file.serve(req, res);
    })
});
server.listen(9003, function() {
    console.log((new Date()) + ' Server is listening on port 9003');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var userTricks = 0;
var clients = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    if (!ws.isInitialized) {
    	console.log('ws not initialized yet!');
    	return;
    }

    var connection = request.accept(null, request.origin);

    if (process.env.ENV != 'production') {
        // console.log(JSON.stringify(request.requestedProtocols));
        // console.log(JSON.stringify(request.requestedExtensions));
        // console.log((new Date()) + ' Connection accepted.');
    }

    connection.clientid = Math.random().toString().replace("0.", "");
    clients[connection.clientid] = connection;

    ws.gameServer.onconnect(connection.clientid, request.httpRequest.headers);


    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            if (process.env.ENV != 'production') {
                console.log('Received Message: ' + message.utf8Data);
            }

            connection.sendUTF(message.utf8Data);

        	ws.gameServer.onmessage(connection.clientid, message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }

    });
    connection.on('close', function(reasonCode, description) {
    	if (connection.clientid in clients) {
    		delete clients[connection.clientid];
    	}

        if (process.env.ENV != 'production') {
            // console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        }
    	ws.gameServer.ondisconnect(connection.clientid, '', '');
    });
    connection.on('error', function(err) {
        console.log((new Date()) + ' error: ' + err);
    });
});




// ws.gameServer.onconnect(connection.clientid, request.httpRequest.headers);

// ws.gameServer.onmessage(connection.clientid, message.utf8Data);

// ws.gameServer.ondisconnect(connection.clientid, '', '');




