type MicControlsProps = {
  isRecording: boolean;
  isUploadingAudio: boolean;
  isSpeaking: boolean;
  startRecording: () => void;
  stopRecording: () => void;
};

export default function MicControls({
  isRecording,
  isUploadingAudio,
  isSpeaking,
  startRecording,
  stopRecording,
}: MicControlsProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {!isRecording ? (
        <button onClick={startRecording}>Start Mic</button>
      ) : (
        <button onClick={stopRecording}>Stop Mic</button>
      )}

      {isUploadingAudio && <span>Transcribing...</span>}
      {isSpeaking && <span>Speaking...</span>}
    </div>
  );
}