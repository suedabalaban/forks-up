import React, {useState} from "react";
import SendResetLink from "../components/SendResetLink";
import {Link} from "react-router-dom";


const ForgotPassword = () => {
    const [message, setMessage] = useState<string>("");

    return (
        <>
            <h2 className="text-3xl font-bold text-center text-gray-800">Reset Password</h2>

            <SendResetLink setMessage={setMessage}/>

            {message && (
                <div className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md">
                    {message}
                </div>
            )}

            <div className="text-center flex flex-row justify-center space-x-1.5">
                <h1 className="">
                    Remember the password?
                </h1>
                <Link to="/sign-up"
                      className="block text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
                    Sign in
                </Link>
            </div>
        </>
    )
}

export default ForgotPassword;