import "./Sidebar.css";
import { useContext, useEffect, useCallback } from "react";
import { MyContext } from "./MyContext.jsx";
import { v4 as uuidv4 } from "uuid";

// Deployed backend URL
const API_BASE_URL = "https://visionai-backend-61s4.onrender.com";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChats,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  // Fetch all saved conversations
  const getAllThreads = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/thread`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      const data = await response.json();

      const filteredData = data.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);
    } catch (error) {
      console.error("Chat history error:", error);
    }
  }, [setAllThreads]);

  useEffect(() => {
    getAllThreads();
  }, [getAllThreads, currThreadId]);

  // Create a new conversation
  const createNewChat = () => {
    setNewChats(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
  };

  // Open an existing conversation
  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setNewChats(false);
    setPrompt("");
    setReply(null);
    setPrevChats([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/thread/${newThreadId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load this conversation");
      }

      const data = await response.json();

      setPrevChats(data.messages || []);
      setNewChats(false);
    } catch (error) {
      console.error("Open conversation error:", error);
    }
  };

  // Delete a conversation
  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/thread/${threadId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      setAllThreads((previous) =>
        previous.filter(
          (thread) => thread.threadId !== threadId
        )
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (error) {
      console.error("Delete conversation error:", error);
    }
  };

  return (
    <section className="sidebar">
      <button onClick={createNewChat}>
        <img
          src="/Neon_AI_Eye_Emblem.png"
          alt="VisionAI logo"
          className="logo"
        />
        <span className="fa-solid fa-pen-to-square"></span>
      </button>

      <ul className="history">
        {allThreads?.map((thread) => (
          <li
            key={thread.threadId}
            onClick={() => changeThread(thread.threadId)}
            className={
              thread.threadId === currThreadId
                ? "highlighted"
                : ""
            }
          >
            <span>{thread.title}</span>

            <i
              className="fa-solid fa-trash-can"
              onClick={(event) => {
                event.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>Made with ❤️ by Akash shukla</p>
      </div>
    </section>
  );
}

export default Sidebar;