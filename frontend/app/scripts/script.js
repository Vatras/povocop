(function() {
  var webWorkers = [];
  var workerCount = 2;
  var socket;
  function passDataToWorkers(data) {
    webWorkers.forEach(function (webWorker) {
      webWorker.postMessage(data);
    });
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
        console.log('onmessage', e)
        socket.emit('results',e.data)
      }
      webWorker.onerror = function (e) {
        console.log('Error: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
      }
    });
  }

  function initWorkers() {
    for (var i = 0; i < workerCount; i++) {
      var newWorker = new Worker('scripts/computationCode.js')
      webWorkers.push(newWorker);
    }
  }

  function initSocketIO() {
    setCookie('povocopusername','Vatras')
    var appName = "pi"
    socket = io('centos:9000/'+appName,{
      query:{
        povocoptoken: getCookie('povocoptoken'),
        povocopusername: getCookie('povocopusername'),
    }});
    console.log(document.cookies)
    return socket
  }

  function socketHandlersInit(socket) {
    socket.on('computationConfig', function (data) {
      console.log(data)
      data.msgType='computationConfig';
      passDataToWorkers(data);
    })
    socket.on('inputData', function (data) {
      console.log(data)
      data.msgType='inputData';
      passDataToWorkers(data);
    })
    socket.on('token',function(token){
      setCookie('povocoptoken', token)
    });
    socket.on('computeNumOfCpu',function(){
      findNumOfThreads(function(cpuNum){
        socket.emit('numOfCpus',cpuNum)
      })
    })
    socket.on('state',function(state){
      console.log(state)
    })
  }

  function findNumOfThreads(callback) {
    function createWorkers(numberOfWorkers) {
      var tempWorkers = [];
      for (var i = 0; i < numberOfWorkers; i++) {
        var tempWorker = new Worker('scripts/test.js');
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
      console.log('response', response);
      callback(response)
    })
  }


  function init() {
    initWorkers();
    initWorkersHandlers();
    var socket = initSocketIO();
    socketHandlersInit(socket)
  }

  init();
})();
