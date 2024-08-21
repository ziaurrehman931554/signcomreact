/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

const CustomMessageList = ({ streamChannel, handleCaption, caption }) => {
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await streamChannel.query({
        messages: { limit: 100 },
      });
      setMessages(response.messages);
    };

    const handleNewMessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.message]);
      handleCaption(event.message.text);
      scrollToBottom();
    };

    const scrollToBottom = () => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      {/* {caption} */}
      {messages.map((msg) => (
        <p key={msg.id}>{msg.text}</p>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
};

export default CustomMessageList;
