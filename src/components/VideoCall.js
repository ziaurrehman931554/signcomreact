/* eslint-disable no-unused-vars */
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
  useCurrentUID,
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

import {
  Chat,
  Channel,
  MessageList,
  Window,
  useMessageNewListener,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import CustomMessageList from "./CustomMessageList";
import useSpeechToText from "./hooks/useSpeechToText";

import mic_off from "../assets/mic_off.png";
import mic_on from "../assets/mic_on.png";
import call_end from "../assets/call_end.png";
import camera_switch from "../assets/camera_switch.png";

// const appId = "5d4f500c39834c95ae5a04635a3f0ab8"; // old account
const appId = "7b076985665c4948af023280d8e7b683";
const streamApiKey = "dwfnpjnhfe4n";
let user = { id: null, name: null };
// let count = 0;

export const VideoCall = () => {
  const { channelName, option } = useParams();
  const [activeConnection, setActiveConnection] = useState(true);

  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  const remoteContainerRef = useRef(null);
  const intervalRef = useRef(null);

  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const [caption, setCaption] = useState("This is where caption displays!");
  const { isListening, transcript, startListening, stopListening } =
    useSpeechToText({ continuous: true });

  const [streamClient, setStreamClient] = useState(null);
  const [streamChannel, setStreamChannel] = useState(null);

  const [init, setInit] = useState(false);
  const uid = useCurrentUID();

  // toggle speech listening
  const startStopListening = () => {
    isListening ? stopListening() : startListening();
  };

  // assign agora current uid to user variable
  useEffect(() => {
    if (uid) {
      console.log("===================================uid: ", uid);
      user.id = `u${uid}`;
      user.name = `User${uid}`;
      setInit(true);
    }
  }, [useCurrentUID, uid]);

  // to leave the call
  const navigate = useNavigate();

  // Suppress the error
  window.addEventListener("error", function (event) {
    if (event.message.includes("ERR_BLOCKED_BY_CLIENT")) {
      console.log("===================================prevented default");
      event.preventDefault();
    }
  });

  // handle caption
  const handleCaption = (cap) => {
    console.log(
      "======================================handle caption called: ",
      cap
    );
    setCaption(cap);
  };

  // initialize stream chat and joining channel and creating users
  useEffect(() => {
    console.log("===============================current init: ", init);
    if (init === true) {
      console.log(
        "========================initializing stream chat with uid:",
        user.id
      );
      let isInterrupted = false;
      async function init() {
        const chatClient = StreamChat.getInstance(streamApiKey);
        console.log("============================chatClient: ", chatClient);
        await chatClient
          .connectUser(
            { ...user, option: option },
            chatClient.devToken(user.id)
          )
          .then(() => {
            if (isInterrupted) return;
            console.log("=======================user connected:", chatClient);
            setStreamClient(chatClient);
          })
          .catch((e) =>
            console.log("====================error while connecting", e)
          );
        const channel = chatClient.channel("messaging", channelName, {
          name: `This is the channel for data transferring on ${channelName}`,
        });
        console.log("======================================channel: ", channel);
        await channel.watch();
        channel
          .sendEvent({
            type: "option-selected",
            option: option,
          })
          .then(
            console.log(
              "============================event sent with option: ",
              option
            )
          )
          .catch((e) =>
            console.log(
              "=============================error while sending event message: ",
              e
            )
          );

        setStreamChannel(channel);
        handleSendMessage("hello");
        return () => {
          isInterrupted = true;
          chatClient.disconnectUser();
          setStreamClient(undefined);
        };
      }
      init();
    }
  }, [init]);

  // TODO: remove this function, sending hello msg after every 5 sec
  // useEffect(() => {
  //   if (streamChannel && option === "gesture") {
  //     console.log("=========================interval started");
  //     const interval = setInterval(() => {
  //       console.log("=========================hello message sent");
  //       handleSendMessage(`=================Hello ${count}`);
  //       count++;
  //     }, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [streamChannel]);

  // handle text events
  const handleSendMessage = (msg) => {
    console.log(
      "=========================handle send message called with msg: ",
      msg
    );
    if (streamChannel) {
      console.log(
        "================================stream channel available for send message"
      );
      streamChannel.sendMessage({
        text: msg,
      });
      console.log("================================msg sent");
    } else {
      console.log("Stream channel is not initialized yet.");
    }
  };

  // set interval for screenshot every 1 second
  useEffect(() => {
    if (option === "gesture") {
      intervalRef.current = setInterval(() => {
        if (gestureRecognizer) {
          takeScreenshot();
        }
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [localCameraTrack]);

  // initialize the media pipe gesture recognizer
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
                "https://raw.githubusercontent.com/ziaurrehman931554/modelfile/main/gesture_recognizer_final.task",
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

  // join the agora call
  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: null,
    },
    activeConnection
  );

  // publish local traces
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // take screenshot
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

  // recognizing gesture
  const recognizeGesture = async (imgData) => {
    if (!gestureRecognizer || !imgData) {
      console.error("Gesture recognizer not loaded or image is null");
      return;
    }
    const img = new Image();
    img.src = imgData;

    img.onload = async () => {
      const results = await gestureRecognizer.recognize(img);
      // console.log("====================== results", results);
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

  // initialize speech
  useEffect(() => {
    if (streamChannel) {
      const handleOptionSelected = (event) => {
        if (event.user.id !== user.id && event.type === "option-selected") {
          // Enable or disable speech recognition based on the option selected by the remote user
          const remoteUserOption = event.option;
          if (remoteUserOption === "speech" && !isListening) {
            console.log("==============speech enabled for remote user");
            startListening();
          }
        }
      };

      streamChannel.on("option-selected", handleOptionSelected);

      return () => {
        streamChannel.off("option-selected", handleOptionSelected);
        stopListening();
      };
    }

    // TODO: remove when testing complete
    // if (streamChannel && option === "gesture") {
    //   console.log("===================starting speech from use effect ");
    //   startListening();
    //   return () => stopListening();
    // }
  }, [streamChannel]);

  // updating caption based on speech recognition transcript
  useEffect(() => {
    if (transcript) {
      console.log("==================transcription changed", transcript);
      // handleCaption(transcript);
      handleSendMessage(transcript);
    }
  }, [transcript]);

  // returning loading if no option received
  if (!option) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      <div className="image-background">
        <div className="bottom-container">
          <div className="capNCam">
            <div className="capContainer">
              {option === "gesture" && <p className="cap">{caption}</p>}
              {streamChannel && option === "speech" && (
                <CustomMessageList
                  streamChannel={streamChannel}
                  handleCaption={handleCaption}
                  caption={caption}
                />
              )}
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
                  {micOn ? (
                    <img
                      src={mic_on}
                      alt="🎙️"
                      width={30}
                      height={30}
                      className="img"
                    />
                  ) : (
                    <img
                      src={mic_off}
                      alt="🎙️"
                      width={30}
                      height={30}
                      className="img"
                    />
                  )}
                </button>
              </div>
              <div className="callControl">
                <button
                  className="callBtn"
                  onClick={async () => {
                    if (streamChannel) await streamChannel.truncate();
                    setActiveConnection(false);
                    navigate("/");
                  }}
                >
                  <img
                    src={call_end}
                    alt="📞"
                    className="img"
                    width={50}
                    height={50}
                  />
                </button>
              </div>
              <div className="camControl">
                <button className="btn" onClick={() => setCamera((a) => !a)}>
                  <img
                    src={camera_switch}
                    alt="📷"
                    width={30}
                    height={30}
                    className="img"
                  />
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
              maxWidth: 370,
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
