const express = require("express");
const Thread = require("../models/thread");

const {
  getGeminiResponse,
  getGeminiVisionResponse,
} = require("../utils/openai");

const multer = require("multer");

const router = express.Router();

// Multer Configuration

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// POST /api/chat
// Normal Chat

router.post("/chat", async (req, res) => {
  try {
    const { threadId, message } = req.body;

    // Check message
    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Find thread
    let thread = await Thread.findOne({
      threadId: threadId,
    });

    // Create thread if not found
    if (!thread) {
      thread = new Thread({
        threadId: threadId,
        title: message,
        messages: [],
      });
    }

    // Save user message
    thread.messages.push({
      role: "user",
      content: message,
    });

    // Gemini response
    const reply = await getGeminiResponse(thread.messages);

    // Save assistant response
    thread.messages.push({
      role: "assistant",
      content: reply,
    });

    // Update time
    thread.updatedAt = new Date();

    // Save
    await thread.save();

    // Response
    res.json({
      reply: reply,
      threadId: thread.threadId,
    });
  } catch (error) {
    console.log("Chat Route Error:", error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

// POST /api/vision
// Image + Question

router.post("/vision", upload.single("image"), async (req, res) => {
  try {
    const { threadId, message, imagePreview } = req.body;

    // Check message

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Check image

    if (!req.file) {
      return res.status(400).json({
        error: "Image is required",
      });
    }

    // Check image type

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "Only image files are allowed",
      });
    }

    // Find existing thread

    let thread = await Thread.findOne({
      threadId: threadId,
    });

    // Create thread if needed

    if (!thread) {
      thread = new Thread({
        threadId: threadId,
        title: message,
        messages: [],
      });
    }

    // Save user's Vision message

    thread.messages.push({
      role: "user",
      content: message,
      image: imagePreview || null,
    });

    // Gemini Vision

    const reply = await getGeminiVisionResponse(
      message,
      req.file.buffer,
      req.file.mimetype,
    );

    // Save assistant response

    thread.messages.push({
      role: "assistant",
      content: reply,
    });

    // Update thread

    thread.updatedAt = new Date();

    // Save MongoDB

    await thread.save();

    // Send response

    res.json({
      reply: reply,
      threadId: thread.threadId,
    });
  } catch (error) {
    console.log("Vision Route Error:", error);

    res.status(500).json({
      error: "Vision request failed",
    });
  }
});

// GET /api/thread
// Get all threads

router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find().sort({
      updatedAt: -1,
    });

    res.json(threads);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch threads",
    });
  }
});

// GET /api/thread/:threadId
// Get one thread

router.get("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await Thread.findOne({
      threadId: threadId,
    });

    if (!thread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    res.json(thread);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch thread",
    });
  }
});

// DELETE /api/thread/:threadId
// Delete thread

router.delete("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const deletedThread = await Thread.findOneAndDelete({
      threadId: threadId,
    });

    if (!deletedThread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    res.json({
      message: "Thread deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to delete thread",
    });
  }
});

module.exports = router;
