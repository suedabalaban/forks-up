import React, { useState } from "react";
import axios from "axios";
import {api, getToken} from "../api/ForksUpAPI";

interface Message {
    text: string;
    sender: "user" | "bot";
}

const Settings: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const userId = "user-id";

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage: Message = { text: input, sender: "user" };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            const token = await getToken();
            const response = await api("/chatbot?message=" + newMessage.text, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }}
            );

            if (response.data) {
                const botMessage: Message = { text: JSON.stringify(response.data), sender: "bot" };
                setMessages((prev) => [...prev, botMessage]);
            }
        } catch (error) {
            console.error("Error fetching response from chatbot:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-4">
            <div className="flex flex-col flex-grow bg-white rounded-xl shadow-lg p-4 overflow-y-auto max-h-[80vh]">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-3 my-2 max-w-xs md:max-w-sm lg:max-w-md rounded-lg text-white ${
                            msg.sender === "user"
                                ? "bg-blue-600 self-end"
                                : "bg-purple-500 self-start"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Settings;