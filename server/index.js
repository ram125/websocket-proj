const express = require('express');

const redis = require('redis');
const app = express();

const WSSserver = require('express-ws')(app);
const aWss = WSSserver.getWss();

const PORT = process.env.PORT || 5000;

let isClicked = 2;

const pubClient = redis.createClient();
const subClient = redis.createClient();

const channel = 'isClicked';
(async () => {
    try {
        await pubClient.connect();
        await subClient.connect();
        subClient.subscribe(channel, (message, channel) => {
            isClicked = parseInt(message);
            broadcastNewState(parseInt(message));
        });
    } catch (error) {
        console.error('error connecting to redis:', error);
    }
})();

app.ws('/', (ws, req) => {
    ws.send(JSON.stringify({
        type: 'greet',
        isClicked: isClicked
      })); 
    ws.on('message', (msg)=>{
        let messageObject = JSON.parse(msg);
        if(messageObject.type === 'updateState'){
            pubClient.publish(channel, messageObject.isClicked.toString());
        }
    })
})                            


const broadcastNewState = (state) => {
    aWss.clients.forEach(client => {
        client.send(JSON.stringify({
            type: 'updateState',
            isClicked: state
          })); 
    });
}

app.listen(PORT, ()=>console.log(`the server is started on port ${PORT}`));