$(function(){

    var oscillator = new Tone.Oscillator();

    var envelope = new Tone.AmplitudeEnvelope(5, 0, 1, 3);
    envelope.attackCurve = "sine";

    let inverse = true;


     oscillator.start();

    oscillator.connect(envelope, 0, 0);
    envelope.fan(waveform).toMaster();

    window.addEventListener("sensor1", function(e){
        switch(e.detail){
            case 0:
                if(inverse){envelope.triggerAttack("+2")}
                else{envelope.triggerRelease()}
                break;
            case 1:
                if(inverse){envelope.triggerRelease("+2")}
                else{envelope.triggerAttack()}
                break;
            default:
                if(inverse){envelope.triggerAttack("+2")}
                else{envelope.triggerRelease()}
                break;
        }
    });


    $("#ping").mousedown(function(){
        window.dispatchEvent(new CustomEvent("sensor1" , {detail: 1}));
    });

    $("#ping").mouseup(function(){
        window.dispatchEvent(new CustomEvent("sensor1" , {detail: 0}));
    });


});
