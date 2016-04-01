var utilAquila = require('./utilAquila');

module.exports = function(RED) {
  function serviceNode(config) {
    RED.nodes.createNode(this, config);

    var self = this;

    self.server = RED.nodes.getNode(config.server);

    self.device      = utilAquila.normalizeAddr(config.device);
    self.method      = config.method;
    self.serviceName = config.serviceName;

    if (self.server)
    {

      self.server.on('tokenReady', function(token) 
      {
        self.token = token;

        var httpStr = "http://";
        if(self.server.secure) httpStr = "https://";
        self.url = httpStr + self.server.host + ':' + self.server.port + '/' +
                    'api/devices/' + self.device + '/service/' + self.serviceName;
        
        var request = require('request');

        self.on('input', function(msg)
        {
          var bodyObject = {};
          if(typeof(msg.payload) === 'object') bodyObject = msg.payload;

          request({
            url: self.url,
            method  : self.method,
            headers : {
              'Content-Type'  : 'application/json',
              'Authorization' : 'Bearer ' + self.token
            },
            body: JSON.stringify(bodyObject)
          }, function (error, response, body){
            if (error) {
              return console.log("There was an error with the request: ", error);
            } else {
              var msg = { payload: body };
              return self.send(msg);
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

  RED.nodes.registerType("service", serviceNode);
}
