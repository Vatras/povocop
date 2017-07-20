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
    res_timestamp: Sequelize.DATE,
    result: Sequelize.JSON
});


function createTable(){
    Result.sync();
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
        console.log(res.dataValues);
});
}
module.exports = {
    init: init,
    insertResult : insertResult
}