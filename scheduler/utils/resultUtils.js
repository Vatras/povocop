/**
 * Created by pjesek on 12.08.17.
 */
const DBUtils = require('./dbUtils')

function verifyHandler(result,STATE,socket){
    const redundancyFactor = STATE.redundancyFactors[socket.appName]
    var pendingResult = STATE.pendingResults[socket.appName].find(function(val){
        return val.uuid === result.data.uuid
    });
    if(!pendingResult){return;}

    if(result.status){
        pendingResult.approves=pendingResult.approves ? pendingResult.approves+1 : 1
    }else{
        pendingResult.rejects=pendingResult.rejects ? pendingResult.rejects+1 : 1
    }
    if(pendingResult.approves  >= redundancyFactor){
        console.log('result approved!',result.data.uuid)
        approveResult(result);
    }
    else if(pendingResult.rejects >= redundancyFactor){
        console.log('result rejected!',result.data.uuid)
        // blacklist(pendingResult.inputData.assignedTo);
        rejectResult(result);
        handleInputDataReassignment({result : result})
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
function handleInputDataReassignment(data){
    if(data.result){

    }else{

    }
}
function approveResult(result){
    DBUtils.updateResult(result,{approved: true});
}
function rejectResult(result){
    DBUtils.deleteResult(result,{approved: false});
}
function sendPendingVerificationsToAllWorkers(STATE,socket,numOfCpus){
    for(let i=0;i<numOfCpus;i++){
        sendPendingVerifications(STATE,socket);
    }
}
function sendPendingVerifications(STATE,socket){
    var pendingResult = STATE.pendingResults[socket.appName].find(function(val){
        return val.verifiesLeftToBeAssigned > 0 && val.ip != socket.ip
    });
    if(pendingResult){
        pendingResult.verifiesLeftToBeAssigned--;
        socket.emit('verify',{results: pendingResult.results, uuid: pendingResult.uuid})
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
        verifiesLeftToBeAssigned : verifiesRemaining - randomSocketsArray.length,
        ip : socket.ip
    })
}
function getRandomSockets(count,ip,socketMap){
    return socketMap.filter((val) => val.ip != ip).sort(() => .5 - Math.random()).slice(0,count);
}
module.exports = {
    verifyHandler: verifyHandler,
    newResultHandler : newResultHandler,
    sendPendingVerifications : sendPendingVerifications,
    sendPendingVerificationsToAllWorkers : sendPendingVerificationsToAllWorkers,
    handleInputDataReassignment : handleInputDataReassignment
}