const numberOfOutputChannels = 2;
const numberOfMatrixChannels = 16;

var context;
var outChannelsMatrix;

AudioSetup = function (){
    context = new Tone.Context();
    context.context.destination.channelCount = numberOfOutputChannels;

    outChannelsMatrix = new Tone.BigMerge(numberOfMatrixChannels);

    outChannelsMatrix.connect(context.context.destination);
};

AudioSetup();