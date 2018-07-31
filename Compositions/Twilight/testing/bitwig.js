$(function(){
    var m_out;

    var chords = {
      "EM+7" : ["E3", "B3", "G4", "D5", "A5"],
      "Dm13" : ["D3", "B3", "F#4", "E5", "A5"],
      "Bm13" : ["B2", "C4", "D4", "F#4", "E5", "A5"],
      "CM9" : ["C3", "D4", "G4", "E5", "G5"]
    }
    var scores = [
      [ {"time" : 0, "note" : "C1", "velocity": 0.9, "harmony" :"EM+7", "loopEnd": "4m"},
        {"time" : "0:2", "note" : "C#1", "velocity": 0.5, "probability": 0.85, "harmony": "EM+7"},
        {"time" : "0:3", "note" : "D1", "velocity": 0.5, "probability": 0.85, },
        {"time" : "1:2", "note" : "D#1", "velocity": 0.5,"probability": 0.85},
        {"time" : "1:3", "note" : "E1", "velocity": 0.5, "probability": 0.85},
        {"time" : "2:1", "note" : "F1", "velocity": 0.5,"probability": 0.85},
        {"time" : "2:2", "note" : "F#1", "velocity": 0.5, "probability": 0.85},
        {"time" : "3:0", "note" : "D#1", "velocity": 0.5, "probability": 0.85},
        {"time" : "3:2", "note" : "G1", "velocity": 0.5, "probability": 0.85},
        {"time": "3:3", "note": null, "change": true}
      ],
      [ {"time" : "0:0", "note" : "C#1", "velocity": 0.9, "loopEnd": "2m"},
        {"time" : "0:2", "note" : "C1", "velocity": 0.5, "probability": 0.85},
        {"time" : "1:0", "note" : "D#1", "velocity": 0.5, "probability": 0.85},
        {"time" : "1:2", "note" : "D1", "velocity": 0.5,"probability": 0.85},
        {"time": "1:3", "note": null, "change": true}
      ],
      [
        {"time" : "0:0", "note" : "C2", "velocity": 0.9, "loopEnd": "2m"},
        {"time" : "1:0", "note" : "C#2", "velocity": 0.9},
        {"time": "1:3", "note": null, "change": true}
      ],
      [
        {"time" : "0:0", "note" : "E1", "velocity": 0.9, "loopEnd": "4m"},
        {"time" : "0:2", "note" : "F1", "velocity": 0.5, "probability": 0.85},
        {"time" : "1:0", "note" : "D#1", "velocity": 0.5, "probability": 0.85},
        {"time" : "2:0", "note" : "F#1", "velocity": 0.5,"probability": 0.85},
        {"time" : "2:2", "note" : "G1", "velocity": 0.5,"probability": 0.85},
        {"time" : "3:0", "note" : "A1", "velocity": 0.5,"probability": 0.85},
        {"time": "3:3", "note": null, "change": true}
      ]
    ];


    var seqChoice = 0;

    function humanKeyUp(msg){

    }

    function humanKeyDown(msg){

    }

    WebMidi.enable(err => {
        if (err) {
            console.error('WebMidi could not be enabled', err);
            return;
        }
        //document.querySelector('.midi-not-supported').style.display = 'none';

        let input = WebMidi.inputs[0];
        input.addListener('noteon', 'all', e => {
            humanKeyDown(e.note.number, e.velocity);
            // console.log(e.note.number, e.velocity);
        });
        input.addListener('noteoff', 'all', e => humanKeyUp(e.note.number));

        console.log(WebMidi.outputs);
        m_out = WebMidi.outputs[1];

        console.log(m_out);
    });



    var part = new Tone.Part(function (time, value) {
        console.log(value);
        self = this;

        if(value.note !== null){
          m_out.playNote(value.note, 1, {duration: 500});
          console.log(value.note);
        }

        if(value.change){
          seqChoice = _.random(0, scores.length-1);
          self.removeAll();

          for (var i = 0; i < scores[seqChoice].length; i++){
            self.add(scores[seqChoice][i]);
          }

          self.loopEnd = scores[seqChoice][0].loopEnd;

          console.log(seqChoice);
          console.log(self);
        }

    }, [
      {"time" : "0:0", "note" : "C2", "velocity": 0.9, "loopEnd": "2m"},
      {"time" : "1:0", "note" : "C#2", "velocity": 0.9},
      {"time": "1:3", "note": null, "change": true}
    ]);

    var extChords = {};

    loadJSON(function(response){
      extChords = JSON.parse(response);
    }, "../../Twilight/MIDI/extChords.json");

    console.log(extChords);

    var dur = Tone.Time("1m").toMilliseconds();
    console.log("duration: " + dur);

    var partExt = new Tone.Part(function(time, value){
        m_out.playNote(value.name, 2, {duration: Tone.Time("1m").toMilliseconds()});
    }, extChords.tracks[0].notes);

    var oscill = new Tone.Oscillator().toMaster();
    oscill.start(0);

    setTimeout(function(){
        part.loop = true;
        part.loopEnd = "4m";
        part.start();
        console.log(part);

        partExt.loop = true;
        partExt.loopEnd = "5m";
        partExt.start();

        Tone.Transport.start();

        Tone.Transport.scheduleRepeat(function(){
            //console.log("hi");
            //console.log("progress: " + part.progress);
        }, 1, 0);

        console.log(Tone.Transport.state);

    }, 2000);

    setInterval(function () {
        //console.log("bang");
    }, 1000);

});
