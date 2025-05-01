"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
  className?: string;
}

export const SpeechToText = ({ onTranscript, className = "" }: SpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSpeechRecognition = () => {
      try {
        // Check for browser support
        if (typeof window === 'undefined') return;

        // Try different implementations
        const SpeechRecognition = (
          window.SpeechRecognition ||
          window.webkitSpeechRecognition ||
          // @ts-ignore
          window.mozSpeechRecognition ||
          // @ts-ignore
          window.msSpeechRecognition
        );

        if (!SpeechRecognition) {
          setError("Speech recognition is not supported in your browser");
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Configure recognition
        recognition.onstart = () => {
          setIsListening(true);
          setIsLoading(false);
          toast.success("Listening... Speak now");
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join(' ');

          if (event.results[0].isFinal) {
            onTranscript(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsLoading(false);
          
          let errorMessage = 'Error with speech recognition. Please try again.';
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech was detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'No microphone was found. Ensure it is plugged in and allowed.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission was denied. Please allow access and try again.';
              break;
            case 'network':
              errorMessage = 'Network error occurred. Please check your connection.';
              break;
          }
          toast.error(errorMessage);
          setError(errorMessage);
        };

        recognition.onend = () => {
          setIsListening(false);
          setIsLoading(false);
        };

        recognitionRef.current = recognition;
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setError("Failed to initialize speech recognition");
        toast.error("Failed to initialize speech recognition");
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    setError(null);
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      try {
        setIsLoading(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsLoading(false);
        toast.error('Failed to start speech recognition. Please try again.');
      }
    }
  }, [isListening]);

  if (!recognitionRef.current && !isLoading) {
    return (
      <button
        onClick={() => toast.error("Speech recognition is not supported in your browser")}
        className={`p-2 rounded-full transition-all duration-200 bg-gray-100 text-gray-400 cursor-not-allowed ${className}`}
        title="Speech recognition not supported"
      >
        <MicOff className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isLoading 
          ? 'bg-gray-100 text-gray-400 cursor-wait'
          : isListening 
            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
      } ${className}`}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <Mic className="h-5 w-5 animate-pulse" />
      ) : (
        <MicOff className="h-5 w-5" />
      )}
    </button>
  );
}; 