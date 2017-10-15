/**
 * Created by pjesek on 14.09.17.
 */
const basicAuth = require('basic-auth');
const uuidv4 = require('uuid/v4');
var login;
var password;
var setCredentials=function(){
    login='povocop';
    password=uuidv4().split('-').join('');
    console.log(`credentialsToUse: ${login}:${password}`)
    console.log('')
}

var auth = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.send(401);
    };

    var user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    };

    if (user.name === login && user.pass === password) {
        return next();
    } else {
        return unauthorized(res);
    };
};

module.exports={
    'basicAuth': auth,
    'setCredentials' :setCredentials
}