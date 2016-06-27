module.exports = function(RED) {
  function aquilaRemoteServerNode(config) {
    RED.nodes.createNode(this, config);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var self = this;

    self.host     = config.host;
    self.secure   = config.secure;
    self.port     = config.port;
    self.username = self.credentials.username;
    self.password = self.credentials.password;

    var request = require('request');

    if (self.secure) {
      self.url = 'https://' + self.host + ':' + self.port + '/api/token';
    } else {
      self.url = 'http://' + self.host + ':' + self.port + '/api/token';
    }

    request({
      url: self.url,
      method: 'POST',
      json: {
        "user"     : self.username,
        "password" : self.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }, function(error, response, body) {
      if(error) {
        console.log("node-red-aquila: There was an error: ", error);
      } else {
        var credentials      = {};
        credentials.token    = body.token;
        credentials.username = self.username;
        credentials.password = self.password;

        if(credentials.token == null)
        {
          // Do nothing
          console.log("node-red-aquila: Bad token, check your login credentials.");
          return;
        }
        else
        {
          // We are correctly connected
          RED.nodes.addCredentials(self.id, credentials);
          self.emit('tokenReady', credentials.token);
        }
        
      }
    });

  }

  RED.nodes.registerType("aquila-remote-server", aquilaRemoteServerNode, {
    credentials: {
      username  : { type : "text" },
      password  : { type : "password" },
      token     : { type : "password" }
    }
  });
}
