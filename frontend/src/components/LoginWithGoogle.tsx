import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseconfig'; 

const LoginWithGoogle: React.FC<{ setMessage: (message: string) => void }> = ({ setMessage }) => {
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

    return <button onClick={handleGoogleLogin}>Login with Google</button>;
};

export default LoginWithGoogle;
