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
