/* eslint-disable no-param-reassign */
/* global module */
const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    const existingUser = users.find((user) => user.username === username && user.room === room);

    if (existingUser) {
        return {
            error: 'Username is already taken'
        }
    }

    users.push({ id, username, room });

    return {
        user: { id, username, room } 
    };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index >= 0) {
        return users.splice(index, 1)[0];
    }

    return false;
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room)
};

module.exports = {
    addUser, 
    removeUser,
    getUser,
    getUsersInRoom
};