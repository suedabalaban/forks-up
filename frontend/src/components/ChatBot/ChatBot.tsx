import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecipe } from '../../context/RecipeContext';
import { getPredefinedQuestions, analyzeRecipe } from '../../api/GeminiAPI';
import { useTranslation } from 'react-i18next';

const ChatBot: React.FC = () => {
    const { t } = useTranslation();
    const { currentRecipe, chatHistory, addChatMessage } = useRecipe();
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
        if (isOpen) {
            loadPredefinedQuestions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (!currentRecipe) {
                addChatMessage('no-recipe', {
                    text: t('chatbot.welcome'),
                    isUser: false
                });
            } else if (!chatHistory[currentRecipe.id] || chatHistory[currentRecipe.id].length === 0) {
                const initialMessage = {
                    text: t('chatbot.initialMessage', { recipeName: currentRecipe.name }),
                    isUser: false
                };
                addChatMessage(currentRecipe.id, initialMessage);
            }
        }
    }, [currentRecipe, isOpen]);

    const loadPredefinedQuestions = async () => {
        try {
            const questions = await getPredefinedQuestions();
            setPredefinedQuestions(questions);
        } catch (error) {
            console.error('Error loading predefined questions:', error);
        }
    };

    const handleQuestionClick = (question: string) => {
        handleSubmit(question);
        setShowSuggestions(false);
    };

    const handleSubmit = async (text: string) => {
        if (!currentRecipe) {
            addChatMessage('no-recipe', {
                text: t('chatbot.selectRecipe'),
                isUser: false
            });
            setInputMessage('');
            return;
        }
        
        if (!text.trim()) return;

        const userMessage = { text, isUser: true };
        addChatMessage(currentRecipe.id, userMessage);
        setInputMessage('');
        
        try {
            const response = await analyzeRecipe(currentRecipe.id, text);
            const botMessage = {
                text: response.result || "I'm sorry, I couldn't analyze that. Please try asking something else.",
                isUser: false
            };
            addChatMessage(currentRecipe.id, botMessage);
        } catch (error) {
            const errorMessage = {
                text: t('chatbot.error'),
                isUser: false
            };
            addChatMessage(currentRecipe.id, errorMessage);
        }
    };


    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-80 transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <MessageSquare size={20} />
                            <span className="font-semibold">{t('chatbot.title')}</span>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                        {currentMessages.map((message, index) => (
                            <div key={index} 
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    message.isUser 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} /> {/* Scroll anchor */}
                    </div>

                    {/* Only show predefined questions if a recipe is selected */}
                    {currentRecipe && predefinedQuestions.length > 0 && (
                        <div className="border-t dark:border-gray-700">
                            <button
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className="w-full p-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <span>{t('chatbot.suggestedQuestions')}</span>
                                {showSuggestions ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            </button>
                            
                            {showSuggestions && (
                                <div className="p-2 max-h-40 overflow-y-auto">
                                    <div className="flex flex-col gap-2">
                                        {predefinedQuestions.map((question, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuestionClick(question)}
                                                className="text-left text-sm bg-gray-100 dark:bg-gray-700 
                                                        text-gray-800 dark:text-gray-200 px-3 py-2 
                                                        rounded-lg hover:bg-gray-200 
                                                        dark:hover:bg-gray-600 transition-colors"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(inputMessage);
                    }} className="p-4 border-t dark:border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={currentRecipe ? t('chatbot.typePlaceholder') : t('chatbot.selectRecipePlaceholder')}
                                disabled={!currentRecipe}
                                className="flex-1 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 
                                        text-gray-800 dark:text-gray-200 focus:outline-none
                                        focus:ring-2 focus:ring-purple-500 disabled:opacity-50
                                        disabled:cursor-not-allowed"
                            />
                            <button 
                                type="submit"
                                disabled={!currentRecipe}
                                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white 
                                        p-2 rounded-lg hover:opacity-90 transition-opacity
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 
                            rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                            hover:scale-110"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
