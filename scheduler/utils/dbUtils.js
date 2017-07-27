/**
 * Created by Pjesek on 20.07.2017.
 */
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:povocop@127.0.0.1:5432/povocop_1');
// const sequelize = new Sequelize('povocop_1', 'postgres', 'povocop', {
//     host: '127.0.0.1',
//     dialect: 'postgres'
// });
const Result = sequelize.define('result', {
    username: Sequelize.STRING,
    result: Sequelize.JSON
});
const InputData = sequelize.define('InputData', {
    data: Sequelize.JSON,
    appName: Sequelize.STRING,
    assigned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
});
const ComputationConfig = sequelize.define('ComputationConfig', {
    config: Sequelize.JSON,
    appName: Sequelize.STRING,
    includesInputData: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
});

function createTable(){
    Result.sync();
    InputData.sync()
    ComputationConfig.sync()
}
function init(){
    sequelize
        .authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
            createTable();
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
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
                    var item = ComputationConfig.create(values);
                    cb(item)
                }
            }).catch(function(error){
            console.log(error)
            cb(error);
        })
    }

    console.log(JSON.stringify(data))
    upsert(data, { "appName" : data.appName})
    // ComputationConfig.create(data)
}
function insertResult(data){
    Result.create(data)
    Result.findOne().then(res => {
        var response = res ? res.dataValues : null;
        console.log(response);
    });
}
function deleteInputData(appName,cb){
    InputData.destroy({where : {appName: appName}}).then(res => {
        var response = res ? res.dataValues : null;
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
    ComputationConfig.findOne({where :{appName : appName}}).then(res => {
        cb(res)
    });
}
function getResults(appName,cb){
    Result.findAll({}).then(res => {
        // console.log(res);
        cb(res)
    });
}
function getInputData(appName,cb){
    InputData.findAll({where : {appName : appName}}).then(res => {
        cb(res)
    });
}
module.exports = {
    init: init,
    getResults: getResults,
    getConfigData : getConfigData,
    getInputData: getInputData,
    deleteInputData : deleteInputData,
    insertInputData : insertInputData,
    insertResult : insertResult,
    insertConfigData : insertConfigData
}