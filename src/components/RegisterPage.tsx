import { useNavigate } from "react-router-dom";
import type { User } from "../context/AuthProvider";
import { useState } from "react";
import constant from "../constant";

const RegisterPage = ({
    showNotification,
    login
} : { 
    showNotification: (message: string, type: "info" | "success" | "error") => void; login: (token: string, userData: User) => void; 
}) => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState<{
        username: string;
        email: string;
        password: string;
    }>({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value});
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(`${constant.uri}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                console.log("Erreur");
                showNotification("An error occured", "error");
            }
            
            const data = await response.json();
            console.log(data)
            login(data.token, data.user);
            showNotification("Registration successfully", "success")
            navigate("/")

        } catch (error) {
            console.log(error)
            showNotification(error.message, "error");
            throw new Error(error.message);
        }
    }
    
    return (
        <div className="login-container">
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username : </label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email : </label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password : </label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-btn">Register</button>
            </form>
        </div>
    )
}

export default RegisterPage