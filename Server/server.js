// Load the TCP Library
net = require('net');
const Crypto = require('crypto')

// Keep track of the chat clients
var clients = [];


var rooms = {}


const genRoom = () => {
  return Crypto.randomBytes(7).toString('base64').slice(0, 7)
}

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort

  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  //socket.write("Welcome\n");

  //broadcast(socket.name + " joined the chat\n", socket);

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    data = data.toString()
    console.log(data)
    if(data=="master"){
      let new_room = genRoom()
      socket.write(new_room + "\n");
      rooms[new_room] = socket

      //console.log(rooms);

      setTimeout(function () {
        delete rooms[new_room]
        //console.log(rooms);
        //console.log('timeout completed');
      }, 3*60*60*1000);

    }
    else if (data.includes("client")){
      if(rooms.hasOwnProperty(data.split(":")[1])){
        socket.write("ok\n")
      }
      else{
        socket.write("wrong\n")
      }
    }
    else {
      if(rooms.hasOwnProperty(data.split(":")[0])){
        rooms[data.split(":")[0]].write(data.split(":")[1])
      }
    }
    //broadcast(data, socket);
  });

  socket.on("error", (err) =>
    console.log(err.stack)
  );

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    //broadcast(socket.name + " left the chat.\n");
  });

  // Send a message to all clients
  /*function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }*/

}).listen(5000);
