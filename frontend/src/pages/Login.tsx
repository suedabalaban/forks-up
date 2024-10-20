import GoogleLoginButton from "../components/GoogleLoginButton";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Button from '@mui/material/Button';

const Login = () => {
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Logged in with email:', userCredential.user);
            })
            .catch((error) => {
                console.error('Error during email sign-in:', error);
                setMessage(error.message);
            });
    };

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>

            <form onSubmit={handleEmailLogin} className="space-y-4">

                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    variant={"contained"}
                    endIcon={<ArrowRight />}
                    className="w-full text-white py-2 px-4"
                >
                    Login
                </Button>
            </form>

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

            <GoogleLoginButton setMessage={setMessage}/>

            {message && (
                <div className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md">
                    {message}
                </div>
            )}
        </>
    );
}

export default Login;