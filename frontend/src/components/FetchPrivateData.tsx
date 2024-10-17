import React from "react";
import axios from "axios";

interface FetchPrivateDataProps {
    token: string | null;
    setResponse: React.Dispatch<React.SetStateAction<string>>;
}

const FetchPrivateData: React.FC<FetchPrivateDataProps> = ({ token, setResponse }) => {
    const fetchPrivateData = async () => {
        if (!token) {
            setResponse("No token available. Please log in first.");
            return;
        }

        try {
            const res = await axios.get("http://localhost:8080/api/private/forks-up", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setResponse(res.data);
        } catch (error: any) {
            const errorMessage = error.response
                ? `Error: ${error.response.status} - ${error.response.data}`
                : `Network Error: ${error.message}`;
            console.error("Error fetching private data", error);
            setResponse(`Access denied or insufficient permissions: ${errorMessage}`);
        }
    };

    return (
        <button onClick={fetchPrivateData} disabled={!token}>
            Fetch Private Data
        </button>
    );
};

export default FetchPrivateData;
