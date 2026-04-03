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
});
