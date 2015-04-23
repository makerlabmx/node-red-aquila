module.exports = function(RED) {
  function aquilaRemoteServerNode(config) {
    RED.nodes.createNode(this, config);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    this.host = config.host;
    this.port = config.port;
    this.username = this.credentials.username;
    this.password = this.credentials.password;
    var self = this;

    var request = require('request');

    request({
      url: 'https://' + self.host + ':' + self.port + '/api/token',
      method: 'POST',
      json: {
        "user": self.username,
        "password": self.password
      },
      headers: {
        'Content-Type': 'Application/Json'
      }
    }, function(error, response, body) {
      if(error) {
        console.log("There was an error: ", error);
      } else {
        var credentials = {};
        credentials.token = body.token;
        RED.nodes.addCredentials(self.id, credentials);
      }
    });

  }
  RED.nodes.registerType("aquila-remote-server", aquilaRemoteServerNode, {
    credentials: {
      username: { type: "text" },
      password: { type: "password" },
      token: { type: "password" }
    }
  });
}
