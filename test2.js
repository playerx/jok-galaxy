
var static = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new(static.Server)('./js');

require('http').createServer(function (request, response) {

    request.on('data', function(data) {
    })

    request.on('end', function() {
        file.serve(request, response);
    })
}).listen(8080);




return;

var static = require('node-static');
var file = new(static.Server)('./');


server = require('http').createServer(function(req, res) {

    req.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(req, res);
    });
});
server.listen(9003, function() {
    console.log((new Date()) + ' Server is listening on port 9003');
});
