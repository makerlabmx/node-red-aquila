var utilAquila = require('./utilAquila');

module.exports = function(RED) {
  function eventNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.device      = utilAquila.normalizeAddr(config.device);
    self.altairEvent = config.altairEvent;

    if (self.server)
    {
      // Mark initial status as disconnected
      self.status({fill:"red",shape:"ring",text:"disconnected"});

      self.server.on('tokenReady', function(token)
      {
        // Mark as connected
        self.status({fill:"green",shape:"dot",text:"connected"});

        self.token = token;

        var url;
        var httpStr = "http://";
        if(self.server.secure) httpStr = "https://";
        url = httpStr + self.server.host + ':' + self.server.port;

        var io = require('socket.io-client');
        self.socket = io(url, {
              query       : "token=" + self.token,
              autoconnect : true
        });

        self.socket.on("connect", function()
        {
          //console.log("Socket connected");
        });

        self.socket.on("error", function(err)
        {
          console.log("node-red-aquila: Socket connection error: ", err);
        });

        self.socket.on('event', function(device, eventN, param)
        {
          // Check device
          if(self.device !== device._id) return;
          // Check event
          if(isNaN(self.altairEvent)) // Is Event name
          {
            for ( var aEvent in device.events )
            {
              if (device.events[aEvent].name === self.altairEvent && eventN === device.events[aEvent].n)
              {
                var msg = {
                  payload: {
                    "device" : device,
                    "eventN" : eventN,
                    "param"  : param
                  }
                };
                return self.send(msg);
              }
            }
          }
          else
          {
            if(parseInt(eventN) === parseInt(self.altairEvent))
            {
              var msg = {
                payload: {
                  "device" : device,
                  "eventN" : eventN,
                  "param"  : param
                }
              };
              return self.send(msg);
            }
          }

        });
      });

    }
    else
    {
      console.log('node-red-aquila: Server undefined');
    }

    self.on('close', function()
    {
      if(!self.socket) return;
      self.socket.removeAllListeners('event');
      self.socket.removeAllListeners('error');
      self.socket.removeAllListeners('connect');
    });
  }

  RED.nodes.registerType("event", eventNode);
}
