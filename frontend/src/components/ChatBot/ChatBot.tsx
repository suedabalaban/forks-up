import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
        setInputMessage('');
        
        // Bot yanıtı simülasyonu
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                text: "Thanks for your message! I'm a demo bot.", 
                isUser: false 
            }]);
        }, 1000);
    };

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
                        {messages.map((message, index) => (
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

                    <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
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
