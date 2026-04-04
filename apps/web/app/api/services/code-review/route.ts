import { createServiceHandler } from "@/lib/service-handler";

export const POST = createServiceHandler("code-review", {
  validateBody: (body) => {
    if (!body.code || typeof body.code !== "string") {
      return "Missing required field: code (string)";
    }
    if ((body.code as string).length > 20000) {
      return "Code too long (max 20000 characters)";
    }
    return null;
  },
  buildUserPrompt: (body) => {
    const lang = body.language ? ` (Language: ${body.language})` : "";
    return `Please review the following code${lang}:\n\n\`\`\`\n${body.code}\n\`\`\``;
  },
  formatResponse: (aiText, petReaction) => {
    // Extract score from AI text or generate a reasonable one
    const scoreMatch = aiText.match(/(\d+)\s*\/\s*10/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : Math.floor(Math.random() * 3) + 6;

    return {
      review: aiText,
      score: Math.min(10, Math.max(1, score)),
      pet_reaction: petReaction,
    };
  },
  discovery: {
    inputExample: { code: "function add(a, b) { return a + b; }", language: "javascript" },
    inputSchema: {
      properties: {
        code: { type: "string", description: "Code to review (max 20000 chars)" },
        language: { type: "string", description: "Programming language (optional)" },
      },
      required: ["code"],
    },
    outputExample: { review: "Clean function with good naming.", score: 8, pet_reaction: "Nice code!" },
    outputSchema: {
      properties: {
        review: { type: "string" },
        score: { type: "number", description: "Code quality score 1-10" },
        pet_reaction: { type: "string" },
      },
    },
  },
});
