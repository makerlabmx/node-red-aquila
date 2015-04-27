module.exports = function(RED) {
  function wserialNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server        = RED.nodes.getNode(config.server);
    self.host          = self.server.host;
    self.port          = self.server.port;
    self.secure        = self.server.secure;
    self.deviceAddress = config.deviceAddress;

    if (self.server) {
      self.token = self.server.credentials.token;
    } else {
      console.log('Server undefined');
    }

    var io = require('socket.io-client');

    var url;
    if (self.secure) {
      url = 'https://' + self.host + ':' + self.port + '/wserial';
    } else {
      url = 'http://' + self.host + ':' + self.port + '/wserial';
    }

    var socket = io(url, {
      query: "token=" + self.token,
      autoconnect: true
    });

    socket.on("connect", function() {
      console.log("Socket connected");
    });

    socket.on('error', function(err) {
      console.log("Socket connection error: ", err);
    });

    socket.on('data', function(data) {
      if (parseInt(data.srcAddr) === parseInt(self.deviceAddress)) {
        var msg = {
          payload: data.data
        };
        self.send(msg);
      }
    });

    self.on('input', function(msg) {
      var data = {
        'dstAddr': self.deviceAddress,
        'data': msg.payload
      };
      socket.emit('data', data);
    });

    self.on('close', function() {
      socket.removeAllListeners('data');
      socket.removeAllListeners('error');
      socket.removeAllListeners('connect');
    });

  }

  RED.nodes.registerType('wserial', wserialNode);
}
