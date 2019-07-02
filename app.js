const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const net = require('net');
const io = require('socket.io')(server);



app.use(express.static(__dirname + '/public')); 

app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/', express.static(__dirname + '/node_modules/bootstrap/dist')); // redirect bootstrap JS, CSS, and fonts

var port = process.env.PORT || 80;
server.listen(port);


var tcpclient = new net.Socket();
tcpclient.connect(1337, '127.0.0.1', function() {
	console.log('Connected');
	tcpclient.write('Hello, server! Love, Client.');
});

tcpclient.on('data', function(data) {
	console.log('Received: ' + data);
	tcpclient.destroy(); // kill client after server's response
});

tcpclient.on('close', function() {
	console.log('tcp connection closed');
});