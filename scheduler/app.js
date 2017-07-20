const express = require('express')
const app = express()
const port = 9000;
const cors = require('cors')
const TokenUtils = require('./utils/tokenUtils')

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(cors({credentials: true, origin: true}))
app.get('/',  (req, res) => {
    res.send('Hello World!')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})

io.on('connection', (socket) => {
    let decodedToken=TokenUtils.validateToken(socket.handshake.query.povocoptoken);
    socket.emit('computationData', { interationCount: 10000 });

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

});