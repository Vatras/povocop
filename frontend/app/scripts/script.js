(function() {
  var webWorkers = [];
  var workerCount = 2;

  function passDataToWorkers(data) {
    webWorkers.forEach(function (webWorker) {
      webWorker.postMessage(data);
    });
  }

  function initWorkersHandlers() {
    webWorkers.forEach(function (webWorker) {
      webWorker.onmessage = function (e) {
        console.log('onmessage', e)
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
    var socket = io('centos:9000');
    return socket
  }

  function socketHandlersInit(socket) {
    socket.on('computationData', function (data) {
      passDataToWorkers(data);
    })
  }

  function findNumOfThreads() {
    function createWorkers(numberOfWorkers) {
      var tempWorkers = [];//new Array(numberOfWorkers).map(function(){return new Worker('scripts/test.js');})
      for (var i = 0; i < numberOfWorkers; i++) {
        var tempWorker = new Worker('scripts/test.js');
        tempWorkers.push(tempWorker)
      }
      return tempWorkers;
    }

    function startComputations(resultArray) {
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
                var endTime = new Date().getTime();
                var resultTime = endTime - startTime;
                console.log(resultTime)
                resultArray.push(resultTime);
                if (lastTime != 0 && lastTime * 2 < resultTime) {
                  terminateWorkers(tempWorkers)
                  resolve(numberOfWorkers / 2)
                } else if (numberOfWorkers < 8) {
                  terminateWorkers(tempWorkers)
                  findTimeForCPU(iter + 1, resultTime)
                } else {
                  terminateWorkers(tempWorkers)
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

    var results = [];
    startComputations(results).then(function (response) {
      console.log('response', response);
      console.log('results', results);
    })
  }

  function init() {
    findNumOfThreads()
    // initWorkers();
    // initWorkersHandlers();
    // var socket = initSocketIO();
    // socketHandlersInit(socket)
  }

  init();
})();
