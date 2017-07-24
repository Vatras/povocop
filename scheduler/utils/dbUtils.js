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
    assigned: Sequelize.BOOLEAN
});

function createTable(){
    Result.sync();
    InputData.sync()
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
function insertResult(data){
    Result.create(data)
    Result.findOne().then(res => {
        var response = res ? res.dataValues : null;
        console.log(response);
    });
}
function insertInputData(data,res){
    InputData.bulkCreate(data) .then(function(response){
        res.json(response);
    })
        .catch(function(error){
            console.log(error)
            res.json(error);
        })
}

function getResults(appName,cb){
    Result.findAll({}).then(res => {
        // console.log(res);
        cb(res)
    });
}
function getInputData(appName,cb){
    InputData.findAll({}).then(res => {
        cb(res)
    });
}
module.exports = {
    init: init,
    getResults: getResults,
    getInputData: getInputData,
    insertInputData : insertInputData,
    insertResult : insertResult
}