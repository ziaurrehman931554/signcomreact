/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ConnectForm } from "./components/ConnectForm";
import { LiveVideo } from "./components/LiveVideo";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";
import { useEffect, useState } from "react";
import { VideoCall } from "./components/VideoCall";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  ); // Initialize Agora Client

  const [option, setOption] = useState("");

  const handleConnect = (channelName, option) => {
    console.log("==========================Received option: ", option);
    setOption(option);
    navigate(`/via/${channelName}/${option}`); // on form submit, navigate to new route
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
            path="/via/:channelName/:option"
            element={
              <AgoraRTCProvider client={agoraClient}>
                <VideoCall />
              </AgoraRTCProvider>
            }
          />
          <Route
            path="/via/:channelName/"
            element={
              <AgoraRTCProvider client={agoraClient}>
                <LiveVideo connectToVideo={handleConnect} />
              </AgoraRTCProvider>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
