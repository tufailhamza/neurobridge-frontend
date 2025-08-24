import PubNub from 'pubnub';
import { env } from '../config/env';

// Debug logging for environment variables
console.log('PubNub Config:', {
    publishKey: env.PUBNUB_PUBLISH_KEY ? `${env.PUBNUB_PUBLISH_KEY.substring(0, 10)}...` : 'MISSING',
    subscribeKey: env.PUBNUB_SUBSCRIBE_KEY ? `${env.PUBNUB_SUBSCRIBE_KEY.substring(0, 10)}...` : 'MISSING',
    secretKey: env.PUBNUB_SECRET_KEY ? `${env.PUBNUB_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
});

export interface PubNubMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    senderId?: string;
    receiverId?: string;
    senderName?: string;
    receiverName?: string;
}

interface PubNubPayload {
    sender: string;
    text: string;
    senderId?: string;
    receiverId?: string;
    senderName?: string;
    receiverName?: string;
}

export class PubNubService {
    private static instance: PubNubService;
    private pubnub: PubNub;
    private channels: Set<string> = new Set();
    private channelCallbacks: Map<string, (message: PubNubMessage) => void> = new Map();
    private isInitialized: boolean = false;

    static getInstance(): PubNubService {
        if (!PubNubService.instance) {
            PubNubService.instance = new PubNubService();
        }
        return PubNubService.instance;
    }

    constructor() {
        // Initialize PubNub with environment variables
        this.pubnub = new PubNub({
            publishKey: env.PUBNUB_PUBLISH_KEY || '',
            subscribeKey: env.PUBNUB_SUBSCRIBE_KEY || '',
            secretKey: env.PUBNUB_SECRET_KEY || '',
            userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique user ID
            restore: true, // Restore subscriptions on reconnect
            keepAlive: true, // Keep connection alive
        });

        this.setupMessageListener();
        this.setupStatusListener();
    }

    private setupMessageListener() {
        this.pubnub.addListener({
            message: (message) => {
                console.log('📨 Raw PubNub message received:', message);
                console.log('📨 Message channel:', message.channel);
                console.log('📨 Message timetoken:', message.timetoken);
                console.log('📨 Message payload:', message.message);
                
                try {
                    const payload = message.message as unknown as PubNubPayload;
                    console.log('📨 Parsed payload:', payload);
                    
                    const pubnubMessage: PubNubMessage = {
                        id: message.timetoken.toString(),
                        sender: payload.sender || 'Unknown',
                        text: payload.text || '',
                        timestamp: Number(message.timetoken),
                        senderId: payload.senderId || '',
                        receiverId: payload.receiverId || '',
                        senderName: payload.senderName || payload.sender || 'Unknown',
                        receiverName: payload.receiverName || '',
                    };
                    
                    console.log('📨 Created PubNub message object:', pubnubMessage);
                    
                    // Find which channel this message belongs to
                    const channelId = message.channel;
                    if (channelId) {
                        console.log('📨 Emitting message to channel:', channelId, pubnubMessage);
                        this.emitMessage(channelId, pubnubMessage);
                    } else {
                        console.warn('📨 No channel ID found in message');
                    }
                } catch (error) {
                    console.error('❌ Error processing received message:', error);
                    console.error('❌ Raw message that caused error:', message);
                }
            },
            presence: (presenceEvent) => {
                console.log('👥 Presence event:', presenceEvent);
            },
            status: (statusEvent) => {
                console.log('📡 Status event:', statusEvent);
            }
        });
    }

    private setupStatusListener() {
        this.pubnub.addListener({
            status: (statusEvent) => {
                console.log('PubNub status:', statusEvent.category);
                
                switch (statusEvent.category) {
                    case 'PNConnectedCategory':
                        console.log('✅ PubNub connected successfully');
                        this.isInitialized = true;
                        break;
                    case 'PNReconnectedCategory':
                        console.log('🔄 PubNub reconnected');
                        break;
                    case 'PNDisconnectedCategory':
                        console.log('❌ PubNub disconnected');
                        break;
                    case 'PNNetworkDownCategory':
                        console.log('🌐 Network down');
                        break;
                    case 'PNNetworkUpCategory':
                        console.log('🌐 Network up');
                        break;
                    default:
                        console.log('PubNub status:', statusEvent.category);
                }
            }
        });
    }

    private emitMessage(channelId: string, message: PubNubMessage) {
        console.log('📤 Emitting message to channel:', channelId);
        console.log('📤 Message to emit:', message);
        
        const callback = this.channelCallbacks.get(channelId);
        if (callback) {
            console.log('📤 Found callback for channel:', channelId);
            try {
                console.log('📤 Calling callback with message:', message);
                callback(message);
                console.log('📤 Callback executed successfully');
            } catch (error: any) {
                console.error('❌ Error in message callback:', error);
                console.error('❌ Callback error details:', {
                    channelId,
                    message,
                    error: error?.message || 'Unknown error',
                    stack: error?.stack || 'No stack trace'
                });
            }
        } else {
            console.warn('⚠️ No callback registered for channel:', channelId);
            console.warn('⚠️ Available channels:', Array.from(this.channelCallbacks.keys()));
        }
    }

    // Subscribe to a chat channel
    subscribeToChannel(channelId: string, onMessage: (message: PubNubMessage) => void) {
        console.log('Subscribing to channel:', channelId);
        
        // Store the callback
        this.channelCallbacks.set(channelId, onMessage);
        
        // Only subscribe if not already subscribed
        if (!this.channels.has(channelId)) {
            this.channels.add(channelId);
            
            this.pubnub.subscribe({
                channels: [channelId],
                withPresence: true,
            });
            
            console.log('✅ Subscribed to channel:', channelId);
        } else {
            console.log('Already subscribed to channel:', channelId);
        }
    }

    // Unsubscribe from a channel
    unsubscribeFromChannel(channelId: string) {
        console.log('Unsubscribing from channel:', channelId);
        
        if (!this.channels.has(channelId)) {
            return;
        }

        this.channels.delete(channelId);
        this.channelCallbacks.delete(channelId);
        
        this.pubnub.unsubscribe({
            channels: [channelId],
        });
        
        console.log('✅ Unsubscribed from channel:', channelId);
    }

    // Send a message to a channel
    async sendMessage(channelId: string, message: Omit<PubNubMessage, 'id' | 'timestamp'>): Promise<PubNubMessage> {
        try {
            // Validate that we have proper keys
            if (!env.PUBNUB_PUBLISH_KEY || !env.PUBNUB_SUBSCRIBE_KEY || !env.PUBNUB_SECRET_KEY) {
                console.error('PubNub keys missing:', {
                    publishKey: !!env.PUBNUB_PUBLISH_KEY,
                    subscribeKey: !!env.PUBNUB_SUBSCRIBE_KEY,
                    secretKey: !!env.PUBNUB_SECRET_KEY
                });
                throw new Error('PubNub keys are missing. Please check your environment variables.');
            }
            
            // Validate channel name
            if (!channelId || channelId.trim() === '') {
                throw new Error('Invalid channel ID');
            }
            
            console.log('📤 Sending message to channel:', channelId, 'Message:', message);
            
            const result = await this.pubnub.publish({
                channel: channelId,
                message: {
                    sender: message.sender,
                    text: message.text,
                    senderId: message.senderId || '',
                    receiverId: message.receiverId || '',
                    senderName: message.senderName || message.sender || '',
                    receiverName: message.receiverName || '',
                },
                storeInHistory: true, // Store message in history
                sendByPost: false, // Use real-time delivery
            });

            console.log('✅ Message sent successfully:', result);

            // Return the sent message with generated ID
            const sentMessage: PubNubMessage = {
                ...message,
                id: result.timetoken.toString(),
                timestamp: Number(result.timetoken),
            };
            
            return sentMessage;
        } catch (error: any) {
            console.error('❌ Error sending message:', error);
            console.error('Error details:', {
                status: error.status,
                statusCode: error.status?.code,
                message: error.message,
                details: error.details,
                operation: error.operation,
            });
            
            // Check if it's a validation error
            if (error.status?.code === 400 || error.status === 400) {
                throw new Error(`PubNub validation failed: ${error.message || 'Check your API keys and channel configuration'}`);
            }
            
            throw error;
        }
    }

    // Get message history for a channel
    async getMessageHistory(channelId: string, limit: number = 50): Promise<PubNubMessage[]> {
        try {
            console.log('📚 Fetching message history for channel:', channelId);
            
            const result = await this.pubnub.history({
                channel: channelId,
                count: limit,
                reverse: false,
            });
            
            console.log('📚 Message history result:', result);
            
            if (!result.messages || result.messages.length === 0) {
                return [];
            }
            
            return result.messages.map((msg: any) => {
                const payload = msg.entry as unknown as PubNubPayload;
                return {
                    id: msg.timetoken.toString(),
                    sender: payload.sender || 'Unknown',
                    text: payload.text || '',
                    timestamp: Number(msg.timetoken),
                    senderId: payload.senderId || '',
                    receiverId: payload.receiverId || '',
                    senderName: payload.senderName || payload.sender || 'Unknown',
                    receiverName: payload.receiverName || '',
                };
            });
        } catch (error: any) {
            console.error('❌ Error fetching message history:', error);
            console.error('Error details:', {
                status: error.status,
                message: error.message,
                details: error.details
            });
            return [];
        }
    }

    // Check if service is ready
    isReady(): boolean {
        return this.isInitialized;
    }

    // Get connection status
    getConnectionStatus(): string {
        return this.isInitialized ? 'connected' : 'connecting';
    }

    // Cleanup all subscriptions
    cleanup() {
        console.log('🧹 Cleaning up PubNub service');
        const channels = Array.from(this.channels);
        channels.forEach(channel => this.unsubscribeFromChannel(channel));
        
        // Stop the PubNub instance
        this.pubnub.stop();
    }
}

export default PubNubService;
