module.exports = function(RED) {
  function eventNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.host        = self.server.host;
    self.secure      = self.server.secure;
    self.port        = self.server.port;
    self.device      = config.device;
    self.altairEvent = config.altairEvent;

    if (this.server) {
      self.token = self.server.credentials.token;
    } else {
      console.log('Server undefined');
    }

    var io = require('socket.io-client');

    var url;
    if (self.secure) {
      url = 'https://' + self.host + ':' + self.port;
    } else {
      url = 'http://' + self.host + ':' + self.port;
    }

    var socket = io(url, {
          query: "token=" + self.token,
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
        if (device.events[aEvent].name === self.altairEvent && eventN === device.events[aEvent].n) {
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
    });

    this.on('close', function() {
      socket.removeAllListeners('event');
      socket.removeAllListeners('error');
      socket.removeAllListeners('connect');
    })
  }

  RED.nodes.registerType("event", eventNode);
}
