import {auth} from "../components/firebaseconfig";

export const UserDetails = () => {
    return (
            <div>
                <p>User Details: {auth.currentUser?.email}</p>
            </div>
    );
}