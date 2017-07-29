/**
 * Created by Pjesek on 28.07.2017.
 */
const DBUtils = require('./dbUtils')
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
                }, {getNotAssigned: true, limit: 500})
            })(app)
        })
    })
}
module.exports = {
    init: init
}