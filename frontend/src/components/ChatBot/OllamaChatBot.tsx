import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessageToChatBot } from '../../api/ChatBotAPI';

const LoadingDots = () => (
    <div className="flex items-center space-x-1 px-2">
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const OllamaChatBot: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Array<{text: string; isUser: boolean}>>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatResponse = (response: any): string => {
        if (typeof response === 'string') {
            return response;
        }
        if (typeof response === 'object') {
            // Check if response contains recipe ID and redirect
            if (response.id) {
                navigate(`/recipe/${response.id}`);
                return `Found a recipe! Taking you to ${response.name || 'the recipe page'}...`;
            }
            // Handle recipe object specifically
            if (response.name && response.description) {
                return `Recipe: ${response.name}\nDescription: ${response.description}`;
            }
            // For other objects, convert to readable format
            return JSON.stringify(response, null, 2);
        }
        return 'Invalid response format';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await sendMessageToChatBot(inputMessage);
            setMessages(prev => [...prev, { 
                text: formatResponse(response), 
                isUser: false 
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                text: 'Sorry, I encountered an error processing your request.', 
                isUser: false 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <div className="min-h-[280px] max-h-[calc(70vh-180px)] overflow-y-auto p-3 space-y-3 flex-grow">
                {messages.map((message, index) => (
                    <div key={index} 
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-wrap break-words ${
                                message.isUser 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700">
                            <LoadingDots />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 
                                text-gray-800 dark:text-gray-200 focus:outline-none
                                focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-blue-500 text-white 
                                p-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </>
    );
};

export default OllamaChatBot;
