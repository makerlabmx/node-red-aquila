module.exports = function(RED) {
  function serviceNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.device      = config.device;
    self.method      = config.method;
    self.serviceName = config.serviceName;

    if (self.server) {

      self.server.on('tokenReady', function(token) {
        self.token = token;
      });

      if (self.server.secure) {
        self.url = 'https://' + self.server.host + ':' + self.server.port + '/' +
                    'api/devices/' + self.device + '/service/' + self.serviceName;
      } else {
        self.url = 'http://' + self.server.host + ':' + self.server.port + '/' +
                    'api/devices/' + self.device + '/service/' + self.serviceName;
      }

      var request = require('request');

      self.on('input', function(msg) {
        request({
          url: self.url,
          method  : self.method,
          headers : {
            'Content-Type'  : 'application/json',
            'Authorization' : 'Bearer ' + self.token
          },
          body: msg.payload
        }, function (error, response, body){
          if (error) {
            console.log("There was an error with the request: ", error);
          } else {
            var msg = { payload: body };
            self.send(msg);
          }
        });
      });
    } else {
      console.log("Server undefined");
    }
  }

  RED.nodes.registerType("service", serviceNode);
}
