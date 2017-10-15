var emittedResults=0;
function povocopOnclick(event){
  console.log(event.value)
  var povocopEvent = new CustomEvent('povocopEvent', { detail: parseInt(event.value)|| 0});
  document.dispatchEvent(povocopEvent);
}

(function() {
  var webWorkers = [];
  var workersWorking = false;
  var workerCount = parseInt(localStorage.getItem('choosenPovocopCpuNum') || localStorage.getItem('povocopCpuNum')||'0');


  var socket;
  var lastConfig = null;
  var lastRememberedCode='';
  document.addEventListener('povocopEvent', function (e) {
    console.log(e.detail);
    workerCount=e.detail;
    localStorage.setItem('choosenPovocopCpuNum',workerCount)
    socket.emit('newNumOfCpus',workerCount)
    if(lastRememberedCode.length>0){
      initWorkers(lastRememberedCode);
      initWorkersHandlers();
      if(lastConfig!=null)
      {
        passDataToWorkers(lastConfig);
      }
    }
  }, false);
  function passDataToWorkers(data,workerNum) {
    if(workerNum>=webWorkers.length){
      return
    }
    if(webWorkers.length == 0){
      initWorkers(lastRememberedCode);
      initWorkersHandlers();
    }
    if(typeof workerNum !== "undefined"){
      if(!webWorkers[workerNum]){window.location.reload()}
      webWorkers[workerNum].postMessage(data);
    }else{
      webWorkers.forEach(function (webWorker) {
        webWorker.postMessage(data);
      });
    }
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  function initWorkersHandlers() {
    webWorkers.forEach(function (webWorker) {
      webWorker.onmessage = function (e) {
        if(e.data.type !== 'verification'){
          console.log('onmessage', e)
          e.data.workerNum = this.num;
          socket.emit('results',e.data)
          emittedResults+=1;
        }else{
          console.log('verified', e)
          socket.emit('verified',e.data)
        }

      }
      webWorker.onerror = function (e) {
        console.log('Error: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
      }
    });
  }

  function initWorkers(code) {
    workersWorking = true;
    code+="\n\n" +
      "self.newConfig = function(data){\n" +
      "\tonConfig = onConfig || function(){}\n" +
      "\tif(data.lastApprovedResult && typeof data.lastApprovedResult.inputData == 'string'){\n" +
      "\t\tdata.lastApprovedResult.inputData = JSON.parse(data.lastApprovedResult.inputData)\n" +
      "\t}\n" +
      " \tonConfig(data.config, data.lastApprovedResult)\n" +
      "}\n" +
      "  self.ondata = function(data){\n" +
      "\tmain =  main || function(){}\n" +
      " \tmain(data.inputData);\n" +
      "}\n" +
      "self.onverify = function(data){\n" +
      "\tvar inputData = data.inputData ?\n" +
      "\t\tJSON.parse(data.inputData) : undefined\n" +
      "\tverify = verify ||  function verify(){return true;};\n" +
      "\tvar status = verify(data.result,inputData);\n" +
      "\tself.postMessage({\n" +
      "\t\ttype : 'verification',\n" +
      "\t\tdata : data,\n" +
      "\t\tstatus : status\n" +
      "\t});\n" +
      "}\n" +
     "self.onmessage = function(e) {\n" +
      "\tvar functionMap = {\n" +
      "\t\t'inputData': 'ondata',\n"+
      "\t\t'computationConfig': 'newConfig',\n"+
      "\t\t'verify': 'onverify'\n"+
      "\t}\n"+
    "\tvar funName = functionMap[e.data.msgType];\n"+
    "\tself[funName](e.data);\n"+
  "}";
    var blob = new Blob([code], {type: "application/javascript"});

    if(webWorkers.length>0){
      webWorkers.forEach(function (tempWorker) {
        tempWorker.terminate();
      })
      webWorkers = []
    }
    for (var i = 0; i < workerCount; i++) {
      // var newWorker = new Worker('scripts/computationCode.js')
      var newWorker = new Worker(URL.createObjectURL(blob));
      newWorker.num=i;
      webWorkers.push(newWorker);
    }
    lastRememberedCode = code;
  }

  function initSocketIO() {
    // setCookie('povocopusername','Vatras')
    var appName = document.getElementById("povocopscript")
      && document.getElementById("povocopscript").getAttribute("appName");
    appName = appName || 'random'
    socket = io(window.location.hostname+':9000/'+appName,{
      query:{
        povocoptoken: getCookie('povocoptoken'),
        povocopusername: getCookie('povocopusername'),
    }});
    console.log(document.cookies)
    return socket
  }

  function socketHandlersInit() {
    socket.on('computationConfig', function (data) {
      console.log(data)
      data.msgType='computationConfig';
      lastConfig=data;
      if(!workersWorking || data.restartAllWorkersOnConfigChange){
        initWorkers(data.code);
        initWorkersHandlers();
      }
      passDataToWorkers(data);
    })
    socket.on('inputData', function (data) {
      console.log('inputData',data,new Date())
      data.msgType='inputData';
      data.inputData = JSON.parse(data.inputData.data)
      passDataToWorkers(data,data.workerNum);
    })
    socket.on('newPI', function (data) {
      console.log(data);
      // $('#piValue').html(data)
    });
    socket.on('adaptiveSchedule', function (data) {
      console.log('performance: '+Math.round((data||0)*100)+'%');
      if(document.getElementById('povocopCpuPerf')){
        document.getElementById('povocopCpuPerf').innerHTML='performance: '+Math.round((data||0)*100)+'%';
      }
      // $('#piValue').html(data)
    });
    socket.on('verify', function (data) {
      console.log('verify',data)
      data.msgType='verify';
      passDataToWorkers(data,Math.floor(Math.random()*webWorkers.length));
    })
    socket.on('token',function(token){
      setCookie('povocoptoken', token)
    });
    socket.on('computeNumOfCpu',function(){
      findNumOfThreads(function(cpuNum){
        localStorage.setItem('povocopCpuNum',cpuNum);
        workerCount=cpuNum;
        if(document.getElementById("cpuPovocop"+workerCount)){
          document.getElementById("cpuPovocop"+workerCount).checked=true
        }
        socket.emit('numOfCpus',cpuNum)
      })
    })
    socket.on('state',function(state){
      // console.log(state)
    })
  }

  function findNumOfThreads(callback) {
    function createWorkers(numberOfWorkers) {
      function testScript(){
          function doCalculations(){
          var iterationCount = 15000000;
          var start = new Date().getTime();
          var res = 1;
          while (iterationCount>0 && res>0) {
            res = iterationCount%13+iterationCount/2+iterationCount+1+Math.random()*Math.random();
            iterationCount--;
          }
          var end =  new Date().getTime();
          self.postMessage({
            time: start-end
          });
        }

        self.onmessage = function(e) {
          doCalculations(e.data);
        }
      }

      var code = testScript.toString();
      code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));

      var blob = new Blob([code], {type: "application/javascript"});

      var tempWorkers = [];
      for (var i = 0; i < numberOfWorkers; i++) {
        var tempWorker = new Worker(URL.createObjectURL(blob));
        // var tempWorker = new Worker('scripts/test.js');
        tempWorkers.push(tempWorker)
      }
      return tempWorkers;
    }

    function startComputations() {
      return new Promise(function (resolve, reject) {
        findTimeForCPU(0, 0)
        function findTimeForCPU(iter, lastTime) {
          var sum = 0;
          var numberOfWorkers = Math.pow(2, iter)
          var tempWorkers = createWorkers(numberOfWorkers);
          tempWorkers.forEach(function (tempWorker) {
            tempWorker.onmessage = function (e) {
              sum += 1;
              if (sum == numberOfWorkers) {
                terminateWorkers(tempWorkers)
                var endTime = new Date().getTime();
                var resultTime = endTime - startTime;
                if(iter==0){
                  localStorage.setItem('singleThreadSpeed',resultTime)
                }
                console.log(resultTime)
                if (lastTime != 0 && lastTime * 1.5 < resultTime) {
                  resolve(numberOfWorkers / 2)
                } else if (numberOfWorkers < 8) {
                  findTimeForCPU(iter + 1, resultTime)
                } else {
                  resolve(numberOfWorkers)
                }
              }
            }
          })
          var startTime = new Date().getTime();
          tempWorkers.forEach(function (tempWorker) {
            tempWorker.postMessage({});
          })
          function terminateWorkers(tempWorkers) {
            tempWorkers.forEach(function (tempWorker) {
              tempWorker.terminate();
            })
          }
        }
      })
    }

    startComputations().then(function (response) {
      localStorage.setItem('cpuNumber',response)
      console.log('response', response);
      callback(response)
    })
  }

  var htmlTemplate = '<div style="width: 100%;height: 50px;background-color: #c5c5c5;display: flex;overflow: auto;" id="topPovocopBanner">'+
  '    <div id="povocopContent" style="margin-left: 15px; margin-top: 5px; ">Computation of PI</div>'+
    '      <div style="margin-left: 15px;margin-top: 5px;position: absolute;right: 50%;" id="povocopCpuPerf"></div>'+
  '      <div style="margin-left: 15px;margin-top: 5px;position: absolute;right: 6%;" id="povocopCpuDiv">'+
  '        <input onclick="povocopOnclick(this)" type="radio" name="cpuPovocop" id="cpuPovocop0" value="none">'+
  '        <label>NONE</label>'+
  '        <input onclick="povocopOnclick(this)" type="radio" name="cpuPovocop" id="cpuPovocop1" value="1">'+
  '        <label>1 CORE</label>'+
  '        <input onclick="povocopOnclick(this)" type="radio" name="cpuPovocop" id="cpuPovocop2" value="2">'+
  '        <label>2 CORES</label>'+
  '        <input onclick="povocopOnclick(this)" type="radio" name="cpuPovocop" id="cpuPovocop4" value="4">'+
  '        <label>4 CORES</label>'+
  '        <input onclick="povocopOnclick(this)" type="radio" name="cpuPovocop" id="cpuPovocop8" value="8">'+
  '        <label>8 CORES</label>'+
  '      </div>'+
  '      <span style="position: absolute;right: 2%;font-size: 30px;font-family: sans-serif;font-weight: bold;cursor: pointer;">X</span>';
  var wrapper = document.createElement("div");
  var list = document.getElementsByTagName("body")[0];
  wrapper.innerHTML=htmlTemplate
  list.insertBefore(wrapper, list.childNodes[0]);
  if(document.getElementById("cpuPovocop"+workerCount)){
    document.getElementById("cpuPovocop"+workerCount).checked=true
  }
  function init() {
    initSocketIO();
    socketHandlersInit()
  }

  init();
})();
