/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";

export default function useSpeechToText(options) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Web Speech is not supported");
      console.log(
        "---------------------------------error webkit not available in window"
      );
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.interimResults = options.interim || true;
    recognition.lang = options.lang || "en-us";
    recognition.continuous = options.continuous || false;

    if ("webkitSpeechGrammarList" in window) {
      const grammar =
        "#JSGF v1.0; grammar punctuation; public <punc> = . | ,| ? | ! | ; | : ;";
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
        console.log(
          "----------------------Speech recognition result: ",
          event.results[i][0].transcript
        );
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      console.error(
        "--------------------------Speech recognition error: ",
        event.error
      );
      if (event.error === "no-speech") {
        console.log(
          "--------------------------No speech detected, restarting..."
        );
        // Delay restarting to ensure the current recognition session is completely stopped
        recognition.stop();
        setTimeout(() => {
          startListening();
        }, 2000); // Adjust delay as needed
      }
    };

    recognition.onend = () => {
      console.log("--------------------------Speech recognition stopped");
      setIsListening(false);
      setTranscript("");
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      console.log("--------------------------started speech recognition");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log("--------------------------stopped speech recognition");
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening };
}
