import "./Chat.css";
import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MyContext } from "./MyContext.jsx";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChats, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);
  const chatEndRef = useRef(null);

  // Type effect
  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      return;
    }

    if (!reply) return;

    const words = reply.split(" ");
    let idx = 0;

    setLatestReply("");

    const interval = setInterval(() => {
      setLatestReply(words.slice(0, idx + 1).join(" "));
      idx++;

      if (idx >= words.length) {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [reply]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [prevChats, latestReply]);

  // Typing check
  const isTyping =
    latestReply !== null &&
    prevChats?.length > 0 &&
    prevChats[prevChats.length - 1]?.role === "assistant";

  // Render user message, including an optional image
  const renderUserMessage = (chat) => (
    <div className="userMessageContainer">
      {chat.image && (
        <img
          className="chatImage"
          src={chat.image}
          alt="Uploaded"
        />
      )}

      {chat.content && (
        <p className="userMessage">{chat.content}</p>
      )}
    </div>
  );

  return (
    <div className="chat">
      {newChats && <h1>Start a New Chat!</h1>}

      {(isTyping ? prevChats.slice(0, -1) : prevChats)?.map(
        (chat, idx) => (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={idx}
          >
            {chat.role === "user" ? (
              renderUserMessage(chat)
            ) : (
              <div className="gptMessage">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {chat.content || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )
      )}

      {isTyping && (
        <div className="gptDiv">
          <div className="gptMessage">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {latestReply || ""}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}

export default Chat;