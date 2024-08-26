const handleMessageEvents = (socket, io, userData) => {
    socket.on('setMessageRead', (data) => {
        const { room, name, message } = data;

        if (!room || !name || !message) return;
        if (!userData[room] || !userData[room][name]) return;

        const keys = Object.keys(userData[room]);

        keys.forEach(key => {
            const values = userData[room][key];
            if (!values.chatting) {
                const userMessagesRead = userData[room][name].messageRead;
                const isMessageRead = userMessagesRead.some(msg => msg.id === message.id);

                if (!isMessageRead) {
                    userMessagesRead.push(message);
                    values.message.push(...userMessagesRead);
                    userMessagesRead.length = 0;
                }
            }
        });
    });

    socket.on('messageFromClient', (data) => {
        const { name, message, chatting, room: [room] } = data;
        const keys = Object.keys(userData[room]);

        userData[room][name]['message'].push(message);
        userData[room][name].chatting = chatting;

        keys.forEach(key => {
            const values = userData[room][key];

            if (values.chatting) {
                const isMessageExists = values.message.some(item => item.id === message.id);
                if (!isMessageExists) {
                    values.message.push(message);
                }
            }
        });
        
        io.to(room).emit('messageFromServer', { idRoom: room, message, name });
    });

    socket.on('getHistoryChat', (room, callback) => {
        if (callback) callback(userData[room]);
    });
};

module.exports = { handleMessageEvents };
