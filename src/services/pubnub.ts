import PubNub from 'pubnub';
import { env } from '../config/env';

// Debug logging for environment variables
console.log('PubNub Config:', {
    publishKey: env.PUBNUB_PUBLISH_KEY ? `${env.PUBNUB_PUBLISH_KEY.substring(0, 10)}...` : 'MISSING',
    subscribeKey: env.PUBNUB_SUBSCRIBE_KEY ? `${env.PUBNUB_SUBSCRIBE_KEY.substring(0, 10)}...` : 'MISSING',
    secretKey: env.PUBNUB_SECRET_KEY ? `${env.PUBNUB_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
});

// Initialize PubNub with environment variables
const pubnub = new PubNub({
    publishKey: env.PUBNUB_PUBLISH_KEY,
    subscribeKey: env.PUBNUB_SUBSCRIBE_KEY,
    secretKey: env.PUBNUB_SECRET_KEY,
    userId: `user_${Date.now()}`, // Generate unique user ID
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
    private channels: Set<string> = new Set();
    private listenerAdded: boolean = false;

    static getInstance(): PubNubService {
        if (!PubNubService.instance) {
            PubNubService.instance = new PubNubService();
        }
        return PubNubService.instance;
    }

    constructor() {
        // Add listener only once when service is created
        if (!this.listenerAdded) {
            this.setupMessageListener();
            this.listenerAdded = true;
        }
    }

    private setupMessageListener() {
        pubnub.addListener({
            message: (message) => {
                const payload = message.message as unknown as PubNubPayload;
                const pubnubMessage: PubNubMessage = {
                    id: message.timetoken.toString(),
                    sender: payload.sender,
                    text: payload.text,
                    timestamp: Number(message.timetoken),
                    senderId: payload.senderId,
                    receiverId: payload.receiverId,
                    senderName: payload.senderName,
                    receiverName: payload.receiverName,
                };
                
                // Find which channel this message belongs to
                const channelId = message.channel;
                if (channelId) {
                    // Emit the message to any registered callbacks for this channel
                    this.emitMessage(channelId, pubnubMessage);
                }
            },
        });
    }

    private channelCallbacks: Map<string, (message: PubNubMessage) => void> = new Map();

    // Subscribe to a chat channel
    subscribeToChannel(channelId: string, onMessage: (message: PubNubMessage) => void) {
        if (this.channels.has(channelId)) {
            // Update the callback for this channel
            this.channelCallbacks.set(channelId, onMessage);
            return;
        }

        this.channels.add(channelId);
        this.channelCallbacks.set(channelId, onMessage);
        
        pubnub.subscribe({
            channels: [channelId],
            withPresence: true,
        });
    }

    private emitMessage(channelId: string, message: PubNubMessage) {
        const callback = this.channelCallbacks.get(channelId);
        if (callback) {
            callback(message);
        }
    }

    // Unsubscribe from a channel
    unsubscribeFromChannel(channelId: string) {
        if (!this.channels.has(channelId)) {
            return;
        }

        this.channels.delete(channelId);
        this.channelCallbacks.delete(channelId);
        
        pubnub.unsubscribe({
            channels: [channelId],
        });
    }

    // Send a message to a channel
    async sendMessage(channelId: string, message: Omit<PubNubMessage, 'id' | 'timestamp'>): Promise<PubNubMessage> {
        try {
            // Validate that we have proper keys
            if (!env.PUBNUB_PUBLISH_KEY || !env.PUBNUB_SUBSCRIBE_KEY || !env.PUBNUB_SECRET_KEY) {
                console.log('PubNub keys:', env.PUBNUB_PUBLISH_KEY, env.PUBNUB_SUBSCRIBE_KEY, env.PUBNUB_SECRET_KEY)
                throw new Error('PubNub keys are missing. Please check your environment variables.');
            }
            
            // Validate channel name
            if (!channelId || channelId.trim() === '') {
                throw new Error('Invalid channel ID');
            }
            
            console.log('Sending message to channel:', channelId, 'Message:', message);
            console.log('Using keys:', {
                publishKey: env.PUBNUB_PUBLISH_KEY.substring(0, 10) + '...',
                subscribeKey: env.PUBNUB_SUBSCRIBE_KEY.substring(0, 10) + '...',
                secretKey: env.PUBNUB_SECRET_KEY.substring(0, 10) + '...'
            });
            
            const result = await pubnub.publish({
                channel: channelId,
                message: {
                    sender: message.sender,
                    text: message.text,
                    senderId: message.senderId || '',
                    receiverId: message.receiverId || '',
                    senderName: message.senderName || '',
                    receiverName: message.receiverName || '',
                } as any, // Type assertion to avoid PubNub type conflicts
            });

            console.log('Message sent successfully:', result);

            // Return the sent message with generated ID
            return {
                ...message,
                id: result.timetoken.toString(),
                timestamp: Number(result.timetoken),
            };
        } catch (error: any) {
            console.error('Error sending message:', error);
            console.error('Error details:', {
                status: error.status,
                statusCode: error.status?.code,
                message: error.message,
                details: error.details,
                operation: error.operation,
                fullError: error
            });
            
            // Check if it's a validation error
            if (error.status?.code === 400 || error.status === 400) {
                throw new Error(`PubNub validation failed: ${error.message || 'Check your API keys and channel configuration'}`);
            }
            
            throw error;
        }
    }

    // Get channel name for a contact
    getChannelName(contactId: number): string {
        return `chat_${contactId}`;
    }

    // Get message history for a channel
    async getMessageHistory(channelId: string, limit: number = 50): Promise<PubNubMessage[]> {
        try {
            console.log('Fetching message history for channel:', channelId);
            
            const result = await pubnub.history({
                channel: channelId,
                count: limit,
                reverse: false
            });
            
            console.log('Message history result:', result);
            
            if (!result.messages || result.messages.length === 0) {
                return [];
            }
            
            return result.messages.map(msg => {
                const payload = msg.entry as unknown as PubNubPayload;
                return {
                    id: msg.timetoken.toString(),
                    sender: payload.sender,
                    text: payload.text,
                    timestamp: Number(msg.timetoken),
                    senderId: payload.senderId,
                    receiverId: payload.receiverId,
                    senderName: payload.senderName,
                    receiverName: payload.receiverName,
                };
            });
        } catch (error: any) {
            console.error('Error fetching message history:', error);
            console.error('Error details:', {
                status: error.status,
                message: error.message,
                details: error.details
            });
            return [];
        }
    }

    // Cleanup all subscriptions
    cleanup() {
        const channels = Array.from(this.channels);
        channels.forEach(channel => this.unsubscribeFromChannel(channel));
    }
}

export default PubNubService;
