import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import {UserDetails} from "./pages/UserDetails";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./config/firebaseconfig";
import LoginLayout from "./layout/LoginLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import axios from "axios";

const App: React.FC = () => {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                console.log(currentUser.metadata.creationTime);
                console.log(currentUser.metadata.lastSignInTime);
                 if (currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime) {
                     try {

                         axios.put("http://localhost:8080/api/user", null , {
                             headers: {
                                 "Authorization": `Bearer ${auth.currentUser?.getIdToken()}`
                             }
                         })
                     } catch (e) {
                         console.error(e);
                     }
                 }
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <>
            <Routes>

                <Route path="/" element={<Layout />} >
                    <Route path="/" element={<Home />} />
                    <Route path="/user" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
                </Route>

                <Route path="/" element={<PublicRoute><LoginLayout/></PublicRoute>} >
                    <Route path="/login" element={<Login />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                <Route path="/">
                </Route>

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