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
    .doublele('timestamp') //64-bit
    .word16Ule('scan_num_horizontal')
    .word16Ule('scan_num_vertical')
    .floatle('vertical_angle',1)
    .floatle('start_horizontal_angle',1)
    .floatle('horizontal_resolution',1)
    .word16Ule('point_count',1)
    .array('distances',128,'word8');

//var tcpRequest = Struct();

const TCP_ADDR = '127.0.0.1';
const TCP_PORT = 1337;
const TCP_MSG_DELIMITER = 0xF8F8F8F8; //'øøøø'  248,248,248,248
const TCP_MSG_HEADER_LEN = 4; // 32 bit integer --> 4
const TCP_MSG_FOOTER_LEN = 4; // 32 bit integer --> 4
var accumulatingBuffer = new Buffer(0); 
var messageLength   = -1; 
var accumulatingLen  =  0;
var recvedThisTimeLen=  0;

var tcpclient = new net.Socket();
tcpclient.connect(TCP_PORT, TCP_ADDR, function() {
	console.log('connected to tcp server');
	//tcpclient.write('Hello, server! Love, Client.');
});

tcpclient.on('data', function(data) {
    console.log('Received: ' + data);
    //lidarSample._setBuff(data);
    
    //accumulate incoming data
    recvedThisTimeLen = data.length;
    let tmpBuffer = new Buffer( accumulatingLen + recvedThisTimeLen );
    accumulatingBuffer.copy(tmpBuffer);
    data.copy ( tmpBuffer, accumulatingLen  ); // offset for accumulating
    accumulatingBuffer = tmpBuffer; 
    tmpBuffer = null;
    accumulatingLen += recvedThisTimeLen;

    if( recvedThisTimeLen < packetHeaderLen ) {
        console.log('need to get more data(less than header-length received) -> wait..');
        return;
    } else if( recvedThisTimeLen == packetHeaderLen ) {
        console.log('need to get more data(only header-info is available) -> wait..');
        return;
    } else {
        console.log('before-messageLength=' + messageLength ); 
        //a packet info is available..
        if( messageLength < 0 ) {
            messageLength = accumulatingBuffer.readUInt32BE(0); 
            console.log('messageLength=' + messageLength );
        }
    }




    //while=> 
    //in case of the accumulatingBuffer has multiple 'header and message'.
    while( accumulatingLen >= messageLength + packetHeaderLen ) {
        console.log( 'accumulatingBuffer= ' + accumulatingBuffer );

        let messageBuffer = new Buffer( messageLength  ); // a whole packet should be available...
        console.log( 'messageBuffer len= ' + messageBuffer.length );
        accumulatingBuffer.copy( messageBuffer, 0, packetHeaderLen, accumulatingBuffer.length); // 

        ////////////////////////////////////////////////////////////////////

        processMessage(messageBuffer);
        
        //let stringData = aPacketBufExceptHeader.toString();
        //let usage = stringData.substring(0,stringData.indexOf(TCP_MSG_DELIMITER));
        //console.log("usage: " + usage);

        //process the first two bytes for the message type
        let messageType = messageBuffer.readInt16LE(0);
        console.log("message type: " + messageType.toString(16)); //convert the integer to hexidecimal
        
        //call handler
        (serverFunctions [usage])(c, remoteIpPort, stringData.substring(1+stringData.indexOf(TCP_MSG_DELIMITER)));
        ////////////////////////////////////////////////////////////////////

        //rebuild buffer
        let newBufRebuild = new Buffer( accumulatingBuffer.length );
        newBufRebuild.fill();
        accumulatingBuffer.copy( newBufRebuild, 0, messageLength + packetHeaderLen, accumulatingBuffer.length);

        //init
        accumulatingLen -= (messageLength + 4) ; //TODO may need to include footer length here too
        accumulatingBuffer = newBufRebuild;
        newBufRebuild = null;
        messageLength = -1;
        console.log( 'Init: accumulatingBuffer= ' + accumulatingBuffer );   
        console.log( '      accumulatingLen   = ' + accumulatingLen );  

        if( accumulatingLen <= packetHeaderLen ) {
            return;
        } else {
            messageLength = accumulatingBuffer.readUInt32BE(0) ; 
            console.log('messageLength=' + messageLength );
        }    
    }  
});

tcpclient.on('close', function() {
	console.log('tcp connection closed');
});


var processMessage = function(messageBuffer){

    //process the first two bytes for the message type
    let messageType = messageBuffer.readInt16LE(0);
    console.log("message type: " + messageType.toString(16)); //convert the integer to hexidecimal
    
    switch(messageType){
        case 0x0000:
            break;
        case 0x0001:
            break;
    }
}