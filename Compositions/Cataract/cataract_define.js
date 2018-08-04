/**
 * Definitions for the piece Cataract
 * Include sound files and note sequences that react to infrared sensor input.
 *
 *
 */

Cataract = function(){
    let self = this;

    self.configFile = "../../Compositions/Cataract/Cataract_settings.json";
    self.isPlaying = false;

    self.midiOut;
    self.midiControlChannel;
    // control gates for the music channels
    self.gateNotes;
    self.bitwigSceneNumber;

    self.config();
    self.initMidi();
    self.sensors();
};

Cataract.prototype.config = function(){
  let self = this;

  loadJSON(function(configuration){
    let config = JSON.parse(configuration);
    console.debug(config);
    self.midiOut = config.midiOut;
    self.midiControlChannel = config.midiControlChannel;
    self.gateNotes = config.gateNotes;
    self.bitwigSceneNumber = config.bitwigSceneNumber;
    self.sensorGroups = config.sensorGroups;
    self.sensorCutoff = config.sensorCutoff;

  }, self.configFile);

  console.debug(self.sensorGroups);

};

Cataract.prototype.start = function(){
    let self =this;

    //send start to BitWig Scene

    self.isPlaying = true;
};

Cataract.prototype.stop = function (){
    let self = this;
    self.isPlaying = false;

    //turn off BitWig Scene
};

Cataract.prototype.free = function (){

};

Cataract.prototype.initMidi = function(){
  let self = this;

  // setup control channels
  self.gateChannels = [self.midiCC1, self.midiCC2];

  WebMidi.enable(err => {
      if (err) {
          console.error('WebMidi could not be enabled', err);
          return;
      }
      console.debug(WebMidi.outputs);
      self.midiOut = WebMidi.getOutputByName(self.midiOut);
  });
};

Cataract.prototype.sensors = function(){
  let self = this;
  console.debug("adding event listener");
  window.addEventListener("sensors", function(e){
    if(self.isPlaying){
      self.envelopes(e);
    }
  });
};

Cataract.prototype.envelopes = function(sensor){
  let self = this;

  let sensorNumber = sensor.detail.number;
  let activeZone = null;
  let envState = 0;

//  console.debug("cataract got sensor message");

  self.sensorGroups.forEach(function(group){
    if(sensorNumber >= group[0] && sensorNumber <= group[1]){
      activeZone = sensorNumber;
      return;
    };
  });

  //if the value is within a cutoff range then send a value
  let sensorValue = sensor.detail.value;
  if(sensorValue != BADDATA && sensorValue < self.sensorCutoff){
    console.debug("sending MIDI out " + activeZone + " " + sensorValue + " " + self.midiControlChannel);
    console.debug(self.midiOut);
    self.midiOut.playNote(self.gateNotes[activeZone], 16);
  } else if {
    self.midiOut.stopNote(self.gateNotes[activeZone], 16);
  }

};
