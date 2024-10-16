import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    User
} from "firebase/auth";
import axios from "axios";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAieC1ci2n7kYhY-fAoHtTbyFlTx8iRbfU",
    authDomain: "forks-up.firebaseapp.com",
    projectId: "forks-up",
    storageBucket: "forks-up.appspot.com",
    messagingSenderId: "97125224512",
    appId: "1:97125224512:web:22b6d52e3e3c192d148fa5",
    measurementId: "G-JG36F93JB2"
};

initializeApp(firebaseConfig);

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [response, setResponse] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const auth = getAuth();

    // Google ile giriş yap
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await handleSuccessfulAuth(user);
        } catch (error) {
            console.error("Login failed", error);
            setMessage("Google login failed. Please try again.");
        }
    };

    // Email ve Şifre ile giriş yap
    const loginWithEmailAndPassword = async () => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;
            await handleSuccessfulAuth(user);
        } catch (error) {
            console.error("Login with email failed", error);
            setMessage("Login failed. Please check your credentials and try again.");
        }
    };

    // Email ve Şifre ile kayıt ol
    const registerWithEmailAndPassword = async () => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            await sendEmailVerification(user);
            setMessage("Registration successful! Please check your email to verify your account before logging in.");
        } catch (error) {
            console.error("Registration failed", error);
            setMessage("Registration failed. This email might already be in use.");
        }
    };

    // Başarılı kimlik doğrulama işlemi
    const handleSuccessfulAuth = async (user: User) => {
        if (user.emailVerified) {
            const idToken = await user.getIdToken();
            setToken(idToken);
            setMessage("Login successful! JWT token generated.");
        } else {
            setMessage("Please verify your email address before logging in.");
            await auth.signOut();
        }
    };

    const fetchPrivateData = async () => {
        try {
            const res = await axios.get("http://localhost:8080/private", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setResponse(res.data);
        } catch (error) {
            console.error("Error fetching private data", error);
            setResponse(`Access denied or insufficient permissions: ${error}`);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Firebase + Spring Boot JWT Authentication</h1>

            {message && <p style={{ color: 'blue' }}>{message}</p>}

            {/* Google ile giriş */}
            <button onClick={loginWithGoogle}>Login with Google</button>
            <br /><br />

            {/* E-posta ve Şifre ile giriş/kayıt */}
            <h2>{isRegistering ? "Email Registration" : "Email and Password Login"}</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />
            {isRegistering ? (
                <button onClick={registerWithEmailAndPassword}>Register</button>
            ) : (
                <button onClick={loginWithEmailAndPassword}>Login</button>
            )}
            <br /><br />
            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Switch to Login" : "Switch to Register"}
            </button>
            <br /><br />

            {/* Özel veri çekme */}
            <button onClick={fetchPrivateData} disabled={!token}>Fetch Private Data</button>
            <br /><br />

            {/* Yanıt ve JWT token */}
            <div>
                <h3>Response:</h3>
                <p>{response}</p>
            </div>
            {token && (
                <div>
                    <h3>JWT Token:</h3>
                    <p>{token}</p>
                </div>
            )}
        </div>
    );
};

export default App;