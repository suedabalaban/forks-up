import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseconfig'; 

const GoogleLogin: React.FC<{ setMessage: (message: string) => void }> = ({ setMessage }) => {
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setMessage("Google login successful!");
        } catch (error) {
            console.error("Error logging in with Google", error);
            setMessage("Failed to log in with Google. Please try again.");
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 ease-in-out flex items-center justify-center"
        >
            <img
                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                alt="Google logo"
                className="h-6 w-6  mr-2"/>
            Login with Google
        </button>
    );
};

export default GoogleLogin;
