import {Link, useSearchParams, useNavigate} from "react-router-dom";
import React, {useState, useEffect} from "react";
import {ArrowRight, Lock} from "lucide-react";
import Button from "@mui/material/Button";
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

const ForgotPassword = () => {
    const [message, setMessage] = useState<string>("");
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState<string>("");
    const navigate = useNavigate();

    const oobCode = searchParams.get("oobCode");
    const auth = getAuth();

    useEffect(() => {
        if (oobCode) {
            verifyPasswordResetCode(auth, oobCode)
                .then((email) => setEmail(email))
                .catch((error) => {
                    setMessage("Invalid or expired reset link. Please try again.");
                });
        }
    }, [oobCode, auth]);

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        if (oobCode) {
            try {
                await confirmPasswordReset(auth, oobCode, password);
                setMessage("Password reset successful!");
                setTimeout(() => navigate("/login"), 2000);
            } catch (error) {
                setMessage("Failed to reset password. Please try again.");
            }
        } else {
            setMessage("Invalid reset link. Please try again.");
        }
    }

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Reset Password</h2>
            {email && (
                <p className="text-center text-gray-600 mt-2">
                    Reset password for: <strong>{email}</strong>
                </p>
            )}
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your new password"
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
                        placeholder="Confirm your new password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<ArrowRight/>}
                    className="w-full text-white py-2 px-4"
                >
                    Reset Password
                </Button>
            </form>

            {message && (
                <div className={`mt-4 text-center p-2 rounded-md ${
                    message.includes("successful") ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"
                }`}>
                    {message}
                </div>
            )}

            <div className="text-center flex flex-row justify-center space-x-1.5 mt-4">
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