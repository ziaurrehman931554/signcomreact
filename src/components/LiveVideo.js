import React, { useState } from "react";
import "./LiveVideo.css";
import { VideoCall } from "./VideoCall";

export const LiveVideo = () => {
  const [option, setOption] = useState("");

  return (
    <div>
      <div>
        {option !== "" ? (
          <VideoCall option={option} />
        ) : (
          <div
            className="options-effect"
            style={{ height: window.innerHeight, width: window.innerWidth }}
          >
            <div className="options-container">
              <h3>Select an option:</h3>
              <button
                className="option-button"
                onClick={() => setOption("speech")}
              >
                Enable Speech Recognition
              </button>
              <button
                className="option-button"
                onClick={() => setOption("gesture")}
              >
                Enable Gesture Detection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
