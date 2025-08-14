'use client';

/**
 * CLINICIAN MESSAGES PAGE
 * 
 * IMPORTANT: Set your clinician ID in localStorage for messaging to work:
 * localStorage.setItem('clinician_id', 'your_actual_clinician_id')
 * 
 * The system will automatically:
 * - Load your user ID from localStorage
 * - Filter messages where you are the receiver
 * - Send messages with your ID as sender
 * - Create contacts for caregivers who message you
 */

import React, { useState, useEffect, useRef } from 'react';
import ClinicianSidebar from '../sidebar';
import { Search, Filter, Star, Phone, Video, MoreHorizontal, Mic, Send, Archive, X, RefreshCw } from 'lucide-react';
import PubNubService, { PubNubMessage } from '../../../services/pubnub';
import { env } from '../../../config/env';

interface Message {
    id: string;
    sender: string;
    text: string;
    time: string;
    senderId: string;
    receiverId: string;
}

interface Contact {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    isStarred: boolean;
    lastMessageTime?: number;
}

export default function MessagesPage() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    
    // Refs for PubNub service
    const pubnubService = useRef<PubNubService | null>(null);
    
    // Helper function to get current user ID from localStorage
    const getCurrentUserId = (): string => {
        try {
            const userInfo = localStorage.getItem('user_info');
            const userId = JSON.parse(userInfo || '{}').user_id;
            return userId;
        } catch (error) {
            console.warn('Failed to get user ID from localStorage:', error);
            return '1'; // fallback
        }
    };

    // Helper function to get current user name from localStorage
    const getCurrentUserName = (): string => {
        try {
            const userInfo = localStorage.getItem('user_info');
            const userName = JSON.parse(userInfo || '{}').name;
            return userName || 'Unknown User';
        } catch (error) {
            console.warn('Failed to get user name from localStorage:', error);
            return 'Unknown User';
        }
    };

    // Helper function to format timestamps
    const formatTimestamp = (timestamp: number | string): string => {
        try {
            let date: Date;
            
            if (typeof timestamp === 'string') {
                date = new Date(parseInt(timestamp));
            } else if (typeof timestamp === 'number') {
                if (timestamp < 1000000000000) {
                    date = new Date(timestamp * 1000);
                } else {
                    date = new Date(timestamp);
                }
            } else {
                date = new Date();
            }
            
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

    // Helper function to format relative time
    const formatRelativeTime = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    };

    // Function to save contacts to localStorage
    const saveContactsToStorage = (contactsList: Contact[]) => {
        try {
            localStorage.setItem('clinician_contacts', JSON.stringify(contactsList));
        } catch (error) {
            console.warn('Failed to save contacts to localStorage:', error);
        }
    };

    // Function to load contacts from localStorage
    const loadContactsFromStorage = (): Contact[] => {
        try {
            const stored = localStorage.getItem('clinician_contacts');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load contacts from localStorage:', error);
        }
        return [];
    };

    // Function to add or update a contact
    const addOrUpdateContact = (contact: Contact, lastMessage?: string, lastMessageTime?: number) => {
        setContacts(prevContacts => {
            const existingIndex = prevContacts.findIndex(c => c.id === contact.id);
            let updatedContact: Contact;

            if (existingIndex >= 0) {
                updatedContact = {
                    ...prevContacts[existingIndex],
                    lastMessage: lastMessage || prevContacts[existingIndex].lastMessage,
                    lastMessageTime: lastMessageTime || prevContacts[existingIndex].lastMessageTime || Date.now()
                };
                
                const newContacts = [...prevContacts];
                newContacts[existingIndex] = updatedContact;
                
                newContacts.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
                
                saveContactsToStorage(newContacts);
                return newContacts;
            } else {
                const newContact: Contact = {
                    ...contact,
                    lastMessage: lastMessage || '',
                    lastMessageTime: lastMessageTime || Date.now()
                };
                
                const newContacts = [newContact, ...prevContacts];
                saveContactsToStorage(newContacts);
                return newContacts;
            }
        });
    };

    // Function to handle incoming message from global channel
    const handleIncomingMessage = (pubnubMessage: PubNubMessage) => {
        // Extract sender and receiver IDs from the message
        const { senderId, senderName, receiverId, text, timestamp } = pubnubMessage;
        
        // Only process messages where this clinician is the receiver
        // Assuming clinician ID is stored somewhere (you'll need to set this)
        const currentClinicianId = getCurrentUserId();
        
        if (receiverId === currentClinicianId) {
            // This message is for us
            const caregiverId = parseInt(senderId || '0');
            
            if (caregiverId > 0) { // Only proceed if we have a valid ID
                // Check if we already have this contact
                let contact = contacts.find(c => c.id === caregiverId);
                
                if (!contact) {
                    // Create new contact for this caregiver using senderName from message
                    const sendername = senderName || `Caregiver ${senderId}`;
                    contact = {
                        id: caregiverId,
                        name: sendername,
                        avatar: '/avatar-default.jpg',
                        lastMessage: text,
                        time: 'Now',
                        isStarred: false,
                        lastMessageTime: timestamp
                    };
                    
                    addOrUpdateContact(contact);
                } else {
                    // Update existing contact
                    addOrUpdateContact(contact, text, timestamp);
                }
                
                // Add message to messages state
                const newMessage: Message = {
                    id: pubnubMessage.id,
                    sender: pubnubMessage.sender,
                    text: pubnubMessage.text,
                    time: formatTimestamp(pubnubMessage.timestamp),
                    senderId: senderId || '',
                    receiverId: receiverId || ''
                };
                
                setMessages(prev => ({
                    ...prev,
                    [caregiverId]: [...(prev[caregiverId] || []), newMessage]
                }));
            }
        }
    };

    // Initialize PubNub service and subscribe to global channel
    useEffect(() => {
        // Load contacts from localStorage
        const storedContacts = loadContactsFromStorage();
        if (storedContacts.length > 0) {
            setContacts(storedContacts);
        }

        // Set current user ID
        const userId = getCurrentUserId();
        setCurrentUserId(userId);
        console.log('Current clinician ID:', userId);

        // Initialize PubNub service
        pubnubService.current = PubNubService.getInstance();
        
        // Subscribe to global channel
        if (pubnubService.current) {
            const globalChannel = 'global_messages';
            pubnubService.current.subscribeToChannel(globalChannel, handleIncomingMessage);
            console.log('Subscribed to global channel:', globalChannel);
        }

        // Cleanup on unmount
        return () => {
            if (pubnubService.current) {
                pubnubService.current.cleanup();
            }
        };
    }, []);

    // Load existing messages when currentUserId is set
    useEffect(() => {
        if (currentUserId && pubnubService.current) {
            loadExistingMessagesAndContacts();
        }
    }, [currentUserId]);

    // Function to load existing messages and create contacts
    const loadExistingMessagesAndContacts = async () => {
        if (!pubnubService.current || !currentUserId) return;
        
        try {
            console.log('Loading existing messages for clinician:', currentUserId);
            const globalChannel = 'global_messages';
            const historyMessages = await pubnubService.current.getMessageHistory(globalChannel);
            
            console.log('Found', historyMessages.length, 'total messages');
            
            // Process each message to create contacts and load conversations
            const processedContacts = new Set<number>();
            const contactMessages: { [key: number]: PubNubMessage[] } = {};
            
            for (const msg of historyMessages) {
                const { senderId, senderName, receiverId, text, timestamp } = msg;
                
                // Check if this message involves the current clinician
                if ((senderId?.toString() === currentUserId?.toString()) || (receiverId?.toString() === currentUserId?.toString())) {
                    const otherUserId = senderId?.toString() === currentUserId?.toString() ? receiverId : senderId;
                    const otherUserIdNum = parseInt(otherUserId || '0');
                    
                    if (otherUserIdNum > 0) {
                        // Add message to this contact's conversation
                        if (!contactMessages[otherUserIdNum]) {
                            contactMessages[otherUserIdNum] = [];
                        }
                        contactMessages[otherUserIdNum].push(msg);
                        
                        if (!processedContacts.has(otherUserIdNum)) {
                            processedContacts.add(otherUserIdNum);
                            
                            // Create or update contact
                            let contact = contacts.find(c => c.id === otherUserIdNum);
                            
                            if (!contact) {
                                // Create new contact using senderName from message if available
                                console.log('senderName',senderName);
                                const sendername = senderName || `User ${otherUserId}`;
                                contact = {
                                    id: otherUserIdNum,
                                    name: sendername,
                                    avatar: '/avatar-default.jpg',
                                    lastMessage: text,
                                    time: 'Now',
                                    isStarred: false,
                                    lastMessageTime: timestamp
                                };
                                
                                addOrUpdateContact(contact);
                                console.log('Created new contact for user:', otherUserId);
                            }
                        }
                    }
                }
            }
            
            // Load conversations for all contacts
            for (const [contactId, messages] of Object.entries(contactMessages)) {
                const contact = contacts.find(c => c.id === parseInt(contactId));
                if (contact) {
                    await loadConversationForContact(contact, messages);
                }
            }
            
            console.log('Processed', processedContacts.size, 'contacts from existing messages');
        } catch (error) {
            console.error('Error loading existing messages:', error);
        }
    };

    // Function to load conversation for a specific contact
    const loadConversationForContact = async (contact: Contact, messages?: PubNubMessage[]) => {
        if (!pubnubService.current || !currentUserId) return;
        
        try {
            let conversationMessages: PubNubMessage[];
            
            if (messages) {
                // Use provided messages (for loading from history)
                conversationMessages = messages;
            } else {
                // Load messages from PubNub
                const globalChannel = 'global_messages';
                const historyMessages = await pubnubService.current.getMessageHistory(globalChannel);
                
                // Filter messages for this specific conversation
                conversationMessages = historyMessages.filter(msg => 
                    (msg.senderId === contact.id.toString() && msg.receiverId === currentUserId.toString()) || // Other user to clinician
                    (msg.senderId === currentUserId.toString() && msg.receiverId === contact.id.toString())    // Clinician to other user
                );
            }
            
            if (conversationMessages.length > 0) {
                // Sort messages by timestamp
                conversationMessages.sort((a, b) => a.timestamp - b.timestamp);
                
                const formattedHistory = conversationMessages.map(pubnubMsg => ({
                    id: pubnubMsg.id,
                    sender: pubnubMsg.sender,
                    text: pubnubMsg.text,
                    time: formatTimestamp(pubnubMsg.timestamp),
                    senderId: pubnubMsg.senderId || '',
                    receiverId: pubnubMsg.receiverId || ''
                }));
                
                setMessages(prev => ({
                    ...prev,
                    [contact.id]: formattedHistory
                }));
                
                // Update contact's last message
                const lastMessage = conversationMessages[conversationMessages.length - 1];
                if (lastMessage) {
                    addOrUpdateContact(contact, lastMessage.text, lastMessage.timestamp);
                }
                
                console.log('Loaded', formattedHistory.length, 'messages for contact:', contact.id);
            }
        } catch (error) {
            console.error('Error loading conversation for contact:', error);
        }
    };

    // Function to handle contact selection
    const handleContactClick = async (contact: Contact) => {
        setSelectedContact(contact);
        
        // Load conversation for this contact if not already loaded
        if (!messages[contact.id] || messages[contact.id].length === 0) {
            await loadConversationForContact(contact);
        }
    };

    // Function to send a message
    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedContact) return;

        setIsLoading(true);
        const messageText = messageInput.trim();
        
        try {
            setMessageInput('');
            
            if (pubnubService.current) {
                const globalChannel = 'global_messages';
                const sentMessage = await pubnubService.current.sendMessage(globalChannel, {
                    sender: 'Me',
                    text: messageText,
                    senderId: currentUserId.toString(), // Ensure it's a string
                    receiverId: selectedContact.id.toString(), // Ensure it's a string
                    senderName: getCurrentUserName() // Add sender name
                });

                if (sentMessage) {
                    const newMessage: Message = {
                        id: sentMessage.id,
                        sender: sentMessage.sender,
                        text: sentMessage.text,
                        time: formatTimestamp(sentMessage.timestamp),
                        senderId: currentUserId.toString(), // Ensure it's a string
                        receiverId: selectedContact.id.toString() // Ensure it's a string
                    };
                    
                    setMessages(prev => ({
                        ...prev,
                        [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
                    }));

                    addOrUpdateContact(selectedContact, messageText, sentMessage.timestamp);
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-d">
            <ClinicianSidebar />
            
            <div className="ml-64 h-full flex flex-col overflow-hidden">
                <div className="p-4 bg-white flex justify-between items-center border-gray-200">
                    <h2 className="text-3xl font-semibold text-b">Messages</h2>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={loadExistingMessagesAndContacts}
                            className='bg-gray-200 p-3 rounded-xl px-5 hover:bg-gray-300 transition-colors'
                        >
                            <RefreshCw size={20} />
                            Refresh Messages
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Contacts Section */}
                    <div className="w-3/10 flex flex-col bg-white">
                        <div className="flex-1 overflow-y-auto">
                            {contacts.map((contact) => (
                                <div 
                                    key={contact.id} 
                                    className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center transition-colors ${
                                        selectedContact?.id === contact.id ? 'bg-gray-100 border-l-4 border-l-b' : ''
                                    }`}
                                    onClick={() => handleContactClick(contact)}
                                >
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
                                            {contact.lastMessage || 'No messages yet'}
                                        </div>
                                    </div>
                                    
                                    {/* Time and Star Column */}
                                    <div className="flex flex-col items-end ml-2">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {contact.lastMessageTime ? formatRelativeTime(contact.lastMessageTime) : contact.time}
                                        </div>
                                        {messages[contact.id] && messages[contact.id].length > 0 && (
                                            <div className="text-xs text-gray-400">
                                                {messages[contact.id].length} message{messages[contact.id].length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Messaging Section */}
                    <div className="w-7/10 flex border rounded-xl m-3 flex-col bg-white">
                        {selectedContact ? (
                            <>
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
                                
                                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                    {messages[selectedContact.id]?.map((message) => (
                                        <div 
                                            key={message.id} 
                                            className={`mb-4 max-w-3/4 ${message.senderId === currentUserId.toString() ? 'ml-auto' : 'mr-auto'}`}
                                        >
                                            {/* Sender name for received messages */}
                                            {message.senderId !== currentUserId.toString() && (
                                                <div className="text-xs text-gray-500 mb-1 ml-1">
                                                    {message.sender}
                                                </div>
                                            )}
                                            
                                            <div 
                                                className={`p-3 rounded-lg ${message.senderId === currentUserId.toString() 
                                                    ? 'bg-b text-white rounded-br-none' 
                                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}
                                            >
                                                {message.text}
                                            </div>
                                            <div 
                                                className={`text-xs mt-1 ${message.senderId === currentUserId.toString() 
                                                    ? 'text-right text-gray-500' 
                                                    : 'text-left text-gray-500'}`}
                                            >
                                                {message.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
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