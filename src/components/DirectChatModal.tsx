import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft,
  CheckCheck,
  Truck,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { ChatMessage, FoodDonation, UserRole } from '../types';
import { appState, useAppState } from '../services/store';

interface DirectChatModalProps {
  donation: FoodDonation;
  onClose?: () => void;
  currentUserRole?: UserRole;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  donation,
  onClose,
  currentUserRole = 'DONOR',
}) => {
  const state = useAppState();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Messages filtered for this donation
  const messages = state.messages.filter((m) => m.donationId === donation.id);

  const charityName = donation.selectedCharityName || 'Hope Community Center';
  const otherPartyName =
    currentUserRole === 'DONOR' ? charityName : donation.donorName;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const senderName =
      currentUserRole === 'DONOR' ? donation.donorName : charityName;
    const senderId =
      currentUserRole === 'DONOR'
        ? donation.donorId
        : donation.selectedCharityId || 'charity';

    appState.addMessage({
      donationId: donation.id,
      senderId,
      senderName,
      senderRole: currentUserRole,
      text: inputText.trim(),
    });

    setInputText('');
  };

  const handleQuickPreset = (text: string) => {
    const senderName =
      currentUserRole === 'DONOR' ? donation.donorName : charityName;
    const senderId =
      currentUserRole === 'DONOR'
        ? donation.donorId
        : donation.selectedCharityId || 'charity';

    appState.addMessage({
      donationId: donation.id,
      senderId,
      senderName,
      senderRole: currentUserRole,
      text,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-[520px] overflow-hidden">
      {/* Header matching screenshot Bottom-Right-1 */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=100&q=80"
              alt={otherPartyName}
              className="w-9 h-9 rounded-full object-cover border border-slate-300"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">
              Chat - {otherPartyName}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • Donation #{donation.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <a
            href={`tel:${donation.donorPhone}`}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Donation Banner pill inside chat */}
      <div className="px-4 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
          <Truck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {donation.portions} portions {donation.foodName} • {donation.urgencyLevel} Urgency
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 font-bold text-emerald-700 text-[10px] uppercase">
          {donation.status.replace('_', ' ')}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 shadow-2xs">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.senderRole === currentUserRole;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold block mb-1 text-blue-600">
                    {msg.senderName}
                  </span>
                )}
                <p className="leading-relaxed">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    isMe ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick preset coordination replies */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold shrink-0">Quick:</span>
        <button
          onClick={() => handleQuickPreset('Food is packed and ready for pickup.')}
          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-full border border-slate-200 shrink-0 whitespace-nowrap transition-colors"
        >
          Packed & Ready
        </button>
        <button
          onClick={() => handleQuickPreset('Driver is on the way in our vehicle.')}
          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-full border border-slate-200 shrink-0 whitespace-nowrap transition-colors"
        >
          Driver on the way
        </button>
        <button
          onClick={() => handleQuickPreset('Arrived at the pickup location.')}
          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-full border border-slate-200 shrink-0 whitespace-nowrap transition-colors"
        >
          Arrived at location
        </button>
      </div>

      {/* Input bar matching screenshot Bottom-Right-1 */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Emoji"
        >
          <Smile className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-xs bg-slate-100 rounded-xl px-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        />
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Attachment"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
