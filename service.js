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

      self.token  = self.server.credentials.token;
      self.secure = self.server.secure;
      self.host   = self.server.host;
      self.port   = self.server.port;

      if (self.secure) {
        self.url = 'https://' + self.host + ':' + self.port + '/' +
                    'api/devices/' + self.device + '/service/' + self.serviceName;
      } else {
        self.url = 'http://' + self.host + ':' + self.port + '/' +
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
            var msg = { payload: body};
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
