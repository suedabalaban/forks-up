import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Moon, Sun, Search, UserRound, Settings, ShoppingBag, Star, Utensils } from 'lucide-react';
import Button from '@mui/material/Button';
import RecipesIcon from '../../assets/RecipesIcon';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
    user: User | null;
    handleLogout: () => Promise<void>;
}

const menuItems = [
    { icon: UserRound, text: 'Profile', path: '/user' },
    { icon: Star, text: 'Favorites', path: '/favorites' },
    { icon: ShoppingBag, text: 'Pantry', path: '/pantry' },
    { icon: Utensils, text: 'Dietary Preferences', path: '/dietary-preferences' },
    { icon: Settings, text: 'Settings', path: '/settings' },
];

const Navbar: React.FC<NavbarProps> = ({ user, handleLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center space-x-3 text-purple-700 hover:opacity-90 transition-opacity"
                        >
                            <RecipesIcon className="fill-purple-700 stroke-purple-700 h-11 w-11"/>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
                                    Forks Up!
                                </span>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-xl px-8">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search recipes..."
                                className="w-full px-4 py-2 pr-12 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Search size={20}/>
                            </button>
                        </form>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative group">
                                <div className="flex items-center space-x-3 cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <span className="text-purple-600 dark:text-purple-300 font-medium">
                                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 transition-all duration-200 border border-gray-100 dark:border-gray-700">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    {menuItems.map((item, index) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <Link
                                                key={index}
                                                to={item.path}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <IconComponent className="w-4 h-4 mr-3 stroke-purple-600 dark:stroke-purple-400"/>
                                                <span>{item.text}</span>
                                            </Link>
                                        );
                                    })}
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun className="w-4 h-4 mr-3 text-yellow-500" />
                                                <span>Light Mode</span>
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="w-4 h-4 mr-3 text-gray-500" />
                                                <span>Dark Mode</span>
                                            </>
                                        )}
                                    </button>
                                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login">
                                    <Button
                                        variant="outlined"
                                        className="!text-purple-600 dark:!text-purple-400 !border-purple-600 dark:!border-purple-400 hover:!bg-purple-50 dark:hover:!bg-purple-900/20"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        variant="contained"
                                        className="!bg-purple-600 dark:!bg-purple-500 hover:!bg-purple-700 dark:hover:!bg-purple-600 !text-white"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
