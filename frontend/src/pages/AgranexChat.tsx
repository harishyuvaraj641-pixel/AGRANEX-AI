import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Image, Mic, MessageSquare, Phone, User, 
  Paperclip, Plus, Smile, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const AgranexChat: React.FC = () => {
  const { user, currentRole } = useStore();
  const currentUserId = user?.id || (
    currentRole === 'buyer' ? 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' :
    currentRole === 'logistics' ? 'logistics_id_express' :
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  );
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordInterval = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChatRooms = async () => {
    try {
      const res = await fetch(`/api/v1/marketplace/chats/rooms?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        if (data.length > 0 && !activeRoom) {
          setActiveRoom(data[0]);
        }
      }
    } catch (err) {
      console.warn('Backend chat unreachable, using fallback mock rooms');
      setRooms([
        { id: 'room1', farmer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', farmer_name: 'Rajesh Kumar', buyer_name: 'BigBasket Corporate' }
      ]);
      setActiveRoom({ id: 'room1', farmer_name: 'Rajesh Kumar', buyer_name: 'BigBasket Corporate' });
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/v1/marketplace/chats/rooms/${roomId}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      setMessages([
        { id: 'msg1', sender_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', content: 'Hello Rajesh, is the Sharbati Wheat crop grade A cert verified?', message_type: 'text', created_at: new Date(Date.now() - 100000).toISOString() },
        { id: 'msg2', sender_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', content: 'Yes, it is moisture-tested (12.2% moisture) and certified organic. Ready at hub Coimbatore.', message_type: 'text', created_at: new Date(Date.now() - 50000).toISOString() }
      ]);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id);
      
      // Setup mock polling interval for real-time demonstration sync
      const poll = setInterval(() => {
        loadMessages(activeRoom.id);
      }, 5000);
      return () => clearInterval(poll);
    }
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (type = 'text', mediaUrl = '') => {
    if (!activeRoom) return;
    if (type === 'text' && !inputValue.trim()) return;

    const payload = {
      roomId: activeRoom.id,
      senderId: currentUserId,
      content: type === 'text' ? inputValue : '',
      mediaUrl,
      messageType: type
    };

    try {
      const res = await fetch('/api/v1/marketplace/chats/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setInputValue('');
        loadMessages(activeRoom.id);
      }
    } catch (err) {
      // Fallback local append for demo
      const newMsg = {
        id: 'msg-' + Date.now(),
        room_id: activeRoom.id,
        sender_id: payload.senderId,
        content: payload.content,
        media_url: payload.mediaUrl,
        message_type: payload.messageType,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      setInputValue('');
    }
  };

  // Mock Voice Recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordTimer(0);
    recordInterval.current = setInterval(() => {
      setRecordTimer(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordInterval.current);
    handleSendMessage('voice', 'https://codesandbox.io/mock-voice-recording.mp3');
  };

  // Mock Photo share simulation
  const sharePhoto = () => {
    handleSendMessage('image', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400');
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
      {/* Left sidebar: Chat Room List */}
      <div className="w-80 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080C14]/80 backdrop-blur-xl flex flex-col p-4 text-slate-900 dark:text-white shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Messages Chat 💬
          </h2>
          <button onClick={loadChatRooms} className="text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {rooms.map((room) => {
            const isActive = activeRoom && activeRoom.id === room.id;
            const isFarmer = currentUserId === room.farmer_id;
            const displayName = isFarmer ? room.buyer_name : room.farmer_name;
            return (
              <div 
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 border ${
                  isActive 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' 
                  : 'hover:bg-slate-200 dark:hover:bg-white/5 border-transparent text-slate-700 dark:text-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                  {displayName ? displayName.charAt(0) : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm truncate text-slate-900 dark:text-white">{displayName || 'Agri User'}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5">Order Delivery Status Queries</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#080C14]">
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080C14] flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  {(currentUserId === activeRoom.farmer_id ? activeRoom.buyer_name : activeRoom.farmer_name)?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {currentUserId === activeRoom.farmer_id ? activeRoom.buyer_name : activeRoom.farmer_name || 'Agri User'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Online Realtime</span>
                </div>
              </div>
              <Phone className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
            </div>

            {/* Chat messages list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 text-sm relative border ${
                      isMe 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-900 dark:text-white' 
                      : 'bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white'
                    }`}>
                      {msg.message_type === 'text' && <p>{msg.content}</p>}
                      {msg.message_type === 'image' && (
                        <div className="space-y-1">
                          <img src={msg.media_url} alt="Shared Photo" className="rounded-lg max-h-48 object-cover border border-white/10" />
                          <span className="text-[10px] text-slate-400 block font-mono">Attachment: Crop Quality Image</span>
                        </div>
                      )}
                      {msg.message_type === 'voice' && (
                        <div className="flex items-center gap-3 py-1 font-mono text-xs">
                          <Mic className="w-5 h-5 text-emerald-400 animate-pulse" />
                          <span>Simulated Voice Note (0:08)</span>
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 block text-right mt-1.5 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat inputs footer */}
            <div className="p-4 bg-slate-100 dark:bg-[#080C14] border-t border-slate-200 dark:border-white/10 shrink-0">
              <div className="glass-card rounded-xl p-1.5 flex items-center gap-2 border border-slate-300 dark:border-white/10">
                <button onClick={sharePhoto} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer" title="Attach Image">
                  <Image className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-between px-3 text-red-500 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                        <span>Recording Audio: {formatTimer(recordTimer)}</span>
                      </div>
                      <button onClick={stopRecording} className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold">Stop & Send</button>
                    </motion.div>
                  ) : (
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                      placeholder="Type your message here..."
                      className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-0 text-sm outline-none px-2"
                    />
                  )}
                </AnimatePresence>

                {!isRecording && (
                  <button onClick={startRecording} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer" title="Record Voice">
                    <Mic className="w-5 h-5" />
                  </button>
                )}

                <button onClick={() => handleSendMessage()} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-16 h-16 text-slate-500/30 mb-4 animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Start Conversations</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-xs mt-1">Select a customer profile room from the sidebar to chat in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgranexChat;
