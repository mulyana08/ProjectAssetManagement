/**
 * ChatPage Component
 * Page wrapper for AI Chat Query feature
 */

import React from 'react';
import { ChatInterface } from '../components/chat';

const ChatPage = () => {
    return (
        <div className="h-[calc(100vh-120px)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">AI Chat Query</h1>
                <p className="text-gray-600 mt-1">
                    Tanyakan informasi tentang aset menggunakan bahasa natural
                </p>
            </div>
            <div className="h-[calc(100%-80px)]">
                <ChatInterface />
            </div>
        </div>
    );
};

export default ChatPage;
