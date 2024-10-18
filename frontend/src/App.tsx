import { Route, Routes} from "react-router-dom";
import Login from "./pages/Login";
import {Home} from "./pages/Home";
import Layout from "./layout/layout";
import {UserDetails} from "./pages/UserDetails";
import SignUp from "./pages/SignUp";

const App: React.FC = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/user" element={<UserDetails />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </>
    );
};

export default App;
