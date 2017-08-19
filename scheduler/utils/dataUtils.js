/**
 * Created by Pjesek on 28.07.2017.
 */
const DBUtils = require('./dbUtils')
const CONFIG =  require('../config')
function init(STATE){
    return new Promise((resolve, reject) => {
        addConfigDataToState(STATE).then(function(stateWithConfig){
            addInputDataToState(stateWithConfig).then(function(stateWithInputData){
                addPendingResultsToState(stateWithInputData).then(function(stateWithPendingResults){
                    resolve(stateWithPendingResults);
               });
            });
        });
        })
}
function addPendingResultsToState(STATE){
    return new Promise((resolve, reject) => {
        let apps = []
        for(let app in STATE.config){
            apps.push(app);
        }
        getPendingResultsForAllApps(STATE,apps).then(function(pendingResults){
            STATE.pendingResults = pendingResults
            resolve(STATE);
        });
    })
}

function addConfigDataToState(STATE){
    return new Promise((resolve, reject) => {
        DBUtils.getConfigData(null,function(res){
            let configs = res || [];
            STATE.config = {}
            configs.forEach(function(val){
                STATE.redundancyFactors[val.dataValues.appName]=parseInt(val.dataValues.redundancyFactor);
                delete val.dataValues.redundancyFactor;
                STATE.config[val.dataValues.appName]=val.dataValues;
            })
            resolve(STATE)
        })
    })
}
function addInputDataToState(STATE){
    return new Promise((resolve, reject) => {
        let apps = []
        for(let app in STATE.config){
            apps.push(app);
        }
        getInputsForAllApps(apps).then(function(inputData){
            STATE.cachedInputData = inputData
            resolve(STATE);
        });
    })
}
function getInputsForAllApps(apps){
    return new Promise((resolve, reject) => {
        let inputData = {}
        if(apps.length === 0){
            resolve(inputData)
        }
        apps.forEach(function(app){
            (function(appName){
                DBUtils.getInputData(app, function (res) {
                    const inputs = res;
                    if(inputs.length>0){
                        inputs.forEach(function (val, idx) {
                            if (idx === 0) {
                                inputData[appName] = [];
                            }
                            inputData[appName].push(val.dataValues);
                        })
                    }else{
                        inputData[appName] = [];
                    }
                    const allAppsDataFetched = apps.length === Object.keys(inputData).length
                    if(allAppsDataFetched){
                        resolve(inputData)
                    }
                }, {getNotAssigned: true, limit: CONFIG.cachedInputDataSize})
            })(app)
        })
    })
}
function getPendingResultsForAllApps(STATE,apps){
    return new Promise((resolve, reject) => {
        let pendingResults = {}
        if(apps.length === 0){
            resolve(pendingResults)
        }
        apps.forEach(function(app){
            (function(appName){
                DBUtils.getPendingResultsForApp(app, function (res) {
                    const redundancyFactor = STATE.redundancyFactors[app];
                    const results = res;
                    if(results.length>0){
                        results.forEach(function (val, idx) {
                            if (idx === 0) {
                                pendingResults[appName] = [];
                            }
                            val.dataValues.result.inputData = val.dataValues.InputData ? val.dataValues.InputData.dataValues.data: null;
                            pendingResults[appName].push({
                                results : val.dataValues.result,
                                verifiesLeftToBeAssigned : redundancyFactor,
                                ip : val.dataValues.ip,
                                uuid : val.dataValues.uuid
                            });
                        })
                    }else{
                        pendingResults[appName] = [];
                    }
                    const allAppsDataFetched = apps.length === Object.keys(pendingResults).length
                    if(allAppsDataFetched){
                        resolve(pendingResults)
                    }
                })
            })(app)
        })
    })
}
function getInputData(STATE,socket,numOfCpus){
    const appName = socket.appName;
    cacheMoreInputData(STATE,appName,numOfCpus);
    let toSend = STATE.cachedInputData[appName].splice(0,numOfCpus);
    const dataIds = toSend.map(function(item){
        return item.id
    })
    DBUtils.assignInputData(appName,dataIds,socket.ip)
    return toSend.length !== 0 ? toSend : null
}
function cacheMoreInputData(STATE,appName,numOfCpus){
    if(STATE.cachedInputData[appName].length >= CONFIG.minimumCachedInputDataSize && STATE.cachedInputData[appName].length - numOfCpus < CONFIG.minimumCachedInputDataSize  ){
        console.log('caching more data');
        DBUtils.getInputData(appName, function (res) {
            const idsArray = STATE.cachedInputData[appName].map(val =>val.id);
            const fetchedData = res.filter (value => idsArray.indexOf(value.id) == -1);
            STATE.cachedInputData[appName] = STATE.cachedInputData[appName].concat(fetchedData);
        },{limit : CONFIG.cachedInputDataSize - CONFIG.minimumCachedInputDataSize});
    }

}
function sendInputDataToWorkers(STATE,socket,numOfCpus){
    const inputDataToSend = getInputData(STATE,socket,numOfCpus)
    if(inputDataToSend){
        for(let i=0;i<numOfCpus;i++){
            if(i < inputDataToSend.length){
                socket.emit('inputData', {workerNum: i, inputData : inputDataToSend[i]});
                socket.inputData[i] = inputDataToSend[i];
            }
        }
    }
}
function sendInputDataToSingleWorker(STATE,socket,workerNum){
    if(typeof socket.inputData === 'undefined'){socket.inputData = []}
    const inputDataToSend = getInputData(STATE,socket,1)
    if(inputDataToSend){
        console.log('sending data to worker ',workerNum)
        socket.emit('inputData', {workerNum: workerNum, inputData : inputDataToSend[0]});
        socket.inputData[workerNum] = inputDataToSend[0];
    }
}
function removeAssignment(socket, result,dbResult,connectedInputData){
    console.log('removing assignment from ',result.workerNum)
    if(connectedInputData){
        DBUtils.associateResultWithInput(dbResult,connectedInputData.id)
    }
    const workerNum = result.workerNum;
    socket.inputData[workerNum] = null;
}
module.exports = {
    init: init,
    getInputData : getInputData,
    removeAssignment : removeAssignment,
    sendInputDataToWorkers : sendInputDataToWorkers,
    sendInputDataToSingleWorker : sendInputDataToSingleWorker
}