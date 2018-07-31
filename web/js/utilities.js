loadJSON = function(callback, file){
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, false);
    xobj.onreadystatechange = function(){
        if(xobj.readyState == 4 && xobj.status =="200"){
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
};