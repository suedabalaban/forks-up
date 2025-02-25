import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useRecipe } from '../../context/RecipeContext';
import { getPredefinedQuestions, analyzeRecipe } from '../../api/ForksUpAPI';

const ChatBot: React.FC = () => {
    const { currentRecipe, chatHistory, addChatMessage } = useRecipe();
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>([]);

    // Load predefined questions when chat opens
    useEffect(() => {
        if (isOpen) {
            loadPredefinedQuestions();
        }
    }, [isOpen]);

    // Set initial message when recipe changes
    useEffect(() => {
        if (currentRecipe && isOpen && (!chatHistory[currentRecipe.id] || chatHistory[currentRecipe.id].length === 0)) {
            const initialMessage = {
                text: `Current Recipe: ${currentRecipe.name}\n\nI can help you with:\n- Ingredient substitutions\n- Cooking techniques\n- Step explanations\n\nWhat would you like to know?`,
                isUser: false
            };
            addChatMessage(currentRecipe.id, initialMessage);
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
    };

    const handleSubmit = async (text: string) => {
        if (!text.trim() || !currentRecipe) return;

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
                text: "I apologize, but I encountered an error. Please try again later.",
                isUser: false
            };
            addChatMessage(currentRecipe.id, errorMessage);
        }
    };

    const currentMessages = currentRecipe ? chatHistory[currentRecipe.id] || [] : [];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-80 transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <MessageSquare size={20} />
                            <span className="font-semibold">AI Assistant</span>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="h-80 overflow-y-auto p-4 space-y-4">
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
                    </div>

                    {/* Predefined Questions Section */}
                    {predefinedQuestions.length > 0 && (
                        <div className="p-2 border-t dark:border-gray-700">
                            <div className="flex flex-wrap gap-2">
                                {predefinedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuestionClick(question)}
                                        className="text-sm bg-gray-100 dark:bg-gray-700 
                                                text-gray-800 dark:text-gray-200 px-3 py-1 
                                                rounded-full hover:bg-gray-200 
                                                dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
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
                                placeholder="Type a message..."
                                className="flex-1 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 
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
