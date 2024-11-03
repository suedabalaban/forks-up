import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "../config/firebaseconfig";
import {UserRound, Settings, ShoppingBag, Star, Utensils} from "lucide-react";
import Button from "@mui/material/Button";

const Layout: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
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

    return (
        <>
            <nav className="bg-gradient-to-br from-blue-200 to-purple-200 p-4 pl-5 pr-5">
                <ul className="flex items-center justify-end pr-1">
                    {user ? (
                        <li className="flex flex-row relative">
                            <Button
                                variant={"outlined"}
                                className={"h-10"}
                                onClick={handleLogout}
                            >
                                Log Out
                            </Button>
                            <div
                                className="relative group"
                            >
                                {user.photoURL && user.photoURL !== "" ? (
                                    <img
                                        src={user.photoURL}
                                        alt="User"
                                        className="ml-5 h-10 w-10 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                ) : (
                                    <UserRound className="ml-5 h-10 w-10 p-1 border-2 border-black rounded-full cursor-pointer hover:opacity-90 transition-opacity" />
                                )}

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
                                <Link to="/login" className={"mr-3"}>
                                    <Button
                                        variant={"outlined"}
                                        className={"h-10"}
                                    >
                                        Log In
                                    </Button>
                                </Link>
                            </li>
                            <li>
                                <Link to="/sign-up" className={"mr-3"}>
                                    <Button
                                        variant={"text"}
                                        className={"h-10"}
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
            <Outlet />
        </>
    );
};

export default Layout;