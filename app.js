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
app.use('/js', express.static(__dirname + '/node_modules/three/build')); // redirect three JS
app.use('/js', express.static(__dirname + '/node_modules/three/examples/js')); // redirect three JS

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
const TCP_PORT = 5000;
const TCP_MSG_DELIMITER = 0xF8F8F8F8; //'øøøø'  248,248,248,248  4177066232
const TCP_MSG_HEADER_LEN = 4; // 32 bit integer --> 4
const TCP_MSG_FOOTER_LEN = 4; // 32 bit integer --> 4
var _accumulatingBuffer = new Buffer(0); 
var _messageLength = -1; 
var _accumulatedLength = 0;
var _receivedDataLength = 0;

var tcpclient = new net.Socket();

setTimeout(function(){


tcpclient.connect(TCP_PORT, TCP_ADDR, function() {
	console.log('connected to tcp server');
	//tcpclient.write('Hello, server! Love, Client.');
});

},5000);

tcpclient.on('data', function(data) {
    
    _receivedDataLength = data.length;
    console.log('received data length:' + _receivedDataLength ); //18

    //accumulate incoming data
    let tmpBuffer = new Buffer( _accumulatedLength + _receivedDataLength ); //make new larger buffer
    _accumulatingBuffer.copy(tmpBuffer); //copy existing data into new buffer
    data.copy ( tmpBuffer, _accumulatedLength  ); // copy the new data into the accumulator, and offset by existing data
    _accumulatingBuffer = tmpBuffer; //reassociate new, larger buffer the accumulating Buffer name
    tmpBuffer = null; //release memory
    _accumulatedLength += _receivedDataLength; //increment the length of the buffer

    if( _receivedDataLength < TCP_MSG_HEADER_LEN ) {
        console.log('need to get more data(less than header-length received) -> wait..');
        return;
    } else if( _receivedDataLength == TCP_MSG_HEADER_LEN ) {
        console.log('need to get more data(only header-info is available) -> wait..');
        return;
    } else {
        console.log('before-_messageLength= ' + _messageLength ); 
        //a packet info is available..
        if( _messageLength < 0 ) {
            _messageLength = _accumulatingBuffer.readUInt32LE(0)-4;
            console.log('_messageLength=' + _messageLength );
        }
    }

    let hexlist = '';
    for(i=0;i<20;i++){
        hexlist += " " + data.readUIntLE(i).toString(16);
    }
    console.log("message starts with: "+hexlist);


    hexlist = '';
    for(i=0;i<20;i++){
        hexlist += " " + _accumulatingBuffer.readUIntLE(i).toString(16);
    }
    console.log("accumulatingGuffer starts with: "+hexlist);


    //while=> 
    //in case of the _accumulatingBuffer has multiple 'header and message'.
    while( _accumulatedLength >= _messageLength ) {
        //console.log( '_accumulatingBuffer= ' + _accumulatingBuffer );
        console.log( '_accumulatingBuffer length= ' + _accumulatingBuffer.length );

        let messageBuffer = new Buffer( _messageLength  ); // a whole packet should be available...
        //console.log( 'messageBuffer len= ' + messageBuffer.length );
        _accumulatingBuffer.copy( messageBuffer, 0, 0, _messageLength); // copy message portion into messageBuffer
        //buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])

        ////////////////////////////////////////////////////////////////////

        processMessage(messageBuffer);
        
        //let stringData = aPacketBufExceptHeader.toString();
        //let usage = stringData.substring(0,stringData.indexOf(TCP_MSG_DELIMITER));
        //console.log("usage: " + usage);

        //process the first two bytes for the message type
        //let messageType = messageBuffer.readInt16LE(0);
        //console.log("message type: " + messageType.toString(16)); //convert the integer to hexidecimal
        
        //call handler
        /*
        (serverFunctions [usage])(c, remoteIpPort, stringData.substring(1+stringData.indexOf(TCP_MSG_DELIMITER)));
        */
        ////////////////////////////////////////////////////////////////////

        //rebuild buffer
        let newBufRebuild = new Buffer( _accumulatingBuffer.length );
        newBufRebuild.fill();
        _accumulatingBuffer.copy( newBufRebuild, 0, _messageLength, _accumulatingBuffer.length);

        //init
        _accumulatedLength -= (_messageLength);
        _accumulatingBuffer = newBufRebuild;
        newBufRebuild = null;
        _messageLength = -1;
        //console.log( 'Init: _accumulatingBuffer= ' + _accumulatingBuffer );   
        console.log( '      _accumulatedLength   = ' + _accumulatedLength );  

        if( _accumulatedLength <= TCP_MSG_HEADER_LEN ) {
            return;
        } else {
            _messageLength = _accumulatingBuffer.readUInt32LE(0)-4;
            console.log('next _messageLength=' + _messageLength );
            if( _accumulatedLength <= _messageLength ) {
                console.log('    not enough bytes yet to process the next message in the buffer');
                return;
            }
        }    
    }  
});

tcpclient.on('close', function() {
    console.log('tcp connection closed');
    
    setTimeout(function(){
        tcpclient.connect(TCP_PORT, TCP_ADDR, function() {
            console.log('connected to tcp server');
        });
    },5000);//try to connect to tcp server again every 5 seconds
});

tcpclient.on('error', function(ex) {
    console.log("handled error");
    console.log(ex);
});

var processMessage = function(messageBuffer){
    //process the first two bytes for the message type after the first 4 bytes for message length
    let sample = {};
    let messageType = messageBuffer.readUInt16LE(4); //2 bytes
    sample['type'] = messageType.toString(16);//convert the integer to hexidecimal
    console.log("message type: " + sample['type']);

    switch(messageType){
        case 0x0101:
            //Vehicle Control Message Schema
            break;
        case 0x0201:
            //Camera Message Schema
            break;
        case 0x0301:
            //copy out our portion
            /*
            let hexlist = '';
            for(i=0;i<_messageLength;i++){
                hexlist += " " + messageBuffer.readUIntLE(i).toString(16);
            }
            console.log("message data is: "+hexlist);
            */

            
            sample['devId'] = messageBuffer.readUInt8(6); //1 byte
            sample['time'] = messageBuffer.readDoubleLE(7); // 8 bytes
            sample['scanId'] = messageBuffer.readUInt32LE(15); //4 bytes
            sample['vId'] = messageBuffer.readUInt32LE(19); //4 bytes
            sample['vRad'] = messageBuffer.readFloatLE(23); //4 bytes
            sample['hRadStart'] = messageBuffer.readFloatLE(27); //4 bytes
            sample['hRadRes'] = messageBuffer.readFloatLE(31); //4 bytes
            sample['count'] = messageBuffer.readUInt32LE(35); //4 bytes
            sample['dists'] = [];
            for(i=0;i<sample['count'];i++){
                sample['dists'].push(messageBuffer.readFloatLE(39+4*i)); //4 bytes)
            }
            
            io.emit('lidar2',sample);
            

            //Lidar Message Schema
            break;
    }
}


let _lidarRayCount = 64;
let _lidarDistances = Array(_lidarRayCount).fill(5);

// setInterval(function(){
//     _lidarDistances = _lidarDistances.map((v,i,a) => {return (v*9+Math.floor(5+Math.random() * 30))/10; });
//     let buffData = new Uint8Array(_lidarDistances);
//     io.emit('lidar',buffData);
// },100);



function disconnectEventListener(socket){
    socket.on('disconnect', function(){
        console.log("client "+socket['id']+" disconnected");
    });
}

io.on('connection',function(socket){
    console.log("client "+socket['id']+" connected");

    disconnectEventListener(socket);
});