import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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

    // Google ile giriş yap
    const loginWithGoogle = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken(); // JWT token
            setToken(idToken);
            alert("Login successful! JWT token generated.");
        } catch (error) {
            console.error("Login failed", error);
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
            setResponse(`Access denied or insufficient permissions: ${error}`,);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Firebase + Spring Boot JWT Authentication</h1>
            <button onClick={loginWithGoogle}>Login with Google</button>
            <br /><br />
            <button onClick={fetchPrivateData}>Fetch Private Data</button>
            <br /><br />
            <div >
                <h3>Response:</h3>
                <p>{response}</p>
            </div>
            {token && (
                <div >
                    <h3>JWT Token:</h3>
                    <p>{token}</p>
                </div>
            )}
        </div>
    );
};

export default App;