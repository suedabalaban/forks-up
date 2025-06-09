import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessageToChatBot } from '../../api/ChatBotAPI';
import {streamTextCompletion} from "../../api/GeminiAPI";

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
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

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

    // Auto-completion effect
    useEffect(() => {
        const delayTimer = setTimeout(async () => {
            if (inputMessage.trim().length > 2) {
                try {
                    setIsStreaming(true);
                    const completions = await streamTextCompletion(inputMessage);
                    setSuggestions(completions);
                    setSelectedSuggestionIndex(0);
                } catch (error) {
                    console.error('Error streaming completion:', error);
                } finally {
                    setIsStreaming(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(delayTimer);
    }, [inputMessage]);

    // Click outside handler to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

        const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (!suggestions.length) return;

        switch (e.key) {
            case 'Tab':
                e.preventDefault();
                setInputMessage(suggestions[selectedSuggestionIndex]);
                setSuggestions([]);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0);
                break;
            case 'Escape':
                setSuggestions([]);
                break;
        }
            };

            const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
        setInputMessage('');
        setSuggestions([]);
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

            <form onSubmit={handleSubmit} className="p-3 border-t dark:border-gray-700 relative">
                <div className="flex gap-2 relative">
                    <div className="flex-1 relative" ref={inputRef}>
                        {suggestions.length > 0 && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 
                                        rounded-lg border border-gray-200 dark:border-gray-600
                                        overflow-hidden shadow-lg z-[60] max-h-[200px] overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className={`px-4 py-2 text-sm cursor-pointer
                                            ${index === selectedSuggestionIndex 
                                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        onClick={() => {
                                            setInputMessage(suggestion);
                                            setSuggestions([]);
                                        }}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                                <div className="text-xs text-center p-1 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                                    Use ↑↓ to navigate, Tab to select
                                </div>
                            </div>
                        )}
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 
                                    text-gray-800 dark:text-gray-200 focus:outline-none
                                    focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
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
