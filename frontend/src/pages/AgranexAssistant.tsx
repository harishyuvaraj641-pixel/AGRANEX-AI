import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Mic, Send, Volume2, Plus, MessageSquare, CloudRain, ShieldAlert, Droplets, TrendingUp, Cpu, ChevronDown, Sparkles } from 'lucide-react';
import { queryAgranex } from '../services/api';
import { useStore, nvidiaNimModels, NvidiaModel } from '../store/useStore';

interface Message {
  id: string;
  sender: 'agranex' | 'user';
  text: string;
  timestamp: Date;
  source?: string;
}

export const AgranexAssistant = () => {
  const { selectedNvidiaModel, setSelectedNvidiaModel, language, setLanguage } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agranex',
      text: 'Hello! I am Agranex, your AI agricultural assistant powered by NVIDIA NIM. I can help you with crop diseases, weather forecasts, market prices, irrigation levels, and government schemes. Ask me anything! I support voice input and speak English, Tamil (தமிழ்), and Hindi (हिंदी).',
      timestamp: new Date(),
      source: `NVIDIA NIM (${selectedNvidiaModel})`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = () => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.setAttribute('referrerpolicy', 'no-referrer');
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (synthesisRef.current && typeof synthesisRef.current.cancel === 'function') {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendQuery = async (queryStr: string) => {
    if (!queryStr.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryStr,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await queryAgranex(queryStr, language, selectedNvidiaModel);
      setIsTyping(false);
      const botMsg: Message = {
        id: Date.now().toString(),
        sender: 'agranex',
        text: data.response,
        timestamp: new Date(),
        source: data.source
      };
      setMessages(prev => [...prev, botMsg]);
      speak(data.response);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    unlockAudio();
    sendQuery(inputValue);
    setInputValue('');
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (synthesisRef.current && typeof synthesisRef.current.cancel === 'function') {
        synthesisRef.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => {
        const voiceLang = v.lang.toLowerCase();
        if (language === 'ta') {
          return voiceLang.startsWith('ta') || voiceLang.includes('tamil');
        } else if (language === 'hi') {
          return voiceLang.startsWith('hi') || voiceLang.includes('hindi');
        }
        return false;
      });

      if (matchingVoice) {
        utterance.voice = matchingVoice;
        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else if (language === 'ta' || language === 'hi') {
        console.log(`No native voice found for ${language}, using Google Translation TTS fallback...`);
        
        // Split text into chunks of at most 160 characters (splitting on spaces/punctuation)
        const chunks: string[] = [];
        const words = text.split(/\s+/);
        let currentChunk = '';
        
        for (const word of words) {
          if ((currentChunk + ' ' + word).length > 160) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk = currentChunk ? currentChunk + ' ' + word : word;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
        
        if (chunks.length === 0) return;
        
        let currentIdx = 0;
        
        if (!audioRef.current) {
          const audio = document.createElement('audio');
          audio.setAttribute('referrerpolicy', 'no-referrer');
          audioRef.current = audio;
        }
        const audioObj = audioRef.current;
        
        const playNext = () => {
          if (currentIdx >= chunks.length) return;
          
          const chunkText = chunks[currentIdx];
          const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=gtx&q=${encodeURIComponent(chunkText)}`;
          
          try {
            audioObj.src = url;
            audioObj.onended = () => {
              currentIdx++;
              playNext();
            };
            audioObj.onerror = (err) => {
              console.error("Error playing TTS chunk:", err);
            };
            audioObj.play().catch(err => {
              if (err.name !== 'AbortError') {
                console.error("Audio play blocked or failed:", err);
              }
            });
          } catch (err) {
            console.error("Failed to play Audio object:", err);
          }
        };
        
        playNext();
        
        synthesisRef.current = {
          cancel: () => {
            audioObj.pause();
            audioObj.src = '';
            currentIdx = chunks.length; // stops the queue
          }
        };
      } else {
        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const startListening = () => {
    unlockAudio();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setIsTyping(false);
      
      let errorMsg = '';
      if (event.error === 'not-allowed') {
        errorMsg = language === 'ta' 
          ? 'மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் மைக் அனுமதியை இயக்கவும்.' 
          : language === 'hi' 
            ? 'माइक्रोफ़ोन पहुंच अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में अनुमति चालू करें।' 
            : 'Microphone access denied. Please enable microphone permissions in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = language === 'ta'
          ? 'குரல் எதுவும் கேட்கவில்லை. மைக்ரோஃபோனை சரிபார்த்து மீண்டும் பேசவும்.'
          : language === 'hi'
            ? 'कोई आवाज नहीं सुनी गई। कृपया दोबारा बोलें।'
            : 'No speech detected. Please check your mic and try speaking again.';
      } else {
        errorMsg = `Speech Recognition Error: ${event.error}`;
      }
      alert(errorMsg);
    };
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);
      
      try {
        const data = await queryAgranex(transcript, language, selectedNvidiaModel);
        setIsTyping(false);
        const botMsg: Message = {
          id: Date.now().toString(),
          sender: 'agranex',
          text: data.response,
          timestamp: new Date(),
          source: data.source
        };
        setMessages(prev => [...prev, botMsg]);
        speak(data.response);
      } catch (err) {
        setIsTyping(false);
      }
    };
    recognition.start();
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080C14]/80 backdrop-blur-xl hidden md:flex flex-col p-4 text-slate-900 dark:text-white">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          Agranex AI Assistant 🤖
        </h2>

        {/* Model Selector Card in Sidebar */}
        <div className="mb-6 bg-slate-200/60 dark:bg-white/5 p-3 rounded-2xl border border-slate-300 dark:border-white/10">
          <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Cpu size={12} className="text-emerald-500" /> Active NVIDIA NIM Model
          </label>
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm"
            >
              <div className="flex flex-col text-left">
                <span className="truncate max-w-[170px]">{nvidiaNimModels.find((m: NvidiaModel) => m.id === selectedNvidiaModel)?.name}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{nvidiaNimModels.find((m: NvidiaModel) => m.id === selectedNvidiaModel)?.badge}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 p-1"
                >
                  {nvidiaNimModels.map((m: NvidiaModel) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedNvidiaModel(m.id);
                        setShowModelMenu(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        selectedNvidiaModel === m.id
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400 font-mono ml-1">{m.badge}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button 
          onClick={() => setMessages([{ id: '1', sender: 'agranex', text: 'Hello! I am Agranex, your AI farming assistant. Ask me anything!', timestamp: new Date(), source: `NVIDIA NIM (${selectedNvidiaModel})` }])} 
          className="btn-primary w-full py-2 flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </button>

        <div className="flex-1 overflow-y-auto space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Suggested Topics</h3>
          
          <button onClick={() => sendQuery('Explain tomato early blight crop disease and its remedies')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 text-left transition-colors text-slate-700 dark:text-gray-300 group">
            <ShieldAlert className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
            <span className="text-sm">Crop disease help</span>
          </button>
          
          <button onClick={() => sendQuery('Show current Coimabtore weather details')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 text-left transition-colors text-slate-700 dark:text-gray-300 group">
            <CloudRain className="w-5 h-5 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
            <span className="text-sm">Weather forecast</span>
          </button>

          <button onClick={() => sendQuery('What are the current wheat mandi prices in Punjab?')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 text-left transition-colors text-slate-700 dark:text-gray-300 group">
            <TrendingUp className="w-5 h-5 text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-300" />
            <span className="text-sm">Market prices</span>
          </button>

          <button onClick={() => sendQuery('Provide irrigation advice based on current soil water indices')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 text-left transition-colors text-slate-700 dark:text-gray-300 group">
            <Droplets className="w-5 h-5 text-cyan-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-300" />
            <span className="text-sm">Irrigation advice</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-50 dark:bg-[#080C14]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'agranex' 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/50' 
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/50'
                }`}>
                  {msg.sender === 'agranex' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div className={`max-w-[85%] rounded-2xl p-4 text-left ${
                  msg.sender === 'agranex' 
                  ? 'glass-card border-l-2 border-l-emerald-500 text-slate-800 dark:text-gray-200' 
                  : 'bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-white'
                }`}>
                  <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-400 dark:text-gray-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.source && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                        {msg.source}
                      </span>
                    )}
                    {msg.sender === 'agranex' && (
                      <button 
                        onClick={() => speak(msg.text)}
                        className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors ml-auto cursor-pointer"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="glass-card rounded-2xl p-4 border-l-2 border-l-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-slate-100 dark:from-[#080C14] via-slate-100 dark:via-[#080C14] to-transparent border-t border-slate-200 dark:border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-2 flex items-end gap-2 border border-slate-200 dark:border-white/10 focus-within:border-emerald-500/50 transition-colors shadow-2xl">
              
              <div className="flex flex-col gap-1 p-2 border-r border-slate-200 dark:border-white/10 shrink-0">
                <button onClick={() => setLanguage('en')} className={`text-xs px-2 py-1 rounded font-bold ${language === 'en' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5'}`}>EN</button>
                <button onClick={() => setLanguage('ta')} className={`text-xs px-2 py-1 rounded font-bold ${language === 'ta' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5'}`}>தமிழ்</button>
                <button onClick={() => setLanguage('hi')} className={`text-xs px-2 py-1 rounded font-bold ${language === 'hi' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5'}`}>हिंदी</button>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Agranex anything about your farm..."
                className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-0 resize-none p-3 max-h-32 min-h-[44px] scrollbar-hide text-sm sm:text-base outline-none"
                rows={1}
              />

              <div className="flex items-center gap-2 p-2 shrink-0">
                <button 
                  onClick={startListening}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 dark:text-gray-500 mt-3 font-mono">
              Agranex AI model: <strong className="text-emerald-600 dark:text-emerald-400">{nvidiaNimModels.find((m: NvidiaModel) => m.id === selectedNvidiaModel)?.name}</strong>. Verify important farming decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgranexAssistant;
