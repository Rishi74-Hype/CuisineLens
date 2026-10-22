import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface AudioTranscriberButtonProps {
  onTranscribe: (transcription: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const AudioTranscriberButton: React.FC<AudioTranscriberButtonProps> = ({
  onTranscribe,
  className = '',
  size = 'md',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine supported mimeType
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await sendAudioToGemini(audioBlob, recorder.mimeType || 'audio/webm');
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start microphone recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToGemini = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const response = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType,
          }),
        });

        const data = await response.json();
        if (data.success && data.transcription) {
          onTranscribe(data.transcription);
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      setIsTranscribing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTranscribing}
      title={isRecording ? 'Stop recording & transcribe' : 'Speak with microphone'}
      className={`relative inline-flex items-center justify-center transition-all ${
        isRecording
          ? 'bg-rose-600 text-white animate-pulse'
          : isTranscribing
          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
      } ${
        isSmall
          ? 'w-7 h-7 rounded-lg text-xs'
          : 'w-9 h-9 rounded-xl text-sm'
      } ${className}`}
    >
      {isTranscribing ? (
        <Loader2 className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin`} />
      ) : isRecording ? (
        <Square className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-current`} />
      ) : (
        <Mic className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      {isRecording && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
      )}
    </button>
  );
};
