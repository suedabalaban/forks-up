import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../config/firebaseconfig";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LogoutModal from './components/LogoutModal';
import { Recipe } from '../model/Recipe';
import { getRecipeHistory, getLastRecipeFromHistory } from '../api/ForksUpAPI';
import { getPreparationTimeFromTags } from '../utils/preparationTime';

const Layout: React.FC = () => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
    const [showRecipeDetails, setShowRecipeDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                localStorage.setItem('user', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('user');
            }
            setUser(currentUser);
            if (currentUser) {
                checkActiveRecipe();
            }
        });

        return () => unsubscribe();
    }, []);

    const checkActiveRecipe = async () => {
        try {
            const lastRecipe = await getLastRecipeFromHistory();
            if (lastRecipe) {
                const startTime = new Date(lastRecipe.startedAt).getTime();
                const currentTime = new Date().getTime();
                const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

                // Tarifin toplam süresini hesapla
                const preparationTimeStr = getPreparationTimeFromTags(lastRecipe.recipe.tags);
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

                    // Eğer süre dolmamışsa ve 0'dan büyükse timer'ı başlat
                    if (totalSeconds > elapsedSeconds && totalSeconds > 0) {
                        setActiveRecipe(lastRecipe.recipe);
                        localStorage.setItem('activeRecipeTimeLeft', (totalSeconds - elapsedSeconds).toString());
                        localStorage.setItem('activeRecipeStartTime', startTime.toString());
                        localStorage.setItem('activeRecipeId', lastRecipe.recipe.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking active recipe:', error);
        }
    };

    const handleLogoutClick = async () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = async () => {
        try {
            await signOut(auth);
            setIsLogoutModalOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    const handleStartRecipe = (recipe: Recipe) => {
        setActiveRecipe(recipe);
        setShowRecipeDetails(false);
    };

    const handleTimerClick = () => {
        setShowRecipeDetails(true);
    };

    const handleCloseTimer = () => {
        setActiveRecipe(null);
        setShowRecipeDetails(false);
    };

    return (
        <div className="min-h-full flex flex-col">
            <Navbar 
                user={user} 
                handleLogout={handleLogoutClick}
                activeRecipe={activeRecipe}
                onTimerClick={handleTimerClick}
                onCloseTimer={handleCloseTimer}
            />

            <main className="flex-1">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet context={{ onStartRecipe: handleStartRecipe, showRecipeDetails }} />
                </div>
            </main>

            <Footer />

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
};

export default Layout;