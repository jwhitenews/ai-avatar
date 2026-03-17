"use client";

import { FormEvent, useMemo, useState } from "react";
import { requestAvatar, requestSpeech, sendChatMessage } from "../lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const sessionId = "demo-session";

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPayload, setAvatarPayload] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const chat = await sendChatMessage(sessionId, userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: chat.reply }]);

      const speechBlob = await requestSpeech(chat.reply);
      const newAudioUrl = URL.createObjectURL(speechBlob);
      setAudioUrl(newAudioUrl);

      const avatar = await requestAvatar(chat.reply);
      setAvatarPayload(avatar);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, padding: 24 }}>
      <section style={{ background: "#111827", borderRadius: 16, padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>AI Avatar Starter</h1>
        <div style={{ minHeight: 320, display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {messages.length === 0 ? <p>Send a message to begin.</p> : null}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              style={{
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                background: message.role === "user" ? "#2563eb" : "#1f2937",
                padding: "12px 14px",
                borderRadius: 12,
                maxWidth: "80%",
              }}
            >
              <strong style={{ display: "block", marginBottom: 4 }}>
                {message.role === "user" ? "You" : "Assistant"}
              </strong>
              <span>{message.content}</span>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 12 }}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
            }}
          />
          <button
            type="submit"
            disabled={!canSend}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: 0,
              background: canSend ? "#10b981" : "#475569",
              color: "white",
            }}
          >
            {loading ? "Working..." : "Send"}
          </button>
        </form>

        {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
      </section>

      <section style={{ background: "#111827", borderRadius: 16, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Voice and Avatar</h2>
        {audioUrl ? <audio controls src={audioUrl} style={{ width: "100%", marginBottom: 16 }} /> : <p>No audio yet.</p>}

        <div
          style={{
            minHeight: 240,
            borderRadius: 12,
            border: "1px solid #334155",
            padding: 16,
            background: "#0f172a",
            overflow: "auto",
          }}
        >
          <p style={{ marginTop: 0 }}><strong>Avatar response payload</strong></p>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {avatarPayload ? JSON.stringify(avatarPayload, null, 2) : "No avatar response yet."}
          </pre>
        </div>
      </section>
    </div>
  );
}
