import { Route, Routes, useNavigate } from "react-router-dom";
import { ConnectForm } from "./components/ConnectForm";
import { LiveVideo } from "./components/LiveVideo";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";

function App() {
  const navigate = useNavigate();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  ); // Initialize Agora Client

  const handleConnect = (channelName) => {
    navigate(`/via/${channelName}`); // on form submit, navigate to new route
  };

  return (
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
                <LiveVideo />
              </AgoraRTCProvider>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
