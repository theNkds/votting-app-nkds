import React, { createContext, useContext, useEffect, useState } from "react";
import constant from "../constant";

// Définition du type utilisateur (adapte selon ta réponse API)
export interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
    votedFor?: string;
}

// Définition du type de contexte
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const INITIAL_STATE: AuthContextType = {
    user: null,
    loading: true,
    login: () => {},
    logout: () => {},
    setUser: () => {},
}

// Valeur par défaut (undefined pour forcer l'utilisation via provider)
const AuthContext = createContext<AuthContextType>(INITIAL_STATE);


export const AuthProvider = ({ children } : { children : React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const initializeAuth = async () => {
        const token = localStorage.getItem("token");
        console.log("token :", token);

        if (token) {
            try {
                const response = await fetch(`${constant.uri}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Correction de "Autorization"
                },
                });

                if (response.ok) {
                    const userData: User = await response.json();
                    setUser(userData);
                } else {
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Auth initialization error", error);
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        initializeAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
        {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => useContext(AuthContext);
