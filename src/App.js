/* eslint-disable react-hooks/exhaustive-deps */
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ConnectForm } from "./components/ConnectForm";
import { LiveVideo } from "./components/LiveVideo";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  ); // Initialize Agora Client

  const [selectedOption, setSelectedOption] = useState("");

  const handleConnect = (channelName, option) => {
    console.log("==========================Received option: ", option);
    setSelectedOption(option);
    navigate(`/via/${channelName}`); // on form submit, navigate to new route
  };

  useEffect(() => {
    const postCurrentUrl = () => {
      window.parent.postMessage({ url: window.location.href }, "*");
    };

    // Post the initial URL
    postCurrentUrl();
  }, [location]);

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
                <LiveVideo option={selectedOption} />
              </AgoraRTCProvider>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
