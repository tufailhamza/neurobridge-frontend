'use client';

import React, { useState, useEffect, useRef } from 'react';
import ClinicianSidebar from '../sidebar';
import { Search, Filter, Star, Phone, Video, MoreHorizontal, Mic, Send, Archive } from 'lucide-react';
import PubNubService, { PubNubMessage } from '../../../services/pubnub';

interface Message {
    id: string;
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
    const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs for PubNub service and current channel
    const pubnubService = useRef<PubNubService | null>(null);
    const currentChannel = useRef<string | null>(null);
    
    // Helper function to format timestamps
    const formatTimestamp = (timestamp: number | string): string => {
        try {
            // Handle different timestamp formats
            let date: Date;
            
            if (typeof timestamp === 'string') {
                // If it's a string, try to parse it
                date = new Date(parseInt(timestamp));
            } else if (typeof timestamp === 'number') {
                // If it's a number, check if it's in seconds or milliseconds
                if (timestamp < 1000000000000) {
                    // Timestamp is in seconds, convert to milliseconds
                    date = new Date(timestamp * 1000);
                } else {
                    // Timestamp is in milliseconds
                    date = new Date(timestamp);
                }
            } else {
                // Fallback to current time
                date = new Date();
            }
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            
            return date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            console.warn('Error formatting timestamp:', error);
            return new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            }
        };

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

    // Initialize PubNub service
    useEffect(() => {
        pubnubService.current = PubNubService.getInstance();

        // Cleanup on unmount
        return () => {
            if (pubnubService.current) {
                pubnubService.current.cleanup();
            }
        };
    }, []);

    // Function to handle contact selection and subscribe to channel
    const handleContactClick = async (contact: Contact) => {
        setSelectedContact(contact);
        
        // Unsubscribe from previous channel if exists
        if (currentChannel.current && pubnubService.current) {
            pubnubService.current.unsubscribeFromChannel(currentChannel.current);
        }
        
        // Subscribe to new channel
        const channelId = pubnubService.current?.getChannelName(contact.id);
        if (channelId && pubnubService.current) {
            currentChannel.current = channelId;
            
            // Load message history first
            try {
                console.log('Loading message history for contact:', contact.id);
                const historyMessages = await pubnubService.current.getMessageHistory(channelId);
                
                if (historyMessages.length > 0) {
                    // Convert PubNub messages to our Message format
                    const formattedHistory = historyMessages.map(pubnubMsg => ({
                        id: pubnubMsg.id,
                        sender: pubnubMsg.sender,
                        text: pubnubMsg.text,
                        time: formatTimestamp(pubnubMsg.timestamp),
                        isMe: pubnubMsg.isMe
                    }));
                    
                    // Update messages state with history
                    setMessages(prev => ({
                        ...prev,
                        [contact.id]: formattedHistory
                    }));
                    
                    console.log('Loaded', formattedHistory.length, 'messages from history');
                } else {
                    console.log('No message history found for this contact');
                }
            } catch (error) {
                console.error('Error loading message history:', error);
            }
            
            // Subscribe to real-time messages
            pubnubService.current.subscribeToChannel(channelId, (pubnubMessage: PubNubMessage) => {
                // Convert PubNub message to our Message format
                const newMessage: Message = {
                    id: pubnubMessage.id,
                    sender: pubnubMessage.sender,
                    text: pubnubMessage.text,
                    time: formatTimestamp(pubnubMessage.timestamp),
                    isMe: pubnubMessage.isMe
                };
                
                // Check if message already exists to prevent duplicates
                setMessages(prev => {
                    const existingMessages = prev[contact.id] || [];
                    const messageExists = existingMessages.some(msg => msg.id === newMessage.id);
                    
                    if (messageExists) {
                        return prev; // Don't add duplicate
                    }
                    
                    return {
                        ...prev,
                        [contact.id]: [...existingMessages, newMessage]
                    };
                });
            });
        }
    };

    // Function to send a message
    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedContact) return;

        setIsLoading(true);
        const originalInput = messageInput;
        const messageText = messageInput.trim();
        
        try {
            // Clear input immediately for better UX
            setMessageInput('');
            
            const sentMessage = await pubnubService.current?.sendMessage(
                pubnubService.current.getChannelName(selectedContact.id),
                {
                    sender: 'Me',
                    text: messageText,
                    isMe: true,
                }
            );

            if (sentMessage) {
                setMessages(prevMessages => {
                    const currentMessages = prevMessages[selectedContact.id] || [];
                    const messageExists = currentMessages.some(msg => msg.id === sentMessage.id);
                    if (messageExists) {
                        return prevMessages; // Don't add duplicate
                    }
                    
                    // Convert PubNub message to Message format
                    const newMessage: Message = {
                        id: sentMessage.id,
                        sender: sentMessage.sender,
                        text: sentMessage.text,
                        time: formatTimestamp(sentMessage.timestamp),
                        isMe: true
                    };
                    
                    return {
                        ...prevMessages,
                        [selectedContact.id]: [...currentMessages, newMessage]
                    };
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore input if sending fails
            setMessageInput(originalInput);
        } finally {
            setIsLoading(false);
        }
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
                                        selectedContact?.id === contact.id ? 'bg-gray-100 border-l-4 border-l-b' : ''
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
                                <div className="p-3 flex items-center border-t border-gray-200 text-b">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !isLoading) {
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 focus:outline-none focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                    <button className="ml-2 text-gray-600 hover:text-gray-900 transition-colors">
                                        <Mic size={20} />
                                    </button>
                                    <button 
                                        onClick={sendMessage}
                                        disabled={isLoading}
                                        className="ml-2 bg-b text-white p-3 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50"
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