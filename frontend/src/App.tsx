import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import {UserDetails} from "./pages/UserDetails";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./config/firebaseconfig";

const App: React.FC = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/user" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
                </Route>

                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            </Routes>
        </>
    );
};

export default App;

export const ProtectedRoute = ({ children}: any) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    return children;
};

export const PublicRoute = ({ children }: any) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (user) return <Navigate to="/" replace />;

    return children;
};