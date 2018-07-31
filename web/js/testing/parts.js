var samplesDirectory = "../../../Compositions/Cataract/Audio/samples/"
var midiDirectory = "../../../Compositions/Cataract/MIDI/";


var sample = 'bass/Bass.pizz.C3-PB.wav';
var samplePitch = 'C3';

var scoreFile = "creekt01.json";

var rate = 0.1;


$(function(){
    var sampler = new Tone.Sampler();
    var part = new Tone.Part(function(time, note){

        sampler.triggerAttackRelease(note, "8n")
    });
})