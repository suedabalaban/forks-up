import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    updatePassword,
    onAuthStateChanged,
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
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [isSettingPassword, setIsSettingPassword] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [user, setUser] = useState<User | null>(null);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                currentUser.getIdToken().then(setToken);
                if (!currentUser.emailVerified) {
                    setIsSettingPassword(true);
                }
            } else {
                setToken(null);
                setIsSettingPassword(false);
            }
        });

        // E-posta doğrulama linkiyle giriş yapma kontrolü
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');
            if (!emailForSignIn) {
                emailForSignIn = window.prompt('Please provide your email for confirmation');
            }
            if (emailForSignIn) {
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        setMessage("Email verified successfully! Please set your password.");
                        setIsSettingPassword(true);
                    })
                    .catch((error) => {
                        setMessage("Error verifying email: " + error.message);
                    });
            }
        }

        return unsubscribe;
    }, [auth]);

    // Google ile giriş yap
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setMessage("Google login successful!");
        } catch (error) {
            console.error("Login failed", error);
            setMessage("Google login failed. Please try again.");
        }
    };

    // Email ve Şifre ile giriş yap
    const loginWithEmailAndPassword = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setMessage("Login successful!");
        } catch (error) {
            console.error("Login with email failed", error);
            setMessage("Login failed. Please check your credentials and try again.");
        }
    };

    // Email doğrulama linki gönder
    const sendVerificationEmail = async () => {
        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: true
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMessage("Verification email sent. Please check your inbox and click the link to complete registration.");
        } catch (error) {
            console.error("Error sending verification email", error);
            setMessage("Failed to send verification email. Please try again.");
        }
    };

    // Şifre oluştur
    const createPassword = async () => {
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (!user) {
            setMessage("No user is currently signed in.");
            return;
        }

        try {
            await updatePassword(user, password);
            setMessage("Password set successfully! You can now log in with your email and password.");
            setIsSettingPassword(false);
        } catch (error) {
            console.error("Error setting password", error);
            setMessage("Failed to set password. Please try again.");
        }
    };

    const fetchPrivateData = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/private/forks-up", {
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

            {user && !isSettingPassword ? (
                <div>
                    <h2>Welcome, {user.email}!</h2>
                    <button onClick={() => auth.signOut()}>Sign Out</button>
                </div>
            ) : isSettingPassword ? (
                <div>
                    <h2>Set Your Password</h2>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br /><br />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <br /><br />
                    <button onClick={createPassword}>Set Password</button>
                </div>
            ) : (
                <>
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
                    {!isRegistering && (
                        <>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <br /><br />
                        </>
                    )}
                    {isRegistering ? (
                        <button onClick={sendVerificationEmail}>Send Verification Email</button>
                    ) : (
                        <button onClick={loginWithEmailAndPassword}>Login</button>
                    )}
                    <br /><br />
                    <button onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? "Switch to Login" : "Switch to Register"}
                    </button>
                </>
            )}

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