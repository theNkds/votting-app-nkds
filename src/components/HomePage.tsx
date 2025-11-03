import type { Dispatch, SetStateAction } from "react"
import type { Vote } from "../App"
import type { User } from "./Header"
import constant from "../constant"

const HomePage = (
    { 
        votes, 
        error, 
        user, 
        setUser, 
        setVotes, 
        showNotification 
    } : {
        votes: Vote[], 
        error: string, 
        user: User, 
        setUser: Dispatch<SetStateAction<User | null>>, 
        setVotes: Dispatch<SetStateAction<Vote[]>>, 
        showNotification: (message: string, type: "info" | "success" | "error") => void
        }
    ) => {

    const handleVote = async (voteId: string) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${constant.uri}/vote/${voteId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                const error = response.json();
                throw new Error(error.error);
            }

            const data: Promise<{ vote: Vote, user: User}> = response.json();
            setVotes((prev) => 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                prev.map((v) => v._id === data?.vote?._id ? data?.vote : v as any
                )
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUser(data?.user as any);
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error : any) {
            showNotification(error.message, "error")
        }
    }

    return (
        <div className="votes-page">
            {error && (
                <div className="error-message">{error}</div>
            )}
            <div className="votes-grid">
                {
                    votes.map((vote, index) => (
                        <div className="vote-card" key={index}>
                            <h3>{vote.option}</h3>
                            <p className="vote-count">Votes: {vote.votes}</p>
                            <p className="createdBy">Created By {vote.createdBy?.email}</p>
                            <button className={`vote-btn ${!user || user?.votedFor ? "disabled" : "Vote"}`} onClick={() => handleVote(vote?._id)}>
                                {vote._id === user?.votedFor ? "Vote" : "Voted"}
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default HomePage