/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

const CustomMessageList = ({ streamChannel, handleCaption }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await streamChannel.query({
        messages: { limit: 100 },
      });
      setMessages(response.messages);
    };

    const handleNewMessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.message.text]);
      handleCaption(event.message.text);
    };

    fetchMessages();

    // Listen for new messages
    streamChannel.on("message.new", handleNewMessage);

    return () => {
      streamChannel.off("message.new", handleNewMessage);
    };
  }, [streamChannel]);

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <p key={msg.id}>{msg.text}</p>
      ))}
    </div>
  );
};

export default CustomMessageList;
