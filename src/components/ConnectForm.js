/* eslint-disable no-unused-vars */
import { useState } from "react";
import "./ConnectForm.css";
import join from "../assets/incoming_b.png";
import generate from "../assets/outgoing_b.png";

export const ConnectForm = ({ connectToVideo }) => {
  const [channelName, setChannelName] = useState("");
  const [generateChannelId, setGenerateChannelId] = useState("");
  const [joinChannelId, setJoinChannelId] = useState("");
  const [invalidInputMsg, setInvalidInputMsg] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [option, setOption] = useState("");
  const [showError, setShowError] = useState(false);

  const handleConnect = (e, action) => {
    e.preventDefault(); // Prevent default form submission

    const trimmedChannelName = channelName.trim();

    // Validate input: make sure channelName is not empty
    if (trimmedChannelName === "") {
      setInvalidInputMsg("⚠️ Channel name can't be empty."); // Show warning
      setChannelName(""); // Resets channel name value in case user entered blank spaces
      setShowError(true); // Show error message
      setTimeout(() => setShowError(false), 3000); // Hide error message after 3 seconds
      return;
    }

    setShowOptions(true);
  };

  const handleOptionSelect = (selectedOption) => {
    setOption(selectedOption);
    setShowOptions(false);
    console.log(
      "==================================calling for video component: ",
      selectedOption
    );
    connectToVideo(channelName, selectedOption);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-section">
          <h2 className="title">Join using Channel ID</h2>
          <div className="circle">
            <img src={join} alt="Join" />
          </div>
          <form onSubmit={(e) => handleConnect(e, "join")}>
            <input
              id="joinChannel"
              type="text"
              placeholder="Enter Existing Channel ID"
              value={joinChannelId}
              className="input"
              onChange={(e) => {
                setJoinChannelId(e.target.value);
                setGenerateChannelId("");
                setChannelName(e.target.value);
                setInvalidInputMsg(""); // Clear the error message
              }}
            />
            <button className="button" type="submit">
              Join
            </button>
          </form>
        </div>
        <div className="divider-container">
          <div className="divider" />
        </div>
        <div className="form-section">
          <h2 className="title">Generate New Channel</h2>
          <div className="circle">
            <img src={generate} alt="Generate" />
          </div>
          <form onSubmit={(e) => handleConnect(e, "generate")}>
            <input
              id="generateChannel"
              type="text"
              placeholder="Enter New Channel ID"
              className="input"
              value={generateChannelId}
              onChange={(e) => {
                setGenerateChannelId(e.target.value);
                setJoinChannelId("");
                setChannelName(e.target.value);
                setInvalidInputMsg(""); // Clear the error message
              }}
            />
            <button className="button" type="submit">
              Generate
            </button>
          </form>
        </div>
      </div>
      {invalidInputMsg && showError && (
        <div className={`error-message ${showError ? "show" : ""}`}>
          {" "}
          <p style={{ color: "black" }}>{invalidInputMsg}</p>
        </div>
      )}

      {showOptions && (
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
      <div style={{ padding: 50 }} />
    </div>
  );
};
