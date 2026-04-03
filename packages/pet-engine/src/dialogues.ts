import type { PetMood } from "@cryptogotchi/shared";

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

export function getRandomDialogue(mood: PetMood): string {
  const messages = DIALOGUES[mood];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getAllDialogues(): Record<PetMood, string[]> {
  return DIALOGUES;
}
