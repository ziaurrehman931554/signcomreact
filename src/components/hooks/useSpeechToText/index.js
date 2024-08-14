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
      console.log(
        "---------------------------------grammars available in window"
      );
      const grammar =
        "#JSGF v1.0; grammar punctuation; public <punc> = . | ,| ? | ! | ; | : ;";
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    recognition.onresult = (event) => {
      console.log(
        "----------------------Speech recognition result: ",
        event.results
      );
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      console.error(
        "--------------------------Speech recognition error: ",
        event.error
      );
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
    console.log("-----------------------start listening called");
    if (recognitionRef.current && !isListening) {
      console.log("--------------------------started speech recognition");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    console.log("--------------------------stop listening called");
    if (recognitionRef.current && isListening) {
      console.log("--------------------------stopped speech recognition");
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening };
}
