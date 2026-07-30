import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, VolumeX, X, Sparkles, Navigation, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { queryAgranex } from '../../services/api';

const commandList = {
  en: [
    { text: "Go to Dashboard", desc: "Open main overview" },
    { text: "Go to Digital Twin", desc: "View 3D interactive farm" },
    { text: "Go to Disease AI", desc: "Scan crops for diseases" },
    { text: "Go to Yield Predict", desc: "Calculate harvest yield" },
    { text: "Go to Marketplace", desc: "Browse crops for sale" },
    { text: "Go to Weather", desc: "Check weather forecast" },
    { text: "Go to Schemes", desc: "Find government grants" },
    { text: "Ask: What is the wheat price?", desc: "Query AI assistant" }
  ],
  ta: [
    { text: "ஒழுங்குமுறை பலகைக்கு போ", desc: "முக்கிய விவரங்களை காண்க" },
    { text: "முப்பரிமாண பண்ணைக்கு போ", desc: "3D பண்ணை காட்சி" },
    { text: "இலை நோயை ஆராய்", desc: "பயிர் நோய்களை கண்டறிய" },
    { text: "விளைச்சல் கணிப்புக்கு போ", desc: "அறுவடை கணிப்பு" },
    { text: "சந்தைக்கு போ", desc: "பயிர் வியாபாரம்" },
    { text: "வானிலைக்கு போ", desc: "மழை மற்றும் வானிலை" },
    { text: "திட்டங்களுக்கு போ", desc: "அரசு திட்டங்கள்" },
    { text: "கேள்: கோதுமை விலை என்ன?", desc: "AI கேள்வி பதில்" }
  ],
  hi: [
    { text: "डैशबोर्ड पर जाओ", desc: "मुख्य अवलोकन खोलें" },
    { text: "थ्रीडी फार्म पर जाओ", desc: "3D फार्म देखें" },
    { text: "फसल रोग की जांच करें", desc: "फसलों के रोग स्कैन करें" },
    { text: "पैदावार अनुमान पर जाओ", desc: "फसल पैदावार देखें" },
    { text: "बाजार पर जाओ", desc: "फसल बाजार ब्राउज़ करें" },
    { text: "मौसम पर जाओ", desc: "मौसम का पूर्वानुमान" },
    { text: "सरकारी योजनाएं पर जाओ", desc: "कृषि सब्सिडी खोजें" },
    { text: "पूछें: गेहूं का क्या मूल्य है?", desc: "AI सहायक से पूछें" }
  ]
};

