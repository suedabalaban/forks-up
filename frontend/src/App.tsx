import React, { useState, useEffect } from "react";
import { onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink, User, sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "./components/firebaseconfig";  
import LoginWithGoogle from "./components/LoginWithGoogle";
import EmailLogin from "./components/EmailLogin";
import PasswordCreation from "./components/PasswordCreation";
import FetchPrivateData from "./components/FetchPrivateData";
import UserInfo from "./components/UserInfo";

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

    useEffect(() => {
        // Listen for authentication state changes
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

        // Check if the sign-in link is in the URL
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem("emailForSignIn");
            if (!emailForSignIn) {
                emailForSignIn = window.prompt("Please provide your email for confirmation");
            }
            if (emailForSignIn) {
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem("emailForSignIn");
                        setMessage("Email verified successfully! Please set your password.");
                        setIsSettingPassword(true);
                    })
                    .catch((error) => {
                        setMessage("Error verifying email: " + error.message);
                    });
            }
        }

        return unsubscribe;
    }, []);

    const sendVerificationEmail = async () => {
        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: true
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem("emailForSignIn", email);
            setMessage("Verification email sent. Please check your inbox and click the link to complete registration.");
        } catch (error) {
            console.error("Error sending verification email", error);
            setMessage("Failed to send verification email. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Firebase + Spring Boot JWT Authentication</h1>
            {message && <p style={{ color: "blue" }}>{message}</p>}

            {user && !isSettingPassword ? (
                <UserInfo user={user} />
            ) : isSettingPassword ? (
                <PasswordCreation
                    password={password}
                    confirmPassword={confirmPassword}
                    setPassword={setPassword}
                    setConfirmPassword={setConfirmPassword}
                    setMessage={setMessage}
                    user={user}
                    setIsSettingPassword={setIsSettingPassword}
                />
            ) : (
                <>
                    <LoginWithGoogle setMessage={setMessage} />
                    <br /><br />
                    <EmailLogin
                        isRegistering={isRegistering}
                        email={email}
                        password={password}
                        setEmail={setEmail}
                        setPassword={setPassword}
                        setMessage={setMessage}
                        setIsRegistering={setIsRegistering}
                        sendVerificationEmail={sendVerificationEmail}
                    />
                </>
            )}

            <br /><br />
            <FetchPrivateData token={token} setResponse={setResponse} />
            <br /><br />

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
