//osc tester

var osc = require("osc");

// Bind to a UDP socket to listen for incoming OSC events.
var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 8888,
    remoteAddress: "127.0.0.1",
    remotePort: 60061
});

udpPort.open();


setInterval(function(){
  let msg = {
      address: "/sensors",
      args: [
        {
          type: "i",
          value: 1
        },
        {
          type: "f",
          value: Math.round(Math.random() * 127)
        }
      ]
  };
  console.log("bang");
  udpPort.send(msg);
}, 4000);