export const VoiceFAB: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, language, setLanguage, activeLocation } = useStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'speaking' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
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

  // Only show Voice FAB for Farmers (or when user is in farmer view)

  // Initialize Speech Recognition
  const initRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Web Speech API is not supported in this browser.");
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    // Set recognition language based on app store language
    if (language === 'ta') rec.lang = 'ta-IN';
    else if (language === 'hi') rec.lang = 'hi-IN';
    else rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setTranscript('');
      setResponse('');
      setRecognitionError(null);
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setStatus('error');
      if (event.error === 'no-speech') {
        setRecognitionError(language === 'ta' ? 'குரல் கேட்கவில்லை' : language === 'hi' ? 'कोई आवाज नहीं सुनी गई' : 'No speech detected.');
      } else if (event.error === 'not-allowed') {
        setRecognitionError(language === 'ta' ? 'அனுமதி மறுக்கப்பட்டது' : language === 'hi' ? 'अनुमति नहीं दी गई' : 'Microphone access denied.');
      } else {
        setRecognitionError(`Error: ${event.error}`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus(prev => prev === 'listening' ? 'idle' : prev);
    };

    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processVoiceCommand(text);
    };

    recognitionRef.current = rec;
    return rec;
  };

  // Trigger Speech Recognition on button click
  const toggleListening = () => {
    unlockAudio();
    // Cancel speaking if active
    if (status === 'speaking' || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (synthesisRef.current && typeof synthesisRef.current.cancel === 'function') {
        synthesisRef.current.cancel();
      }
      setStatus('idle');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsOpen(true);
      const rec = initRecognition();
      if (rec) {
        try {
          rec.start();
        } catch (e) {
          console.warn("Recognition already started or error:", e);
        }
      }
    }
  };

  // Speak response out loud
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear queue
      if (isMuted) return;

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select appropriate voice based on language
      if (language === 'ta') {
        utterance.lang = 'ta-IN';
      } else if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => {
        setStatus('speaking');
      };

      utterance.onend = () => {
        setStatus('idle');
      };

      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setStatus('idle');
      };

      // Try to find native voice
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
        // Fallback to Google Translation TTS
        console.log(`No native voice found for ${language}, using Google Translation TTS fallback...`);
        setStatus('speaking');
        
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
        
        if (chunks.length === 0) {
          setStatus('idle');
          return;
        }
        
        let currentIdx = 0;
        
        // Make sure audio is unlocked
        if (!audioRef.current) {
          const audio = document.createElement('audio');
          audio.setAttribute('referrerpolicy', 'no-referrer');
          audioRef.current = audio;
        }
        const audioObj = audioRef.current;
        
        const playNext = () => {
          if (currentIdx >= chunks.length) {
            setStatus('idle');
            return;
          }
          
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
              setStatus('idle');
            };
            audioObj.play().catch(err => {
              if (err.name !== 'AbortError') {
                console.error("Audio play blocked or failed:", err);
              }
              setStatus('idle');
            });
          } catch (err) {
            console.error("Failed to play Audio object:", err);
            setStatus('idle');
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

  // Process commands & query Agranex AI
  const processVoiceCommand = async (text: string) => {
    setStatus('processing');
    const lowerText = text.toLowerCase().trim();

    // Check if it's a question/query rather than a navigation request
    const questionKeywords = [
      '?', 'what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'can', 'will', 'price', 'cost', 'ask',
      'என்ன', 'எப்படி', 'எப்போது', 'எங்கே', 'ஏன்', 'விலை', 'வருமா', 'இருக்கு', 'கேள்',
      'क्या', 'कैसे', 'कब', 'कहाँ', 'क्यों', 'कितना', 'मूल्य', 'दाम', 'पूछें'
    ];
    const isQuestion = questionKeywords.some(keyword => lowerText.includes(keyword));

    // Mapping of navigation commands in English, Tamil, and Hindi
    const navCommands = [
      {
        keys: ['dashboard', 'home', 'ஒழுங்குமுறை பலகை', 'டேஷ்போர்டு', 'डैशबोर्ड', 'होम'],
        path: '/dashboard',
        label: { en: 'Dashboard', ta: 'ஒழுங்குமுறை பலகை', hi: 'डैशबोर्ड' },
        speech: { en: 'Opening Dashboard', ta: 'ஒழுங்குமுறை பலகையை திறக்கிறேன்', hi: 'डैशबोर्ड खोल रहा हूँ' }
      },
      {
        keys: ['digital twin', '3d farm', '3d twin', 'farm', 'முப்பரிமாண பண்ணை', 'பண்ணை', 'थ्रीडी फार्म', 'डिजिटल ट्विन', 'फार्म'],
        path: '/digital-twin',
        label: { en: '3D Digital Twin', ta: 'முப்பரிமாண பண்ணை', hi: 'थ्रीडी डिजिटल ट्विन' },
        speech: { en: 'Opening 3D Digital Twin', ta: 'முப்பரிமாண பண்ணையை திறக்கிறேன்', hi: 'थ्रीडी डिजिटल ट्विन खोल रहा हूँ' }
      },
      {
        keys: ['satellite', 'ndvi', 'செயற்கைக்கோள்', 'செயற்கைகோள்', 'सैटेलाइट', 'कृत्रिम उपग्रह'],
        path: '/satellite',
        label: { en: 'Satellite Intelligence', ta: 'செயற்கைக்கோள்', hi: 'सैटेलाइट इंटेलिजेंस' },
        speech: { en: 'Opening Satellite Intelligence', ta: 'செயற்கைக்கோள் விவரங்களை திறக்கிறேன்', hi: 'सैटेलाइट इंटेलिजेंस खोल रहा हूँ' }
      },
      {
        keys: ['disease', 'crop check', 'scan leaf', 'leaf check', 'இலை நோய்', 'நோய் கண்டறிதல்', 'बीमारी', 'फसल रोग', 'रोग जांच'],
        path: '/disease-ai',
        label: { en: 'Disease Detection AI', ta: 'நோய் கண்டறிதல்', hi: 'रोग जांच AI' },
        speech: { en: 'Opening Crop Disease AI', ta: 'பயிர் நோய் கண்டறிதல் பகுதியை திறக்கிறேன்', hi: 'फसल रोग जांच खोल रहा हूँ' }
      },
      {
        keys: ['yield', 'predict yield', 'harvest', 'விளைச்சல்', 'கணிப்பு', 'पैदावार', 'फसल अनुमान'],
        path: '/yield-predict',
        label: { en: 'Yield Prediction', ta: 'விளைச்சல் கணிப்பு', hi: 'पैदावार अनुमान' },
        speech: { en: 'Opening Yield Prediction', ta: 'விளைச்சல் கணிப்பு பகுதியை திறக்கிறேன்', hi: 'पैदावार अनुमान खोल रहा हूँ' }
      },
      {
        keys: ['marketplace', 'market', 'shop', 'buy crop', 'sell crop', 'சந்தை', 'வியாபாரம்', 'கடை', 'बाजार', 'दुकान', 'फसल बाजार'],
        path: '/marketplace',
        label: { en: 'Marketplace', ta: 'விவசாய சந்தை', hi: 'मार्केटप्लेस' },
        speech: { en: 'Opening Crop Marketplace', ta: 'சந்தை பகுதியை திறக்கிறேன்', hi: 'फसल बाजार खोल रहा हूँ' }
      },
      {
        keys: ['weather', 'forecast', 'rain', 'மழை', 'வானிலை', 'मौसम', 'बारिश'],
        path: '/weather',
        label: { en: 'Weather Intelligence', ta: 'வானிலை', hi: 'मौसम पूर्वानुमान' },
        speech: { en: 'Opening Weather Intelligence', ta: 'வானிலை அறிக்கையை திறக்கிறேன்', hi: 'मौसम विभाग खोल रहा हूँ' }
      },
      {
        keys: ['assistant', 'agranex ai', 'bot', 'உதவியாளர்', 'कृषि सहायक', 'चैटबॉट'],
        path: '/agranex-ai',
        label: { en: 'Agranex Assistant', ta: 'உதவியாளர்', hi: 'कृषि सहायक' },
        speech: { en: 'Opening voice assistant', ta: 'உதவியாளரை திறக்கிறேன்', hi: 'सहायक खोल रहा हूँ' }
      },
      {
        keys: ['scheme', 'government schemes', 'subsidies', 'திட்டங்கள்', 'அரசு திட்டம்', 'योजनाएं', 'सरकारी योजनाएं', 'सब्सिडी'],
        path: '/schemes',
        label: { en: 'Government Schemes', ta: 'அரசு திட்டங்கள்', hi: 'सरकारी योजनाएं' },
        speech: { en: 'Opening Government Schemes', ta: 'அரசு திட்டங்கள் பகுதியை திறக்கிறேன்', hi: 'सरकारी योजनाएं खोल रहा हूँ' }
      }
    ];

    // Check if the command is a navigation action
    if (!isQuestion) {
      for (const cmd of navCommands) {
        if (cmd.keys.some(key => lowerText.includes(key))) {
          setStatus('success');
          const confirmText = cmd.speech[language as 'en' | 'ta' | 'hi'] || cmd.speech.en;
          setResponse(cmd.label[language as 'en' | 'ta' | 'hi'] || cmd.label.en);
          speakText(confirmText);
          setTimeout(() => {
            navigate(cmd.path);
            setIsOpen(false);
            setStatus('idle');
          }, 1200);
          return;
        }
      }
    }

    // Location-based voice strategy analyzer interceptor
    const isLocationQuery = [
      'location', 'strategies', 'soil', 'analyse my location', 'analyze my location', 
      'temperature', 'disaster', 'chemical', 'factory', 'map', 'field', 'satellite',
      'அளவிடு', 'பகுப்பாய்வு', 'இடம்', 'இடத்', 'மண்', 'வெப்பநிலை', 'பயிர்', 
      'வழிகாட்டி', 'சாதகமான', 'தீர்வு', 'வரைபடம்', 'திற', 'விவரம்',
      'तापमान', 'विश्लेषण', 'स्थान', 'नुकसान', 'केमिकल', 'नक्शा', 'मानचित्र', 'खेत'
    ].some(keyword => lowerText.includes(keyword));

    if (isLocationQuery && activeLocation) {
      const alertSnippet = activeLocation.nearbyChemicalAlert 
        ? `Note hazard proximity warning: ${activeLocation.nearbyChemicalAlert}`
        : "No chemical factories detected nearby. Runoff risk: safe.";
      const cropsSnippet = activeLocation.bestCrops.map(c => `${c.name} (${c.score}% suit)`).join(', ');
      
      const structuredPrompt = `You are Agranex AI agricultural intelligence assistant.
The farmer has moved their active field to: ${activeLocation.name} (coordinates: ${activeLocation.lat.toFixed(4)}, ${activeLocation.lng.toFixed(4)}).
Climate Telemetry: Predicted Temperature is ${activeLocation.temperature}°C, Soil pH is ${activeLocation.soilPh}, Soil Moisture is ${activeLocation.soilMoisture}%, Organic Carbon is ${activeLocation.organicCarbon}%.
${alertSnippet}
Recommended Crops & Suitability: ${cropsSnippet}.
The farmer's request: "${text}".
Write a concise, professional 3-4 sentence response in the selected language (${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}) summarizing the location's climate metrics, the best crop to plant based on suitability, and a direct strategy/alert for hazards. Don't use code snippets, return only plain speech.`;

      try {
        const responseData = await queryAgranex(structuredPrompt, language, 'meta/llama-3.1-70b-instruct');
        setResponse(responseData.response);
        speakText(responseData.response);
        
        // Open map immediately centered on pointed place
        navigate('/satellite');
        return;
      } catch (err) {
        console.error("AI service error, using local reasoning fallback:", err);
        let fallbackText = `Here is the analysis for ${activeLocation.name}: The temperature is ${activeLocation.temperature}°C with a soil pH of ${activeLocation.soilPh}. The best matched crop is ${activeLocation.bestCrops[0]?.name || 'Wheat'} (${activeLocation.bestCrops[0]?.score}% match). ${activeLocation.nearbyChemicalAlert || 'All industrial proximity safety markers are normal.'}`;
        
        if (language === 'ta') {
          fallbackText = `${activeLocation.name} பகுப்பாய்வு: வெப்பநிலை ${activeLocation.temperature}°C, மண் pH ${activeLocation.soilPh} ஆகும். சிறந்த பயிர் ${activeLocation.bestCrops[0]?.name || 'Wheat'} (${activeLocation.bestCrops[0]?.score}% பொருத்தம்). ${activeLocation.nearbyChemicalAlert || 'அருகிலுள்ள வேதியியல் தொழிற்சாலைகள் அபாயம் எதுவும் இல்லை.'}`;
        } else if (language === 'hi') {
          fallbackText = `${activeLocation.name} विश्लेषण: तापमान ${activeLocation.temperature}°C और मिट्टी का pH ${activeLocation.soilPh} है। सर्वश्रेष्ठ फसल ${activeLocation.bestCrops[0]?.name || 'गेहूं'} (${activeLocation.bestCrops[0]?.score}% उपयुक्तता) है। ${activeLocation.nearbyChemicalAlert || 'आसपास कोई रासायनिक खतरा नहीं है।'}`;
        }
        
        setResponse(fallbackText);
        speakText(fallbackText);
        
        // Open map immediately centered on pointed place
        navigate('/satellite');
        return;
      }
    }

    // Default: query backend LLM via API for agricultural advice
    try {
      // Trigger API call using Agranex Query API
      // Specify model in the query so that it resolves to the real NVIDIA NIM model selected in the app
      const responseData = await queryAgranex(text, language, 'meta/llama-3.1-70b-instruct');
      setResponse(responseData.response);
      speakText(responseData.response);
    } catch (err) {
      console.error(err);
      setStatus('error');
      const failMsg = language === 'ta' ? 'அகராநெக்ஸ் பதிலளிக்கவில்லை. மீண்டும் முயலவும்.' : language === 'hi' ? 'सर्वर से संपर्क नहीं हो पाया। पुनः प्रयास करें।' : 'Sorry, Agranex is offline. Please try again.';
      setResponse(failMsg);
      speakText(failMsg);
    }
  };

  // Close panel and stop audio
  const handleClose = () => {
    setIsOpen(false);
    setIsListening(false);
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (currentRole !== 'farmer') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Voice Control Expandable Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="mb-4 w-80 md:w-96 rounded-2xl glass-card border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl shadow-2xl p-5 text-slate-800 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span className="font-bold text-sm tracking-wide">AGRANEX VOICE ASSISTANT</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {/* Language Switcher */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ta' | 'hi')}
                  className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs px-2 py-1 focus:outline-none text-slate-700 dark:text-gray-200 mr-2"
                >
                  <option value="en">English 🇬🇧</option>
                  <option value="ta">தமிழ் 🇮🇳</option>
                  <option value="hi">हिंदी 🇮🇳</option>
                </select>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  title={isMuted ? "Unmute Voice Output" : "Mute Voice Output"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  title="Show command examples"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Command Guide */}
            {showHelp ? (
              <div className="py-3">
                <p className="text-xs font-semibold text-slate-400 dark:text-gray-400 mb-2">Navigation commands & query helper:</p>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {commandList[language as 'en' | 'ta' | 'hi'].map((cmd, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        unlockAudio();
                        setTranscript(cmd.text.startsWith("Ask:") ? cmd.text.substring(5) : cmd.text);
                        processVoiceCommand(cmd.text.startsWith("Ask:") ? cmd.text.substring(5) : cmd.text);
                        setShowHelp(false);
                      }}
                      className="p-2 rounded-lg bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{cmd.text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-gray-400 ml-5">{cmd.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Core Content */
              <div className="py-4 flex flex-col space-y-4">
                
                {/* Visual Status Indicator */}
                <div className="flex justify-center py-2">
                  {status === 'listening' ? (
                    /* Listening wave animation */
                    <div className="flex items-center space-x-1.5 h-8">
                      <div className="w-1.5 bg-red-500 animate-[bounce_0.8s_infinite_100ms] rounded-full" style={{ height: '70%' }} />
                      <div className="w-1.5 bg-red-500 animate-[bounce_0.8s_infinite_200ms] rounded-full" style={{ height: '100%' }} />
                      <div className="w-1.5 bg-red-500 animate-[bounce_0.8s_infinite_300ms] rounded-full" style={{ height: '80%' }} />
                      <div className="w-1.5 bg-red-500 animate-[bounce_0.8s_infinite_400ms] rounded-full" style={{ height: '50%' }} />
                      <div className="w-1.5 bg-red-500 animate-[bounce_0.8s_infinite_500ms] rounded-full" style={{ height: '90%' }} />
                    </div>
                  ) : status === 'processing' ? (
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  ) : status === 'speaking' ? (
                    /* Speaking animation */
                    <div className="flex items-center space-x-1.5 h-8">
                      <div className="w-1 bg-emerald-500 animate-[bounce_0.6s_infinite_200ms] rounded-full" style={{ height: '40%' }} />
                      <div className="w-1 bg-emerald-500 animate-[bounce_0.6s_infinite_400ms] rounded-full" style={{ height: '80%' }} />
                      <div className="w-1 bg-emerald-500 animate-[bounce_0.6s_infinite_100ms] rounded-full" style={{ height: '50%' }} />
                      <div className="w-1 bg-emerald-500 animate-[bounce_0.6s_infinite_300ms] rounded-full" style={{ height: '70%' }} />
                    </div>
                  ) : status === 'success' ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <Mic className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                  )}
                </div>

                {/* State Label */}
                <div className="text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">
                    {status === 'listening' ? (language === 'ta' ? 'குரலை கேட்கிறது...' : language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...') :
                     status === 'processing' ? (language === 'ta' ? 'ஆராய்கிறது...' : language === 'hi' ? 'प्रसंस्करण...' : 'Analyzing Query...') :
                     status === 'speaking' ? (language === 'ta' ? 'பதிலளிக்கிறது...' : language === 'hi' ? 'बोल रहा हूँ...' : 'Speaking Response...') :
                     status === 'success' ? (language === 'ta' ? 'வெற்றி!' : language === 'hi' ? 'सफल!' : 'Success!') :
                     status === 'error' ? (language === 'ta' ? 'பிழை!' : language === 'hi' ? 'त्रुटि!' : 'Error!') :
                     (language === 'ta' ? 'அகராநெக்ஸ் குரல் உதவியாளர்' : language === 'hi' ? 'अक्वानेक्स वॉयस असिस्टेंट' : 'Agranex Voice Assistant')}
                  </span>
                </div>

                {/* Transcript Card */}
                {transcript && (
                  <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                    <p className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">You Said:</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-white mt-1 leading-relaxed">"{transcript}"</p>
                  </div>
                )}

                {/* Response / Guidance Card */}
                {response && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-500 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Agranex Response:</p>
                    <p className="text-sm text-slate-700 dark:text-gray-200 mt-1 leading-relaxed">{response}</p>
                  </div>
                )}

                {/* Error Banner */}
                {recognitionError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-500 font-medium">{recognitionError}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={toggleListening}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-300 ${
          status === 'listening'
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] text-white'
            : status === 'speaking'
            ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] text-white animate-pulse'
            : 'bg-gradient-to-tr from-[#10B981] to-[#3B82F6] hover:from-[#059669] hover:to-[#2563EB] text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
        }`}
        title={language === 'ta' ? 'குரல் வழிகாட்டி' : language === 'hi' ? 'वॉयस控制' : 'Voice Assistant Access'}
      >
        {/* Pulsating Ring (listening / speaking mode) */}
        {(status === 'listening' || status === 'speaking') && (
          <span className={`absolute inset-0 rounded-full animate-ping opacity-60 border-4 ${status === 'listening' ? 'border-red-400' : 'border-emerald-400'}`} style={{ animationDuration: '1.2s' }} />
        )}
        
        {status === 'speaking' && !isMuted ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
};
