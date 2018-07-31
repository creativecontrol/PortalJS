/**
 *
 */

//     "use strict";

const BADDATA = 999;


oscHandler = function(){
    this.oscPort = new osc.WebSocketPort({
        url: "ws://localhost:8081"
    });

    this.listen();
    this.oscPort.open();

    this.oscPort.socket.onmessage = function (e) {
        console.log("message", e);
    };
};

oscHandler.prototype.listen = function () {
    //this.oscPort.on("open", this.play.bind(this));
    this.oscPort.on("message", this.event_create.bind(this));
    this.oscPort.on("message", function (msg) {
        //console.log("message", msg);
    });
    //this.oscPort.on("close", this.pause.bind(this));
};

oscHandler.prototype.event_create = function(oscMessage){

    let address = oscMessage.address;
    let sensor = oscMessage.args[0];
    let value = oscMessage.args[1];

    console.log(address + " " + sensor + " " + value);

    if(address === '/sensors') {
       console.log("sending event");
        window.dispatchEvent(new CustomEvent("sensors", {detail: {
          number : sensor,
          value : value }
        }));
    }
};

var osc_handler = new oscHandler();
console.log("osc handler loaded");
