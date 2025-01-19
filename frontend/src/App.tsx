import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import React, {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./config/firebaseconfig";
import LoginLayout from "./layout/LoginLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SearchRecipes from "./pages/SearchRecipes";
import Loading from "./pages/Loading";
import UserFavorites from "./pages/UserFavorites";
import UserIngredients from "./pages/Pantry";
import DietaryPreferences from "./pages/DietaryPreferences";
import {registerOrUpdateUser} from "./api/ForksUpAPI";
import Settings from "./pages/Settings";
import {ThemeProvider} from "./context/ThemeContext";
import RecipeHistory from "./pages/RecipeHistory";

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser?.uid !== user?.uid) {  // Only update if user has changed
                setUser(currentUser);
                if (currentUser) {
                    try {
                        await registerOrUpdateUser(currentUser);
                    } catch (e) {
                        console.error('Error registering or updating user:', e);
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <ThemeProvider>
            <Routes>

                <Route path="/" element={<Layout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/user" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                    <Route path="/search" element={<ProtectedRoute><SearchRecipes/></ProtectedRoute>}/>
                    <Route path="/favorites" element={<ProtectedRoute><UserFavorites/></ProtectedRoute>}/>
                    <Route path="/pantry" element={<ProtectedRoute><UserIngredients/></ProtectedRoute>}/>
                    <Route path="/dietary-preferences"
                           element={<ProtectedRoute><DietaryPreferences/></ProtectedRoute>}/>
                    <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
                    <Route path="/history" element={<ProtectedRoute><RecipeHistory/></ProtectedRoute>}/>

                </Route>

                <Route path="/" element={<PublicRoute><LoginLayout/></PublicRoute>}>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                </Route>

                <Route path="/">
                </Route>

            </Routes>
        </ThemeProvider>
    );
};

export default App;

export const ProtectedRoute = ({children}: any) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <Loading/>;

    if (!user) return <Navigate to="/login" replace/>;

    return children;
};

export const PublicRoute = ({children}: any) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <Loading/>;

    if (user) return <Navigate to="/" replace/>;

    return children;
};