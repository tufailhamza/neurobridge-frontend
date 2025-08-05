'use client';

import React, { useState, useEffect } from 'react';
import ClinicianSidebar from '../sidebar';
import { Search, Filter, Star, Phone, Video, MoreHorizontal, Mic, Send, Archive } from 'lucide-react';

interface Message {
    id: number;
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
}

interface Contact {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    isStarred: boolean;
}

export default function MessagesPage() {
    // State for active tab in contacts
    const [activeTab, setActiveTab] = useState('all');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messageInput, setMessageInput] = useState('');
    
    // Sample contacts data
    const contacts: Contact[] = [
        { 
            id: 1, 
            name: 'John Smith', 
            avatar: '/avatar1.jpg', 
            lastMessage: 'Hey, how are you doing today?', 
            time: '10:30 AM',
            isStarred: true
        },
        { 
            id: 2, 
            name: 'Sarah Johnson', 
            avatar: '/avatar2.jpg', 
            lastMessage: 'Can we schedule a meeting tomorrow?', 
            time: 'Yesterday',
            isStarred: false
        },
        { 
            id: 3, 
            name: 'Mike Peterson', 
            avatar: '/avatar3.jpg', 
            lastMessage: 'I sent you the documents you requested', 
            time: 'Mon',
            isStarred: true
        },
        { 
            id: 4, 
            name: 'Emily Richards', 
            avatar: '/avatar4.jpg', 
            lastMessage: 'Thanks for your help with everything!', 
            time: 'Sun',
            isStarred: false
        },
        { 
            id: 5, 
            name: 'David Cooper', 
            avatar: '/avatar5.jpg', 
            lastMessage: 'Let me know when you\'re available', 
            time: 'May 10',
            isStarred: false
        },
        { 
            id: 6, 
            name: 'Lisa Wong', 
            avatar: '/avatar6.jpg', 
            lastMessage: 'The meeting went really well', 
            time: 'May 8',
            isStarred: true
        },
    ];

    // Initialize messages from localStorage or create default messages
    const [messages, setMessages] = useState<{ [key: number]: Message[] }>(() => {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
            const savedMessages = localStorage.getItem('clinicianChatMessages');
            if (savedMessages) {
                return JSON.parse(savedMessages);
            }
        }
        
        // Create default messages for each contact
        const defaultMessages: { [key: number]: Message[] } = {};
        contacts.forEach(contact => {
            defaultMessages[contact.id] = [
                {
                    id: 1,
                    sender: contact.name,
                    text: 'Hi there! How can I help you today?',
                    time: '10:30 AM',
                    isMe: false
                }
            ];
        });
        return defaultMessages;
    });

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('clinicianChatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    // Function to send a message
    const sendMessage = (contactId: number) => {
        if (!messageInput.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: 'Me',
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages(prev => ({
            ...prev,
            [contactId]: [...(prev[contactId] || []), newMessage]
        }));

        setMessageInput('');

        // Simulate automated reply after 1 second
        setTimeout(() => {
            const autoReply: Message = {
                id: Date.now() + 1,
                sender: contacts.find(c => c.id === contactId)?.name || 'Contact',
                text: 'This is an automated message. I hope you are doing great!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false
            };

            setMessages(prev => ({
                ...prev,
                [contactId]: [...(prev[contactId] || []), autoReply]
            }));
        }, 1000);
    };

    // Function to handle contact selection
    const handleContactClick = (contact: Contact) => {
        setSelectedContact(contact);
    };

    return (
        <div className="h-screen bg-d">
            {/* Sidebar */}
            <ClinicianSidebar />
            
            {/* Main Content */}
            <div className="ml-64 h-full flex flex-col overflow-hidden">
                {/* Messenger Header */}
                <div className="p-4 bg-white flex justify-between items-center  border-gray-200">
                    <h2 className="text-3xl font-semibold text-b">Messages</h2>
                    <div className="flex items-center space-x-4 ">
                        <button className='bg-a p-3 rounded-xl px-5'>
                            +  Create Message
                        </button>
                    </div>
                </div>

                {/* Content Area with Chat */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Contacts Section (30% width) */}
                    <div className="w-3/10 flex flex-col bg-white">

                        {/* Contact Cards - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            {contacts.map((contact) => (
                                <div 
                                    key={contact.id} 
                                    className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${
                                        selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                                    }`}
                                    onClick={() => handleContactClick(contact)}
                                >
                                    {/* Avatar Column */}
                                    <div className="mr-3">
                                        <div className="w-12 h-12 rounded-full bg-b flex items-center justify-center overflow-hidden">
                                            <div className="text-lg font-bold text-white">
                                                {contact.name.split(' ').map(word => word[0]).join('')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Info Column */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900">{contact.name}</div>
                                        <div className="text-sm text-gray-500 truncate">
                                            {messages[contact.id]?.[messages[contact.id].length - 1]?.text || contact.lastMessage}
                                        </div>
                                    </div>
                                    
                                    {/* Time and Star Column */}
                                    <div className="flex flex-col items-end ml-2">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {messages[contact.id]?.[messages[contact.id].length - 1]?.time || contact.time}
                                        </div>
                                        {contact.isStarred && (
                                            <Star size={16} className="text-yellow-500" fill="currentColor" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Messaging Section (70% width) */}
                    <div className="w-7/10 flex border rounded-xl m-3 flex-col bg-white">
                        {selectedContact ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
                                    <div className="font-semibold text-lg text-gray-900">{selectedContact.name}</div>
                                    <div className="flex items-center space-x-4">
                                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                            <Phone size={20} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                            <Video size={20} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                    {messages[selectedContact.id]?.map((message) => (
                                        <div 
                                            key={message.id} 
                                            className={`mb-4 max-w-3/4 ${message.isMe ? 'ml-auto' : ''}`}
                                        >
                                            <div 
                                                className={`p-3 rounded-lg ${message.isMe 
                                                    ? 'bg-b text-white rounded-br-none' 
                                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}
                                            >
                                                {message.text}
                                            </div>
                                            <div 
                                                className={`text-xs mt-1 ${message.isMe 
                                                    ? 'text-right text-gray-500' 
                                                    : 'text-gray-500'}`}
                                            >
                                                {message.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Message Input */}
                                <div className="p-3 flex items-center border-t border-gray-200">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                sendMessage(selectedContact.id);
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                                    />
                                    <button className="ml-2 text-gray-600 hover:text-gray-900 transition-colors">
                                        <Mic size={20} />
                                    </button>
                                    <button 
                                        onClick={() => sendMessage(selectedContact.id)}
                                        className="ml-2 bg-b text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h3 className="text-xl font-medium mb-2">Select a contact to start chatting</h3>
                                    <p className="text-sm">Choose from your contacts list to begin a conversation</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 