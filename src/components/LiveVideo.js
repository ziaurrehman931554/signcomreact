/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./LiveVideo.css";
import { VideoCall } from "./VideoCall";
import { useParams } from "react-router-dom";

export const LiveVideo = ({ connectToVideo }) => {
  const [selectOption, setSelectOption] = useState("");
  const { channelName, option } = useParams();

  const handleOptionSelect = (selectedOption) => {
    setSelectOption(selectedOption);
    connectToVideo(channelName, selectedOption);
  };

  return (
    <div>
      <div>
        {option !== undefined ? (
          <VideoCall />
        ) : (
          <div
            className="options-effect"
            style={{ height: window.innerHeight, width: window.innerWidth }}
          >
            <div className="options-container">
              <h3>Select an option:</h3>
              <button
                className="option-button"
                onClick={() => handleOptionSelect("speech")}
              >
                Enable Speech Recognition
              </button>
              <button
                className="option-button"
                onClick={() => handleOptionSelect("gesture")}
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
