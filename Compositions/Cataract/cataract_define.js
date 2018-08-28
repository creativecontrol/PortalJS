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

    self.midiOut = '';
    self.midiOuput = '';
    self.midiControlChannel;
    // control gates for the music channels
    self.gateNotes;
    self.bitwigSceneNumber;

    self.activeZones = [];

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

  self.sensorGroups.forEach(function() {
    self.activeZones.push(0);
  });
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
      console.log(WebMidi.outputs);
      self.midiOutput = WebMidi.getOutputByName(self.midiOut);
      console.log(self.midiOutput);
  });

};

Cataract.prototype.sensors = function(){
  let self = this;
  console.debug("adding event listener");
  window.addEventListener("sensors", function(e){
    // console.debug(e);
    if(self.isPlaying){
      self.envelopes(e);
    }
  });
};

Cataract.prototype.envelopes = function(sensor){
  let self = this;

  let sensorNumber = sensor.detail.number;
  let activeZone = 0;
  let envState = 0;

//  console.debug("cataract got sensor message");

  // console.log(sensorNumber);

  self.sensorGroups.forEach(function(group, idx){
    if(sensorNumber >= group[0] && sensorNumber <= group[1]){
      activeZone = idx;
      return;
    };
  });

  // console.log(activeZone);

   //if the value is within a cutoff range then send a value
   let sensorValue = sensor.detail.value;
   if(sensorValue !== BADDATA && sensorValue < self.sensorCutoff){
     console.log("sending MIDI out " + self.gateNotes[activeZone] + " " + sensorValue + " " + self.midiControlChannel);
     //  console.debug(self.midiOut);
     self.midiOutput.playNote(self.gateNotes[activeZone], 16);
     self.activeZones[activeZone] = 1;
   } else {
     if(self.activeZones[activeZone] == 1){
       self.midiOutput.stopNote(self.gateNotes[activeZone], 16);
       self.activeZones[activeZone] = 0;
     }
   }

};
