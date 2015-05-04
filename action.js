module.exports = function(RED) {
  function actionNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.device = config.device;
    self.action = config.action;

    if (self.server) {

      self.server.on('tokenReady', function(token) {
        self.token = token;
      });

      if (self.server.secure) {
        self.url = 'https://' + self.server.host + ':' + self.server.port +
                    '/api/devices/' + self.device + '/action/' + self.action;
      } else {
        self.url = 'http://' + self.server.host + ':' + self.server.port +
                    '/api/devices/' + self.device + '/action/' + self.action;
      }

      var request = require('request');

      self.on('input', function(msg) {
        var url = self.url + '/' + msg.payload;
        request({
          url: url,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + self.token
          }
        }, function (error, response, body) {
          if(error) {
            console.log("There was an error with the action: ", error);
          }
        });
      });
    } else {
      console.log("Server undefined");
    }
  }

  RED.nodes.registerType("action", actionNode);
}
