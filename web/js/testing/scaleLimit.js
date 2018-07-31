import scale from "tonal"


$(function(){
    var seq =  [];

    var res = scale('major').map(Tonal.transpose('C2'));

    console.log(res);
});
