import './App.css';
import { useState, useEffect } from "react";

function App() {
  const [isClicked, setClicked] = useState(0); //0 not loaded; 1 clicked, red; 2 not clicked
  const [socketState, setSState] = useState(null);
  useEffect(() => {
    let socket;
    let heartbeat;
    let reconnectTimeout;
    const connect = () => {
      socket = new WebSocket('ws://localhost:5000');
      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'greet',
          msg: 'sent u message from client'
        }));
        heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };
      socket.onmessage = (event) => {
        console.log(event.data);
        let messageObject = JSON.parse(event.data);
        setClicked(messageObject.isClicked);
      };
      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        clearInterval(heartbeat);

        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };

      setSState(socket);
    }

    connect();
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        console.log('Cleaning up WebSocket');
        clearTimeout(reconnectTimeout);
        clearInterval(heartbeat);
        socket.close();
      }
    };
  }, []);

  const getClasses = (isClicked) => {
    if (isClicked === 1) return 'mainbutton clicked';
    if (isClicked === 2) return 'mainbutton notclicked';
    return 'mainbutton';
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className={`${getClasses(isClicked)}`} onClick={() => {
            if (isClicked === 1) {
              if (socketState && socketState.readyState === WebSocket.OPEN) {
                socketState.send(JSON.stringify({
                  type: 'updateState',
                  isClicked: 2
                }));
              }
            } else if(isClicked === 2) {
              if (socketState && socketState.readyState === WebSocket.OPEN) {
                socketState.send(JSON.stringify({
                  type: 'updateState',
                  isClicked: 1
                }));
              }
            }
        }}>click me to change the color</div>
      </header>
    </div>
  );
}

export default App;
