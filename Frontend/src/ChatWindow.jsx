
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useContext, useState, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import { ScaleLoader } from "react-spinners";

// Live Render backend URL
const API_BASE_URL =
  "https://visionai-backend-61s4.onrender.com/api";

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
  // Thumbnail is also saved in MongoDB for chat history
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

  // ==========================================
  // NORMAL CHAT
  // ==========================================

  const getReply = async () => {
    if (!prompt.trim() || loading) {
      return;
    }

    const currentPrompt = prompt.trim();

    // Show user message immediately
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
    setReply(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
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
        throw new Error(res.error || "Chat request failed");
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
      alert(
        "Unable to get a response. Please try again. If the server was inactive, wait a moment and retry."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VISION CHAT
  // Image question is optional
  // ==========================================

  const getVisionReply = async () => {
    if (loading) {
      return;
    }

    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    // If the user hasn't typed a question,
    // ask Gemini to describe the uploaded image.
    const currentPrompt =
      prompt.trim() || "Describe this image in detail.";

    const currentImage = selectedImage;
    const currentPreview = imagePreview;

    // Show uploaded image and prompt in chat
    setPrevChats((prev) => [
      ...prev,
      {
        role: "user",
        content: prompt.trim(),
        image: currentPreview,
      },
    ]);

    setNewChats(false);
    setPrompt("");
    setLoading(true);
    setReply(null);

    try {
      const formData = new FormData();

      formData.append("message", currentPrompt);
      formData.append("image", currentImage);
      formData.append("imagePreview", currentPreview || "");
      formData.append("threadId", currThreadId || "");

      const response = await fetch(`${API_BASE_URL}/vision`, {
        method: "POST",
        body: formData,
      });

      const res = await response.json();

      console.log("Vision Response:", res);

      if (!response.ok) {
        throw new Error(res.error || "Vision request failed");
      }

      // Gemini reply
      setReply(res.reply);

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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Vision Error:", error);
      alert(
        "Unable to analyze the image. Please try again. If the server was inactive, wait a moment and retry."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PROFILE
  // ==========================================

  const handleProfileClick = () => {
    setIsopen(!isOpen);
  };

  // ==========================================
  // ATTACHMENT BUTTON
  // ==========================================

  const handlePlusClick = () => {
    setShowMenu(!showMenu);
  };

  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // ==========================================
  // IMAGE SELECTED
  // ==========================================

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Image check
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    try {
      const thumbnail = await createImageThumbnail(file);

      setSelectedImage(file);
      setImagePreview(thumbnail);
      setShowMenu(false);

      console.log("Selected Image:", file);
    } catch (error) {
      console.error("Image Preview Error:", error);
      setSelectedImage(null);
      setImagePreview(null);
      alert("Unable to preview this image. Please select another image.");
    }
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // SEND
  // ==========================================

  const handleSend = () => {
    if (loading) {
      return;
    }

    if (selectedImage) {
      getVisionReply();
    } else {
      getReply();
    }
  };

  // ==========================================
  // UI
  // ==========================================

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
            style={{ display: "none" }}
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
              selectedImage ? "Ask about this image (optional)..." : "Ask anything"
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Send */}
          <div
            id="submit"
            onClick={handleSend}
            title="Send"
            style={{
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>

        <p className="info">
          VisionAI can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
