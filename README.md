const userData = {
    room1: {
        khanh: { message: [], messageRead: [], chatting: false },
        hung: { message: [], messageRead: [], chatting: false },
    }
};

const typingUsers = {} 
you should figure out the structure

docker:

docker pull cradz1/chatserver

docker run -d -p 3000:3000 cradz1/chatserver:latest
