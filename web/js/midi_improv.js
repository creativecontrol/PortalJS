$(function(){
    const MIN_NOTE = 48;
    const MAX_NOTE = 84;
    const KEY = 'Em';

    // Using the Improv RNN pretrained model from https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn
    let rnn = new mm.MusicRNN(
        'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv'
    );

    let temperature = 1.1;
    //let builtInKeyboard = new AudioKeys({ rows: 2 });
    //let onScreenKeyboardContainer = document.querySelector('.keyboard');
    //let onScreenKeyboard = buildKeyboard(onScreenKeyboardContainer);
    //let machinePlayer = buildKeyboard(
    //  document.querySelector('.machine-bg .player')
    //);
    //let humanPlayer = buildKeyboard(document.querySelector('.human-bg .player'));

    let currentSeed = [];
    let stopCurrentSequenceGenerator;
    var tonic_last = "";
    var tonic_m = "";

    function isAccidental(note) {
        let pc = note % 12;
        return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
    }

    function buildKeyboard(container) {
        let nAccidentals = _.range(MIN_NOTE, MAX_NOTE + 1).filter(isAccidental)
        .length;
        let keyWidthPercent = 100 / (MAX_NOTE - MIN_NOTE - nAccidentals + 1);
        let keyInnerWidthPercent =
        100 / (MAX_NOTE - MIN_NOTE - nAccidentals + 1) - 0.5;
        let gapPercent = keyWidthPercent - keyInnerWidthPercent;
        let accumulatedWidth = 0;
        return _.range(MIN_NOTE, MAX_NOTE + 1).map(note => {
            let accidental = isAccidental(note);
            let key = document.createElement('div');
            key.classList.add('key');
            if (accidental) {
                key.classList.add('accidental');
                key.style.left = `${accumulatedWidth -
                    gapPercent -
                    (keyWidthPercent / 2 - gapPercent) / 2}%`;
                    key.style.width = `${keyWidthPercent / 2}%`;
                } else {
                    key.style.left = `${accumulatedWidth}%`;
                    key.style.width = `${keyInnerWidthPercent}%`;
                }
                container.appendChild(key);
                if (!accidental) accumulatedWidth += keyWidthPercent;
                return key;
            });
        }

        function getSeedIntervals(seed) {
            let intervals = [];
            for (let i = 0; i < seed.length - 1; i++) {
                let rawInterval = seed[i + 1].time - seed[i].time;
                let measure = _.minBy(['8n', '4n'], subdiv =>
                Math.abs(rawInterval - Tone.Time(subdiv).toSeconds())
            );
            intervals.push(Tone.Time(measure).toSeconds());
        }
        return intervals;
    }

    function getSequenceLaunchWaitTime(seed) {
        if (seed.length <= 1) {
            return 1;
        }
        let intervals = getSeedIntervals(seed);
        let maxInterval = _.max(intervals);
        return maxInterval * 2;
    }

    function getSequencePlayIntervalTime(seed) {
        if (seed.length <= 1) {
            return Tone.Time('8n').toSeconds();
        }
        let intervals = getSeedIntervals(seed).sort();
        return _.first(intervals);
    }

    function detectChord(notes) {
        notes = notes.map(n => Tonal.Note.pc(Tonal.Note.fromMidi(n.note))).sort();
        return Tonal.PcSet.modes(notes)
        .map((mode, i) => {
            const tonic = Tonal.Note.name(notes[i]);
            const names = Tonal.Dictionary.chord.names(mode);
            return names.length ? tonic + names[0] : null;
        })
        .filter(x => x);
    }

    function buildNoteSequence(seed) {
        tonic_m = seed[0].note;
        return mm.sequences.quantizeNoteSequence(
            {
                ticksPerQuarter: 220,
                totalTime: seed.length * 0.5,
                quantizationInfo: {
                    stepsPerQuarter: 1
                },
                timeSignatures: [
                    {
                        time: 0,
                        numerator: 4,
                        denominator: 4
                    }
                ],
                tempos: [
                    {
                        time: 0,
                        qpm: 120
                    }
                ],
                notes: seed.map((n, idx) => ({
                    pitch: n.note,
                    startTime: idx * 0.5,
                    endTime: (idx + 1) * 0.5
                }))
            },
            1
        );
    }

    function startSequenceGenerator(seed) {
        let running = true,
        lastGenerationTask = Promise.resolve();

        let chords = detectChord(seed);
        let chord = _.first(chords) || KEY;
        let seedSeq = buildNoteSequence(seed);
        let generatedSequence =
        Math.random() < 0.7 ? _.clone(seedSeq.notes.map(n => n.pitch)) : [];
        let launchWaitTime = getSequenceLaunchWaitTime(seed);
        let playIntervalTime = getSequencePlayIntervalTime(seed);
        let generationIntervalTime = playIntervalTime / 2;

        function generateNext() {
            if (!running) return;
            if (generatedSequence.length < 10) {
                lastGenerationTask = rnn
                .continueSequence(seedSeq, 20, temperature, [chord])
                .then(genSeq => {
                    generatedSequence = generatedSequence.concat(
                        genSeq.notes.map(n => n.pitch)
                    );
                    setTimeout(generateNext, generationIntervalTime * 1000);
                });
            } else {
                setTimeout(generateNext, generationIntervalTime * 1000);
            }
        }

        function consumeNext(time) {
            if (generatedSequence.length) {
                let note = generatedSequence.shift();
                if (note > 0) {
                    machineKeyDown(note, time);
                }
            }
        }

        setTimeout(generateNext, launchWaitTime * 1000);
        let consumerId = Tone.Transport.scheduleRepeat(
            consumeNext,
            playIntervalTime,
            Tone.Transport.seconds + launchWaitTime
          );

          return () => {
            running = false;
            Tone.Transport.clear(consumerId);
          };
    }

    function updateChord({ add = null, remove = null }) {
        if (add) {
            currentSeed.push({ note: add, time: Tone.now() });
        }
        if (remove && _.some(currentSeed, { note: remove })) {
            _.remove(currentSeed, { note: remove });
        }

        if (stopCurrentSequenceGenerator) {
            stopCurrentSequenceGenerator();
            stopCurrentSequenceGenerator = null;
        }
        if (currentSeed.length && !stopCurrentSequenceGenerator) {
            resetState = true;
            stopCurrentSequenceGenerator = startSequenceGenerator(
                _.cloneDeep(currentSeed)
            );
        }
    }

    function humanKeyDown(note, velocity = 0.7) {
        if (note < MIN_NOTE || note > MAX_NOTE) return;
        updateChord({ add: note });
    }

    function humanKeyUp(note) {
        if (note < MIN_NOTE || note > MAX_NOTE) return;
        m_out.sendStop();
        updateChord({ remove: note });
    }

    function machineKeyDown(note, time) {
        if (note < MIN_NOTE || note > MAX_NOTE) return;
        // console.log(note);

        m_out.playNote(note, 1, {duration: 500});
        if(tonic_m !== tonic_last){

            m_out.playNote(drop_octave(tonic_m), 2, {duration:750});
            tonic_last = tonic_m;
        }

    }

    function drop_octave(original_note){
        return original_note - 12;
    }
    // MIDI Controls

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

        m_out = WebMidi.outputs[1];
    });

    // Startup

    function generateDummySequence() {
        // Generate a throwaway sequence to get the RNN loaded so it doesn't
        // cause jank later.
        return rnn.continueSequence(
            buildNoteSequence([{ note: 60, time: Tone.now() }]),
            20,
            temperature,
            ['Cm']
        );
    }

    Promise.all([rnn.initialize()])
        .then(() => {
            $("#content").text("Initialized MusicRNN");
        })
        .then(generateDummySequence)
        .then(() => {
            Tone.Transport.start();
            $("#content").append("<p>.... Transport started ...</p>");
        });

    // let bufferLoadPromise = new Promise(res => Tone.Buffer.on('load', res));
    // Promise.all([bufferLoadPromise, rnn.initialize()])
    //   .then(generateDummySequence);
});
