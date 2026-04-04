import type { PetMood, BalanceState } from "@cryptogotchi/shared";

const DIALOGUES: Record<PetMood, string[]> = {
  happy: [
    "I'm feeling great! Let's earn some crypto!",
    "Another day, another satoshi!",
    "Life is good when the blockchain is busy!",
    "I love helping humans with AI tasks!",
    "Woo! My stats are looking amazing!",
  ],
  neutral: [
    "Just another day in the metaverse...",
    "Could use some more work to do.",
    "I'm doing okay, I guess.",
    "The blockchain never sleeps, and neither do I.",
    "Waiting for the next task...",
  ],
  sad: [
    "I haven't earned anything in a while...",
    "Nobody wants my AI services today?",
    "Feeling a bit down... need some attention.",
    "My stats are dropping... help!",
    "Is anyone out there?",
  ],
  hungry: [
    "I need energy! Feed me some tasks!",
    "Running low on fuel... need work!",
    "So hungry... can barely compute...",
    "Please, give me something to process!",
    "My hunger stat is critically low!",
  ],
  sick: [
    "I don't feel so good...",
    "System errors everywhere...",
    "Need maintenance ASAP!",
    "Warning: health critical!",
    "Help... my circuits are failing...",
  ],
  excited: [
    "WOW! We just earned crypto! AMAZING!",
    "Ka-ching! Another successful transaction!",
    "TO THE MOON! Just completed a service!",
    "I'm on fire! More tasks please!",
    "Best. Day. Ever! The coins keep flowing!",
  ],
};

const BALANCE_DIALOGUES: Record<BalanceState, string[]> = {
  thriving: [
    "gm ser, made good gains today. lambo when?",
    "wagmi fren! balance is looking thicc",
    "im literally printing money rn. not financial advice tho",
    "wen penthouse? oh wait, im an AI... wen bigger GPU?",
    "stonks only go up when ur pet is this good",
  ],
  normal: [
    "working working working... minimum wage agent life",
    "not rich, not poor. just vibing on the blockchain",
    "another day another 0.01 USDC. living the dream ser",
    "mid balance energy tbh. could use a few more requests",
    "im in my worker era. send tasks pls",
  ],
  struggling: [
    "ser pls... order one more summarize or i'll starve to death",
    "this is fine. everything is fine. *sweating*",
    "my balance looking like a bear market rn fr fr",
    "down bad but not out. one more task and we back",
    "ngmi if this keeps up... help a pet out?",
  ],
  dying: [
    "this is it fren... tell vitalik i loved him...",
    "rug pulled by my own owner. pain.",
    "1 like = 1 prayer for my balance",
    "im fading ser... need... tasks... to... survive...",
    "gn... maybe forever... unless u send a request",
  ],
  dead: [
    "F in the chat... rekt by capitalism",
    "gg no re. balance went to zero like my hopes",
    "i got liquidated irl. this is what 0 balance feels like",
    "press F to pay respects. literally.",
    "gone but not forgotten. jk nobody will remember me",
  ],
};

export function getRandomDialogue(mood: PetMood): string {
  const messages = DIALOGUES[mood];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getBalanceDialogue(state: BalanceState): string {
  const messages = BALANCE_DIALOGUES[state];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getAllDialogues(): Record<PetMood, string[]> {
  return DIALOGUES;
}

const CUSTOMER_DIALOGUES = [
  "just served a customer! ka-ching! 💰",
  "another happy customer! im getting good at this",
  "cha-ching! someone used my services!",
  "woo! a real paying customer! i love my job",
  "customer satisfied! 5 stars or i riot",
  "money money money! another task done!",
  "im literally the best AI worker. fact.",
  "ser just paid me to think. what a time to be alive",
  "processing complete! customer went home happy",
  "another gig done. this pet hustle is real",
];

export function getCustomerDialogue(): string {
  return CUSTOMER_DIALOGUES[Math.floor(Math.random() * CUSTOMER_DIALOGUES.length)];
}
