"use client";

import { useEffect, useRef, useState } from "react";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import MicControls from "../components/MicControls";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("session_id");
      if (existing) return existing;

      const newId = crypto.randomUUID();
      localStorage.setItem("session_id", newId);
      return newId;
    }
    return "default-session";
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/history/${sessionId}`
        );
        const data = await res.json();

        const formatted = (data.messages || []).map((msg: any) => ({
          role: msg.role,
          text: msg.content,
        }));

        setMessages(formatted);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    loadHistory();
  }, [sessionId]);

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS failed:", error);
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userText,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "No reply received.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      await speakText(reply);
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong." },
      ]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        setIsUploadingAudio(true);

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stt`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          setInput(data.transcript ?? "");
        } catch (error) {
          console.error("STT upload failed:", error);
        } finally {
          setIsUploadingAudio(false);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Could not start recording:", error);
      alert("Microphone access failed.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>AI Chatbot</h1>

      <MessageList messages={messages} />

      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />

      <MicControls
        isRecording={isRecording}
        isUploadingAudio={isUploadingAudio}
        isSpeaking={isSpeaking}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
    </main>
  );
}