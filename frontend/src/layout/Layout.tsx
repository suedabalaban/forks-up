import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import {auth} from "../config/firebaseconfig";
import {UserRound} from "lucide-react";
import Button from "@mui/material/Button";

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

    return (
        <>
            <nav className="bg-gradient-to-br from-blue-200 to-purple-200 p-4 pl-5 pr-5">
                <ul className="flex items-center justify-end pr-1">
                    {user ? (
                        <li className="flex flex-row">
                            <Button
                                variant={"outlined"}
                                className={"h-10"}
                                onClick={handleLogout}
                            >
                                Log Out
                            </Button>
                            {
                                user.photoURL ?
                                    <img src={user?.photoURL!} alt="User" className="ml-5 h-10 rounded-full"/>
                                    :
                                    <UserRound className="ml-5 h-10 w-10 p-1  border-2 border-black rounded-full"/>

                            }
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