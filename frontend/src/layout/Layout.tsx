import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../config/firebaseconfig";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LogoutModal from './components/LogoutModal';
import { Recipe } from '../model/Recipe';

const Layout: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
    const [showRecipeDetails, setShowRecipeDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

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