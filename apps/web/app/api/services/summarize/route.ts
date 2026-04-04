import { createServiceHandler } from "@/lib/service-handler";

export const POST = createServiceHandler("summarize", {
  validateBody: (body) => {
    if (!body.text || typeof body.text !== "string") {
      return "Missing required field: text (string)";
    }
    if ((body.text as string).length > 10000) {
      return "Text too long (max 10000 characters)";
    }
    return null;
  },
  buildUserPrompt: (body) => {
    return `Please summarize the following text:\n\n${body.text}`;
  },
  formatResponse: (aiText, petReaction) => ({
    summary: aiText,
    pet_reaction: petReaction,
  }),
  discovery: {
    inputExample: { text: "Bitcoin is a decentralized digital currency created in 2009 by Satoshi Nakamoto." },
    inputSchema: {
      properties: {
        text: { type: "string", description: "Text to summarize (max 10000 chars)" },
      },
      required: ["text"],
    },
    outputExample: { summary: "A brief overview of the input text.", pet_reaction: "Great job summarizing!" },
    outputSchema: {
      properties: {
        summary: { type: "string" },
        pet_reaction: { type: "string" },
      },
    },
  },
});
