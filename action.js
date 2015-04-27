module.exports = function(RED) {
  function actionNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.device = config.device;
    self.action = config.action;
    self.secure = self.server.secure;

    if (self.secure) {
      self.url = 'https://' + self.server.host + ':' + self.server.port +
                  '/api/devices/' + self.device + '/action/' + self.action;
    } else {
      self.url = 'http://' + self.server.host + ':' + self.server.port +
                  '/api/devices/' + self.device + '/action/' + self.action;
    }

    var request = require('request');

    if (!self.server) {
      console.log("Server undefined");
    }

    self.on('input', function(msg) {
      var url = self.url + '/' + msg.payload;
      request({
        url: url,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + self.server.credentials.token
        }
      }, function (error, response, body) {
        if(error) {
          console.log("There was an error with the action: ", error);
        }
      });
    });
  }

  RED.nodes.registerType("action", actionNode);
}
