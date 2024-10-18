import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    return (
        <>
            <nav className="bg-gradient-to-br from-blue-200 to-purple-200 p-5 pr-64">
                <ul className="flex items-center justify-end space-x-4">
                    <li>
                        <Link to="/login" className="text-black p-3 border border-black pl-5 pr-5">Login</Link>
                    </li>
                    <li>
                        <Link to="/signup" className="text-black p-3 pl-5 pr-5">Sign Up</Link>
                    </li>
                </ul>
            </nav>
            <Outlet/>
        </>
    )
};

export default Layout;
