/**
 * Created by pjesek on 26.07.17.
 */

$('#saveBtn').on('click',saveConfigData);


window.onload = main;

function main(){
    getConfigData();
}

function getConfigData() {
    var appname = window.location.pathname.split('/')[3]
    $.get("/config/"+ appname, function (data, status) {
        if(data === ""){return;}
        document.getElementById('configurationData').value = JSON.stringify(data.config,null, 2);
        document.getElementById('includesInputData').checked = data.includesInputData
    });
}

function saveConfigData(){
    var appName = window.location.pathname.split('/')[3]
    var configData = document.getElementById('configurationData').value.length>0 ? document.getElementById('configurationData').value : "{}";
    var configDataJSON = null;
    try {
        configDataJSON = JSON.parse(configData)
    }
    catch(e){
        console.log('error',e)
    }
    if(configDataJSON!=null){
        console.log(configDataJSON)
    }
    else{
        alert('Couldn\'t parse text. It is not in valid JSON format. \nAre the variable names in quotation marks ( "" )? ')
        return;
    }
    var request = {};
    request.config = configDataJSON
    request.includesInputData = document.getElementById('includesInputData').checked
    $.post("/config/"+ appName,
        {"data" : request} ,function (data, status) {

        },"json");

}