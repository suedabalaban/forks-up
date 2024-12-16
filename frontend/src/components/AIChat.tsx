import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Recipe } from '../model/Recipe';
import { checkDietaryRestriction, analyzeRecipeSteps } from '../api/ForksUpAPI';

interface AIChatProps {
    recipe: Recipe | null;
}

type ChatMode = 'select' | 'dietary' | 'steps';

const AIChat: React.FC<AIChatProps> = ({ recipe }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ text: string; isUser: boolean }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>('select');

    const handleModeSelect = (selectedMode: ChatMode) => {
        setMode(selectedMode);
        if (selectedMode === 'dietary') {
            setChatHistory(prev => [...prev, { 
                text: 'What dietary information would you like to know about this recipe? (e.g., allergies, vegan, gluten-free)', 
                isUser: false 
            }]);
        } else if (selectedMode === 'steps') {
            setChatHistory(prev => [...prev, { 
                text: 'What would you like to know about the recipe steps? (e.g., cooking time, technique, substitutions)', 
                isUser: false 
            }]);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || !recipe) return;

        const userMessage = message;
        setMessage('');
        setChatHistory(prev => [...prev, { text: userMessage, isUser: true }]);
        setIsLoading(true);

        try {
            let response;
            if (mode === 'dietary') {
                response = await checkDietaryRestriction(recipe.id, userMessage);
            } else {
                response = await analyzeRecipeSteps(recipe.id, userMessage);
            }

            setChatHistory(prev => [...prev, { text: response.response, isUser: false }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { 
                text: 'Sorry, an error occurred. Please try again.', 
                isUser: false 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setMode('select');
        setChatHistory([]);
    };

    if (!recipe) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg"
                >
                    <MessageCircle size={24} />
                </button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 max-h-96 flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-white">AI Assistant</h3>
                        <div className="flex gap-2">
                            {mode !== 'select' && (
                                <button
                                    onClick={handleReset}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    New Question
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {mode === 'select' ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleModeSelect('dietary')}
                                    className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-3 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                >
                                    Ask about Dietary Restrictions
                                </button>
                                <button
                                    onClick={() => handleModeSelect('steps')}
                                    className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-3 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                >
                                    Ask about Recipe Steps
                                </button>
                            </div>
                        ) : (
                            <>
                                {chatHistory.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${
                                                msg.isUser
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                            <div className="animate-pulse">Typing...</div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {mode !== 'select' && (
                        <div className="p-4 border-t dark:border-gray-700">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your question..."
                                    className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-2 disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIChat; 