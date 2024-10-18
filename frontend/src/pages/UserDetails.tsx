import {auth} from "../components/firebaseconfig";
import {Navigate, useNavigate} from "react-router-dom";

export const UserDetails = () => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/");
        }).catch((error) => {
            console.error('Sign-out error:', error);
        });
    };

    return (
        auth.currentUser ?
            <div>
                <p>User Details: {auth.currentUser.email}</p>
                <button onClick={handleSignOut}>Sign Out</button>
            </div>
            :
            <Navigate to={"/"} />
    );
}