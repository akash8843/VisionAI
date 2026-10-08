# VisionAI — AI Chat & Image Understanding

VisionAI is a full-stack AI chat application built with React, Node.js, Express, MongoDB, and Google's Gemini API. It provides conversational AI responses, image understanding, and persistent chat history through a clean, ChatGPT-inspired interface.

## 🚀 Live Demo

**Live Website:** https://vision-ai-sooty.vercel.app

**GitHub Repository:** https://github.com/akash8843/VisionAI

## ✨ Features

- **AI-powered conversations:** Ask questions and receive responses using Google's Gemini API.
- **Image understanding:** Upload an image and ask questions about its contents.
- **Image-only prompts:** Upload an image without typing a question to request a description.
- **Conversation context:** Continue a conversation with previous messages included as context.
- **Persistent chat history:** Store and retrieve conversations using MongoDB.
- **Thread management:** View previous conversations and delete threads.
- **Recent chats first:** Display recently updated conversations at the top.
- **Markdown responses:** Render formatted text, tables, and code blocks.
- **Responsive chat interface:** A dark-themed UI with a sidebar and image upload preview.

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- React Markdown

**Backend**
- Node.js
- Express.js
- Multer for image uploads
- Google GenAI SDK

**Database & Deployment**
- MongoDB Atlas
- Render — Backend hosting
- Vercel — Frontend hosting
- GitHub — Source code management

## 🏗️ Architecture

- The React frontend sends chat and image requests to the Express API.
- The backend communicates with Google's Gemini API to generate responses.
- MongoDB stores conversation threads and messages.
- The frontend is deployed on Vercel, while the backend is hosted on Render.

## ⚙️ Run Locally

### Prerequisites

- Node.js and npm
- A MongoDB connection URI
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/akash8843/VisionAI.git
cd VisionAI
```

### 2. Configure the backend

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend`:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_uri
PORT=8080
```

Start the backend:

```bash
node server.js
```

### 3. Configure the frontend

Open a separate terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Ensure the frontend API configuration points to your local backend when developing locally.

## 🔐 Security Notes

- Never commit `.env` files or API keys to GitHub.
- Keep Gemini and MongoDB credentials on the backend.
- Configure production environment variables in the backend hosting service.
- Validate uploaded files and keep upload-size limits enabled.

## ## 👨‍💻 About the Author

**Akash Shukla**  
*Full-Stack Developer (MERN) | Aspiring Software Engineer*

- 💼 **LinkedIn:** [Connect with me](https://www.linkedin.com/in/akash-shukla-5636132ab/)
- 💻 **GitHub:** [akash8843](https://github.com/akash8843)
- 🚀 **Live Project:** [VisionAI — Try it here](https://vision-ai-sooty.vercel.app)

---

*Built with ❤️ by Akash Shukla*

Built as a full-stack AI application project to practice React, backend API development, database integration, and deployment.
