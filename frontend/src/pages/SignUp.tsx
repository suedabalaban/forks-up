import {Link} from "react-router-dom";
import EmailSignUp from "../components/EmailSignUp";
import React, {useState} from "react";
import GoogleLogin from "../components/GoogleLogin";

const SignUp = () => {
    const [message, setMessage] = useState<string>("");

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>

            <EmailSignUp setMessage={setMessage}/>

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

            <GoogleLogin setMessage={setMessage}/>

            {message && (
                <div className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md">
                    {message}
                </div>
            )}
        </>
    );
}

export default SignUp;