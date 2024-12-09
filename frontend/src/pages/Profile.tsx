import React, { useState, useEffect } from "react";
import { auth } from "../config/firebaseconfig";
import { 
    updateProfile, 
    updateEmail, 
    sendEmailVerification, 
    User, 
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    deleteUser
} from "firebase/auth";
import DietaryPreferences from "./DietaryPreferences";
import { User as UserIcon, X } from 'lucide-react';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 inline-block ml-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const Profile: React.FC = () => {
    const [displayName, setDisplayName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setDisplayName(user.displayName || "");
                setEmail(user.email || "");
            }
        });

        return () => unsubscribe();
    }, []);

    // Auto-hide success and error messages after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const isEmailProvider = () => {
        if (!user) return false;
        const providers = user.providerData.map(provider => provider.providerId);
        return providers.includes("password");
    };

    const handleReauthenticate = async () => {
        if (!user || !user.email) return false;
        
        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);
            return true;
        } catch (error: any) {
            setErrorMessage("Incorrect password or an error occurred");
            return false;
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // Handle display name update
            if (displayName !== user.displayName) {
                await updateProfile(user, {
                    displayName: displayName
                });
                setSuccessMessage("Profile updated successfully!");
            }

            // Handle email update
            if (email !== user.email) {
                if (!isEmailProvider()) {
                    setErrorMessage("Google users cannot change their email address");
                    setEmail(user.email || "");
                    setIsLoading(false);
                    return;
                }

                if (!user.emailVerified) {
                    setErrorMessage("Please verify your current email before changing to a new one");
                    setEmail(user.email || "");
                    setIsLoading(false);
                    return;
                }

                if (!currentPassword) {
                    setShowPasswordInput(true);
                    setIsLoading(false);
                    return;
                }

                const isReauthenticated = await handleReauthenticate();
                if (!isReauthenticated) {
                    setIsLoading(false);
                    return;
                }

                try {
                    await updateEmail(user, email);
                    await sendEmailVerification(user);
                    setShowPasswordInput(false);
                    setCurrentPassword("");
                    setSuccessMessage("Verification email sent to " + email + ". Please verify your new email address!");
                } catch (error: any) {
                    if (error.code === "auth/requires-recent-login") {
                        setErrorMessage("Please log out and log in again before changing your email");
                    } else if (error.code === "auth/operation-not-allowed") {
                        setErrorMessage("Please verify your current email before changing to a new one");
                        setEmail(user.email || "");
                    } else {
                        setErrorMessage(error.message || "Failed to update email");
                        setEmail(user.email || "");
                    }
                }
            }
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user?.email || !isEmailProvider()) return;
        
        try {
            await sendPasswordResetEmail(auth, user.email);
            setSuccessMessage("Password reset link sent to your email!");
        } catch (error: any) {
            setErrorMessage("Failed to send password reset link");
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            if (isEmailProvider() && !currentPassword) {
                setShowPasswordInput(true);
                return;
            }

            if (isEmailProvider()) {
                const isReauthenticated = await handleReauthenticate();
                if (!isReauthenticated) return;
            }

            await deleteUser(user);
            setSuccessMessage("Account successfully deleted");
            window.location.href = "/";
        } catch (error: any) {
            setErrorMessage("Failed to delete account: " + error.message);
        }
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Please log in</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-2">
            {/* Message Banners */}
            {successMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center justify-between shadow-lg">
                        <p className="flex-1 mr-2">{successMessage}</p>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="text-green-700 hover:text-green-900 focus:outline-none"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between shadow-lg">
                        <p className="flex-1 mr-2">{errorMessage}</p>
                        <button
                            onClick={() => setErrorMessage("")}
                            className="text-red-700 hover:text-red-900 focus:outline-none"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Header with Photo */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                    {user.photoURL ? (
                        <div className="flex items-center space-x-3 cursor-pointer">
                            <div
                                className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <span className="text-purple-600 text-2xl dark:text-purple-300 font-medium">
                                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                        </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <UserIcon size={40} className="text-purple-600 dark:text-purple-300"/>
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            {user.displayName || 'Account Settings'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email {!isEmailProvider() && <GoogleIcon />}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${!isEmailProvider() ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-600' : ''}`}
                                placeholder="Enter your email"
                                disabled={!isEmailProvider()}
                                title={!isEmailProvider() ? "Google account users cannot change their email" : ""}
                            />
                            {!user.emailVerified && (
                                <p className="text-yellow-600 dark:text-yellow-500 text-sm mt-1">
                                    ⚠️ Email not verified
                                </p>
                            )}
                        </div>

                        {showPasswordInput && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Current Password (Required for changes)
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter your current password"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleUpdateProfile}
                            disabled={isLoading}
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
                        >
                            {isLoading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>

                    {/* Security Settings */}
                    {isEmailProvider() && (
                        <div className="pt-6 border-t dark:border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 dark:text-white">Security</h2>
                            <button
                                onClick={handleResetPassword}
                                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mb-4 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Reset Password
                            </button>
                        </div>
                    )}


                </div>
                
                <DietaryPreferences />

                {/* Account Deletion */}
                <div className="pt-6 border-t dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-500">Danger Zone</h2>
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-red-600 dark:text-red-500 text-sm">
                                ⚠️ This action cannot be undone. Your account and all data will be permanently deleted.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    Yes, Delete My Account
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;