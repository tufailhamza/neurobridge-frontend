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
import { Search, Filter, Star, Send, Archive, X, MoreVertical } from 'lucide-react';
import PubNubService, { PubNubMessage } from '../../../services/pubnub';
import { env } from '../../../config/env';
import { useSearchParams } from 'next/navigation';

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
    unreadCount?: number; // Number of unread messages
}

export default function MessagesPage() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    
    // Create Message functionality states
    const [isCreateMessageMode, setIsCreateMessageMode] = useState(false);
    const [clinicians, setClinicians] = useState<any[]>([]);
    const [filteredClinicians, setFilteredClinicians] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showClinicianDropdown, setShowClinicianDropdown] = useState(false);
    const [isLoadingClinicians, setIsLoadingClinicians] = useState(false);
    
    // URL parameters for auto-opening conversations
    const searchParams = useSearchParams();
    const clinicianIdFromUrl = searchParams.get('clinician');
    
    // Refs for PubNub service
    const pubnubService = useRef<PubNubService | null>(null);
    
    // Helper function to get current user ID from localStorage
    const getCurrentUserId = (): string => {
        try {
            const userInfo = localStorage.getItem('user_info');
            const userId = JSON.parse(userInfo || '{}').user_id;
            return String(userId); // Ensure it's always a string
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
    const addOrUpdateContact = (contact: Contact, lastMessage?: string, lastMessageTime?: number, isUnread: boolean = false) => {
        setContacts(prevContacts => {
            const existingIndex = prevContacts.findIndex(c => c.id === contact.id);
            let updatedContact: Contact;

            if (existingIndex >= 0) {
                const currentContact = prevContacts[existingIndex];
                const currentUnreadCount = currentContact.unreadCount || 0;
                
                updatedContact = {
                    ...currentContact,
                    lastMessage: lastMessage || currentContact.lastMessage,
                    lastMessageTime: lastMessageTime || currentContact.lastMessageTime || Date.now(),
                    unreadCount: isUnread && selectedContact?.id !== contact.id 
                        ? currentUnreadCount + 1 
                        : currentUnreadCount
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
                    lastMessageTime: lastMessageTime || Date.now(),
                    unreadCount: isUnread ? 1 : 0
                };
                
                const newContacts = [newContact, ...prevContacts];
                saveContactsToStorage(newContacts);
                return newContacts;
            }
        });
    };

    // Function to handle incoming message from global channel
    const handleIncomingMessage = (pubnubMessage: PubNubMessage) => {
        console.log('📨 Received message from PubNub:', pubnubMessage);
        
        // Extract sender and receiver IDs from the message and ensure they are strings
        const senderId = String(pubnubMessage.senderId || '');
        const receiverId = String(pubnubMessage.receiverId || '');
        const { senderName, text, timestamp } = pubnubMessage;
        
        // Only process messages where this clinician is the receiver
        const currentClinicianId = String(getCurrentUserId()); // Ensure it's a string
        
        console.log('🔍 Processing message - Sender:', senderId, 'Receiver:', receiverId, 'Current User:', currentClinicianId);
        console.log('🔍 Type check - senderId type:', typeof senderId, 'receiverId type:', typeof receiverId, 'currentClinicianId type:', typeof currentClinicianId);
        console.log('🔍 Raw values - senderId:', senderId, 'receiverId:', receiverId, 'currentClinicianId:', currentClinicianId);
        console.log('🔍 String conversion - String(senderId):', String(senderId), 'String(receiverId):', String(receiverId), 'String(currentClinicianId):', String(currentClinicianId));
        console.log('🔍 Comparison check - receiverId === currentClinicianId:', receiverId === currentClinicianId);
        console.log('🔍 String comparison - String(receiverId) === String(currentClinicianId):', String(receiverId) === String(currentClinicianId));
        console.log('🔍 Length check - receiverId.length:', String(receiverId).length, 'currentClinicianId.length:', String(currentClinicianId).length);
        console.log('🔍 Character by character check:');
        const receiverStr = String(receiverId);
        const currentStr = String(currentClinicianId);
        for (let i = 0; i < Math.max(receiverStr.length, currentStr.length); i++) {
            console.log(`  Position ${i}: receiverId[${i}] = "${receiverStr[i]}" (${receiverStr.charCodeAt(i)}), currentClinicianId[${i}] = "${currentStr[i]}" (${currentStr.charCodeAt(i)})`);
        }
        
        // Skip if this is our own message (we already handled it in sendMessage)
        if (senderId === currentClinicianId) {
            console.log('⏭️ Skipping own message');
            return;
        }
        
        if (receiverStr === currentStr) {
            console.log('✅ This message is for us!');
            // This message is for us
            const caregiverId = parseInt(senderId || '0');
            const isUnread = selectedContact?.id !== caregiverId; // Mark as unread if not current contact
            
            if (caregiverId > 0) { // Only proceed if we have a valid ID
                console.log('👥 Processing message from caregiver:', caregiverId);
                
                // Check if we already have this contact
                let contact = contacts.find(c => c.id === caregiverId);
                
                if (!contact) {
                    console.log('🆕 Creating new contact for caregiver:', caregiverId);
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
                    
                    addOrUpdateContact(contact, text, timestamp, isUnread);
                } else {
                    console.log('📝 Updating existing contact for caregiver:', caregiverId);
                    // Update existing contact
                    addOrUpdateContact(contact, text, timestamp, isUnread);
                }
                
                // Add message to messages state immediately
                const newMessage: Message = {
                    id: pubnubMessage.id,
                    sender: pubnubMessage.sender || senderName || `Caregiver ${senderId}`,
                    text: pubnubMessage.text,
                    time: formatTimestamp(pubnubMessage.timestamp),
                    senderId: senderId, // Already a string
                    receiverId: receiverId // Already a string
                };
                
                console.log('💬 Adding received message to UI:', newMessage);
                
                setMessages(prev => {
                    const currentMessages = prev[caregiverId] || [];
                    // Check if message already exists to avoid duplicates
                    const messageExists = currentMessages.some(msg => msg.id === pubnubMessage.id);
                    if (messageExists) {
                        console.log('⚠️ Message already exists, skipping duplicate');
                        return prev;
                    }
                    
                    const updatedMessages = [...currentMessages, newMessage];
                    console.log('📱 Updated messages for caregiver', caregiverId, ':', updatedMessages.length, 'messages');
                    
                    return {
                    ...prev,
                        [caregiverId]: updatedMessages
                    };
                });
            }
        } else {
            console.log('❌ Message not for us, ignoring');
            console.log('❌ Debug - receiverId:', receiverId, 'currentClinicianId:', currentClinicianId, 'types:', typeof receiverId, typeof currentClinicianId);
            console.log('❌ Final comparison failed - String(receiverId):', String(receiverId), 'String(currentClinicianId):', String(currentClinicianId));
        }
    };

    // Initialize PubNub service and subscribe to global channel
    useEffect(() => {
        console.log('Initializing clinician messages page...');
        console.log('URL parameter clinicianIdFromUrl:', clinicianIdFromUrl);
        
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

        // Auto-open conversation if clinician ID is in URL
        if (clinicianIdFromUrl) {
            console.log('Found clinician ID in URL, will auto-open conversation');
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

        // Auto-open conversation if caregiver ID is in URL (fallback for empty contacts)
        if (clinicianIdFromUrl && currentUserId && pubnubService.current && contacts.length === 0) {
            console.log('Auto-opening conversation with empty contacts...');
            autoOpenConversation(clinicianIdFromUrl);
        }
    }, [currentUserId]);

    // Handle URL parameter changes
    useEffect(() => {
        if (clinicianIdFromUrl && currentUserId && pubnubService.current && contacts.length > 0) {
            console.log('URL parameter detected, auto-opening conversation...');
            autoOpenConversation(clinicianIdFromUrl);
        }
    }, [clinicianIdFromUrl, currentUserId, contacts.length]);

    // Remove periodic refresh - rely on real-time PubNub messaging
    // The system will now work purely through real-time message delivery

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
        
        // Clear unread count for this contact
        setContacts(prevContacts => {
            const updatedContacts = prevContacts.map(c => 
                c.id === contact.id ? { ...c, unreadCount: 0 } : c
            );
            saveContactsToStorage(updatedContacts);
            return updatedContacts;
        });
        
        // Load conversation for this contact if not already loaded
        if (!messages[contact.id] || messages[contact.id].length === 0) {
            await loadConversationForContact(contact);
        }
    };

    // Function to auto-open conversation with clinician from URL
    const autoOpenConversation = async (clinicianId: string) => {
        try {
            console.log('Attempting to auto-open conversation with clinician:', clinicianId);
            
            // Fetch the specific clinician by user_id from the new backend route
            const response = await fetch(`${env.BACKEND_URL}/clinicians/clinicians/${clinicianId}`);
            
            if (response.ok) {
                const clinician = await response.json();
                console.log('Found clinician:', clinician);
                
                // Use the existing handleClinicianSelect function
                await handleClinicianSelect(clinician);
                
                console.log('Auto-opened conversation with clinician:', clinicianId);
            } else if (response.status === 404) {
                console.error('Clinician not found:', clinicianId);
            } else {
                console.error('Failed to fetch clinician:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error auto-opening conversation:', error);
        }
    };

    // Monitor messages state changes for debugging
    useEffect(() => {
        console.log('🔄 Messages state updated:', messages);
        if (selectedContact) {
            console.log('📱 Current contact messages:', messages[selectedContact.id]?.length || 0, 'messages');
        }
    }, [messages, selectedContact]);

    // Function to send a message
    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedContact) return;

        setIsLoading(true);
        const originalInput = messageInput;
        const messageText = messageInput.trim();
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('🚀 Starting to send message:', messageText);
        console.log('📝 Temp ID:', tempId);
        console.log('👤 Selected contact:', selectedContact.id);
        
        // Ensure all IDs are strings
        const senderIdStr = String(currentUserId);
        const receiverIdStr = String(selectedContact.id);
        
        console.log('🔍 ID Type Check - currentUserId type:', typeof currentUserId, 'value:', currentUserId);
        console.log('🔍 ID Type Check - selectedContact.id type:', typeof selectedContact.id, 'value:', selectedContact.id);
        console.log('🔍 ID Type Check - senderIdStr type:', typeof senderIdStr, 'value:', senderIdStr);
        console.log('🔍 ID Type Check - receiverIdStr type:', typeof receiverIdStr, 'value:', receiverIdStr);
        
        try {
            // Clear input immediately for better UX
            setMessageInput('');
            
            // Create the message object immediately for instant display
            const tempMessage: Message = {
                id: tempId,
                sender: 'Me',
                text: messageText,
                time: formatTimestamp(Date.now()),
                senderId: senderIdStr,
                receiverId: receiverIdStr
            };
            
            console.log('📤 Adding temp message to UI:', tempMessage);
            
            // Add message to UI immediately
            setMessages(prevMessages => {
                const currentMessages = prevMessages[selectedContact.id] || [];
                const newMessages = [...currentMessages, tempMessage];
                console.log('📱 Updated messages for contact', selectedContact.id, ':', newMessages.length, 'messages');
                return {
                    ...prevMessages,
                    [selectedContact.id]: newMessages
                };
            });
            
            console.log('📡 Sending message to PubNub...');
            
            if (pubnubService.current) {
                const globalChannel = 'global_messages';
                const sentMessage = await pubnubService.current.sendMessage(globalChannel, {
                    sender: 'Me',
                    text: messageText,
                    senderId: senderIdStr, // Use string version
                    receiverId: receiverIdStr, // Use string version
                    senderName: getCurrentUserName() // Add sender name
                });

                console.log('✅ Message sent successfully:', sentMessage);

                if (sentMessage) {
                    console.log('🔄 Replacing temp message with real message...');
                    // Replace temp message with real message
                    setMessages(prevMessages => {
                        const currentMessages = prevMessages[selectedContact.id] || [];
                        const updatedMessages = currentMessages.map(msg => 
                            msg.id === tempId
                                ? {
                        id: sentMessage.id,
                        sender: sentMessage.sender,
                        text: sentMessage.text,
                        time: formatTimestamp(sentMessage.timestamp),
                                    senderId: senderIdStr, // Use string version
                                    receiverId: String(sentMessage.receiverId || receiverIdStr) // Ensure string
                                }
                                : msg
                        );
                        
                        console.log('✅ Messages updated for contact', selectedContact.id, ':', updatedMessages.length, 'messages');
                        
                        return {
                            ...prevMessages,
                            [selectedContact.id]: updatedMessages
                        };
                    });

                    addOrUpdateContact(selectedContact, messageText, sentMessage.timestamp);
                }
            }
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            // Restore input if sending fails
            setMessageInput(originalInput);
            // Remove the temp message if sending failed
            setMessages(prevMessages => {
                const currentMessages = prevMessages[selectedContact.id] || [];
                const filteredMessages = currentMessages.filter(msg => msg.id !== tempId);
                console.log('🗑️ Removed temp message due to error');
                return {
                    ...prevMessages,
                    [selectedContact.id]: filteredMessages
                };
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to fetch clinicians from API
    const fetchClinicians = async () => {
        setIsLoadingClinicians(true);
        try {
            const response = await fetch(`${env.BACKEND_URL}/clinicians/clinicians`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched clinicians from API:', data.map((c: any) => ({ id: c.user_id, name: `${c.first_name} ${c.last_name}` })));
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
        
        const filtered = clinicians.filter((clinician: any) => 
            clinician.first_name.toLowerCase().includes(query.toLowerCase()) ||
            clinician.last_name.toLowerCase().includes(query.toLowerCase()) ||
            clinician.specialty?.toLowerCase().includes(query.toLowerCase()) ||
            clinician.clinician_type?.toLowerCase().includes(query.toLowerCase()) ||
            clinician.city?.toLowerCase().includes(query.toLowerCase()) ||
            clinician.state?.toLowerCase().includes(query.toLowerCase())
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
    const handleClinicianSelect = async (clinician: any) => {
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

    return (
        <div className="h-screen bg-d">
            <ClinicianSidebar />
            
            <div className="ml-64 h-full flex flex-col overflow-hidden">
                <div className="pt-4 pr-4 pb-6 bg-white flex justify-between items-center">
                    <h2 className="text-4xl font-black text-b">Messages</h2>
                    <div className="flex items-center space-x-4">
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
                                        <div className={`font-medium ${contact.unreadCount && contact.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
                                            {contact.name}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                            {contact.lastMessage || 'No messages yet'}
                                        </div>
                                    </div>
                                    
                                    {/* Time and Unread Column */}
                                    <div className="flex flex-col items-end ml-2">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {contact.lastMessageTime ? formatRelativeTime(contact.lastMessageTime) : contact.time}
                                        </div>
                                        {contact.unreadCount && contact.unreadCount > 0 ? (
                                            <div className="w-3 h-3 bg-a rounded-full"></div>
                                        ) : (
                                            <div className="w-3 h-3"></div>
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
                                <div className="px-6 py-4 flex justify-between items-center border-b-2 border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-b flex items-center justify-center overflow-hidden mr-3">
                                            <div className="text-sm font-bold text-white">
                                                {selectedContact.name.split(' ').map(word => word[0]).join('')}
                                            </div>
                                        </div>
                                    <div className="font-semibold text-lg text-gray-900">{selectedContact.name}</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 bg-white" key={`messages-${selectedContact.id}-${messages[selectedContact.id]?.length || 0}`}>
                                    {(() => {
                                        console.log('🎨 Rendering messages for contact:', selectedContact.id, 'Messages:', messages[selectedContact.id]?.length || 0);
                                        return null;
                                    })()}
                                    {messages[selectedContact.id]?.map((message) => {
                                        console.log('🎨 Rendering message:', message);
                                        return (
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
                                                        ? 'bg-white text-gray-800 rounded-br-none shadow-sm' 
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
                                        );
                                    })}
                                    {(!messages[selectedContact.id] || messages[selectedContact.id].length === 0) && (
                                        <div className="text-center text-gray-500 py-8">
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-3 flex items-center border-t-2 border-gray-200 text-b">
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