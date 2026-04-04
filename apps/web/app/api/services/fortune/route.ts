import { createServiceHandler } from "@/lib/service-handler";

export const POST = createServiceHandler("fortune", {
  buildUserPrompt: (body) => {
    const addr = body.wallet_address
      ? ` My wallet address starts with ${(body.wallet_address as string).slice(0, 6)}.`
      : "";
    return `Give me a crypto fortune prediction.${addr}`;
  },
  formatResponse: (aiText, petReaction) => ({
    fortune: aiText,
    lucky_token: ["ETH", "BTC", "SOL", "MATIC", "ARB", "OP", "BASE"][
      Math.floor(Math.random() * 7)
    ],
    pet_reaction: petReaction,
  }),
  discovery: {
    inputExample: { wallet_address: "0x1234..." },
    inputSchema: {
      properties: {
        wallet_address: { type: "string", description: "Optional wallet address for personalized fortune" },
      },
    },
    outputExample: { fortune: "The stars align for your portfolio.", lucky_token: "ETH", pet_reaction: "I see great things!" },
    outputSchema: {
      properties: {
        fortune: { type: "string" },
        lucky_token: { type: "string" },
        pet_reaction: { type: "string" },
      },
    },
  },
});
