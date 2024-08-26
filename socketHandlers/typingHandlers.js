const typingUsers = {};

const handleTypingEvents = (socket, io) => {
    socket.on('startTyping', ({ room, user }) => {
        if (!typingUsers[room]) {
            typingUsers[room] = [];
        }
        if (!typingUsers[room].includes(user)) {
            typingUsers[room].push(user);
        }
        io.to(room).emit('updateTypingStatus', typingUsers[room]);
    });

    socket.on('stopTyping', ({ room, user }) => {
        if (typingUsers[room]) {
            typingUsers[room] = typingUsers[room].filter((username) => username !== user);
            io.to(room).emit('updateTypingStatus', typingUsers[room]);
        }
    });
};

module.exports = { handleTypingEvents };
