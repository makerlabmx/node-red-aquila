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

      self.server.on('tokenReady', function(token)
      {
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
              return console.log("There was an error with the action: ", error);
            }
            var device = JSON.parse(body);
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
          if(!self.url) return console.log("Error: Action misconfigured, chaeck that the Action is valid");
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
              return console.log("There was an error with the action: ", error);
            }
          });
        });

      });

    }
    else
    {
      console.log("Server undefined");
    }
  }

  RED.nodes.registerType("action", actionNode);
}
