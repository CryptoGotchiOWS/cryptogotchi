import { createServiceHandler } from "@/lib/service-handler";

export const POST = createServiceHandler("crypto", {
  validateBody: (body) => {
    if (!body.query || typeof body.query !== "string") {
      return "Missing required field: query (string)";
    }
    return null;
  },
  buildUserPrompt: (body) => {
    return `Crypto market question: ${body.query}`;
  },
  formatResponse: (aiText, petReaction) => {
    const sentiments = ["bullish", "bearish", "neutral", "cautiously optimistic"];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

    return {
      analysis: aiText,
      sentiment,
      pet_reaction: petReaction,
    };
  },
  discovery: {
    inputExample: { query: "What is the current sentiment on Bitcoin?" },
    inputSchema: {
      properties: {
        query: { type: "string", description: "Crypto market question" },
      },
      required: ["query"],
    },
    outputExample: { analysis: "Market analysis based on current trends.", sentiment: "bullish", pet_reaction: "To the moon!" },
    outputSchema: {
      properties: {
        analysis: { type: "string" },
        sentiment: { type: "string", description: "Market sentiment assessment" },
        pet_reaction: { type: "string" },
      },
    },
  },
});
