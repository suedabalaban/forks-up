import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Moon, Sun, Search, UserRound, Settings, ShoppingBag, Star, Heart, History } from 'lucide-react';
import Button from '@mui/material/Button';
import RecipesIcon from '../../assets/RecipesIcon';
import { useTheme } from '../../context/ThemeContext';
import { Recipe } from '../../model/Recipe';
import ActiveRecipeTimer from "../../components/ActiveRecipeTimer";
import { useTranslation } from 'react-i18next';
import {getAvatar} from "../../api/UserAPI";

interface NavbarProps {
    user: User | null;
    handleLogout: () => Promise<void>;
    activeRecipe: Recipe | null;
    onTimerClick: () => void;
    onCloseTimer: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, handleLogout, activeRecipe, onTimerClick, onCloseTimer }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const tooltipTimer = React.useRef<NodeJS.Timeout>();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAvatar = async () => {
            if (user) {
                try {
                    const avatarData = await getAvatar();
                    if (avatarData) {
                        const blob = new Blob([avatarData], { type: 'image/jpeg' });
                        const imageUrl = URL.createObjectURL(blob);
                        setAvatar(imageUrl);
                    }
                } catch (error) {
                    console.error('Error fetching avatar:', error);
                }
            }
        };

        fetchAvatar();
    }, [user]);

    const handleMouseEnter = () => {
        tooltipTimer.current = setTimeout(() => {
            setShowTooltip(true);
        }, 350);
    };

    const handleMouseLeave = () => {
        if (tooltipTimer.current) {
            clearTimeout(tooltipTimer.current);
        }
        setShowTooltip(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            const searchParams = new URLSearchParams();
            searchParams.append('q', searchTerm.trim());
            if (isPersonalized) {
                searchParams.append('personalized', 'true');
            }
            navigate(`/search?${searchParams.toString()}`);
        }
    };

    const menuItems = [
        { icon: UserRound, text: t('navbar.menu.profile'), path: '/user' },
        { icon: ShoppingBag, text: t('navbar.menu.pantry'), path: '/pantry' },
        { icon: Star, text: t('navbar.menu.favorites'), path: '/favorites' },
        { icon: History, text: t('navbar.menu.history'), path: '/history' },
        { icon: Settings, text: t('navbar.menu.settings'), path: '/settings' },
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center space-x-3 text-purple-700 hover:opacity-90 transition-opacity"
                        >
                            <RecipesIcon className="fill-purple-700 stroke-purple-700 h-12 w-12"/>
                            <span className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
                                Forks Up!
                            </span>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-xl px-10">
                        <form onSubmit={handleSearch} className="relative flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('navbar.search.placeholder')}
                                    className="w-full px-5 py-2.5 pr-14 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Search size={22}/>
                                </button>
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsPersonalized(!isPersonalized)}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    className={`px-5 py-2.5 rounded-full transition-all transform hover:scale-105 flex items-center gap-2 ${
                                        isPersonalized
                                            ? 'bg-gradient-to-r from-purple-700 to-blue-600 text-white shadow-lg'
                                            : 'bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Heart
                                        className={`w-6 h-6 transition-colors ${
                                            isPersonalized
                                                ? 'fill-white stroke-white'
                                                : 'fill-none stroke-current'
                                        }`}
                                    />
                                    {t('navbar.search.forYou')}
                                </button>

                                {showTooltip && (
                                    <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg whitespace-normal w-80 shadow-lg z-50">
                                        <div className="relative">
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 transform -rotate-45 w-3 h-3 bg-gray-900"></div>
                                            <div className="space-y-2">
                                                <p className="flex items-center gap-2">
                                                    <span>🎯</span>
                                                    <span>{t('navbar.search.personalizationTooltip.title1')}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span>🥘</span>
                                                    <span>{t('navbar.search.personalizationTooltip.title2')}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span>🧺</span>
                                                    <span>{t('navbar.search.personalizationTooltip.title3')}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center space-x-6">
                        {activeRecipe && (
                            <ActiveRecipeTimer
                                recipe={activeRecipe}
                                onTimerClick={onTimerClick}
                                onClose={onCloseTimer}
                            />
                        )}
                        {user ? (
                            <div className="relative group">
                                <div className="flex items-center space-x-3 cursor-pointer">
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-900 flex items-center justify-center shadow-md">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-purple-600 dark:text-purple-300 font-medium text-lg">
                                                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 mt-3 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 transition-all duration-200 border border-gray-100 dark:border-gray-700">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    {menuItems.map((item, index) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <Link
                                                key={index}
                                                to={item.path}
                                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <IconComponent className="w-5 h-5 mr-3 stroke-purple-600 dark:stroke-purple-400"/>
                                                <span>{item.text}</span>
                                            </Link>
                                        );
                                    })}
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun className="w-5 h-5 mr-3 text-yellow-500" />
                                                <span>{t('navbar.menu.lightMode')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="w-5 h-5 mr-3 text-gray-500" />
                                                <span>{t('navbar.menu.darkMode')}</span>
                                            </>
                                        )}
                                    </button>
                                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        >
                                            {t('navbar.menu.logout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login">
                                    <Button
                                        variant="outlined"
                                        className="!text-purple-600 dark:!text-purple-400 !border-purple-600 dark:!border-purple-400 hover:!bg-purple-50 dark:hover:!bg-purple-900/20 !px-6 !py-2 !rounded-full !transition-all !duration-300"
                                    >
                                        {t('navbar.auth.login')}
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        variant="contained"
                                        className="!bg-purple-600 dark:!bg-purple-500 hover:!bg-purple-700 dark:hover:!bg-purple-600 !text-white !px-6 !py-2.5 !rounded-full !transition-all !duration-300"
                                    >
                                        {t('navbar.auth.signup')}
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