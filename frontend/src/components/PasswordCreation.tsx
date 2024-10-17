import React from "react";
import { updatePassword, User } from "firebase/auth";

const PasswordCreation: React.FC<{
    password: string;
    confirmPassword: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    user: User | null;
    setIsSettingPassword: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ password, confirmPassword, setPassword, setConfirmPassword, setMessage, user, setIsSettingPassword }) => {
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

    return (
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
    );
};

export default PasswordCreation;
