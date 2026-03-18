type Message = {
  role: "user" | "assistant";
  text: string;
};

type MessageListProps = {
  messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div
      style={{
        marginBottom: 16,
        border: "1px solid #ccc",
        padding: 12,
        minHeight: 240,
      }}
    >
      {messages.length === 0 && <p>No messages yet.</p>}

      {messages.map((msg, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <strong>{msg.role}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}