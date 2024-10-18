import GoogleLogin from "../components/GoogleLogin";
import React, { useEffect, useState } from "react";
import EmailLogin from "../components/EmailLogin";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { auth } from "../components/firebaseconfig";
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

    const handleGoBack = () => {
        navigate("/");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <button
                onClick={handleGoBack}
                className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
            >
                <ArrowLeft className="mr-2"/>
                Back
            </button>
            <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>

                <EmailLogin setMessage={setMessage}/>

                <div className="text-center">
                    <Link to="/signup"
                          className="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
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
            </div>
        </div>
    );
}

export default Login;