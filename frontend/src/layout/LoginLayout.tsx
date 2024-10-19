import React from "react";
import {ArrowLeft} from "lucide-react";
import {Outlet, useNavigate} from "react-router-dom";

const LoginLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <button
                onClick={handleGoBack}
                className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
            >
                <ArrowLeft className="mr-2"/>
                Back
            </button>
            <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md space-y-4">
                <Outlet/>
            </div>
        </div>
    );
}

export default LoginLayout;