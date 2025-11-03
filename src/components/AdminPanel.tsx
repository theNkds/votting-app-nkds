import { useState, type Dispatch, type SetStateAction } from "react"
import type { Vote } from "../App"
import constant from "../constant";

const AdminPanel = (
    { 
        votes, 
        setVotes, 
        showNotification 
    } : {
        votes: Vote[], 
        setVotes: Dispatch<SetStateAction<Vote[]>>, 
        showNotification: (message: string, type: "info" | "success" | "error") => void
    }
) => {

    const [newOption, setNewOption] = useState("");

    const handleAddOption = async () => {
        if (!newOption?.trim()) return showNotification("the option is empty", "info");

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${constant.uri}/votes`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    option: newOption
                })
            });

            if (!response.ok) return showNotification("Failed to add option", "error");

            const data = await response.json();

            setVotes([...votes, data]);
            setNewOption("");
            showNotification("Option added successfully", "success");
        } catch (error) {
            showNotification(error.message, "error");
        }
    }

    const handleDeleteOption = async (voteId: string) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${constant.uri}/vote/${voteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) return showNotification("Failed to add option", "error");

            setVotes(votes?.filter((vote) => vote._id !== voteId));
            showNotification("Option deleted Successfully", "success");
        } catch (error) {
            showNotification(error.message, "error");
        }
    }

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div className="add-option-form">
                <input 
                    type="text" 
                    value={newOption} 
                    onChange={(e) => setNewOption(e.target.value)} 
                    placeholder="New voting option"
                />
                <button onClick={handleAddOption}>Add new option</button>
            </div>
            <div className="current-options">
                <h3>Current Option</h3>
                {votes.map((vote, index) => (
                    <div className="option-item" key={index}>
                        <span>{vote.option}</span>
                        <span>Votes : {vote.votes}</span>
                        <button className="delete-btn" onClick={() => handleDeleteOption(vote._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminPanel