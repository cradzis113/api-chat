const { v4: uuidv4 } = require('uuid');

const handleRoomEvents = (socket, io, userData, timeouts, listUserLeft) => {
    socket.on("joinRoom", (user, callback) => {
        const { idRoom, name } = user;

        socket.join(idRoom);

        if (!userData[idRoom]) {
            userData[idRoom] = {};
        }

        if (!userData[idRoom][name]) {
            userData[idRoom][name] = {
                message: [],
                messageRead: [],
                chatting: false,
            };
        }

        userData[idRoom][name].message.push({
            id: uuidv4(),
            user: name,
            text: 'đã vào phòng',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'join'
        })

        const keys = Object.keys(userData[idRoom]);
        const kd = userData[idRoom][name].message[0];

        keys.forEach(i => {
            if (i !== name) {
                userData[idRoom][i].message.push(kd);
            }
        });

        io.to(idRoom).emit('messageFromServer', userData[idRoom])
        if (callback) callback({ id: socket.id, idRoom: idRoom });
    });

    socket.on('leaveRoom', (user, callback) => {
        const { name: userName, idRoom: roomId } = user;
        if (!roomId || !userName) {
            if (callback) callback(false);
            return;
        }

        const roomData = userData[roomId];
        if (!roomData || !roomData[userName]) {
            if (callback) callback(false);
            return;
        }

        Object.keys(roomData).forEach(otherUser => {
            if (otherUser !== userName) {
                roomData[otherUser].message.push({
                    id: uuidv4(),
                    user: userName,
                    text: 'đã rời phòng',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'left'
                });
            }
        });

        delete roomData[userName];

        io.to(roomId).emit('messageFromServer', roomData);
        if (callback) callback(true);
    });

    socket.on('userLosesConnection', (room, name) => {
        listUserLeft.add(name);

        timeouts[name] = setTimeout(() => {
            listUserLeft.delete(name);

            if (userData[room]) {
                const roomData = userData[room]

                Object.keys(roomData).forEach(otherUser => {
                    if (otherUser !== name) {
                        roomData[otherUser].message.push({
                            id: uuidv4(),
                            user: name,
                            text: 'đã rời phòng',
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: 'left'
                        });
                    }
                });
                
                delete userData[room][name];
                io.to(room).emit('messageFromServer', userData[room]);
            }

            delete timeouts[name];
        }, 4000);
    });

    socket.on('isUserInRoom', (user, callback) => {
        const { idRoom, name } = user;

        if (userData[idRoom] && userData[idRoom][name]) {
            if (callback) callback(true);
        } else {
            if (callback) callback(false);
        }
    });

    socket.on('getRoom', (callback) => {
        const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
        if (callback) callback(rooms);
    });

    socket.on('reconnectToRoom', (room) => {
        socket.join(room);
    });
};

module.exports = { handleRoomEvents };
