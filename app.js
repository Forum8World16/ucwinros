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



const Struct = require('struct');

var lidarSample = Struct()
	.word8('id')
    .double('timestamp') //64-bit
    .word16Ule('scan_num_horizontal')
    .word16Ule('scan_num_vertical')
    .float('vertical_angle',1)
    .float('start_horizontal_angle',1)
    .float('horizontal_resolution',1)
    .word16Ule('point_count',1)
    .array('distances',128,'word8');

//var tcpRequest = Struct();

var tcpclient = new net.Socket();
tcpclient.connect(1337, '127.0.0.1', function() {
	console.log('connected to tcp server');
	//tcpclient.write('Hello, server! Love, Client.');
});

tcpclient.on('data', function(data) {
    console.log('Received: ' + data);
    lidarSample._setBuff(data);
	tcpclient.destroy(); // kill client after server's response
});

tcpclient.on('close', function() {
	console.log('tcp connection closed');
});