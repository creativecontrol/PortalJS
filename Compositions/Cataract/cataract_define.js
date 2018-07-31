/**
 * Definitions for the piece Cataract
 * Include sound files and note sequences that react to infrared sensor input.
 *
 *
 */

Cataract = function(){
    let self = this;

    self.configFile = "../../Compositions/Cataract/Cataract_settings.json";

    self.midiOut;
    self.midiControlChannel;
    // control gates for the music channels
    self.midiCC1;
    self.midiCC2;
    self.midiCC3;
    self.midiCC4;
    self.midiCC5;
    self.midiCC6;
    self.bitwigSceneNumber;

    self.config();
    self.initMidi();
    self.sensors();
};

Cataract.prototype.config = function(){
  let self = this;

  loadJSON(function(configuration){
    let config = JSON.parse(configuration);
    console.log(config);
    self.midiOut = config.midiOut;
    self.midiControlChannel = config.midiControlChannel;
    self.midiCC1 = config.midiCC1;
    self.midiCC2 = config.midiCC2;
    self.midiCC3 = config.midiCC3;
    self.midiCC4 = config.midiCC4;
    self.midiCC5 = config.midiCC5;
    self.midiCC6 = config.midiCC6;
    self.bitwigSceneNumber = config.bitwigSceneNumber;
    self.sensorGroups = config.sensorGroups;
    self.sensorCutoff = config.sensorCutoff;

  }, self.configFile);

  console.log(self.sensorGroups);

};

Cataract.prototype.start = function(){
    let self =this;

    //send start to BitWig Scene

};

Cataract.prototype.stop = function (){
    let self = this;

};

Cataract.prototype.free = function (){

};

Cataract.prototype.initMidi = function(){
  let self = this;

  WebMidi.enable(err => {
      if (err) {
          console.error('WebMidi could not be enabled', err);
          return;
      }
      console.log(WebMidi.outputs);
      self.midiOut = WebMidi.getOutputByName(self.midiOut);
  });
};

Cataract.prototype.sensors = function(){
  let self = this;
  console.log("adding event listener");
  window.addEventListener("sensors", function(e){
    self.envelopes(e);
  });
};

Cataract.prototype.envelopes = function(sensor){
  let self = this;

  let sensorNumber = sensor.detail.number;
  let activeZone = null;
  let envState = 0;

//  console.log("cataract got sensor message");

  self.sensorGroups.forEach(function(group){
    if(sensorNumber >= group[0] && sensorNumber <= group[1]){
      activeZone = sensorNumber;
      return;
    };
  });

  //if the value is within a cutoff range then send a value
  let sensorValue = sensor.detail.value;
  if(sensorValue != BADDATA && sensorValue < self.sensorCutoff){
    console.log("sending MIDI out " + activeZone + " " + sensorValue + " " + self.midiControlChannel);

    console.log(self.midiOut);
    self.midiOut.playNote(activeZone, 16);
  } else if {
    self.midiOut.stopNote(activeZone, 16);
  }

};
