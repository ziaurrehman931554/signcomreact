import { useState } from "react";
import "./ConnectForm.css";
import join from "../assets/join.png";
import generate from "../assets/generate.png";

export const ConnectForm = ({ connectToVideo }) => {
  const [channelName, setChannelName] = useState("");
  const [invalidInputMsg, setInvalidInputMsg] = useState("");

  const handleConnect = (e, action) => {
    e.preventDefault(); // Prevent default form submission
    const trimmedChannelName = channelName.trim();

    // Validate input: make sure channelName is not empty
    if (trimmedChannelName === "") {
      setInvalidInputMsg("Channel name can't be empty."); // Show warning
      setChannelName(""); // Resets channel name value in case user entered blank spaces
      return;
    }

    connectToVideo(trimmedChannelName);
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
              value={channelName}
              className="input"
              onChange={(e) => {
                setChannelName(e.target.value);
                setInvalidInputMsg(""); // Clear the error message
              }}
            />
            <button className="btn" type="submit">
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
              value={channelName}
              onChange={(e) => {
                setChannelName(e.target.value);
                setInvalidInputMsg(""); // Clear the error message
              }}
            />
            <button className="btn" type="submit">
              Generate
            </button>
          </form>
        </div>
      </div>
      {invalidInputMsg && <p style={{ color: "red" }}>{invalidInputMsg}</p>}
    </div>
  );
};
