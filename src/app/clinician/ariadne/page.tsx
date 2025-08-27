'use client';

import { useState, useEffect } from 'react';
import ClinicianSidebar from '../sidebar';
import { MoreVertical, Search, Plus, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ariadne';
  timestamp: Date;
}

export default function AriadnePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate Ariadne response
    setTimeout(() => {
      const ariadneMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm Ariadne, your AI assistant. How can I help you today?",
        sender: 'ariadne',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, ariadneMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-screen bg-d">
      <ClinicianSidebar />
      
      <div className="ml-64 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="pt-4 pr-4 pb-6 bg-white flex justify-between items-center">
          <h2 className="text-4xl font-black text-b">Ariadne</h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Container */}
          <div className="flex-1 flex flex-col bg-white m-3 rounded-xl">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Start a conversation with Ariadne!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-3/4 p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-b text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="ml-2 bg-b text-white p-3 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white border border-gray-200 rounded-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-200">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={16} />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                />
              </div>
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-gray-900">Previous Chat 1</p>
                  <p className="text-sm text-gray-500">Last message preview...</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-gray-900">Previous Chat 2</p>
                  <p className="text-sm text-gray-500">Last message preview...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
