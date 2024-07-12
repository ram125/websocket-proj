import './App.css';
import { useState } from "react";

function App() {
  const [isClicked, setClicked] = useState(false);
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
