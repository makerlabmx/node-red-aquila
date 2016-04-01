module.exports = function(RED) {
  function wserialNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server        = RED.nodes.getNode(config.server);

    self.host          = self.server.host;
    self.port          = self.server.port;
    self.deviceAddress = config.deviceAddress;

    if (self.server) {
      self.server.on('tokenReady', function(token)
      {
        self.token = token;

        var url;
        var httpStr = "http://";
        if(self.server.secure) httpStr = "https://";
        url = httpStr + self.host + ':' + self.port + '/wserial';

        var io = require('socket.io-client');
        self.socket = io(url, {
          query: "token=" + self.token,
          autoconnect: true
        });

        self.socket.on("connect", function()
        {
          console.log("Socket connected");
        });

        self.socket.on('error', function(err)
        {
          console.log("Socket connection error: ", err);
        });

        self.socket.on('data', function(data)
        {
          // if we are listening broadcast or is from the device we have configured
          if ( parseInt(data.srcAddr) === hexToDec(self.deviceAddress) || hexToDec(self.deviceAddress) === hexToDec("FFFF"))
          {
            var msg = {
              payload: {
                data: data.data,
                srcAddr: data.srcAddr.toString(16).toUpperCase()
              }
            };
            self.send(msg);
          }
        });

        self.on('input', function(msg)
        {
          var data = {
            'dstAddr': hexToDec(self.deviceAddress),
            'data': String(msg.payload)
          };
          self.socket.emit('data', data);
        });

      });
    }
    else
    {
      console.log('Server undefined');
    }

    self.on('close', function()
    {
      self.socket.removeAllListeners('data');
      self.socket.removeAllListeners('error');
      self.socket.removeAllListeners('connect');
    });

  }

  RED.nodes.registerType('wserial', wserialNode);
}

function hexToDec(h)
{
  return parseInt(h, 16);
}
