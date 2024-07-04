import {
  Route,
  Routes,
  useNavigate,
  BrowserRouter as Router,
} from "react-router-dom";
import { ConnectForm } from "./components/ConnectForm";
import { LiveVideo } from "./components/LiveVideo";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";
import { useState } from "react";

function App() {
  const navigate = useNavigate();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  ); // Initialize Agora Client

  const [selectedOption, setSelectedOption] = useState("");

  const handleConnect = (channelName, option) => {
    console.log("==========================Received option: ", option);
    setSelectedOption(option);
    navigate(`/via/${channelName}`); // on form submit, navigate to new route
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="main-container" style={{ height: window.innerHeight }}>
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={<ConnectForm connectToVideo={handleConnect} />}
            />
            <Route
              path="/via/:channelName"
              element={
                <AgoraRTCProvider client={agoraClient}>
                  <LiveVideo option={selectedOption} />
                </AgoraRTCProvider>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
