"use strict";

const express = require('express')
const app = express()
const port = 9000;
const cors = require('cors')

const TokenUtils = require('./utils/tokenUtils')
const DBUtils = require('./utils/dbUtils')
const DataUtils = require('./utils/dataUtils')
const ResultUtils = require('./utils/resultUtils')
const bodyParser = require('body-parser')

const server = require('http').Server(app);
const io = require('socket.io')(server);
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const socketEventsEmitter = new MyEmitter();
let STATE = {
    redundancyFactors: {},
    config : {},
    apps : [],
    socketMap : [],
    pendingResults : {}
}

DBUtils.init().then(() => {
    DataUtils.init(STATE).then(initSocketsAndHTTP);
});


app.use(bodyParser.json({limit: '50mb', extended: true, parameterLimit:500000}));

app.use(express.static('public'))
app.use(cors({credentials: true, origin: true}))
app.get('/',  (req, res) => {
    res.send('Hello World!')
})
app.post('/data/:appname',  (req, res) => {
    const appName = req.params.appname;
    req.body.data.map(function(val){
        val.appName=appName;
        return val;
    })
    DBUtils.insertInputData(req.body.data,appName,function(response){
        res.json(response)
    });
});
app.delete('/data/:appname',  (req, res) => {
    const appName = req.params.appname;
    DBUtils.deleteInputData(appName,function(response){
        res.json({})
    });
});
app.post('/config/:appname',  (req, res) => {
    const appName = req.params.appname;
    req.body.data.appName = appName;
    const redundancyFactor = req.body.data.redundancyFactor
    req.body.data.redundancyFactor = redundancyFactor !== "" ? parseInt(redundancyFactor) :0;
    DBUtils.insertConfigData(req.body.data,function(response){
        newConfigCallback(response);
        res.json(response)
    });
});
app.get('/config/:appname',  (req, res) => {
    const appName = req.params.appname;
    DBUtils.getConfigData(appName,function(response){
        res.send(response)
    });
});
app.get('/data/:appname',  (req, res) => {
    const appName = req.params.appname;
    DBUtils.getInputData(appName,function(response){
        res.send({inputData: response})
    },{getNotAssigned : true});
});
app.get('/manager/config/:appname',  (req, res) => {
    const appName = req.params.appname;
    res.sendFile(process.cwd()+'/views/computationConfig.html')
});
app.get('/manager/data/:appname',  (req, res) => {
    const appName = req.params.appname;
    res.sendFile(process.cwd()+'/views/inputDataView.html')
});
app.get('/results/:appname',  (req, res) => {
    const appName = req.params.appname;
    DBUtils.getResults(appName,function(results){
        res.send(results)
    })
})
function newConfigCallback(response){
    const appName = response.appName
    if(!STATE.apps.includes(appName)){
        STATE.apps.push(appName);
        STATE.pendingResults[appName] = []
        const nsp = io.of(`/${appName}`);
        nsp.on('connection', socketHandler)
    }
    STATE.redundancyFactors[appName]=parseInt(response.redundancyFactor);
    delete response['redundancyFactor'];
    STATE.config[appName]=response;
    socketEventsEmitter.emit('newConfig')
}
function initSocketsAndHTTP(configuredState){
    STATE = configuredState;
    server.listen(port, () => {
        console.log(`Example app listening on port ${port}!`)
    })

    STATE.apps = [];

    for(let app in STATE.config){
        const nsp = io.of('/'+app);
        STATE.apps.push(app)
        STATE.socketMap[app]=[]
        nsp.on('connection', socketHandler)
    }
    const nsp = io.of('/random');
    nsp.on('connection', socketHandler)
    // io.on('connection', socketHandler)

}

