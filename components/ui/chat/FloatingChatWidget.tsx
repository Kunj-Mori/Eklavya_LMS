"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mic, MessageCircle, Send, StopCircle, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const speechRecognitionRef = useRef<any>(null);

  const welcomeMessage = "Hi there! I'm your AI learning assistant. Ask me anything about your courses, assignments, or any educational topic. You can type your question or use the microphone button for voice input.";

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
          console.error("Speech recognition is not supported");
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          toast.success("Listening... Speak now");
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join(' ');

          setPrompt(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
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
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        toast.error("Failed to initialize speech recognition");
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    try {
      setIsLoading(true);
      setResponse("");
      setErrorMessage("");
      setShowWelcomeMessage(false);
      
      console.log("Sending prompt to API:", prompt);
      
      try {
        // Try using the main API endpoint first
        const { data } = await axios.post("/api/chatbot", { prompt });
        console.log("Main API response:", data);
        
        if (data.message) {
          setResponse(data.message);
          // Use text-to-speech for the response
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data.message);
            window.speechSynthesis.speak(utterance);
          }
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (mainApiError) {
        console.error("Main API failed, using fallback:", mainApiError);
        
        // Use fallback if main API fails
        const { data } = await axios.post("/api/chatbot/fallback", { prompt });
        console.log("Fallback API response:", data);
        
        if (data.message) {
          setResponse(data.message);
          // Use text-to-speech for the response
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data.message);
            window.speechSynthesis.speak(utterance);
          }
        } else if (data.error) {
          throw new Error(data.error);
        }
      }
    } catch (error: any) {
      console.error("Error calling chatbot API:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to get a response";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      try {
        speechRecognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      try {
        setPrompt("");
        speechRecognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Stop speech synthesis when closing the chat
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-xl border-0 backdrop-blur-sm bg-gradient-to-br from-purple-900/90 to-blue-900/90 text-white">
          <CardHeader className="p-3 flex flex-row items-center justify-between border-b border-white/10">
            <CardTitle className="text-md font-bold text-white">AI Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 bg-gradient-to-b from-transparent to-black/20">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {showWelcomeMessage && !response && !errorMessage && !isLoading && (
                <div className="p-3 bg-blue-500/20 rounded-lg text-sm mb-2 border border-blue-400/30">
                  <p className="text-white">{welcomeMessage}</p>
                </div>
              )}
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                </div>
              )}
              {errorMessage && !isLoading && (
                <div className="p-3 bg-red-500/20 text-white rounded-lg text-sm mb-2 border border-red-400/30">
                  <p>Error: {errorMessage}</p>
                </div>
              )}
              {response && !isLoading && (
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg text-sm border border-white/20">
                  <p className="whitespace-pre-wrap text-white">{response}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t border-white/10">
            <form onSubmit={handleSubmit} className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Ask me anything..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 min-h-[60px] text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                  disabled={isLoading || isListening}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "outline"}
                    disabled={isLoading}
                    className={isListening ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20 border-white/20 text-white"}
                  >
                    {isListening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !prompt.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          onClick={toggleChat} 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default FloatingChatWidget; 