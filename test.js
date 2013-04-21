
var Game = require('./jsfiles-loader').Game
var WebSocketClient = require('websocket').client



TestClient = function(){
}

TestClient.prototype.start = function() {
    this._socket = new WebSocketClient();

    this._socket.on('connect', this._open.bind(this))
    this._socket.on('message', this._message.bind(this))
    this._socket.on('close', this._close.bind(this))

    this._socket.connect('ws://37.153.97.80:9003/');
}

TestClient.prototype._open = function(connection) {

    /* send CREATE_PLAYER */

    this.connection = connection;

    var id = Math.random().toString().replace(/\D/g, "");
    var shipOptions = {
        color: 'yellow',
        type: 1,
        weaponType: 0
    }
    var data = {};

    data[id] = {
        name: 'player_' + id,
        score: 0,
        shipOptions: shipOptions
    }


    this._send(Game.MSG_CREATE_PLAYER, data);

    var randomX = Math.floor(Math.random() * (1000) + 1);
    var randomY = Math.floor(Math.random() * (1000) + 1);

    data = {};
    data[id] = {
        phys: {
            mass: 0.7,
            orientation: 0,
            decay: 0.5,
            position: [randomX, randomY],
            velocity: [0, 0] /* pixels per second */
        }
    }
    
    this._send(Game.MSG_CREATE_SHIP, data)
}

TestClient.prototype._message = function(e) {
    
}

TestClient.prototype._close = function(e) {
    if (!this.connection) return false;


    this.connection.close();
    return true;
}


TestClient.prototype._send = function(type, data) {
    var obj = {
        type: type,
        data: data
    }
    this.connection.sendUTF(JSON.stringify(obj));
}



var activeClients = [];

setInterval(function() {

    for (var i = 0; i < 20; i++) {
        createTestStuff();
    };

}, 1)

var createTestStuff = function() {
    var client = new TestClient();
    client.start();
    activeClients.push(client);
    console.log('connecting...', activeClients.length)


    // var tt = setInterval(function() {
    //     clearInterval(tt);
    //     if (!client._close()) return;

    //     activeClients.splice(activeClients.indexOf(client), 1);

    //     console.log('disconnecting...', activeClients.length);
    // }, 200)
}




