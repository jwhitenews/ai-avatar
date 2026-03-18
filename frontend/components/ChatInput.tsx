type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
};

export default function ChatInput({
  input,
  setInput,
  sendMessage,
}: ChatInputProps) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or record a message..."
        style={{ flex: 1, padding: 8 }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}