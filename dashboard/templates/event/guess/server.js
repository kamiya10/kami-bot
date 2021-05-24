const http = require('http')
const express = require('express')
const config = require("../../../../config");

const app = express()
app.use(express.static('public'))

app.set('port', '80')

    // We bind the domain.
    app.locals.domain = config.domain.split("//")[1];

    app.get("/", function (req, res) {
            res.redirect("https://youtu.be/dQw4w9WgXcQ");
    });

const server = http.createServer(app)
server.on('listening', () => {
 console.log('Listening on port 80')
})

// Web sockets
const io = require('socket.io')(server)

io.sockets.on('connection', (socket) => {
    socket.broadcast.emit('connectionUpdate', null);

	console.log('Client connected: ' + socket.id)
	socket.on('mouse', (data) => socket.broadcast.emit('mouse', data))
	socket.on('canvasClear', (data) => socket.broadcast.emit('canvasClear', data))
	socket.on('updateCanvas', canvas => socket.broadcast.emit('updateCanvas', canvas))
	socket.on('disconnect', () => console.log('Client has disconnected'))
})
server.listen('80')