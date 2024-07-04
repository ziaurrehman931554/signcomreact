/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  // useRemoteAudioTracks,
  useRemoteUsers,
  // useRemoteVideoTracks,
} from "agora-rtc-react";
import "./LiveVideo.css";
import html2canvas from "html2canvas";
import {
  GestureRecognizer,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export const VideoCall = ({ option }) => {
  const appId = "5d4f500c39834c95ae5a04635a3f0ab8";
  const { channelName } = useParams();
  const [activeConnection, setActiveConnection] = useState(true);
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const remoteContainerRef = useRef(null);
  const intervalRef = useRef(null);
  const [caption, setCaption] = useState("This is whee caption displays!");
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();

  // to leave the call
  const navigate = useNavigate();

  const handleCaption = (cap) => {
    setCaption(cap);
    console.log("===========================", "updated caption: ", cap);
  };

  useEffect(() => {
    if (option === "gesture") {
      intervalRef.current = setInterval(() => {
        takeScreenshot();
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [localCameraTrack]);

  useEffect(() => {
    if (option === "gesture") {
      const initializeGestureRecognizer = async () => {
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );

          const recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://cvws.icloud-content.com/B/AfTB0ta39S9FrhRC0NKwLRe09idfAakwCDjuZAp8bpPMghZqAGDohNAn/gesture_recognizer.task?o=AiWR6nrGAiaL-_PFnK1UI7CdbEI5CIESDIJ5c-GXKkmN&v=1&x=3&a=CAogoEvtz2Jw0-O309SCssZOp3HgpDauEan0E8-aLJ9rPuESbxC7qpvfhzIYu4f34IcyIgEAUgS09idfWgTohNAnaidtOeKQl8Wzjk4G3urlRc2FhPN1S7DYbU-eP0kkT8lF5OAjlyyD9DlyJwiFz34dHGHpd0-Le06CslG-juTKfTOdcq6GxMHZycalA7CwN83Szw&e=1720069243&fl=&r=89cb38c0-9dde-4426-ae56-9b57e68cbeb2-1&k=smNDDkxlMymp0JCsjk2uHw&ckc=com.apple.clouddocs&ckz=com.apple.CloudDocs&p=157&s=N1jfzgDrVtHK39ros3ojRcTwBx0",
              delegate: "CPU",
            },
            runningMode: "IMAGE",
          });

          setGestureRecognizer(recognizer);
          setIsModelLoaded(true);
        } catch (error) {
          console.error("Error initializing gesture recognizer:", error);
        }
      };

      initializeGestureRecognizer();
    }
  }, [isModelLoaded]);

  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: null,
    },
    activeConnection
  );

  usePublish([localMicrophoneTrack, localCameraTrack]);

  const takeScreenshot = () => {
    const remoteContainer = remoteContainerRef.current;
    if (!remoteContainer) return;

    html2canvas(remoteContainer).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      if (isModelLoaded) {
        recognizeGesture(imgData);
      }
    });
  };

  const recognizeGesture = async (imgData) => {
    if (!gestureRecognizer || !imgData) {
      console.error("Gesture recognizer not loaded or image is null");
      return;
    }
    const img = new Image();
    img.src = imgData;

    img.onload = async () => {
      const results = await gestureRecognizer.recognize(img);
      console.log(
        "=========================================== results",
        results
      );
      if (results.gestures.length > 0) {
        const categoryName = results.gestures[0][0].categoryName;
        handleCaption(categoryName);
      }
    };
  };

  const remoteUsers = useRemoteUsers();
  // const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  // const { videoTracks } = useRemoteVideoTracks(remoteUsers);

  // audioTracks.forEach((track) => track.play());
  // videoTracks.forEach((track) => track.play());

  useEffect(() => {
    if (option === "speech") {
      if (SpeechRecognition.browserSupportsSpeechRecognition()) {
        SpeechRecognition.startListening({ continuous: true });
        console.log("========================listning started");
      } else {
        console.log("=======================speech recognition not supported");
      }

      return () => {
        SpeechRecognition.stopListening();
        resetTranscript();
      };
    }
  }, []);

  useEffect(() => {
    console.log("==================transcription changed", transcript);
    if (transcript && option === "speech") {
      handleCaption(transcript);
    }
  }, [transcript]);

  if (!option) {
    return <div>Loading...</div>;
  }

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
                playAudio={false}
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
            ref={remoteContainerRef}
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
