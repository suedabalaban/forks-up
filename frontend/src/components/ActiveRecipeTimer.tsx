import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Play, Pause } from 'lucide-react';
import { Recipe } from '../model/Recipe';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeDetails from "./RecipeDetails";
import { createPortal } from 'react-dom';
import { getPreparationTimeFromTags } from '../utils/preparationTime';
import { addToRecipeHistory, getRecipeHistory } from '../api/ForksUpAPI';
import { RecipeHistory } from '../model/RecipeHistory';
import { auth } from '../config/firebaseconfig';
import ReviewModal from './ReviewModal';

interface ActiveRecipeTimerProps {
    recipe: Recipe;
    onTimerClick: () => void;
    onClose: () => void;
}

const ActiveRecipeTimer: React.FC<ActiveRecipeTimerProps> = ({ recipe, onTimerClick, onClose }) => {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const isHistoryAdded = useRef(false);

    const DEFAULT_TIME = 60 * 60;
    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const savedTimeLeft = localStorage.getItem('activeRecipeTimeLeft');
        const savedStartTime = localStorage.getItem('activeRecipeStartTime');
        const savedRecipeId = localStorage.getItem('activeRecipeId');

        if (savedTimeLeft && savedStartTime && savedRecipeId === recipe.id) {
            const elapsedSinceLastCheck = Math.floor(
                (new Date().getTime() - parseInt(savedStartTime)) / 1000
            );
            const remainingTime = parseInt(savedTimeLeft) - elapsedSinceLastCheck;
            if (remainingTime > 0) {
                isHistoryAdded.current = true;
                return remainingTime;
            }
        }

        const preparationTimeStr = getPreparationTimeFromTags(recipe.tags);
        if (preparationTimeStr) {
            const hourMatch = preparationTimeStr.match(/(\d+)h/i);
            const minuteMatch = preparationTimeStr.match(/(\d+)m/i);

            let totalSeconds = 0;

            if (hourMatch) {
                totalSeconds += parseInt(hourMatch[1]) * 3600;
            }

            if (minuteMatch) {
                totalSeconds += parseInt(minuteMatch[1]) * 60;
            }

            const checkAuthAndGetElapsedTime = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        const history = await getRecipeHistory();
                        const lastRecipe = history.find((h: RecipeHistory) => h.recipe.id === recipe.id);
                        if (lastRecipe) {
                            const startTime = new Date(lastRecipe.startedAt).getTime();
                            const currentTime = new Date().getTime();
                            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                            return totalSeconds - elapsedSeconds;
                        }
                    } catch (error) {
                        console.error('Error getting elapsed time:', error);
                    }
                }
                return totalSeconds;
            };

            checkAuthAndGetElapsedTime().then(remainingTime => {
                if (remainingTime > 0) {
                    setTimeLeft(remainingTime);
                }
            });

            return totalSeconds > 0 ? totalSeconds : DEFAULT_TIME;
        }
        return DEFAULT_TIME;
    });
    const [totalTime] = useState<number>(() => timeLeft);
    const [isPaused, setIsPaused] = useState(false);
    const [isAlmostDone, setIsAlmostDone] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!isPaused && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    if (newTime === 0) {
                        setShowReviewModal(true);
                    }
                    if (newTime <= 300 && !isAlmostDone) {
                        setIsAlmostDone(true);
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [isPaused, timeLeft]);

    useEffect(() => {
        const addRecipeToHistory = async () => {
            if (isHistoryAdded.current) {
                return;
            }

            try {
                await addToRecipeHistory(recipe.id);
                isHistoryAdded.current = true;
            } catch (error) {
                console.error('Error adding recipe to history:', error);
            }
        };

        addRecipeToHistory();
    }, []);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const pad = (num: number): string => num.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
        }
        return `${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    const getProgressColor = () => {
        const progress = timeLeft / totalTime;

        if (isAlmostDone) return 'from-red-500 to-orange-500';
        if (progress > 0.6) return 'from-green-500 to-emerald-500';
        if (progress > 0.3) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    const getTimerStyle = () => {
        if (timeLeft === 0) return 'animate-pulse bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
        if (isAlmostDone) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
    };

    const getHandAngles = () => {
        const totalSeconds = timeLeft;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            seconds: (seconds / 60) * 360,
            minutes: ((minutes + seconds / 60) / 60) * 360,
            hours: ((hours + minutes / 60) / 12) * 360
        };
    };

    const angles = getHandAngles();

    const handleClosePopup = () => {
        setSelectedRecipe(null);
    };

    const handleClose = () => {
        if (timeLeft > 0) {
            setIsClosing(true);
            setShowReviewModal(true);
        } else {
            onClose();
        }
    };

    return (
        <>
            <motion.div
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`active-recipe-timer flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm bg-white/10 dark:bg-gray-800/50 border border-purple-100/20 dark:border-purple-500/20 shadow-lg shadow-purple-500/10 ${getTimerStyle()}`}
            >
                <div onClick={() => {setSelectedRecipe(recipe)}} className="flex items-center gap-3">
                    <div className="relative">
                        <div className="relative z-10">
                            {timeLeft === 0 ? (
                                <div className="bg-red-500/10 dark:bg-red-500/20 p-2 rounded-full">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                            ) : (
                                <div className="relative w-10 h-10">
                                    <div className="absolute inset-0 rounded-full border-2 border-purple-600/20 dark:border-purple-400/20" />

                                    <motion.div
                                        className="absolute w-[2px] h-[8px] bg-purple-800 dark:bg-purple-300 rounded-full"
                                        style={{
                                            left: '50%',
                                            bottom: '50%',
                                            transformOrigin: 'bottom',
                                            rotate: angles.hours
                                        }}
                                        animate={{ rotate: angles.hours }}
                                        transition={{ duration: 0.5 }}
                                    />

                                    <motion.div
                                        className="absolute w-[1.5px] h-[12px] bg-purple-600 dark:bg-purple-400 rounded-full"
                                        style={{
                                            left: '50%',
                                            bottom: '50%',
                                            transformOrigin: 'bottom',
                                            rotate: angles.minutes
                                        }}
                                        animate={{ rotate: angles.minutes }}
                                        transition={{ duration: 0.5 }}
                                    />

                                    <motion.div
                                        className="absolute w-[1px] h-[14px] bg-purple-500 dark:bg-purple-400 rounded-full"
                                        style={{
                                            left: '50%',
                                            bottom: '50%',
                                            transformOrigin: 'bottom',
                                            rotate: angles.seconds
                                        }}
                                        animate={{ rotate: angles.seconds }}
                                        transition={{ duration: 0.5 }}
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 shadow-sm" />
                                    </div>

                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle
                                            className="text-purple-600/10 dark:text-purple-400/10"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            fill="none"
                                            r="19"
                                            cx="20"
                                            cy="20"
                                        />
                                        <motion.circle
                                            className="text-purple-600 dark:text-purple-400"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            fill="none"
                                            r="19"
                                            cx="20"
                                            cy="20"
                                            strokeLinecap="round"
                                            strokeDasharray={119.4}
                                            strokeDashoffset={119.4 - (timeLeft / totalTime * 119.4)}
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium tabular-nums text-purple-700 dark:text-purple-300">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-xs font-medium truncate max-w-[120px] text-gray-600 dark:text-gray-400">
                            {recipe.name}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 border-l border-purple-100 dark:border-purple-800 pl-3 ml-1">
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPaused(!isPaused);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30 transition-colors"
                    >
                        {isPaused ? (
                            <Play className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                        ) : (
                            <Pause className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                        )}
                    </motion.button>
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
                    >
                        <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </motion.button>
                </div>

                {selectedRecipe && createPortal(
                    <RecipeDetails
                        recipe={selectedRecipe}
                        onClose={handleClosePopup}
                    />,
                    document.getElementById('root')!
                )}
            </motion.div>

            {showReviewModal && (
                <ReviewModal
                    recipe={recipe}
                    onClose={() => {
                        setShowReviewModal(false);
                        if (isClosing || timeLeft === 0) {
                            onClose();
                        }
                    }}
                />
            )}
        </>
    );
};

export default ActiveRecipeTimer;