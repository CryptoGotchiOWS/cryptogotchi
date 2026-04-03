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
});
