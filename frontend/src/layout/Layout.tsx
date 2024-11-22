import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../config/firebaseconfig";
import {UserRound, Settings, ShoppingBag, Star, Utensils, Search} from "lucide-react";
import Button from "@mui/material/Button";
import RecipesIcon from "../assets/RecipesIcon";

const Layout: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
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

    const menuItems = [
        { icon: Star, text: "Favorites", path: "/favorites" },
        { icon: Utensils, text: "Diet and Health", path: "/dietary-preferences" },
        { icon: ShoppingBag, text: "My Items", path: "/pantry" },
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
        <div className="min-h-screen flex flex-col">
            <nav className="bg-gradient-to-br from-blue-200 to-purple-200 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center opacity-75 space-x-2">
                        <RecipesIcon className="fill-pink-700 stroke-pink-700 h-11 w-11"/>
                        <span className="text-xl font-bold text-pink-700">Forks Up!</span>
                    </Link>

                    {/* Center Search Button */}
                    <div className="flex-1 flex justify-center mx-4">
                        <Link to="/search">
                            <Button
                                variant="outlined"
                                className="h-10 px-6 flex items-center space-x-2"
                            >
                                <Search className="w-5 h-5"/>
                                <span>Search Recipes</span>
                            </Button>
                        </Link>
                    </div>

                    {/* User Menu */}
                    <ul className="flex items-center space-x-4">
                        {user ? (
                            <li className="flex flex-row relative">
                                <Button
                                    variant="outlined"
                                    className="h-10"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </Button>
                                <div className="relative group">
                                    <UserRound
                                        className="ml-5 h-10 w-10 p-1 border-2 stroke-blue-500 border-blue-500 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                                    />

                                    {/* Dropdown Menu */}
                                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 transition-all duration-300">
                                        {menuItems.map((item, index) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <Link
                                                    key={index}
                                                    to={item.path}
                                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <IconComponent className="w-5 h-5 mr-3" />
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
                                            className="h-10"
                                        >
                                            Log In
                                        </Button>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/sign-up">
                                        <Button
                                            variant="text"
                                            className="h-10"
                                        >
                                            Sign Up
                                        </Button>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="bg-gradient-to-br from-blue-200 to-purple-200 mt-auto">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Company Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company</h3>
                            <ul className="space-y-2">
                                {footerLinks.company.map((link, index) => (
                                    <li key={index}>
                                        <Link to={link.path} className="text-gray-600 hover:text-gray-900 transition-colors">
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
                                        <Link to={link.path} className="text-gray-600 hover:text-gray-900 transition-colors">
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
                            © {new Date().getFullYear()} Your Company Name. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;