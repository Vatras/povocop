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

    ajaxRequest({url:"/config/"+ appname,method:'GET'},function(data){

        document.getElementById('configurationData').value = data.config ? JSON.stringify(data.config,null, 2) : '';
        document.getElementById('includesInputData').checked = data.includesInputData ? data.includesInputData : false;
        document.getElementById('redundancyFactor').value = data.redundancyFactor ? data.redundancyFactor : 0;
        document.getElementById('code').value = data.code ? data.code : '';
    })
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
    request.code = document.getElementById("code").value//{code: eval(document.getElementById("code").value)}
    request.redundancyFactor = document.getElementById("redundancyFactor").value;
    request.config = configDataJSON
    request.includesInputData = document.getElementById('includesInputData').checked
    var requestData = {
        data:{"data" : request},
        url : '/config/'+ appName,
        method : "POST"
    }
    ajaxRequest(requestData)
}
