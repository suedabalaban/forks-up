import {Link, useNavigate} from "react-router-dom";
import EmailSignUp from "../components/EmailSignUp";
import React, {useState} from "react";
import GoogleLogin from "../components/GoogleLogin";
import {ArrowLeft} from "lucide-react";

const SignUp = () => {
    const [message, setMessage] = useState<string>("");
    const navigate = useNavigate(); // useNavigate kancasını kullanarak yönlendirme işlemi

    const handleGoBack = () => {
        navigate("/"); // Ana sayfaya yönlendir
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <button
                onClick={handleGoBack}
                className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
            >
                <ArrowLeft className="mr-2"/> {/* Sol tarafta simge */}
                Back
            </button>
            <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md space-y-6">
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
            </div>

        </div>
    );
}

export default SignUp;