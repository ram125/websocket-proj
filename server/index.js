const express = require('express');

const redis = require('redis');
const app = express();

const WSSserver = require('express-ws')(app);
const aWss = WSSserver.getWss();

const PORT = process.env.PORT || 5000;

let isClicked = 2;
const connectionTimeout = 60000;

const pingInterval = 30000;

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
    let lastPingTime = Date.now();
    ws.send(JSON.stringify({
        type: 'greet',
        isClicked: isClicked
      })); 
    ws.on('message', (msg)=>{
        let messageObject = JSON.parse(msg);
        if(messageObject.type === 'updateState'){
            pubClient.publish(channel, messageObject.isClicked.toString());
        }else if (messageObject.type === 'ping') {
            lastPingTime = Date.now();
        }
    })
    const checkConnection = setInterval(() => {
        if (Date.now() - lastPingTime > connectionTimeout) {
          console.log('Client inactive, closing connection');
          ws.close();
          clearInterval(checkConnection);
        }
      }, pingInterval);
    ws.on('close', () => {
        console.log('connection timed out');
        clearInterval(checkConnection);
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clearInterval(checkConnection);
    });
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