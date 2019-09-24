/* global require, module, __dirname */
const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const publicPath = path.join(__dirname, '../../public');

app.use(express.json());

//set up static folder
app.use(express.static(publicPath));

io.on('connection', (socket) => {

    socket.on('join', (options, callback) => {
        const { error, user: { room, username } = {} } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(room);
        socket.emit('message', generateMessage(null, 'Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage(null, `${username} has joined!`));
        io.to(room).emit('roomData', {
            room: room,
            users: getUsersInRoom(room)
        });
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (user) {
            const filter = new Filter();
            if (filter.isProfane(message)) {
                return callback("Message contains foul language. It cannot be broadcasted.");
            }
            socket.broadcast.to(user.room).emit('message', generateMessage(user.username, message));
            socket.emit('message', generateMessage('me', message));
            return callback('Delivered');
        }
        return callback('Room not found!!!');
    });

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id);
        if (user) {
            const url = `https://google.com/maps/@${latitude},${longitude}`;
            socket.broadcast.to(user.room).emit('locationMessage', generateMessage(user.username, url));
            socket.emit('locationMessage', generateMessage('me', url));
            return callback();
        }
        return callback('Room not found!!!');
    });

    socket.on('disconnect', () => {
        const { username, room } = removeUser(socket.id);
        if (username && room) {
            io.to(room).emit('message', generateMessage(null, `${username} has left!!`));
            io.to(room).emit('roomData', {
                room: room,
                users: getUsersInRoom(room)
            });
        }
    });
});

module.exports = server;