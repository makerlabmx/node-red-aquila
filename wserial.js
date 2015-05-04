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
      self.server.on('tokenReady', function(token) {
        self.token = token;

        var url;
        if (self.secure) {
          url = 'https://' + self.host + ':' + self.port + '/wserial';
        } else {
          url = 'http://' + self.host + ':' + self.port + '/wserial';
        }

        var io = require('socket.io-client');
        self.socket = io(url, {
          query: "token=" + self.token,
          autoconnect: true
        });

        self.socket.on("connect", function() {
          console.log("Socket connected");
        });

        self.socket.on('error', function(err) {
          console.log("Socket connection error: ", err);
        });

        self.socket.on('data', function(data) {
          if (parseInt(data.srcAddr) === parseInt(self.deviceAddress)) {
            var msg = {
              payload: data.data
            };
            self.send(msg);
          }
        });
      });
    } else {
      console.log('Server undefined');
    }


    self.on('input', function(msg) {
      var data = {
        'dstAddr': self.deviceAddress,
        'data': msg.payload
      };
      self.socket.emit('data', data);
    });

    self.on('close', function() {
      self.socket.removeAllListeners('data');
      self.socket.removeAllListeners('error');
      self.socket.removeAllListeners('connect');
    });

  }

  RED.nodes.registerType('wserial', wserialNode);
}
