module.exports = function(RED) {
  function websocketNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    this.server = RED.nodes.getNode(config.server);

    this.host = this.server.host;
    this.port = this.server.port;
    this.device = config.device;
    this.altairEvent = config.altairEvent;

    if (this.server) {
      this.token = this.server.credentials.token;
    } else {
      console.log('Server undefined');
    }

    var io = require('socket.io-client');


    var socket = io('https://' + this.host + ':' + this.port, {
          query: "token=" + this.token,
          autoconnect: true
        });

    socket.on("connect", function() {
      console.log("Socket connected");
    });

    socket.on("error", function(err) {
      console.log("Socket connection error: ", err);
    });

    socket.on('event', function(device, eventN, param) {
      for ( var aEvent in device.events ) {
        if (device.events[aEvent].name === self.altairEvent) {
          if ( eventN === device.events[aEvent].n) {
            console.log("EVENT MOTHERFUCKER!: ", device.events[aEvent]);
            var msg = {
              payload: {
                "device": device,
                "eventN": eventN,
                "param": param
              }
            };
            self.send(msg);
          }
        }
      }
    });

    this.on('close', function() {
      socket.removeAllListeners('event');
      socket.removeAllListeners('error');
      socket.removeAllListeners('connect');
    })
  }

  RED.nodes.registerType("altairWebsocket", websocketNode);

}
