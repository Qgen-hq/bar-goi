import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, lang, placeholder }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'kz' ? 'Браузеріңіз дауысты енгізуді қолдамайды' : 'Ваш браузер не поддерживает голосовой ввод');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'kz' ? 'kk-KZ' : 'ru-RU';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech API start fail', e);
      setIsListening(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={lang === 'kz' ? 'Дауыспен енгізу' : 'Голосовой ввод'}
      style={{
        background: isListening ? '#EF4444' : 'var(--primary-emerald-light)',
        color: isListening ? '#FFFFFF' : 'var(--primary-emerald)',
        border: isListening ? '2px solid #DC2626' : '1px solid #A7F3D0',
        borderRadius: '12px',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 800,
        transition: 'all 0.2s ease',
        boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none',
        animation: isListening ? 'pulse 1.2s infinite' : 'none'
      }}
    >
      {isListening ? (
        <>
          <MicOff size={16} />
          <span>{lang === 'kz' ? 'Тыңдауда...' : 'Слушаю...'}</span>
        </>
      ) : (
        <>
          <Mic size={16} />
          <span>{lang === 'kz' ? 'Дауыспен енгізу' : 'Голосом'}</span>
        </>
      )}
    </button>
  );
}
