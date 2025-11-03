import { Link, useNavigate } from "react-router-dom";

// Type d’un utilisateur (extrait de ton AuthProvider)
export interface User {
    _id: string;
    username: string;
    email: string;
    password?: string;
    role?: "admin" | "user";
    createdAt?: string;
    updatedAt?: string;
    votedFor?: string;
}
const Header = ({ user, logout, showNotification } : { user: User | null, logout: () => void, showNotification: (message: string, type: "info" | "success" | "error") => void}) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        showNotification("Logout successfully", "success");
        navigate("/login");
    }

    return (
        <header className="app-header">
            <h1 className="logo">
                <Link to="/">Real Time Voting App</Link>
            </h1>

            <div className="auth-info">
                {
                    user?._id ? (
                        <>
                            <span className="user-email">
                                <span className="welcome">Welcome,</span>
                                {user?.username}
                            </span>
                            {user?.role === "admin" && <Link to={"/admin"} className="auth-link admin-link">Admin</Link>}

                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        </>
                    ) : 
                    <>
                        <Link to={"login"} className="auth-link">
                            Login
                        </Link>
                        <Link to={"register"} className="auth-link">
                            Register
                        </Link>
                    </>
                }
            </div>
        </header>
    )
}

export default Header