function socketHandler(socket){
    socket.ip = socket.handshake.address
        + Math.random(); //for debug only
    socket.results = [];
    console.log('New connection from ' + socket.ip);
    const nsp = this;
    socket.appName = nsp.name !== '/random' ? nsp.name.split('/').join('') : STATE.apps[Math.floor((Math.random() * STATE.apps.length))]
    STATE.socketMap[socket.appName].push(socket)
    console.log(socket.appName)
    let resultsCount = 0
    let lastResultsCount = 0
    let decodedToken=TokenUtils.validateToken(socket.handshake.query.povocoptoken);
    //for debugging - remove it later!
    setInterval(function(){
        nsp.emit('state', STATE);
    },5000)

    const isTokenInRequest = decodedToken;
    const isUsernameInRequest = isTokenInRequest && decodedToken.povocopusername;
    socketEventsEmitter.on('newConfig',() =>{
        socket.emit('computationConfig', STATE.config[socket.appName]);
    })
    if(!isTokenInRequest){
        socket.emit('computeNumOfCpu', {});
        socket.once('numOfCpus', (numOfCpus) => {
            const tokenToSend = TokenUtils.createToken(socket,numOfCpus)
            socket.inputData = new Array(numOfCpus);
            socket.emit('token', tokenToSend);
            socket.emit('computationConfig', STATE.config[socket.appName]);
            ResultUtils.sendPendingVerificationsToAllWorkers(STATE,socket,numOfCpus)
            if(STATE.config[socket.appName].includesInputData){
                DataUtils.sendInputDataToWorkers(STATE,socket,numOfCpus)
            }

        });
    }else if(!isUsernameInRequest){
        const tokenToSend = TokenUtils.createToken(socket,decodedToken.numOfCpus)
        socket.inputData = new Array(decodedToken.numOfCpus);
        socket.emit('token', tokenToSend)
        socket.emit('computationConfig', STATE.config[socket.appName]);
        ResultUtils.sendPendingVerificationsToAllWorkers(STATE,socket,decodedToken.numOfCpus)
        if(STATE.config[socket.appName].includesInputData){
            DataUtils.sendInputDataToWorkers(STATE,socket,decodedToken.numOfCpus)
        }
    }else{
        socket.povocopData=decodedToken;
        socket.inputData = new Array(decodedToken.numOfCpus)
        socket.emit('computationConfig', STATE.config[socket.appName]);
        ResultUtils.sendPendingVerificationsToAllWorkers(STATE,socket,decodedToken.numOfCpus)
        if(STATE.config[socket.appName].includesInputData){
            DataUtils.sendInputDataToWorkers(STATE,socket,decodedToken.numOfCpus)
        }
    }
    socket.on('results', (results) => {
        resultsCount++;
        const username = socket.povocopData ? socket.povocopData.povocopusername : 'anonymous'
        console.log('results',results)
        const needsVerification = STATE.redundancyFactors[socket.appName] != 0;
        const approved = !needsVerification;
        DBUtils.insertResult({
            username: username,
            appName: socket.appName,
            result: results,
            approved : approved,
            ip : socket.ip
        },function(result){
            const workerNum = results.workerNum;
            const connectedInputData = socket.inputData[workerNum];
            DataUtils.removeAssignment(socket,results,result,connectedInputData);
            delete result.dataValues.ip;
            if(needsVerification){ResultUtils.newResultHandler(result.dataValues,STATE,socket,connectedInputData)}
        })

        if(STATE.config[socket.appName].includesInputData){
            DataUtils.sendInputDataToSingleWorker(STATE,socket,results.workerNum)
        }
    })
    socket.on('verified',(result)=>{ResultUtils.verifyHandler(result,STATE,socket)});

    let interval = setInterval(() => {
        if(!socket.povocopData){
            return
        }
        let strength = resultsCount - lastResultsCount;
        lastResultsCount = resultsCount;
        socket.povocopData.points+=strength;
        const tokenToSend = TokenUtils.updateToken(socket)
        socket.emit('token', tokenToSend);
    },1000*20*1)

    socket.on('disconnect',()=>{
        ResultUtils.handleInputDataReassignment({inputData : socket.inputData},socket, STATE);
        ResultUtils.handleResultVerificationReassignment({results : socket.results},socket, STATE);
        console.log("disconnected!",socket.povocopData ? socket.povocopData.povocopusername : 'anonymous',socket.id)
        clearInterval(interval);
        interval = null;
        STATE.socketMap[socket.appName] = STATE.socketMap[socket.appName].filter(item => item.id !== socket.id)
    })
}