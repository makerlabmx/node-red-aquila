module.exports = function(RED) {
  function serviceNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    this.server = RED.nodes.getNode(config.server);

    this.device      = config.device;
    this.method      = config.method;
    this.serviceName = config.serviceName;

    this.url = 'http://' + this.server.host + ':' + this.server.port + '/' +
                'api/devices/' + this.device + '/service/' + this.serviceName;

    this.username;
    this.password;
    this.token;

    var request = require('request');

    if (this.server) {
      this.username = this.server.credentials.username;
      this.password = this.server.credentials.password;
      this.token    = this.server.credentials.token;
    } else {
      console.log("Server undefined");
    }

    this.on('input', function(msg) {
      request({
        url: self.url,
        method: self.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.server.credentials.token
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

  }
  RED.nodes.registerType("service", serviceNode);
}
