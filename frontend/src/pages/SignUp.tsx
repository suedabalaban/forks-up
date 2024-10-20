import {Link} from "react-router-dom";
import React, {useState} from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import {ArrowRight, Lock, Mail} from "lucide-react";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {auth} from "../config/firebaseconfig";
import Button from "@mui/material/Button";

const SignUp = () => {
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('User created:', userCredential.user);
            })
            .catch((error) => {
                console.error('Error during sign-up:', error);
                setMessage(error.message);
            });
    };

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
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
                    Sign Up with Email
                </Button>
            </form>

            <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
                    Already have an account? Login
                </Link>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
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

export default SignUp;