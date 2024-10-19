import GoogleLogin from "../components/GoogleLogin";
import React, { useEffect, useState } from "react";
import EmailLogin from "../components/EmailLogin";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { auth } from "../config/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
    const [message, setMessage] = useState<string>("");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);



    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>

            <EmailLogin setMessage={setMessage}/>

            <div className="text-center space-y-2">
                <Link to="/forgot-password"
                      className="block text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
                    Forgot password?
                </Link>
                <Link to="/sign-up"
                      className="block text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
                    Don't have an account? Sign up
                </Link>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <GoogleLogin setMessage={setMessage}/>

            {message && (
                <div className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md">
                    {message}
                </div>
            )}
        </>
    );
}

export default Login;