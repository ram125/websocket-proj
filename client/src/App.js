import './App.css';
import { useState, useEffect } from "react";

function App() {
  const [isClicked, setClicked] = useState(false);
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      socket.send(JSON.stringify({
        msg: 'sent u message from client'
      }));
    };

    socket.onmessage = (event) => {
      console.log(event.data);
    };
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        console.log('Cleaning up WebSocket');
        socket.close();
      }
    };
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <div className={`mainbutton ${isClicked ? "clicked" : "notclicked"}`} onClick={() => {
            if (isClicked) {
                setClicked(false);
            } else {
                setClicked(true);
            }
        }}>click me to change the color</div>
      </header>
    </div>
  );
}

export default App;
