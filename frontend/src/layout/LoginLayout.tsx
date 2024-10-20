import React from "react";
import {ArrowLeft} from "lucide-react";
import {Outlet, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";

const LoginLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">

            <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md space-y-4">
                <Button
                    onClick={handleGoBack}
                    variant="text"
                    startIcon={<ArrowLeft />}
                >
                    Back
                </Button>
                <Outlet/>
            </div>
        </div>
    );
}

export default LoginLayout;