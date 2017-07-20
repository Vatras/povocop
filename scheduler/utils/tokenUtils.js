/**
 * Created by Pjesek on 20.07.2017.
 */
const jwt = require('jwt-simple');
const secret = process.env.secret || 'abXcdEF96412'
function createToken(socket,numOfCpus){
    const username = socket.handshake.query.povocopusername;
    console.log("username:",username)
    const payload = {
        numOfCpus: numOfCpus,
        points: 0
    };
    if(username && username.length>0){
        payload.povocopusername = username;
    }
    socket.povocopData=payload;
    const token = jwt.encode(payload, secret);
    return token;
}
function updateToken(socket){
    const payload = socket.povocopData
    console.log('updating the token',payload)
    const token = jwt.encode(payload, secret);
    return token;
}
function validateToken(povocopToken){
    const segments = povocopToken.split('.');
    if (segments.length === 3) {
        const decodedToken = povocopToken ? jwt.decode(povocopToken, secret) : '';
        console.log("decodedToken ",decodedToken)
        return decodedToken;
    }
    return null;
}

module.exports = {
    createToken : createToken,
    updateToken : updateToken,
    validateToken : validateToken
}