/**
 * Created by Pjesek on 28.07.2017.
 */
const DBUtils = require('./dbUtils')
const CONFIG =  require('../config')
function init(STATE){
    return new Promise((resolve, reject) => {
        addConfigDataToState(STATE).then(function(stateWithConfig){
            addInputDataToState(stateWithConfig).then(function(stateWithInputData){
                resolve(stateWithInputData);
            });
        });
    });
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
        STATE.cachedInputData = getInputsForAllApps(apps).then(function(inputData){
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
function getInputData(STATE,socket,numOfCpus){
    const appName = socket.appName;
    let toSend = STATE.cachedInputData[appName].splice(0,numOfCpus);
    const dataIds = toSend.map(function(item){
        return item.id
    })
    DBUtils.assignInputData(appName,dataIds,socket.ip)
    return toSend.length !== 0 ? toSend : null
}

function sendInputDataToWorkers(STATE,socket,numOfCpus){
    const inputDataToSend = getInputData(STATE,socket,numOfCpus)
    if(inputDataToSend){
        for(let i=0;i<numOfCpus;i++){
            if(i < inputDataToSend.length){
                socket.emit('inputData', {workerNum: i, inputData : inputDataToSend[i]});
            }
        }
    }
}
function sendInputDataToSingleWorker(STATE,socket,workerNum){
    const inputDataToSend = getInputData(STATE,socket,1)
    if(inputDataToSend){
        socket.emit('inputData', {workerNum: workerNum, inputData : inputDataToSend[0]});
    }
}
module.exports = {
    init: init,
    getInputData : getInputData,
    sendInputDataToWorkers : sendInputDataToWorkers,
    sendInputDataToSingleWorker : sendInputDataToSingleWorker
}