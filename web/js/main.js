/*

 */

Play = function (){
    //Tone.Transport.bpm.value = 60;
    Tone.Transport.start();
    console.log("Transport Started");
};


$(function () {
// Start the transport
    Play();

    setTimeout(function(){

        cataract.start();

        console.log("starting Cataract");
    }, 4000);
});
