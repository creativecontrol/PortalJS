/*

 */

var Play = function () {
  // Tone.Transport.bpm.value = 60;
  Tone.Transport.start();
  console.log('Transport Started');
};

$(function () {
// Start the transport
  Play();

  setTimeout(function () {
    twilight.start();

    console.log('starting Twilight');
  }, 6000);
});
