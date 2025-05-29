import React, { useState } from 'react';
import { MessageSquare, X, Shield, Zap } from 'lucide-react';
import GeminiChatBot from './GeminiChatBot';
import OllamaChatBot from './OllamaChatBot';

type AIModel = 'Gemini' | 'ChefBot';

const ChatBotContainer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeModel, setActiveModel] = useState<AIModel>('Gemini');

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-96 md:w-[450px] transition-all duration-300 overflow-visible max-h-[70vh] flex flex-col mt-16">
                    <div className="bg-gradient-to-r rounded-t-2xl from-purple-600 to-blue-500 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-semibold">AI Assistant</span>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/10 p-1 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex gap-2 bg-white/10 rounded-lg p-1 relative">
                            <div className="relative group flex-1">
                                <button
                                    onClick={() => setActiveModel('Gemini')}
                                    className={`w-full py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                        activeModel === 'Gemini'
                                            ? 'bg-white text-purple-600'
                                            : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Zap size={14} />
                                    Gemini
                                </button>
                                <div className="absolute bottom-[calc(100%+1rem)] left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-xs text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none before:content-[''] before:absolute before:bottom-[-0.5rem] before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-gray-900 min-w-[12rem] text-center shadow-xl">
                                    Faster responses, powered by Google AI
                                    <br />
                                    <span className="text-gray-400 block mt-1">Data is shared with Google</span>
                                </div>
                            </div>
                            <div className="relative group flex-1">
                                <button
                                    onClick={() => setActiveModel('ChefBot')}
                                    className={`w-full py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                        activeModel === 'ChefBot'
                                            ? 'bg-white text-purple-600'
                                            : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Shield size={14} />
                                    ChefBot
                                </button>
                                <div className="absolute bottom-[calc(100%+1rem)] left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-xs text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none before:content-[''] before:absolute before:bottom-[-0.5rem] before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-gray-900 min-w-[12rem] text-center shadow-xl">
                                    Private & secure local processing
                                    <br />
                                    <span className="text-gray-400 block mt-1">Your data stays on our servers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activeModel === 'Gemini' ? <GeminiChatBot /> : <OllamaChatBot />}
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

export default ChatBotContainer;
