import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAvatar, generateAvatar, updateDescription } from '../api/ForksUpAPI';
import { Button, TextField } from '@mui/material';
import { Upload, Wand2, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const InitialProfileSetup: React.FC = () => {
    const [description, setDescription] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGenerateAvatar = async () => {
        setLoading(true);
        try {
            await updateDescription(description);
            
            const response = await generateAvatar();
            const blob = new Blob([response], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            setPreviewUrl(imageUrl);
            
            const avatarFile = new File([blob], 'generated-avatar.jpg', { type: 'image/jpeg' });
            setAvatar(avatarFile);
        } catch (error) {
            setErrorMessage('Failed to generate avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (avatar) {
                await uploadAvatar(avatar);
            }
            if (description) {
                await updateDescription(description);
            }
            navigate('/dietary-preferences');
        } catch (error) {
            setErrorMessage('Error saving profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dietary-preferences');
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 space-y-8"
            >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    Complete Your Profile
                </h1>
                
                <div className="flex flex-col items-center space-y-8">
                    {/* Description Section First */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full space-y-3"
                    >
                        <label className="block text-lg font-medium text-gray-900 dark:text-white">
                            Tell us about yourself
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This will help us generate a personalized avatar for you
                        </p>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            placeholder="Share your cooking experience, favorite cuisines, or any dietary preferences..."
                            className="dark:bg-gray-700"
                        />
                    </motion.div>

                    {/* Avatar Section Second */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                Profile Picture
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Generate an avatar based on your description or upload your own
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-6">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="relative"
                            >
                                <div className="w-32 h-32 rounded-full border-4 border-purple-100 dark:border-purple-900/50 overflow-hidden">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                            <User size={48} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outlined"
                                    onClick={handleGenerateAvatar}
                                    startIcon={<Wand2 />}
                                    disabled={loading || !description}
                                    className="dark:border-gray-600 dark:text-gray-200"
                                >
                                    Generate Avatar
                                </Button>

                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<Upload />}
                                    disabled={loading}
                                    className="dark:border-gray-600 dark:text-gray-200"
                                >
                                    Upload Photo
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm text-center">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex gap-4 w-full pt-4">
                        <Button
                            fullWidth
                            variant="text"
                            onClick={handleSkip}
                            disabled={loading}
                            className="dark:text-gray-300"
                        >
                            Skip for now
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || (!avatar && !description)}
                            endIcon={!loading && <ArrowRight />}
                            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                'Continue'
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InitialProfileSetup;
