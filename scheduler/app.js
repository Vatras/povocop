const express = require('express')
const app = express()
const port = 9000;
const cors = require('cors')

const TokenUtils = require('./utils/tokenUtils')
const DBUtils = require('./utils/dbUtils')

const server = require('http').Server(app);
const io = require('socket.io')(server);

DBUtils.init();

app.use(cors({credentials: true, origin: true}))
app.get('/',  (req, res) => {
    res.send('Hello World!')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})

io.on('connection', (socket) => {
    let resultsCount = 0
    let lastResultsCount = 0
    let decodedToken=TokenUtils.validateToken(socket.handshake.query.povocoptoken);
    socket.emit('computationData', { interationCount: 100000000 });

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
        const username = socket.povocopData.povocopusername
        console.log('results',results)
        DBUtils.insertResult({
            username: username,
            res_timestamp: new Date(),
                result: results
        })
        // socket.emit('computationData', { interationCount: 100000000 });
    })
    let interval = setInterval(() => {
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