const express = require('express');
const app = express();

const WSSserver = require('express-ws')(app)

const PORT = process.env.PORT || 5000;

app.ws('/', (ws, req) => {
    ws.send('sent from server')
    ws.on('message', (msg)=>{
        console.log(msg);
    })
})

app.listen(PORT, ()=>console.log(`the server is started on port ${PORT}`));