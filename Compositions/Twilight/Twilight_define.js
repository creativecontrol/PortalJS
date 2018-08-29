var Twilight = function () {
  let self = this;

  self.configFile = '../../Compositions/Twilight/Twilight_settings.json';

  self.audioDirectory = '';
  self.midiDirectory = '';
  self.samplesDirectory = '';

  self.midiOut = '';
  self.midiOutput = '';
  self.melodyTimeOffset = '';
  self.midiMelodyChannel = '';
  self.midiImprovChannel = '';
  self.midiBassChannel = '';
  self.midiLeadChannel = '';
  self.leadDuration = '';

  self.gateNotes = '';
  self.sensorGroups = '';
  self.sensorCutoff = '';
  self.activeZones = [];
  self.zoneLock = [];
  self.zoneLockTime = '';

  self.leadSet = '';

  self.melodyTriggerDuration = '';

  self.neuralNet = '';
  self.temperature = '';
  self.key = '';
  self.tempo = '';

  self.scoreFile = '';
  self.scores = '';
  self.perform = '';
  self.lastHarmony = null;

  self.improvisor = '';
  self.isPlaying = false;

  self.seqChoice = 0;

  self.init();
};

Twilight.prototype.init = function () {
  let self = this;

  self.config();
  self.sensors();
  self.loadScore();
  self.scoreInit();
  self.initMidi();
  self.initImprov();
};

Twilight.prototype.start = function () {
  let self = this;

  self.isPlaying = true;
  console.warn(Tone.now());
  self.perform.start();
};

Twilight.prototype.stop = function () {
  let self = this;
  
  self.isPlaying = false;
  self.perform.stop();
};

Twilight.prototype.config = function () {
  let self = this;

  loadJSON(function (configuration) {
    let config = JSON.parse(configuration);

    self.audioDirectory = config.audioDirectory;
    self.midiDirectory = config.midiDirectory;

    self.midiOut = config.midiOut;
    self.melodyTimeOffest = config.melodyTimeOffest;
    self.midiMelodyChannel = config.midiMelodyChannel;
    self.midiImprovChannel = config.midiImprovChannel;
    self.midiBassChannel = config.midiBassChannel;
    self.midiLeadChannel = config.midiLeadChannel;
    self.leadDuration = config.leadDuration;

    self.gateNotes = config.gateNotes;
    self.sensorGroups = config.sensorGroups;
    self.sensorCutoff = config.sensorCutoff;
    self.zoneLockTime = config.zoneLockTime;

    self.melodyTriggerDuration = config.melodyTriggerDuration;

    self.neuralNet = config.neuralNet;
    self.temperature = config.temperature;
    self.key = config.key;
    self.tempo = config.tempo;

    self.scoreFile = config.scoreFile;
  }, self.configFile);

  self.sensorGroups.forEach(function() {
    self.activeZones.push(0);
    self.zoneLock.push(0);
  });
};

Twilight.prototype.initImprov = function () {
  let self = this;

  console.warn('init improv: ' + self.midiOut);

  self.improvisor = new Improvisor({
    key: self.key,
    tempo: self.tempo,
    temperature: self.temperature,
    neuralNet: self.neuralNet,
    improvOut: self.midiOutput,
    improvChannel: self.midiImprovChannel,
    bassOut: self.midiOutput,
    bassChannel: self.midiBassChannel,
    leadOut: self.midiOutput,
    leadChannel: self.midiLeadChannel,
    parent: self
  });
};

Twilight.prototype.initMidi = function () {
  let self = this;

  WebMidi.enable(err => {
    if (err) {
      console.error('WebMidi could not be enabled', err);
      return;
    }

    console.debug(WebMidi.outputs);
    self.midiOutput = WebMidi.getOutputByName(self.midiOut);
  });
  console.log(self.midiOutput);
};

Twilight.prototype.loadScore = function () {
  let self = this;

  loadJSON(function (score) {
    self.scores = JSON.parse(score);
  }, self.midiDirectory + self.scoreFile);
};

// This is the main melody guitar part played using various Gutar samples
Twilight.prototype.scoreInit = function () {
  let self = this;

  self.perform = new Tone.Part(function (time, value) {
    console.debug(value);
    let part = this;

    if (value.note) {
      self.midiOutput.playNote(value.note, 1, {duration: self.melodyTriggerDuration, time: self.melodyTimeOffest});
      console.debug(value.note);
    }

    if (value.harmony) {
      // process the harmony field and send it to the magenta improvisor
      console.debug(value.harmony);
      console.debug(self.scores.score.chords);
      console.debug(self.scores.score.chords[value.harmony]);

      // remove the notes from the previous harmony
      if (self.lastHarmony) {
        // self.scores.score.chords[self.lastHarmony].forEach((note) => {
        //   self.improvisor.removeNote(note);
        // });
        self.improvisor.removeNote(self.lastHarmony);
      }

      // for each of the notes listed in the chord harmony, add a note to the Improvisor
      // self.scores.score.chords[value.harmony].forEach((note) => {
      //   self.improvisor.inputNote(note);
      // });

      self.improvisor.inputNote(self.scores.score.chords[value.harmony]);

      self.lastHarmony = self.scores.score.chords[value.harmony];
    }

    if (value.change) {
      self.seqChoice = _.random(0, self.scores.score.notes.length - 1);
      part.removeAll();
      for (var i = 0; i < self.scores.score.notes[self.seqChoice].length; i++) {
        part.add(self.scores.score.notes[self.seqChoice][i]);
      }

      part.loopEnd = self.scores.score.notes[self.seqChoice][0].loopEnd;

      console.debug(self.seqChoice);
    }
  }, [
    {'time': '0:0', 'change': true}
  ]);

  self.perform.loop = true;
  self.perform.loopEnd = '1m';
  Tone.Transport.bpm.value = self.tempo;
};

Twilight.prototype.improvEvents = function (note, channel, duration) {
  let self = this;
  self.midiOutput.playNote(note, channel, {duration: duration});
};

Twilight.prototype.sensors = function(){
  let self = this;
  console.debug("adding event listener");
  window.addEventListener("sensors", function(e){
    // console.debug(e);
    if(self.isPlaying){
      self.chooseLead(e);
    }
  });
};

Twilight.prototype.chooseLead = function(sensor){
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

  //console.warn(activeZone);

   //if the value is within a cutoff range then send a value
   let sensorValue = sensor.detail.value;
   if(sensorValue !== BADDATA && sensorValue < self.sensorCutoff && self.activeZones[activeZone] == 0){
     console.warn("sending MIDI out " + self.gateNotes[activeZone] + " " + sensorNumber + " " + sensorValue);
     //  console.debug(self.midiOut);
     let selectedNote = self.leadSet[Math.floor(Math.random() * self.leadSet.length)];
     console.warn(selectedNote);
     self.midiOutput.playNote(selectedNote, self.midiLeadChannel[activeZone], {duration:self.leadDuration});
     self.activeZones[activeZone] = 1;	
     self.zoneLock[activeZone] = Tone.now();
   } else {
     if(self.activeZones[activeZone] == 1 && Tone.now() > (self.zoneLock[activeZone] + self.zoneLockTime)){
       self.activeZones[activeZone] = 0;
       self.zoneLock[activeZone] = 0;
     }
   }

  
};
