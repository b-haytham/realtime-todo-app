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

const users = []
const todos = []

nextApp.prepare().then(() => {
    


    io.on('connection', (socket)=> {
        console.log('new Connection')
        socket.emit('welcome', 'welcome')
    
        socket.on('new-user', u=> {
            const user = {
                id: socket.id,
                username: u
            }

            users.push(user)

            socket.emit('new-user-success', user)

            io.emit('all-users', users)
        })

        
        socket.on('position', p=> {

            const user = users.find(u=> u.id === p.userId)

            socket.broadcast.emit('position', {
                    position: p.position,
                    username: user.username
            })
        })


        socket.on('new-todo', (td)=> {
            const user = users.find(u=> u.id === socket.id)

            const todo = {
                id: Date.now(),
                text: td,
                user, 
            }

            todos.push(todo)

            io.emit('all-todos', todos)
        })
        

        socket.on('delete-todo', (t)=> {
            const objectIndex = todos.findIndex(todo=> todo.id === t.id)
            console.log(objectIndex)
            todos.splice(objectIndex, 1)

            io.emit('todo-deleted', t)
            io.emit('all-todos', todos)
        })

        socket.on('get-user', username=> {
            const user =  users.find(u=> u.username === username)
            console.log(user)

            socket.emit('get-user', user)
        })



    })


    app.get('/users', (req, res)=> {
        res.json(users)
    })

    app.get('/todos', (req, res)=> {
        res.json(todos)
    })

    app.all("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
