import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useContext, useState, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setCurrThreadId,
    setPrevChats,
    setNewChats,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsopen] = useState(false);

  // Attachment menu
  const [showMenu, setShowMenu] = useState(false);

  // Selected original image file
  const [selectedImage, setSelectedImage] = useState(null);

  // Small preview image
  const [imagePreview, setImagePreview] = useState(null);

  // Hidden file input
  const fileInputRef = useRef(null);

  // Create small image preview
  // This preview will also be saved in MongoDB

  const createImageThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);

      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxSize = 400;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

        URL.revokeObjectURL(objectUrl);

        resolve(thumbnail);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to create image preview"));
      };

      img.src = objectUrl;
    });
  };

  // NORMAL CHAT

  const getReply = async () => {
    if (!prompt.trim()) {
      return;
    }

    const currentPrompt = prompt;

    // User message
    setPrevChats((prev) => [
      ...prev,
      {
        role: "user",
        content: currentPrompt,
      },
    ]);

    setNewChats(false);
    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentPrompt,
          threadId: currThreadId,
        }),
      });

      const res = await response.json();

      console.log("Normal Chat Response:", res);

      if (!response.ok) {
        console.error("Backend Error:", res);
        return;
      }

      setReply(res.reply);

      setPrevChats((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
        },
      ]);

      if (res.threadId) {
        setCurrThreadId(res.threadId);
      }
    } catch (error) {
      console.error("Error fetching reply:", error);
    } finally {
      setLoading(false);
    }
  };

  // VISION CHAT

  const getVisionReply = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    if (!prompt.trim()) {
      alert("Please enter a question about the image.");
      return;
    }

    const currentPrompt = prompt;

    // User Vision message
    // imagePreview is saved along with message
    setPrevChats((prev) => [
      ...prev,
      {
        role: "user",
        content: currentPrompt,
        image: imagePreview,
      },
    ]);

    setNewChats(false);
    setPrompt("");
    setLoading(true);

    try {
      const formData = new FormData();

      // Question
      formData.append("message", currentPrompt);

      // Original image
      formData.append("image", selectedImage);

      // Small thumbnail for chat/history
      formData.append("imagePreview", imagePreview);

      // Thread ID
      formData.append("threadId", currThreadId);

      const response = await fetch("http://localhost:8080/api/vision", {
        method: "POST",
        body: formData,
      });

      const res = await response.json();

      console.log("Vision Response:", res);

      if (!response.ok) {
        console.error("Vision Backend Error:", res);
        return;
      }

      // Gemini reply
      setReply(res.reply);

      // Assistant message
      setPrevChats((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
        },
      ]);

      // Update thread ID
      if (res.threadId) {
        setCurrThreadId(res.threadId);
      }

      // Clear image after successful request
      setSelectedImage(null);
      setImagePreview(null);
      setShowMenu(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Vision Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Profile //

  const handleProfileClick = () => {
    setIsopen(!isOpen);
  };

  // Attachment Button //

  const handlePlusClick = () => {
    setShowMenu(!showMenu);
  };

  // Upload Image//

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Image Selected //

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Image check
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10 MB.");
      return;
    }

    try {
      // Original image
      setSelectedImage(file);

      // Small preview
      const thumbnail = await createImageThumbnail(file);

      setImagePreview(thumbnail);

      // Close menu
      setShowMenu(false);

      console.log("Selected Image:", file);
    } catch (error) {
      console.error("Image Preview Error:", error);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Remove Image //

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send//

  const handleSend = () => {
    if (selectedImage) {
      getVisionReply();
    } else {
      getReply();
    }
  };

  return (
    <div className="chatWindow">
      {/* Navbar */}
      <div className="navbar">
        <span>
          VisionAI <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i>
            Settings
          </div>

          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Upgrade Plan
          </div>

          <div className="dropDownItem">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Log out
          </div>
        </div>
      )}

      {/* Chat */}
      <Chat />

      {/* Loader */}
      <div className="loader">
        <ScaleLoader
          color="#fff"
          loading={loading}
          height={25}
          width={5}
          radius={2}
          margin={2}
        />
      </div>

      {/* Input */}
      <div className="chatInput">
        <div className="inputBox">
          {/* Attachment Button */}
          <div
            className="plusButton"
            onClick={handlePlusClick}
            title="Attach Image"
          >
            <i className="fa-solid fa-paperclip"></i>
          </div>

          {/* Attachment Menu */}
          {showMenu && (
            <div className="plusMenu">
              <div className="plusMenuItem" onClick={handleImageClick}>
                <i className="fa-regular fa-image"></i>

                <span>Upload Image</span>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{
              display: "none",
            }}
            onChange={handleImageChange}
          />

          {/* Image Preview */}
          {selectedImage && imagePreview && (
            <div className="imagePreview">
              <img src={imagePreview} alt="Selected" />

              <button
                type="button"
                className="removeImage"
                onClick={removeSelectedImage}
                title="Remove image"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Input */}
          <input
            placeholder={
              selectedImage ? "Ask about this image..." : "Ask anything"
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          {/* Send */}
          <div id="submit" onClick={handleSend} title="Send">
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>

        <p className="info">
          ChatGPT can make mistakes. Check important info. See cookie
          Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
