const express = require('express');
const app = express();

const WSSserver = require('express-ws')(app);
const aWss = WSSserver.getWss();

const PORT = process.env.PORT || 5000;

let isClicked = 2;
app.ws('/', (ws, req) => {
    ws.send(JSON.stringify({
        type: 'greet',
        isClicked: isClicked
      })); 
    ws.on('message', (msg)=>{
        let messageObject = JSON.parse(msg);
        if(messageObject.type === 'updateState'){
            isClicked = messageObject.isClicked;
            broadcastNewState(messageObject.isClicked)
        }else if(messageObject.type === 'greet'){
            ws.send(JSON.stringify({
                type: 'greet',
                isClicked: isClicked
              })); 
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