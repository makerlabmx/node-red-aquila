module.exports = function(RED) {
  function actionNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    this.server = RED.nodes.getNode(config.server);

    this.device = config.device;
    this.action = config.action;
    this.url = 'http://' + this.server.host + ':' + this.server.port +
                '/api/devices/' + this.device + '/action/' + this.action;

    var username = "";
    var password = "";
    var token = "";

    var request = require('request');

    if (this.server) {
      username = this.server.credentials.username;
      password = this.server.credentials.password;
      token = this.server.credentials.token;
    } else {
      console.log("Server undefined");
    }

    this.on('input', function(msg) {
      url = self.url + '/' + msg.payload;
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
