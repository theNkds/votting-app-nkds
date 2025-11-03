import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { io, Socket } from "socket.io-client";
import constant from "./constant";
import { useUserContext } from "./context/AuthProvider";
import { Navigate, Route, Routes } from "react-router-dom";
import Header, { type User } from "./components/Header";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminPanel from "./components/AdminPanel";

// Type d’un vote (selon ton exemple)
export interface Vote {
  _id: string;
  option: string;
  votes: number;
  createdBy: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Type pour les notifications
export interface Notification {
  show: boolean;
  message: string;
  type: "info" | "success" | "error";
}

function App() {
  const { user, login, logout, setUser } = useUserContext();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [notification, setNotification] = useState<Notification>({
    show: true,
    message: "",
    type: "info",
  });

  // Instance socket.io
  const socket: Socket = io(constant.uri, {
    transports: ["websocket"],
    withCredentials: true,
  });

  const fetchVotes = async () => {
    try {
      const response = await fetch(`${constant.uri}/votes`);

      if (!response.ok) throw new Error("Failed to fetch votes");

      const data: Vote[] = await response.json();
      setVotes(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();

    // Écoute des événements socket.io (si besoin plus tard)
    socket.on("voteUpdated", (updatedVote: Vote) => {
      setVotes((prevVotes) =>
        prevVotes.map((v) => (v._id === updatedVote._id ? updatedVote : v))
      );

      showNotification("Vote Updated","success");
      
    });
    
    socket.on("voteCreated", (newVote: Vote) => {
      setVotes((prev) => [...prev, newVote]);
      
      showNotification("Vote Created","success");
      
    });
    
    socket.on("voteDeleted", (voteId: string) => {
      setVotes((prev) => prev.filter((item) => item._id !== voteId));
      
      showNotification("Vote Deleted","success");

    });

    // Cleanup socket à la destruction du composant
    return () => {
      socket.off("voteUpdated");
      socket.off("voteCreated");
      socket.off("voteDeleted");
    };
  }, [socket]);

  const showNotification = (message: string, type: "info" | "success" | "error") => {
    setNotification({
      message,
      type,
      show: true
    });

    setTimeout(() => {
      setNotification({...notification, show: false})
    }, 3000);
  }

  if (isLoading) {
    return (
      <div className="loading">Loading...</div>
    )
  }

  return (
    <div className="app-container">
      <Header user={user as User} logout={logout} showNotification={showNotification} /> 

      <main className="main-content">
        <Routes>
          <Route path="/" element={
              <HomePage 
                votes={votes}
                error={error}
                user={user as User}
                setUser={setUser as Dispatch<SetStateAction<User | null>>}
                setVotes={setVotes}
                showNotification={showNotification}
              />
            } 
          />
          <Route path="/login" element={
            user?.role === "admin" ? 
              <Navigate to={"/admin"} /> :
                user ? <Navigate to={"/"} />
              :
              <LoginPage 
                showNotification={showNotification}
                login={login}
              />
            } 
          />
          <Route path="/register" element={
            user ?
              <Navigate to={"/"} /> 
                :
              <RegisterPage login={login} showNotification={showNotification} /> 
            } 
          />
          {
            user?.role === "admin" && (
              <Route path="/admin" element={
                <AdminPanel 
                  votes={votes}
                  setVotes={setVotes}
                  showNotification={showNotification}
                />
                } 
              />
            )
          }
        </Routes>
      </main>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;
