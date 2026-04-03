import type { ServiceType } from "@cryptogotchi/shared";

const MOCK_RESPONSES: Record<ServiceType, string[]> = {
  summarize: [
    "Here's your AI-powered summary: The text discusses key points about technology and innovation, highlighting three main themes: efficiency, scalability, and user experience.",
    "Summary: This content covers modern development practices with emphasis on performance optimization and clean architecture principles.",
  ],
  fortune: [
    "The stars align for your portfolio! A surprising altcoin will catch your eye this week. Lucky numbers: 7, 21, 42. Remember: DYOR!",
    "Mercury is in retrograde, but your crypto isn't! Expect green candles ahead. Your lucky token starts with 'E'. Fortune favors the HODLer!",
  ],
  "code-review": [
    "Code Review: Overall quality is good! Consider extracting the repeated logic into a helper function. Watch out for potential null references on line 42. Suggestion: Add error boundaries for better UX.",
    "Code Review: Clean architecture! Minor suggestions: 1) Add input validation 2) Consider memoization for expensive computations 3) The naming convention is consistent - great job!",
  ],
  crypto: [
    "Market Insight: Current sentiment is cautiously optimistic. Key resistance levels are holding. Volume suggests accumulation phase. Remember: this is not financial advice!",
    "Crypto Analysis: The market is showing interesting patterns. Layer 2 solutions are gaining traction. DeFi TVL is trending upward. Always manage your risk!",
  ],
};

export function getMockResponse(serviceType: ServiceType): string {
  const responses = MOCK_RESPONSES[serviceType];
  return responses[Math.floor(Math.random() * responses.length)];
}
