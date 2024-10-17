import React from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseconfig'; 

interface EmailLoginProps {
    isRegistering: boolean;
    email: string;
    password: string;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setMessage: (message: string) => void;
    setIsRegistering: (registering: boolean) => void;
    sendVerificationEmail: () => Promise<void>;
}

const EmailLogin: React.FC<EmailLoginProps> = ({
    isRegistering,
    email,
    password,
    setEmail,
    setPassword,
    setMessage,
    setIsRegistering,
    sendVerificationEmail,
}) => {
    const handleLogin = async () => {
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
                await sendVerificationEmail();
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                setMessage("Login successful!");
            }
        } catch (error) {
            console.error("Error logging in", error);
            setMessage("Failed to log in. Please try again.");
        }
    };

    return (
        <div>
            <h2>{isRegistering ? "Register" : "Login"}</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleLogin}>{isRegistering ? "Register" : "Login"}</button>
            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Switch to Login" : "Switch to Register"}
            </button>
        </div>
    );
};

export default EmailLogin;
