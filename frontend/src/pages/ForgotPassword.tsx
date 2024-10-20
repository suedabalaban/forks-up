import React, {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowRight, Mail} from "lucide-react";
import {sendPasswordResetEmail} from "firebase/auth";
import {auth} from "../config/firebaseconfig";
import Button from "@mui/material/Button";


const ForgotPassword: React.FC = () => {
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset link sent. Check your email.");
            setEmail('');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                setMessage("No user found with this email address.");
            } else if (error.code === 'auth/invalid-email') {
                setMessage("Invalid email address. Please check and try again.");
            } else {
                setMessage("An error occurred. Please try again later.");
            }
            console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Reset Password</h2>

            <form onSubmit={handlePasswordReset} className="space-y-4">
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

                <Button
                    type="submit"
                    variant={"contained"}
                    className="w-full h-10 text-white"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
            </form>

            {message && (
                <div className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md">
                    {message}
                </div>
            )}

            <div className="text-center flex flex-row justify-center space-x-1.5">
                <h1 className="">
                    Remember the password?
                </h1>
                <Link to="/login"
                      className="block text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
                    Sign in
                </Link>
            </div>
        </>
    )
}

export default ForgotPassword;