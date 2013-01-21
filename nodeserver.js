var SerialPort  = require('serialport').SerialPort;
var portName = 'COM3';

var io = require('socket.io').listen(8000); // server listens for socket.io communication at port 8000
io.set('log level', 1); // disables debugging. this is optional. you may remove it if desired.

data = "";
delimiter = '\n';

var serialPort = new SerialPort(portName, { // portName is instatiated to be COM3, replace as necessary
   baudRate: 9600 // this is synced to what was set for the Arduino Code
   //,dataBits: 8, // this is the default for Arduino serial communication
   //,parity: 'none', // this is the default for Arduino serial communication
   //,stopBits: 1, // this is the default for Arduino serial communication
   //,flowControl: false // this is the default for Arduino serial communication
   ,parser: function (emitter, buffer) {
		// Collect data
		data += buffer.toString();

		// Split collected data by delimiter
		var parts = data.split(delimiter)
		data = parts.pop();
		parts.forEach(function (part, i, array) {
			emitter.emit('data', part);
		});
	}
});

io.sockets.on('connection', function (socket) {
    console.log('connected');
	// If socket.io receives message from the client browser then 
    // this call back will be executed.
    socket.on('message', function (msg) {
    	console.log(msg);
    });
    // If a web browser disconnects from Socket.IO then this callback is called.
    socket.on('disconnect', function () {
    	console.log('disconnected');
    });
});



serialPort.on("open", function () {
  console.log('open');
	serialPort.on('data', function (data) { // call back when data is received

	    io.sockets.emit('message', data);
	    /*
	    readData += data.toString(); // append data to buffer
	    // if the letters 'A' and 'B' are found on the buffer then isolate what's in the middle
	    // as clean data. Then clear the buffer. 
	    if (readData.indexOf('B') >= 0 && readData.indexOf('A') >= 0) {
	        cleanData = readData.substring(readData.indexOf('A') + 1, readData.indexOf('B'));
	        readData = '';
	        io.sockets.emit('message', cleanData);
		}
		*/
	});
});

