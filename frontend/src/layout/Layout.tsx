import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import {auth} from "../components/firebaseconfig";

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
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    return (
        <>
            <nav className="bg-gradient-to-br from-blue-200 to-purple-200 p-4 pl-5 pr-5">
                <ul className="flex items-center justify-end pr-1">
                    {user ? (
                        <li className="flex flex-row">
                            <button
                                onClick={handleLogout}
                                className="text-black h-10 border border-black pl-5 pr-5 hover:bg-purple-300 transition duration-300"
                            >
                                Log Out
                            </button>

                            <img src={user?.photoURL!} alt="User" className="ml-5 h-10 rounded-full" />

                        </li>
                    ) : (
                        <>
                            <li>
                                <Link to="/login">
                                    <button className="text-black h-10 border border-black pl-5 pr-5 hover:bg-purple-300 transition duration-300"
                                    >
                                        Login
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <Link to="/signup">
                                    <button
                                        className="mr-3 ml-3 text-black h-10 pl-5 pr-5 hover:bg-purple-300 transition duration-300"
                                    >
                                        Sign Up
                                    </button>
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