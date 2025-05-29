import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import {Send, Search, Sparkle, MessageSquare} from 'lucide-react';
import { useRecipe } from '../../context/RecipeContext';
import { getPredefinedQuestions, analyzeRecipe, naturalLanguageSearch, streamTextCompletion } from '../../api/GeminiAPI';
import { useTranslation } from 'react-i18next';

const LoadingDots = () => (
    <div className="flex items-center space-x-1 px-2">
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const GeminiChatBot: React.FC = () => {
    const { t } = useTranslation();
    const { currentRecipe, chatHistory, addChatMessage } = useRecipe();
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [mode, setMode] = useState<'chat' | 'search'>('chat');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [streamingText, setStreamingText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
    const inputRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);

    const currentMessages = currentRecipe
        ? chatHistory[currentRecipe.id] || []
        : chatHistory['no-recipe'] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages]);

    useEffect(() => {
        if (isOpen && !currentMessages.length) {
            addChatMessage('no-recipe', {
                text: t('chatbot.welcome'),
                isUser: false
            });
        }
    }, [isOpen]); // Only depend on isOpen, remove currentRecipe dependency


    useEffect(() => {
        if (currentRecipe?.id) {
            loadPredefinedQuestions();
        }
    }, [currentRecipe?.id]);

    const loadPredefinedQuestions = async () => {
        if (!currentRecipe) return;
        try {
            const response = await getPredefinedQuestions(currentRecipe.id);
            const botMessage = {
                text: response,
                isUser: false
            };
            addChatMessage(currentRecipe.id, botMessage);
        } catch (error) {
            console.error('Error loading predefined questions:', error);
        }
    };

    const handleQuestionClick = (question: string) => {
        setInputMessage(question);
    };

    const parseAndFormatQuestions = (text: string) => {
        const parts = text.split(/(".*?")/g);
        return parts.map((part, index) => {
            if (part.match(/^".*"$/)) {
                const question = part.slice(1, -1);
                return `<button 
                    class="font-medium text-purple-600 dark:text-purple-400 
                           hover:text-purple-800 dark:hover:text-purple-300 
                           transition-colors duration-200 inline"
                    data-question="${question}"
                    onclick="document.dispatchEvent(new CustomEvent('questionClick', {detail: '${question.replace(/'/g, "\\'")}'}));"
                >${question}</button>`;
            }
            return part;
        }).join('');
    };

    // Add event listener for question clicks
    useEffect(() => {
        const handleQuestionClickEvent = (event: CustomEvent) => {
            handleQuestionClick(event.detail);
        };

        document.addEventListener('questionClick', handleQuestionClickEvent as EventListener);
        return () => {
            document.removeEventListener('questionClick', handleQuestionClickEvent as EventListener);
        };
    }, []);

    const handleModeSwitch = (newMode: 'chat' | 'search') => {
        setMode(newMode);
        setSearchResults([]);
    };

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

    // Add click outside handler
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

    const handleSubmit = async (text: string) => {
        if (!text.trim()) return;

        const userMessage = { text, isUser: true };
        const chatId = currentRecipe?.id || 'no-recipe';
        addChatMessage(chatId, userMessage);
        setInputMessage('');
        setStreamingText('');
        setIsTyping(true); // Show typing indicator

        try {
            if (mode === 'search') {
                const searchResponse = await naturalLanguageSearch(text);
                const searchMessage = {
                    text: `Found ${searchResponse.content.length} recipes:\n${
                        searchResponse.content.map((recipe: any) =>
                            `- ${recipe.name}`).join('\n')
                    }`,
                    isUser: false
                };
                addChatMessage(chatId, searchMessage);
                setSearchResults(searchResponse.content);
            } else {
                if (!currentRecipe) {
                    const response = await analyzeRecipe('no-recipe', text);
                    const botMessage = {
                        text: parseAndFormatQuestions(response.response),
                        isUser: false
                    };
                    addChatMessage('no-recipe', botMessage);
                    return;
                }
                const response = await analyzeRecipe(currentRecipe.id, text);
                const botMessage = {
                    text: parseAndFormatQuestions(response.response),
                    isUser: false
                };
                addChatMessage(currentRecipe.id, botMessage);
            }
        } catch (error) {
            addChatMessage(chatId, {
                text: t('chatbot.error'),
                isUser: false
            });
        } finally {
            setIsTyping(false); // Hide typing indicator
        }
    };

    const formatMessage = (text: string) => {
        // First, handle the quoted questions
        const withQuestions = text.replace(
            /"([^"]+)"/g,
            (_, question) => `<span 
                class="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 cursor-pointer inline"
                data-question="${question}"
                onclick="document.dispatchEvent(new CustomEvent('questionClick', {detail: '${question.replace(/'/g, "\\'")}'}));"
            >${question}</span>`
        );

        // Then handle the markdown formatting
        const doubleStarred = withQuestions.replace(
            /\*\*(.*?)\*\*/g,
            '<span class="font-extrabold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 rounded-md">$1</span>'
        );

        return doubleStarred.replace(
            /\*(.*?)\*/g,
            '<span class="font-bold">$1</span>'
        );
    };

    return (
        <>
            <div className="flex border-b dark:text-white dark:border-gray-700">
                <button
                    onClick={() => handleModeSwitch('chat')}
                    className={`flex-1 p-2 ${mode === 'chat' ? 'bg-purple-100 dark:bg-purple-900/40' : ''}`}
                >
                    <MessageSquare size={16} className="inline mr-2" />
                    {t('chatbot.chat')}
                </button>
                <button
                    onClick={() => handleModeSwitch('search')}
                    className={`flex-1 p-2 ${mode === 'search' ? 'bg-purple-100 dark:bg-purple-900/40' : ''}`}
                >
                    <Search size={16} className="inline mr-2" />
                    {t('chatbot.search')}
                </button>
            </div>

            <div className="min-h-[280px] max-h-[calc(70vh-180px)] overflow-y-auto p-3 space-y-3 flex-grow">
                {currentMessages.map((message, index) => (
                    <div key={index} 
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`rounded-lg px-4 py-2 max-w-[85%] whitespace-pre-wrap break-words ${
                                message.isUser 
                                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                        />
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

            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(inputMessage);
            }} className="p-3 border-t dark:border-gray-700 relative">
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
                            placeholder={t('chatbot.typePlaceholder')}
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

export default GeminiChatBot;
