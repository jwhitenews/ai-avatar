"use client";

import { useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: "web-session",
        message: userText,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.reply ?? "No reply received." },
    ]);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
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

      <div style={{ marginBottom: 16, border: "1px solid #ccc", padding: 12, minHeight: 240 }}>
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or record a message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!isRecording ? (
          <button onClick={startRecording}>Start Mic</button>
        ) : (
          <button onClick={stopRecording}>Stop Mic</button>
        )}

        {isUploadingAudio && <span>Transcribing...</span>}
      </div>
    </main>
  );
}