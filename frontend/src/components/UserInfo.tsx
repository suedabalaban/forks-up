import React from "react";
import { getAuth, User } from "firebase/auth";

const UserInfo: React.FC<{ user: User | null }> = ({ user }) => {
    const auth = getAuth();

    return (
        <div>
            <h2>Welcome, {user?.email}!</h2>
            <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
    );
};

export default UserInfo;
