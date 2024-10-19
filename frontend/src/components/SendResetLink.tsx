import {Mail} from "lucide-react";
import React, {useState} from "react";
import {auth} from "../config/firebaseconfig";
import { sendPasswordResetEmail } from 'firebase/auth';


const SendResetLink: React.FC<{ setMessage: (message: string) => void }> = ({ setMessage }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset link sent. Check your email.");
            setEmail('');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                setMessage("No user found with this email address.");
            } else if (error.code === 'auth/invalid-email') {
                setMessage("Invalid email address. Please check and try again.");
            } else {
                setMessage("An error occurred. Please try again later.");
            }
            console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
        </form>
    )
}

export default SendResetLink;
