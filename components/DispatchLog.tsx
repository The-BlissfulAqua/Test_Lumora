import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface DispatchLogProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOffline: boolean;
}

const DispatchLog: React.FC<DispatchLogProps> = ({ messages, onSendMessage, isOffline }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="bg-navy-dark rounded-lg p-4 flex flex-col h-full">
      <h4 className="text-lg font-bold text-accent-cyan mb-3 flex-shrink-0">Dispatch Log</h4>
      <div className="flex-grow space-y-3 overflow-y-auto pr-2 mb-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'Agent' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs rounded-lg px-3 py-2 ${msg.sender === 'Agent' ? 'bg-accent-cyan text-command-blue' : 'bg-navy-light text-slate-light'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
            <p className="text-xs text-slate-dark mt-1">{msg.sender} - {new Date(msg.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
         {messages.length === 0 && <p className="text-sm text-slate-dark text-center">No messages yet.</p>}
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isOffline && handleSend()}
          placeholder={isOffline ? "Cannot send messages while offline" : "Type your message..."}
          className="w-full bg-command-blue border border-navy-light rounded-md px-3 py-2 text-sm text-slate-light focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50"
          disabled={isOffline}
        />
        <button
          onClick={handleSend}
          disabled={isOffline}
          className="bg-accent-cyan text-command-blue font-bold px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DispatchLog;
