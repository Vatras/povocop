/**
 * Created by pjesek on 12.08.17.
 */
const DBUtils = require('./dbUtils')

function verifyHandler(result,STATE,socket){
    const redundancyFactor = STATE.redundancyFactors[socket.appName]
    var pendingResult = STATE.pendingResults[socket.appName].find(function(val){return val.results.uuid === result.data.uuid});
    if(!pendingResult){return;}

    if(result.status){
        pendingResult.approves=pendingResult.approves ? pendingResult.approves+1 : 1
    }else{
        pendingResult.rejects=pendingResult.rejects ? pendingResult.rejects+1 : 1
    }
    if(pendingResult.approves  >= redundancyFactor){
        console.log('result approved!')
    }
    else if(pendingResult.rejects >= redundancyFactor){
        console.log('result rejected!')
        // blacklist(pendingResult.inputData.assignedTo);
        // rejectResult();
    }
    else if(pendingResult.rejects + pendingResult.approves >= redundancyFactor){
        const randomSocketsArray = getRandomSockets(1,socket.ip,STATE.socketMap[socket.appName]);
        randomSocketsArray.forEach(function(randomSocket){
            randomSocket.emit('verify',result)
        })
        if(randomSocketsArray.length == 0){
            pendingResult.verifiesLeftToBeAssigned=1;
        }
    }
}

function newResultHandler(result,STATE,socket){
    const verifiesRemaining = STATE.redundancyFactors[socket.appName];
    const randomSocketsArray = getRandomSockets(verifiesRemaining,socket.ip,STATE.socketMap[socket.appName]);
    randomSocketsArray.forEach(function(randomSocket){
        randomSocket.emit('verify',result)
    })
    STATE.pendingResults[socket.appName].push({
        results : result,
        verifiesLeftToBeAssigned : verifiesRemaining - randomSocketsArray.length
    })
}
function getRandomSockets(count,ip,socketMap){
    return socketMap.filter((val) => val.ip != ip).sort(() => .5 - Math.random()).slice(0,count);
}
module.exports = {
    verifyHandler: verifyHandler,
    newResultHandler : newResultHandler
}