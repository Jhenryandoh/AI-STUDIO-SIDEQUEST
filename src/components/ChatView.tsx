import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Camera, AlertCircle, MessageSquare } from 'lucide-react';
import type { ChatMessage, Player } from '../types/index.ts';

interface ChatViewProps {
  player: Player;
  messages: ChatMessage[];
  onSendMessage: (text: string, type?: ChatMessage['type']) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  player,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'chat');
    setInputText('');
  };

  const quickPills = [
    { text: '🍻 Cheers squad!', type: 'chat' as const },
    { text: '📍 At the bar counter!', type: 'location_ping' as const },
    { text: '🚨 Need backup for a challenge!', type: 'chat' as const },
    { text: '🕵️ Secret quest initiated...', type: 'chat' as const },
  ];

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-[calc(100vh-130px)] pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
            ENCRYPTED SQUAD COMMS
          </span>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            Squad Chatroom
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          Live Sync
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 no-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === player.id;
          const isSystem = msg.type === 'system' || msg.type === 'quest_complete';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-[11px] font-mono text-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <span className="text-lg shrink-0 mt-0.5">
                {msg.senderAvatar.split(' ')[0]}
              </span>

              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-cyan-400 block mb-0.5">
                    {msg.senderName}
                  </span>
                )}
                <p className="leading-relaxed">{msg.text}</p>
                {msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt="Shared in chat"
                    className="mt-2 rounded-lg max-h-36 object-cover border border-white/20"
                  />
                )}
                <span className="text-[9px] opacity-60 text-right block mt-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pills */}
      <div className="flex gap-1.5 overflow-x-auto py-1.5 no-scrollbar shrink-0">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(pill.text, pill.type)}
            className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-medium text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
          >
            {pill.text}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-purple-900/30 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message squad..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-cyan-500/20"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
