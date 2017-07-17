const express = require('express')
const app = express()
const port = 9000;
app.get('/',  (req, res) => {
    res.send('Hello World!')
})

const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})


io.on('connection', function (socket) {
    socket.emit('computationData', { interationCount: 10000 });
});