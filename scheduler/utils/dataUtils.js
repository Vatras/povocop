/**
 * Created by Pjesek on 28.07.2017.
 */
const DBUtils = require('./dbUtils')
function init(STATE){
    addConfigDataToState(STATE);
    addInputDataToState(STATE);
}
function addConfigDataToState(STATE){
    DBUtils.getConfigData(null,function(res){
        let configs = res || [];
        STATE.config = {}
        configs.forEach(function(val){
            STATE.config[val.dataValues.appName]=val.dataValues;
        })
    })
}
function addInputDataToState(STATE){
    DBUtils.getInputData(null,function(res){
        let configs = res || [];
        STATE.cachedInputData = {}
        configs.forEach(function(val,idx){
            if(idx === 0){
                STATE.cachedInputData[val.dataValues.appName]=[];
            }
            STATE.cachedInputData[val.dataValues.appName].push(val.dataValues);
        },{getNotAssigned : true})
    })
}
module.exports = {
    init: init
}