/**
 * Created by pjesek on 12.08.17.
 */
const DBUtils = require('./dbUtils')
const socketEventsEmitter = require('./socketEventEmitter')

function verifyHandler(result,STATE,socket){
    const redundancyFactor = STATE.redundancyFactors[socket.appName]
    var pendingResult = STATE.pendingResults[socket.appName].find(function(val){
        return val.uuid == result.data.uuid
    });
    socket.results = socket.results.filter((val)=>{
        return val.uuid != result.data.uuid
    })
    if(!pendingResult){return;}

    if(result.status){
        pendingResult.approves=pendingResult.approves ? pendingResult.approves+1 : 1
    }else{
        pendingResult.rejects=pendingResult.rejects ? pendingResult.rejects+1 : 1
    }
    if(pendingResult.approves  >= redundancyFactor){
        console.log('result approved!',result.data.uuid)
        approveResult(result,socket.appName,STATE);
    }
    else if(pendingResult.rejects >= redundancyFactor){
        console.log('result rejected!',result.data.uuid)
        // blacklist(pendingResult.inputData.assignedTo);
        handleInputDataReassignment({result : result},socket,STATE)
        rejectResult(result);
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
function handleInputDataReassignment(data, socket, STATE) {
    if (data.result) {
        DBUtils.getInputDataForResult(data.result,function(dbInputData){
            DBUtils.resetAssignment(dbInputData.dataValues).then(()=>{
                STATE.cachedInputData[socket.appName].push(dbInputData.dataValues);
            })
        })
    } else if (data.inputData){
        socket.inputData.filter((val)=>{return val != null}).forEach((val)=>{

            ((inputDataValue) =>{
                DBUtils.resetAssignment(inputDataValue).then(()=>{
                    STATE.cachedInputData[socket.appName].push(inputDataValue);
                })
            })(val)
        })
    }

}
function handleResultVerificationReassignment(data, socket, STATE) {
    socket.results.forEach((result)=>{
        let resultToChange = STATE.pendingResults[socket.appName].find(function(val){
            return val.uuid == result.uuid
        });
        if(resultToChange){
            resultToChange.verifiesLeftToBeAssigned +=1;
            resultToChange.ip ='';
        }
    })
}
function approveResult(result,appName,STATE){
    DBUtils.approveResult(result,function(dbResult){
        DBUtils.setLatestResultToConfig(appName,dbResult,function(){
            if(STATE.config[appName].provideLastResultInConfig == true){
                STATE.config[appName].lastApprovedResult = {result: dbResult.dataValues.result, inputData: dbResult.InputData ? dbResult.InputData.dataValues.data : null};
                socketEventsEmitter.emit('newConfig');
            }
        });
    });
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
        console.log('sending pending verification to',socket.id)
        socket.emit('verify',{results: pendingResult.results, uuid: pendingResult.uuid})
        socket.results.push({results: pendingResult.results, uuid: pendingResult.uuid})
    }
}
function newResultHandler(result,STATE,socket,connectedInputData){
    console.log('new result from',socket.id)
    const verifiesRemaining = STATE.redundancyFactors[socket.appName];
    const randomSocketsArray = getRandomSockets(verifiesRemaining,socket.ip,STATE.socketMap[socket.appName]);
    result.inputData = connectedInputData ? connectedInputData.data : null;
    randomSocketsArray.forEach(function(randomSocket){
        console.log('sending verification to',randomSocket.id)
        randomSocket.emit('verify',result)
        randomSocket.results.push(result);
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
    handleInputDataReassignment : handleInputDataReassignment,
    handleResultVerificationReassignment : handleResultVerificationReassignment
}