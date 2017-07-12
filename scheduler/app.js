const express = require('express')
const app = express()
const port = 9000;
app.get('/',  (req, res) => {
    res.send('Hello World!')
})

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})


io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('a', function (data) {
        console.log(data);
    });
});