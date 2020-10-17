const express = require("express");
const next = require("next");
const http = require("http");
const socketio = require("socket.io");
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express()
const server =  http.createServer(app);
const io = socketio(server)

nextApp.prepare().then(() => {
    
    io.on('connection', (socket)=> {
        console.log('new Connection')
        socket.emit('welcome', 'welcome') 
    })



    app.all("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
