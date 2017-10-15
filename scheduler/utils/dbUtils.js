/**
 * Created by Pjesek on 20.07.2017.
 */
const CONFIG =  require('../config')
const Sequelize = require('sequelize');
const sequelize = new Sequelize(CONFIG.dbName, CONFIG.dbUser, CONFIG.dbPassword, {
    host: CONFIG.dbHost,
    dialect: 'postgres',
    logging: CONFIG.dbLogging
});
const Result = sequelize.define('result', {
    username: Sequelize.STRING,
    appName: Sequelize.STRING,
    ip: Sequelize.STRING,
    result: Sequelize.JSON,
    uuid: {type: Sequelize.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4},
    approved: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
});
const InputData = sequelize.define('InputData', {
    data: Sequelize.JSON,
    appName: Sequelize.STRING,
    assignedTo: { type: Sequelize.STRING, allowNull: true, defaultValue: ''},
});
const ComputationConfig = sequelize.define('ComputationConfig', {
    config: Sequelize.JSON,
    code: Sequelize.TEXT,
    redundancyFactor: Sequelize.NUMERIC,
    appName: Sequelize.STRING,
    restartAllWorkersOnConfigChange: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    provideLastResultInConfig: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    includesInputData: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
});
Result.belongsTo(InputData, {as: 'InputData'});
ComputationConfig.belongsTo(Result, {as: 'LastApprovedResult'});
function createTable(resolve){
    InputData.sync().then(()=>Result.sync()).then(()=>ComputationConfig.sync()).then(()=>{
        resolve();
    })
}
function init(){
    return new Promise((resolve,reject)=>{
        sequelize
            .authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
                createTable(resolve,reject);
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
    })

}
function associateResultWithInput(result,inputId){
    InputData.findOne({where:{ id: inputId}}).then((inputObject)=>{
        result.setInputData(inputObject).then((res)=>{
            // console.log(res)
            }
        );
    });
}
function insertConfigData(data,cb){
    function upsert(values, condition) {
        return ComputationConfig
            .findOne({ where: condition })
            .then(function(obj) {
                if(obj) { // update
                    obj.update(values);
                    cb(values)
                }
                else { // insert
                    const item = ComputationConfig.create(values);
                    cb(values)
                }
            }).catch(function(error){
            console.log(error)
            cb(error);
        })
    }

    // console.log(JSON.stringify(data))
    upsert(data, { "appName" : data.appName})
}
function setLatestResultToConfig(appName, result, cb){
    ComputationConfig.findOne({where: {appName: appName}}).then(compConfig => {
        compConfig.setLastApprovedResult(result);
        cb();
    })

}
function insertResult(data,cb){
    Result.create(data).then(res => {
        cb(res)
    });
}
function deleteInputData(appName,cb){
    InputData.destroy({where : {appName: appName}}).then(res => {
        const response = res ? res : null;
        // console.log(response);
        cb(response)
    });
}
//change to (data,err,cb)
function insertInputData(data,appName,cb){
    InputData.bulkCreate(data,{options:{fields:[{appName: appName}]}}).then(function(response){
        cb(response);
    })
        .catch(function(error){
            console.log(error)
            cb(error);
        })
}

function getConfigData(appName,cb){
    const getOne = appName;
    if(getOne){
        ComputationConfig.findOne({where : {appName : appName},include: [{
                model: Result,
                as: 'LastApprovedResult',
                include: [{
                    model: InputData,
                    as: 'InputData',
                }]
            }]
                // attributes: ['appName', 'config','code','config','includesInputData','redundancyFactor']
            }
        // ,{attributes: ['appName', 'config','code','config','includesInputData']}
        ).then(res => {
            res = res || {}
            // res.lastApprovedResult = res.lastApprovedResult && res.lastApprovedResult.dataValues ? res.lastApprovedResult.dataValues : {};
            cb(res)
        });
    }else{
        ComputationConfig.findAll({include: [{
            model: Result,
            as: 'LastApprovedResult',
            include: [{
                model: InputData,
                as: 'InputData',
            }]
        }]
            // attributes: ['appName', 'config','code','config','includesInputData','redundancyFactor']
        }).then(res => {
            cb(res)
        });
    }
}
function getPendingResultsForApp(appName,cb){
    Result.findAll({where : {appName : appName, approved : false},include: [{
        model: InputData,
        as: 'InputData'
    }]}).then(res => {
        cb(res)
    });
}
function getResults(appName,cb){
    Result.findAll({}).then(res => {
        cb(res)
    });
}
function getLastApprovedResult(appName,cb){
    Result.max('id', {where : {appName : appName, approved : true}
    }).then(resultId =>
        Result.findOne({where : {id : resultId}
            ,include: [{
                model: InputData,
                as: 'InputData'
            }]})).then(result => {
                if(result){
                    cb({result: result.dataValues.result, inputData:result.InputData ? result.InputData.dataValues.data : {}})
                }
    });
}
function assignInputData(appName,dataIds,ip){
    InputData.update({ assignedTo: ip },{where : {appName : appName, assignedTo : '', id : {$in : dataIds}}}).then(data => {

    });
}
function getInputData(appName,cb,options = {}){
    const getOne = appName;

    if(getOne){
        let condition = options.getNotAssigned ? {where : {appName : appName, assignedTo : ''}} : {where : {appName : appName}}
        condition.limit = options.limit
        InputData.findAll(condition).then(res => {
            cb(res)
        });
    }else{
        let condition = options.getNotAssigned ? {where : {assignedTo : ''}} : {}
        if(options.limit){
            condition.limit = options.limit
        }
        InputData.findAll(condition).then(res => {
            cb(res)
        });
    }
}
function approveResult(result,cb){
    Result.findOne({where: {uuid: result.data.uuid},include: [{
        model: InputData,
        as: 'InputData',
    }]} )
        .then(dbResult =>
            dbResult.set('approved',true)
        ).then(dbApprovedResult =>{
            cb(dbApprovedResult)
        })
}
function deleteResult(result){
    Result.destroy({where : {uuid: result.data.uuid}}).then(res => {
        console.log("removed rejected result")
    });
}
function getInputDataForResult(result,cb){
    Result.findOne({where:{ uuid: result.data.uuid}}).then(dbResult =>{
        if(dbResult){
            dbResult.getInputData().then(inputData=>{
                cb(inputData)
            })
        }else{
            console.log('no dbResult')
        }

    })
}

function resetAssignment(inputData,cb){
    return InputData.update({assignedTo: ''},{where:{id :inputData.id}})
}
module.exports = {
    approveResult : approveResult,
    assignInputData : assignInputData,
    associateResultWithInput : associateResultWithInput,
    deleteResult : deleteResult,
    getResults: getResults,
    getLastApprovedResult : getLastApprovedResult,
    getInputDataForResult : getInputDataForResult,
    getConfigData : getConfigData,
    getInputData: getInputData,
    getPendingResultsForApp : getPendingResultsForApp,
    deleteInputData : deleteInputData,
    init: init,
    insertInputData : insertInputData,
    insertResult : insertResult,
    insertConfigData : insertConfigData,
    resetAssignment : resetAssignment,
    setLatestResultToConfig : setLatestResultToConfig
}