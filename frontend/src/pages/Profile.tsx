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
import {KeyRound, ShieldAlert, Trash2, Upload, User as UserIcon, Wand2, X} from 'lucide-react';
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import GoogleIcon from "../assets/GoogleIcon";
import { useNotification } from '../context/NotificationContext';
import {generateAvatar, getAvatar, getMyUser, updateDescription, uploadAvatar} from "../api/UserAPI";

const Profile: React.FC = () => {
    const { showSuccess, showError } = useNotification();
    const { t, i18n } = useTranslation();
    const [displayName, setDisplayName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [description, setDescription] = useState<string>("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fetchedAvatar, setFetchedAvatar] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setDisplayName(user.displayName || "");
                setEmail(user.email || "");
                
                // Fetch user data including description and avatar
                const fetchUserData = async () => {
                    try {
                        const [userResponse, avatarData] = await Promise.all([
                            getMyUser(),
                            getAvatar()
                        ]);

                        // Set description if exists
                        if (userResponse.data.description) {
                            setDescription(userResponse.data.description);
                        }

                        // Set avatar if exists
                        if (avatarData) {
                            const blob = new Blob([avatarData], { type: 'image/jpeg' });
                            const imageUrl = URL.createObjectURL(blob);
                            setFetchedAvatar(imageUrl);
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                };

                fetchUserData();
            }
        });

        return () => unsubscribe();
    }, []);

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
            showError("Incorrect password or an error occurred");
            return false;
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // Handle avatar upload
            if (avatar) {
                await uploadAvatar(avatar);
                showSuccess("Profile updated successfully!");
            }

            // Handle description update
            if (description) {
                await updateDescription(description);
                showSuccess("Profile updated successfully!");
            }

            // Handle display name update
            if (displayName !== user.displayName) {
                await updateProfile(user, {
                    displayName: displayName
                });
                showSuccess("Profile updated successfully!");
            }

            // Handle email update
            if (email !== user.email) {
                if (!isEmailProvider()) {
                    showError("Google users cannot change their email address");
                    setEmail(user.email || "");
                    setIsLoading(false);
                    return;
                }

                if (!user.emailVerified) {
                    showError("Please verify your current email before changing to a new one");
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
                    showSuccess("Verification email sent to " + email + ". Please verify your new email address!");
                } catch (error: any) {
                    if (error.code === "auth/requires-recent-login") {
                        showError("Please log out and log in again before changing your email");
                    } else if (error.code === "auth/operation-not-allowed") {
                        showError("Please verify your current email before changing to a new one");
                        setEmail(user.email || "");
                    } else {
                        showError(error.message || "Failed to update email");
                        setEmail(user.email || "");
                    }
                }
            }
        } catch (error: any) {
            showError(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user?.email || !isEmailProvider()) return;
        
        try {
            await sendPasswordResetEmail(auth, user.email);
            showSuccess("Password reset link sent to your email!");
        } catch (error: any) {
            showError("Failed to send password reset link");
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
            showSuccess("Account successfully deleted");
            window.location.href = "/";
        } catch (error: any) {
            showError("Failed to delete account: " + error.message);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGenerateAvatar = async () => {
        setIsLoading(true);
        try {
            await updateDescription(description);
            const response = await generateAvatar();
            const blob = new Blob([response], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            setPreviewUrl(imageUrl);
            const avatarFile = new File([blob], 'generated-avatar.jpg', { type: 'image/jpeg' });
            setAvatar(avatarFile);
            showSuccess("Avatar generated successfully!");
        } catch (error) {
            showError('Failed to generate avatar');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);
        showSuccess(t('profile.languageChangeSuccess'));
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Please log in</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <div 
                            onClick={() => (previewUrl || fetchedAvatar) && setShowAvatarModal(true)}
                            className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-900/50 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            {(previewUrl || fetchedAvatar) ? (
                                <img
                                    src={previewUrl || fetchedAvatar || undefined}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                    <UserIcon size={36} className="text-purple-600 dark:text-purple-400"/>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user.displayName || 'Account Settings'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            {user.email}
                            {!isEmailProvider() && <GoogleIcon />}
                        </p>
                    </div>
                </div>

                {/* Avatar Modal */}
                {showAvatarModal && (previewUrl || fetchedAvatar) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAvatarModal(false)}
                    >
                        <div className="relative max-w-2xl w-full">
                            <button
                                onClick={() => setShowAvatarModal(false)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <motion.img
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                src={previewUrl || fetchedAvatar || undefined}
                                alt="Profile"
                                className="w-full h-auto rounded-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Avatar and Description Section */}
                <div className="space-y-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            About Me
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 
                                     dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={4}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateAvatar}
                            disabled={!description || isLoading}
                            className="group relative flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 
                                     dark:border-gray-600 dark:hover:bg-gray-700 transition-colors dark:text-white"
                        >
                            <Wand2 size={16} />
                            Generate Avatar
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 
                                          group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                Avatar will be generated based on your "About Me" description
                            </div>
                        </button>

                        <button
                            className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 
                                     dark:border-gray-600 dark:hover:bg-gray-700 transition-colors dark:text-white"
                        >
                            <Upload size={16} />
                            <label className="cursor-pointer">
                                Upload Photo
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </button>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${
                                    !isEmailProvider()
                                        ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-600/30 text-gray-400 dark:text-gray-500'
                                        : 'focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                }`}
                                disabled={!isEmailProvider()}
                            />
                            {!user.emailVerified && isEmailProvider() && (
                                <div className="mt-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                                    <ShieldAlert size={16} />
                                    <span>Email not verified</span>
                                </div>
                            )}
                        </div>

                        {showPasswordInput && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <button
                            onClick={handleUpdateProfile}
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </motion.div>

                    {/* Language Settings */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-6 border-t dark:border-gray-700 space-y-4"
                    >
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Languages size={20} className="text-purple-600 dark:text-purple-400" />
                            <h2 className="text-lg font-semibold">{t('profile.languageSettings')}</h2>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('profile.selectLanguage')}
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        i18n.language === 'en'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {t('profile.english')}
                                </button>
                                <button
                                    onClick={() => handleLanguageChange('tr')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        i18n.language === 'tr'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {t('profile.turkish')}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Section */}
                    {isEmailProvider() && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="pt-6 border-t dark:border-gray-700 space-y-4"
                        >
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <KeyRound size={20} className="text-purple-600 dark:text-purple-400" />
                                <h2 className="text-lg font-semibold">Security</h2>
                            </div>

                            <button
                                onClick={handleResetPassword}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600/50
                                rounded-xl transition-colors text-gray-700 dark:text-gray-200"
                            >
                                <span>Change Password</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Last changed 2 weeks ago</span>
                            </button>
                        </motion.div>
                    )}

                    {/* Dietary Preferences */}
                    <DietaryPreferences />

                    {/* Danger Zone */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-6 border-t dark:border-gray-700 space-y-4"
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                            <h2 className="text-lg font-semibold">Danger Zone</h2>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/40
                                text-red-600 dark:text-red-400 rounded-xl transition-colors flex items-center justify-between"
                            >
                                <span>Delete Account</span>
                                <span className="text-sm">Permanent action</span>
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl"
                            >
                                <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                    <ShieldAlert size={20} className="flex-shrink-0 mt-1" />
                                    <p className="text-sm">
                                        This action cannot be undone. All your data including recipes, preferences,
                                        and account information will be permanently deleted from our servers.
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg
                                        dark:bg-red-500 dark:hover:bg-red-600 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete Account
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;