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

    var io = require('socket.io');

    var socket = io.connect('http://' + this.host + ':' + this.port, {
          query: "token=" + this.token
        });

    socket.on("connect", function() {
      console.log("Socket connected");
    });

    socket.on("error", function(err) {
      console.log("Socket connection error: ", err);
    });

    socket.on(this.altairEvent, function(device, eventN, param) {
      console.log("Altair event: ", device, " ", eventN, " ", param);
    });

  }

  RED.nodes.registerType("websocket", websocketNode);

}
