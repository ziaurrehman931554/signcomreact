import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
  // useRemoteVideoTracks,
} from "agora-rtc-react";

import "./LiveVideo.css";

export const LiveVideo = () => {
  const appId = "5d4f500c39834c95ae5a04635a3f0ab8";
  const { channelName } = useParams();
  const [activeConnection, setActiveConnection] = useState(true);
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  const [caption, setCaption] = useState("This is whee caption displays!");

  const handleCaption = (cap) => {
    setCaption((prevCaption) => prevCaption + cap);
  };

  useEffect(() => {
    handleCaption("a");
  }, []);

  // to leave the call
  const navigate = useNavigate();

  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: null,
    },
    activeConnection
  );

  usePublish([localMicrophoneTrack, localCameraTrack]);

  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  // const { videoTracks } = useRemoteVideoTracks(remoteUsers);

  audioTracks.forEach((track) => track.play());
  // videoTracks.forEach((track) => track.play());

  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      <div className="image-background">
        <div className="bottom-container">
          <div className="capNCam">
            <div className="capContainer">
              <p className="cap">{caption}</p>
            </div>
            <div className="camContainer">
              <LocalUser
                audioTrack={localMicrophoneTrack}
                videoTrack={localCameraTrack}
                cameraOn={cameraOn}
                micOn={micOn}
                playAudio={micOn}
                playVideo={cameraOn}
                className=""
              />
            </div>
          </div>
          <div className="ControlContainer">
            <div className="micCallCamControl">
              <div className="micControl">
                <button className="btn" onClick={() => setMic((a) => !a)}>
                  🎙️
                </button>
              </div>
              <div className="callControl">
                <button
                  className="callBtn"
                  onClick={() => {
                    setActiveConnection(false);
                    navigate("/");
                  }}
                >
                  {activeConnection ? "📞" : "📞"}
                </button>
              </div>
              <div className="camControl">
                <button className="btn" onClick={() => setCamera((a) => !a)}>
                  📷
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="remoteContainer">
          <div
            className="remoteVideoContainer"
            style={{
              height: window.innerHeight - (window.innerHeight * 25) / 100,
            }}
          >
            {
              // Initialize each remote stream using RemoteUser component
              remoteUsers.map((user) => (
                <div key={user.uid} className="remote-video-container">
                  <RemoteUser user={user} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

/* <div id="remoteVideoGrid">
  {
    // Initialize each remote stream using RemoteUser component
    remoteUsers.map((user) => (
      <div key={user.uid} className="remote-video-container">
        <RemoteUser user={user} />
      </div>
    ))
  }
</div>
<div id="localVideo">
  <LocalUser
    audioTrack={localMicrophoneTrack}
    videoTrack={localCameraTrack}
    cameraOn={cameraOn}
    micOn={micOn}
    playAudio={micOn}
    playVideo={cameraOn}
    className=""
  />
  <div>
    //media-controls toolbar component - UI controlling mic, camera, & connection state
    <div id="controlsToolbar">
      <div id="mediaControls">
        <button className="btn" onClick={() => setMic((a) => !a)}>
          Mic
        </button>
        <button className="btn" onClick={() => setCamera((a) => !a)}>
          Camera
        </button>
      </div>
      <button
        id="endConnection"
        onClick={() => {
          setActiveConnection(false);
          navigate("/");
        }}
      >
        {" "}
        Disconnect
      </button>
    </div>
  </div>
</div> */
