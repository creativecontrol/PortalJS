/*
This is an example of how to extend the Tone.js API to allow for more channel support.
 */


var context =  new Tone.Context();

context.context.destination.channelCount = 8;

Tone.BigMerge = function(ins){
    Tone.AudioNode.call(this);
    this.createInsOuts(ins, 0);

    this._merger = this.output = this.context.createChannelMerger(ins);

    for(var i=0; i < ins; i++){
        this.input[i] = new Tone.Gain();
        this.input[i].connect(this._merger, 0, i);
        this.input[i].channelCount = 1;
        this.input[i].channelCountMode = "explicit";

    }

};

Tone.extend(Tone.BigMerge, Tone.AudioNode);


var merge = new Tone.BigMerge(15);

var oscs = []

for(var i=0; i<7; i++){
    oscs.push(new Tone.Oscillator(440+(i*100)));
    oscs[i].connect(merge,0,i);
    oscs[i].start();
}

var am = new Tone.AMSynth();

am.connect(merge, 0, 8);
am.triggerAttackRelease("C4", "4n");

//merge.toMaster();
merge.connect(context.context.destination);
