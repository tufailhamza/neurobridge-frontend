'use client';

import React, { useState, useEffect } from 'react';
import PubNubService from '../services/pubnub';

interface MessageStatusIndicatorProps {
    className?: string;
}

export default function MessageStatusIndicator({ className = '' }: MessageStatusIndicatorProps) {
    const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
    const [lastMessageTime, setLastMessageTime] = useState<string>('Never');
    const [messageCount, setMessageCount] = useState<number>(0);

    useEffect(() => {
        const pubnubService = PubNubService.getInstance();
        
        // Check connection status periodically
        const statusInterval = setInterval(() => {
            setConnectionStatus(pubnubService.getConnectionStatus());
        }, 1000);

        // Subscribe to global channel to monitor messages
        pubnubService.subscribeToChannel('global_messages', (message) => {
            setLastMessageTime(new Date().toLocaleTimeString());
            setMessageCount(prev => prev + 1);
        });

        return () => {
            clearInterval(statusInterval);
        };
    }, []);

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'text-green-600';
            case 'connecting':
                return 'text-yellow-600';
            default:
                return 'text-red-600';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return '🟢';
            case 'connecting':
                return '🟡';
            default:
                return '🔴';
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-xs ${className}`}>
            <div className="flex items-center space-x-2 mb-2">
                <span>{getStatusIcon()}</span>
                <span className={`font-medium ${getStatusColor()}`}>
                    {connectionStatus === 'connected' ? 'Real-time Active' : 'Connecting...'}
                </span>
            </div>
            <div className="text-gray-600">
                <div>Last message: {lastMessageTime}</div>
                <div>Messages received: {messageCount}</div>
            </div>
        </div>
    );
}
