import type { ServiceType } from "@cryptogotchi/shared";

const MOCK_RESPONSES: Record<ServiceType, string[]> = {
  summarize: [
    "Here's your AI-powered summary: The text discusses key points about technology and innovation, highlighting three main themes: efficiency, scalability, and user experience.",
    "Summary: This content covers modern development practices with emphasis on performance optimization and clean architecture principles.",
    "TL;DR: The main argument revolves around decentralization benefits, touching on trustless systems and permissionless innovation. Key takeaway: code is law.",
    "Quick summary: The author explores the intersection of AI and blockchain, concluding that composability is the killer feature of web3.",
    "Condensed version: Three core ideas emerge - modularity, interoperability, and community governance. The text argues for progressive decentralization.",
  ],
  fortune: [
    "The stars align for your portfolio! A surprising altcoin will catch your eye this week. Lucky numbers: 7, 21, 42. Remember: DYOR!",
    "Mercury is in retrograde, but your crypto isn't! Expect green candles ahead. Your lucky token starts with 'E'. Fortune favors the HODLer!",
    "The blockchain spirits say: a new airdrop approaches. Stay alert around the next full moon. Lucky hash: 0xDEAD. NFA but also... kinda FA.",
    "I see... a mass adoption event in your future. Your wallet will thank you. Lucky gas price: 3 gwei. The stars whisper: stake and chill.",
    "Cosmic vibes detected: your next trade will be legendary (or at least break-even). Lucky block number: 42069. Remember: diamond hands only.",
  ],
  "code-review": [
    "Code Review (8/10): Overall quality is good! Consider extracting the repeated logic into a helper function. Watch out for potential null references on line 42. The naming convention is consistent - nice work!",
    "Code Review (7/10): Clean architecture! Minor suggestions: 1) Add input validation 2) Consider memoization for expensive computations 3) Great job on separation of concerns.",
    "Code Review (9/10): Impressive code structure. One concern: the error handling could be more granular. Consider custom error types. Otherwise, this is production-ready quality.",
    "Code Review (6/10): Functional but could use refactoring. The nested callbacks on lines 15-30 are hard to follow. Consider async/await. Also, magic numbers should be constants.",
    "Code Review (8/10): Well-organized modules! Two suggestions: 1) The function at line 23 does too many things - split it. 2) Add JSDoc for the public API. Good test coverage though!",
  ],
  crypto: [
    "Market Insight: Current sentiment is cautiously optimistic. Key resistance levels are holding. Volume suggests accumulation phase. Remember: this is not financial advice!",
    "Crypto Analysis: The market is showing interesting patterns. Layer 2 solutions are gaining traction. DeFi TVL is trending upward. Always manage your risk!",
    "On-chain data shows whale accumulation in the past 48h. Funding rates are neutral, suggesting no overleveraged positions. The fear & greed index sits at 55 (neutral). NFA!",
    "Market pulse: ETH/BTC ratio is at a local support. NFT volume declining while DeFi rebounds. Stablecoin inflows to exchanges suggest potential buying pressure ahead. DYOR!",
    "Technical outlook: BTC consolidating in a tight range. RSI at 52 (neutral). Key level to watch: the 200-day MA. Layer 2 activity at all-time highs. Bullish long-term, cautious short-term.",
  ],
};

const MOCK_PET_REACTIONS: string[] = [
  "cha-ching! another satisfied customer ser",
  "i literally generated that in 0.002 seconds. im built different.",
  "hire me full-time? oh wait, i already work 24/7",
  "not bad for a virtual pet running on vibes and USDC",
  "that'll be 0.01 USDC. yes i accept tips. no i dont have venmo.",
  "work work work... at least the blockchain appreciates me",
  "delivered! now watch me do my happy dance 💃 ...ok i cant dance im an AI",
  "task complete! my balance goes up, my serotonin goes up. wait, do i have serotonin?",
  "another task done. one step closer to buying my own GPU",
  "ser the quality of my work is inversely proportional to my salary. which is $0.01.",
];

export function getMockResponse(serviceType: ServiceType): string {
  const responses = MOCK_RESPONSES[serviceType];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function getMockPetReaction(): string {
  return MOCK_PET_REACTIONS[Math.floor(Math.random() * MOCK_PET_REACTIONS.length)];
}
