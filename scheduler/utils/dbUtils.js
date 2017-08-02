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
    result: Sequelize.JSON,
    uuid: {type: Sequelize.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4},
    approved: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    valid: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
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
    includesInputData: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
});

function createTable(resolve){
    Result.sync();
    InputData.sync()
    ComputationConfig.sync().then(()=>{
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

    console.log(JSON.stringify(data))
    upsert(data, { "appName" : data.appName})
}
function insertResult(data){
    Result.create(data)
    Result.findOne().then(res => {
        const response = res ? res.dataValues : null;
        console.log(response);
    });
}
function deleteInputData(appName,cb){
    InputData.destroy({where : {appName: appName}}).then(res => {
        const response = res ? res : null;
        console.log(response);
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
        ComputationConfig.findOne({where : {appName : appName}},{attributes: ['appName', 'config','code','config','includesInputData']}).then(res => {
            res = res || {}
            cb(res)
        });
    }else{
        ComputationConfig.findAll({attributes: ['appName', 'config','code','config','includesInputData','redundancyFactor']}).then(res => {
            cb(res)
        });
    }
}
function getResults(appName,cb){
    Result.findAll({}).then(res => {
        // console.log(res);
        cb(res)
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
module.exports = {
    assignInputData : assignInputData,
    init: init,
    getResults: getResults,
    getConfigData : getConfigData,
    getInputData: getInputData,
    deleteInputData : deleteInputData,
    insertInputData : insertInputData,
    insertResult : insertResult,
    insertConfigData : insertConfigData
}