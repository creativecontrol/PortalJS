 var context;
    window.addEventListener('load', init, false);

    function init(){
        try {

            context = new (window.AudioContext || window.webkitAudioContext)();
            var oscillator = context.createOscillator();
            var gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = 440;
            gain.connect(context.destination);
            oscillator.connect(gain);

            oscillator.start(0);

        }
        catch(e){
            alert("Web Audio not supported");
        }
    }
