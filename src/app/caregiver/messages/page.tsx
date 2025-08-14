'use client';

/**
 * CAREGIVER MESSAGES PAGE
 * 
 * IMPORTANT: Set your caregiver ID in localStorage for messaging to work:
 * localStorage.setItem('caregiver_id', 'your_actual_caregiver_id')
 * 
 * The system will automatically:
 * - Load your user ID from localStorage
 * - Filter messages where you are the receiver
 * - Send messages with your ID as sender
 * - Create contacts for clinicians who message you
 */

import React, { useState, useEffect, useRef } from 'react';
import CaregiverSidebar from '../sidebar';
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
    lastMessageTime?: number; // For sorting by recent activity
}

interface Clinician {
    user_id: string;
    specialty: string;
    profile_image: string | null;
    is_subscribed: boolean;
    prefix: string;
    first_name: string;
    last_name: string;
    country: string;
    city: string;
    state: string;
    zip_code: string;
    clinician_type: string;
    license_number: string;
    area_of_expertise: string;
}

export default function MessagesPage() {
    // State for active tab in contacts
    const [activeTab, setActiveTab] = useState('all');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
    const [isLoading, setIsLoading] = useState(false);
    
    // New state for Create Message functionality
    const [isCreateMessageMode, setIsCreateMessageMode] = useState(false);
    const [clinicians, setClinicians] = useState<Clinician[]>([]);
    const [filteredClinicians, setFilteredClinicians] = useState<Clinician[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingClinicians, setIsLoadingClinicians] = useState(false);
    const [showClinicianDropdown, setShowClinicianDropdown] = useState(false);
    
    // State for contacts management
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    
    // Refs for PubNub service and current channel
    const pubnubService = useRef<PubNubService | null>(null);
    const currentChannel = useRef<string | null>(null);
    
    // Helper function to get current user ID from localStorage
    const getCurrentUserId = (): string => {
        try {
            // Try to get from different possible localStorage keys
            const userInfo = localStorage.getItem('user_info');
            const userId = JSON.parse(userInfo || '{}').user_id;
            const userName = JSON.parse(userInfo || '{}').name;            
            console.log('userName',userInfo);
            console.log('userId',userId);
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
            localStorage.setItem('caregiver_contacts', JSON.stringify(contactsList));
        } catch (error) {
            console.warn('Failed to save contacts to localStorage:', error);
        }
    };

    // Function to load contacts from localStorage
    const loadContactsFromStorage = (): Contact[] => {
        try {
            const stored = localStorage.getItem('caregiver_contacts');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load contacts from localStorage:', error);
        }
        return [];
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
                    (msg.senderId === contact.id.toString() && msg.receiverId === currentUserId.toString()) || // Other user to caregiver
                    (msg.senderId === currentUserId.toString() && msg.receiverId === contact.id.toString())    // Caregiver to other user
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

    // Function to refresh contacts list
    const refreshContactsList = async () => {
        if (pubnubService.current) {
            await loadExistingMessagesAndContacts();
        }
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
        const { senderId, receiverId, text, timestamp } = pubnubMessage;
        
        // Only process messages where this caregiver is the receiver
        const currentCaregiverId = getCurrentUserId();
        
        if (receiverId === currentCaregiverId) {
            // This message is for us
            const clinicianId = parseInt(senderId || '0');
            
            if (clinicianId > 0) { // Only proceed if we have a valid ID
                // Check if we already have this contact
                let contact = contacts.find(c => c.id === clinicianId);
            
                if (!contact) {
                    // Create new contact for this clinician
                    contact = {
                        id: clinicianId,
                        name: `Clinician ${senderId}`,
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
                    [clinicianId]: [...(prev[clinicianId] || []), newMessage]
                }));
            }
        }
    };

    // Function to fetch clinicians from API
    const fetchClinicians = async () => {
        setIsLoadingClinicians(true);
        try {
            const response = await fetch(`${env.BACKEND_URL}/clinicians/clinicians`);
            if (response.ok) {
                const data = await response.json();
                setClinicians(data);
                setFilteredClinicians(data);
            } else {
                console.error('Failed to fetch clinicians');
            }
        } catch (error) {
            console.error('Error fetching clinicians:', error);
        } finally {
            setIsLoadingClinicians(false);
        }
    };

    // Function to filter clinicians based on search query
    const filterClinicians = (query: string) => {
        if (!query.trim()) {
            setFilteredClinicians(clinicians);
            return;
        }
        
        const filtered = clinicians.filter(clinician => 
            clinician.first_name.toLowerCase().includes(query.toLowerCase()) ||
            clinician.last_name.toLowerCase().includes(query.toLowerCase()) ||
            clinician.specialty.toLowerCase().includes(query.toLowerCase()) ||
            clinician.clinician_type.toLowerCase().includes(query.toLowerCase()) ||
            clinician.city.toLowerCase().includes(query.toLowerCase()) ||
            clinician.state.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredClinicians(filtered);
    };

    // Function to handle search input changes
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        filterClinicians(query);
        setShowClinicianDropdown(true);
    };

    // Function to handle clinician selection
    const handleClinicianSelect = async (clinician: Clinician) => {
        // Create a new contact for this clinician
        const newContact: Contact = {
            id: parseInt(clinician.user_id),
            name: `${clinician.prefix} ${clinician.first_name} ${clinician.last_name}`,
            avatar: clinician.profile_image || '/avatar-default.jpg',
            lastMessage: '',
            time: 'Now',
            isStarred: false,
            lastMessageTime: Date.now()
        };
        
        // Add to contacts
        addOrUpdateContact(newContact);
        
        // Select this contact and exit create message mode
        setSelectedContact(newContact);
        setIsCreateMessageMode(false);
        setSearchQuery('');
        setShowClinicianDropdown(false);
        
        // Handle the contact click to set up messaging and load history
        await handleContactClick(newContact);
    };

    // Function to handle Create Message button click
    const handleCreateMessage = () => {
        setIsCreateMessageMode(true);
        setSelectedContact(null);
        // Fetch clinicians when entering create message mode
        if (clinicians.length === 0) {
            fetchClinicians();
        }
    };

    // Function to exit Create Message mode
    const handleExitCreateMessage = () => {
        setIsCreateMessageMode(false);
        setSearchQuery('');
        setShowClinicianDropdown(false);
    };
    
    // Initialize contacts from localStorage and PubNub service
    useEffect(() => {
        // Load contacts from localStorage
        const storedContacts = loadContactsFromStorage();
        if (storedContacts.length > 0) {
            setContacts(storedContacts);
        } else {
        }

    // Initialize PubNub service
        pubnubService.current = PubNubService.getInstance();
        
        // Set current user ID
        const userId = getCurrentUserId();
        setCurrentUserId(userId);
        console.log('Current caregiver ID:', userId);
        
        // Subscribe to global channel
        if (pubnubService.current) {
            const globalChannel = 'global_messages';
            pubnubService.current.subscribeToChannel(globalChannel, handleIncomingMessage);
            console.log('Subscribed to global channel:', globalChannel);
            
            // Load existing messages and create contacts
            loadExistingMessagesAndContacts();
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
            console.log('Loading existing messages for caregiver:', currentUserId);
            const globalChannel = 'global_messages';
            const historyMessages = await pubnubService.current.getMessageHistory(globalChannel);
            
            console.log('Found', historyMessages.length, 'total messages');
            
            // Process each message to create contacts and load conversations
            const processedContacts = new Set<number>();
            const contactMessages: { [key: number]: PubNubMessage[] } = {};
            
            for (const msg of historyMessages) {
                const { senderId, senderName, receiverId, text, timestamp } = msg;
                
                // Check if this message involves the current caregiver
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
                                // Create new contact
                                contact = {
                                    id: otherUserIdNum,
                                    name: senderName || `User ${otherUserId}`,
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

    // Periodically refresh contacts list to catch new conversations
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            if (pubnubService.current && contacts.length > 0) {
                refreshContactsList();
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(refreshInterval);
    }, [contacts.length]);

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
        const originalInput = messageInput;
        const messageText = messageInput.trim();
        
        try {
            // Clear input immediately for better UX
            setMessageInput('');
            
            const sentMessage = await pubnubService.current?.sendMessage(
                'global_messages', // Use global channel
                {
                    sender: 'Me',
                    text: messageText,
                    senderId: currentUserId.toString(), // Ensure it's a string
                    receiverId: selectedContact.id.toString(), // Ensure it's a string
                    senderName: getCurrentUserName(), // Add sender name
                    receiverName: selectedContact.name // Add receiver name
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
                        senderId: currentUserId.toString(), // Ensure it's a string
                        receiverId: sentMessage.receiverId || ''
                    };
                    
                    return {
                        ...prevMessages,
                        [selectedContact.id]: [...currentMessages, newMessage]
                    };
                });

                // Update contact's last message and time
                addOrUpdateContact(selectedContact, messageText, sentMessage.timestamp);
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
            <CaregiverSidebar />
            
            {/* Main Content */}
            <div className="ml-64 h-full flex flex-col overflow-hidden">
                {/* Messenger Header */}
                <div className="p-4 bg-white flex justify-between items-center  border-gray-200">
                    <h2 className="text-3xl font-semibold text-b">Messages</h2>
                    <div className="flex items-center space-x-4 ">
                        <button 
                            onClick={handleCreateMessage}
                            className='bg-a p-3 rounded-xl px-5'
                        >
                            +  Create Message
                        </button>
                        <button 
                            onClick={refreshContactsList}
                            className='bg-gray-200 p-3 rounded-xl px-5'
                        >
                            <RefreshCw size={20} />
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
                                            {messages[contact.id]?.[messages[contact.id].length - 1]?.text || contact.lastMessage || 'No messages yet'}
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
                    
                    {/* Messaging Section (70% width) */}
                    <div className="w-7/10 flex border rounded-xl m-3 flex-col bg-white">
                        {isCreateMessageMode ? (
                            // Create Message Mode - Show Clinician Search
                            <>
                                {/* Create Message Header */}
                                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
                                    <div className="font-semibold text-lg text-gray-900">Create New Message</div>
                                    <button 
                                        onClick={handleExitCreateMessage}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                {/* Clinician Search Area */}
                                <div className="flex-1 p-6">
                                    <div className="max-w-2xl mx-auto">
                                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                                            Search for a Clinician
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Find a clinician by name, specialty, or location to start a conversation.
                                        </p>
                                        
                                        {/* Search Input */}
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => handleSearchChange(e.target.value)}
                                                    onFocus={() => setShowClinicianDropdown(true)}
                                                    placeholder="Search by name, specialty, or location..."
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                                                />
                                            </div>
                                            
                                            {/* Clinicians Dropdown */}
                                            {showClinicianDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
                                                    {isLoadingClinicians ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            Loading clinicians...
                                                        </div>
                                                    ) : filteredClinicians.length > 0 ? (
                                                        filteredClinicians.map((clinician) => (
                                                            <div
                                                                key={clinician.user_id}
                                                                onClick={() => handleClinicianSelect(clinician)}
                                                                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <div className="flex items-center">
                                                                    {/* Avatar */}
                                                                    <div className="w-10 h-10 rounded-full bg-b flex items-center justify-center mr-3">
                                                                        <div className="text-sm font-bold text-white">
                                                                            {clinician.first_name[0]}{clinician.last_name[0]}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Clinician Info */}
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-900">
                                                                            {clinician.prefix} {clinician.first_name} {clinician.last_name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {clinician.specialty} • {clinician.clinician_type}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {clinician.city}, {clinician.state}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : searchQuery ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            No clinicians found matching "{searchQuery}"
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500">
                                                            Start typing to search for clinicians
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Instructions */}
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Search for clinicians by name, specialty, or location</li>
                                                <li>• Click on a clinician to start a conversation</li>
                                                <li>• Your new contact will be added to your contacts list</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : selectedContact ? (
                            // Normal Chat Mode
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
                                            className={`mb-4 max-w-3/4 ${message.senderId === currentUserId.toString() ? 'ml-auto' : ''}`}
                                        >
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
                            // Default State - No Contact Selected
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