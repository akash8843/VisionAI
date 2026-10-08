const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables FIRST
dotenv.config();

// Import routes
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
    });
    console.log("Connected with Database!");
  } catch (error) {
    console.log("Failed to connect with Database");
    console.log(error.message);
  }
};

// Home Route

app.get("/", (req, res) => {
  res.send("VisionAI Backend is running 🚀");
});

// API Routes

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
