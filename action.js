var utilAquila = require('./utilAquila');

module.exports = function(RED) {
  function actionNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.device = utilAquila.normalizeAddr(config.device);
    self.action = config.action;

    if (self.server)
    {

      var request = require('request');

      // Mark initial status as disconnected
      self.status({fill:"red",shape:"ring",text:"disconnected"});

      self.server.on('tokenReady', function(token)
      {
        // Mark as connected
        self.status({fill:"green",shape:"dot",text:"connected"});

        self.token = token;

        var httpStr = "http://";
        if(self.server.secure) httpStr = "https://";

        // Check if action is number or name
        var actionNumber;
        if(isNaN(self.action))
        {
          // is name, get number
          var url = httpStr + self.server.host + ':' + self.server.port +
                      '/api/devices/' + self.device;
          request({
            url: url,
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + self.token
            }
          }, function (error, response, body) {
            if(error) {
              return console.log("node-red-aquila: There was an error with the action: ", error);
            }

            try {
              var device = JSON.parse(body);
            }
            catch(err) {
              return console.log("node-red-aquila: JSON Parsing Error:", err);
            }

            for(var i in device.actions)
            {
              if(device.actions[i].name === self.action)
              {
                actionNumber = device.actions[i].n;
                self.url = httpStr + self.server.host + ':' + self.server.port +
                      '/api/devices/' + self.device + '/action/' + actionNumber;
                break;
              }
            }
          });
        }
        else
        {
          // is number
          actionNumber = self.action;
          self.url = httpStr + self.server.host + ':' + self.server.port +
                      '/api/devices/' + self.device + '/action/' + actionNumber;
        }

        self.on('input', function(msg)
        {
          if(!self.url) return console.log("node-red-aquila: Error: Action misconfigured, chaeck that the Action is valid");
          var paramString = "";
          if(typeof(msg.payload) === 'number' && msg.payload >= 0 && msg.payload < 256 ) paramString = '/' + msg.payload;
          var url = self.url + paramString;
          request({
            url: url,
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + self.token
            }
          }, function (error, response, body) {
            if(error) {
              return console.log("node-red-aquila: There was an error with the action: ", error);
            }
          });
        });

      });

    }
    else
    {
      console.log("node-red-aquila: Server undefined");
    }
  }

  RED.nodes.registerType("action", actionNode);
}
