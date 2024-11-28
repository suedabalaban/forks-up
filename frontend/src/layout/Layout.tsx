import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../config/firebaseconfig";
import {UserRound, Settings, ShoppingBag, Star, Utensils, Search} from "lucide-react";
import Button from "@mui/material/Button";
import RecipesIcon from "../assets/RecipesIcon";

const Layout: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            try {
                await signOut(auth);
                navigate('/');
            } catch (error) {
                console.error('Error signing out: ', error);
            }
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const menuItems = [
        { icon: Star, text: "Favorites", path: "/favorites" },
        { icon: Utensils, text: "Diet and Health", path: "/dietary-preferences" },
        { icon: ShoppingBag, text: "My Pantry", path: "/pantry" },
        { icon: Settings, text: "Settings", path: "/settings" },
    ];

    const footerLinks = {
        company: [
            { text: "About Us", path: "/about" },
            { text: "Contact", path: "/contact" },
            { text: "Careers", path: "/careers" },
        ],
        legal: [
            { text: "Privacy Policy", path: "/privacy" },
            { text: "Terms of Service", path: "/terms" },
            { text: "Cookie Policy", path: "/cookies" },
        ],
        social: [
            { text: "Instagram", path: "https://instagram.com" },
            { text: "Twitter", path: "https://twitter.com" },
            { text: "Facebook", path: "https://facebook.com" },
        ],
    };

    return (
        <div className="flex flex-col">
            <nav className="bg-white shadow-md relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Search Form */}
                        <div className="flex-1 flex items-center justify-between gap-8">
                            <Link 
                                to="/" 
                                className="flex items-center space-x-3 text-purple-700 hover:opacity-90 transition-opacity"
                            >
                                <RecipesIcon className="fill-purple-700 stroke-purple-700 h-11 w-11"/>
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
                                    Forks Up!
                                </span>
                            </Link>

                            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search recipes..."
                                        className="w-full px-4 py-2 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 placeholder-gray-400 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-gray-100"
                                    >
                                        <Search size={20}/>
                                    </button>
                                </div>
                            </form>
                            
                            {/* User Menu */}
                            <ul className="flex items-center space-x-4">
                                {user ? (
                                    <li className="flex items-center space-x-4">
                                        <Button
                                            variant="outlined"
                                            className="h-9 normal-case text-purple-700 border-purple-700 hover:bg-purple-50"
                                            onClick={handleLogout}
                                        >
                                            Log Out
                                        </Button>
                                        <div className="relative group">
                                            <div className="flex items-center space-x-2 cursor-pointer">
                                                <UserRound
                                                    className="h-9 w-9 p-1.5 stroke-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
                                                />
                                            </div>

                                            {/* Dropdown Menu */}
                                            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 transition-all duration-200 border border-gray-100">
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                {menuItems.map((item, index) => {
                                                    const IconComponent = item.icon;
                                                    return (
                                                        <Link
                                                            key={index}
                                                            to={item.path}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                                                        >
                                                            <IconComponent className="w-4 h-4 mr-3 stroke-purple-600"/>
                                                            <span>{item.text}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link to="/login">
                                                <Button
                                                    variant="outlined"
                                                    className="h-9 normal-case text-purple-700 border-purple-700 hover:bg-purple-50"
                                                >
                                                    Log In
                                                </Button>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/signup">
                                                <Button
                                                    variant="contained"
                                                    className="h-9 normal-case bg-purple-700 hover:bg-purple-800"
                                                >
                                                    Sign Up
                                                </Button>
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="bg-gray-50 flex-grow min-h-[52rem]">
                <Outlet/>
            </main>

            <footer className="bg-gradient-to-br from-blue-200 to-purple-200">
                <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Company Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company</h3>
                            <ul className="space-y-2">
                                {footerLinks.company.map((link, index) => (
                                    <li key={index}>
                                        <Link to={link.path}
                                              className="text-gray-600 hover:text-gray-900 transition-colors">
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal</h3>
                            <ul className="space-y-2">
                                {footerLinks.legal.map((link, index) => (
                                    <li key={index}>
                                        <Link to={link.path}
                                              className="text-gray-600 hover:text-gray-900 transition-colors">
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Social</h3>
                            <ul className="space-y-2">
                                {footerLinks.social.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-center text-gray-500">
                            &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;