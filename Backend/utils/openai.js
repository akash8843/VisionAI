const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Normal Chat Response
// With Conversation Context

const getGeminiResponse = async (messages) => {
  try {
    // Convert MongoDB messages
    // into Gemini conversation format

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",

      parts: [
        {
          text: message.content,
        },
      ],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: contents,
    });

    return response.text;
  } catch (error) {
    console.log("Gemini API Error:", error);

    throw error;
  }
};

// Vision Response
// Image + User Question

const getGeminiVisionResponse = async (message, imageBuffer, mimeType) => {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
        {
          text: message,
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.log("Gemini Vision API Error:", error);

    throw error;
  }
};

module.exports = {
  getGeminiResponse,
  getGeminiVisionResponse,
};
