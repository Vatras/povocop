const express = require('express')
const app = express()
const port = 9000;
const cors = require('cors')

const TokenUtils = require('./utils/tokenUtils')
const DBUtils = require('./utils/dbUtils')
const DataUtils = require('./utils/dataUtils')
const bodyParser = require('body-parser')

const server = require('http').Server(app);
const io = require('socket.io')(server);
let STATE = {}

DataUtils.init(STATE)
DBUtils.init();
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'))
app.use(cors({credentials: true, origin: true}))
app.get('/',  (req, res) => {
    res.send('Hello World!')
})
app.post('/data/:appname',  (req, res) => {
    var appName = req.params.appname;
    req.body.data.map(function(val){
        val.appName=appName;
        return val;
    })
    DBUtils.insertInputData(req.body.data,appName,function(response){
        res.json(response)
    });
});
app.delete('/data/:appname',  (req, res) => {
    var appName = req.params.appname;
    DBUtils.deleteInputData(appName,function(response){
        res.json(response)
    });
});
app.post('/config/:appname',  (req, res) => {
    var appName = req.params.appname;
    req.body.data.appName = appName;
    DBUtils.insertConfigData(req.body.data,function(response){
        res.json(response)
    });
});
app.get('/config/:appname',  (req, res) => {
    var appName = req.params.appname;
    DBUtils.getConfigData(appName,function(response){
        res.send(response)
    });
});
app.get('/data/:appname',  (req, res) => {
    var appName = req.params.appname;
    DBUtils.getInputData(appName,function(response){
        res.send(response)
    },{getNotAssigned : true});
});
app.get('/manager/config/:appname',  (req, res) => {
    var appName = req.params.appname;
    res.sendFile(process.cwd()+'/views/computationConfig.html')
});
app.get('/manager/data/:appname',  (req, res) => {
    var appName = req.params.appname;
    res.sendFile(process.cwd()+'/views/inputDataView.html')
});
app.get('/results/:appname',  (req, res) => {
    var appName = req.params.appname;
    DBUtils.getResults(appName,function(results){
        res.send(results)
    })
})
server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})

io.on('connection', (socket) => {
    let resultsCount = 0
    let lastResultsCount = 0
    let decodedToken=TokenUtils.validateToken(socket.handshake.query.povocoptoken);
    socket.emit('computationData', { interationCount: 100000000 });
    //for debugging - remove it later!
    setInterval(function(){
        socket.emit('state', STATE);
    },5000)

    const isTokenInRequest = decodedToken;
    const isUsernameInRequest = isTokenInRequest && decodedToken.povocopusername;
    if(!isTokenInRequest){
        socket.emit('computeNumOfCpu', {});
        socket.once('numOfCpus', (numOfCpus) => {
            const tokenToSend = TokenUtils.createToken(socket,numOfCpus)
            socket.emit('token', tokenToSend);
        });
    }else if(!isUsernameInRequest){
        const tokenToSend = TokenUtils.createToken(socket,decodedToken.numOfCpus)
        socket.emit('token', tokenToSend)
    }else{
        socket.povocopData=decodedToken;
    }
    socket.on('results', (results) => {
        resultsCount++;
        const username = socket.povocopData ? socket.povocopData.povocopusername : 'anonymous'
        console.log('results',results)
        DBUtils.insertResult({
            username: username,
            result: results
        })
        socket.emit('computationData', { interationCount: 100000000 });
    })
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
        console.log("disconnected!",socket.povocopData.povocopusername)
        clearInterval(interval);
        interval = null;
    })
});