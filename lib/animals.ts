export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type Animal = {
  id: string;
  name: string;
  emoji: string;
  duration: number;
  rarity: Rarity;
  rarityLabel: string;
  rarityColor: string;
  glowColor: string;
};

export const ANIMALS: Animal[] = [
  // ── 7일 커먼 ──────────────────────────────────────
  { id: "chick",   name: "병아리",  emoji: "🐣", duration: 7,   rarity: "common",    rarityLabel: "COMMON",    rarityColor: "rgba(180,180,180,0.9)", glowColor: "rgba(200,200,200,0.3)" },
  { id: "hamster", name: "햄스터",  emoji: "🐹", duration: 7,   rarity: "common",    rarityLabel: "COMMON",    rarityColor: "rgba(180,180,180,0.9)", glowColor: "rgba(200,200,200,0.3)" },
  { id: "fish",    name: "금붕어",  emoji: "🐠", duration: 7,   rarity: "common",    rarityLabel: "COMMON",    rarityColor: "rgba(180,180,180,0.9)", glowColor: "rgba(200,200,200,0.3)" },
  // ── 30일 언커먼 ───────────────────────────────────
  { id: "dog",     name: "강아지",  emoji: "🐶", duration: 30,  rarity: "uncommon",  rarityLabel: "UNCOMMON",  rarityColor: "rgba(80,200,120,0.9)",  glowColor: "rgba(80,200,120,0.3)"  },
  { id: "cat",     name: "고양이",  emoji: "🐱", duration: 30,  rarity: "uncommon",  rarityLabel: "UNCOMMON",  rarityColor: "rgba(80,200,120,0.9)",  glowColor: "rgba(80,200,120,0.3)"  },
  { id: "rabbit",  name: "토끼",    emoji: "🐰", duration: 30,  rarity: "uncommon",  rarityLabel: "UNCOMMON",  rarityColor: "rgba(80,200,120,0.9)",  glowColor: "rgba(80,200,120,0.3)"  },
  { id: "turtle",  name: "거북이",  emoji: "🐢", duration: 30,  rarity: "uncommon",  rarityLabel: "UNCOMMON",  rarityColor: "rgba(80,200,120,0.9)",  glowColor: "rgba(80,200,120,0.3)"  },
  { id: "parrot",  name: "앵무새",  emoji: "🦜", duration: 30,  rarity: "uncommon",  rarityLabel: "UNCOMMON",  rarityColor: "rgba(80,200,120,0.9)",  glowColor: "rgba(80,200,120,0.3)"  },
  { id: "frog",    name: "개구리",  emoji: "🐸", duration: 30,  rarity: "uncommon",  rarityLabel: "UNCOMMON",  rarityColor: "rgba(80,200,120,0.9)",  glowColor: "rgba(80,200,120,0.3)"  },
  // ── 90일 레어 ─────────────────────────────────────
  { id: "wolf",    name: "늑대",    emoji: "🐺", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  { id: "fox",     name: "여우",    emoji: "🦊", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  { id: "lion",    name: "사자",    emoji: "🦁", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  { id: "tiger",   name: "호랑이",  emoji: "🐯", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  { id: "raccoon", name: "너구리",  emoji: "🦝", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  { id: "penguin", name: "펭귄",    emoji: "🐧", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  { id: "otter",   name: "수달",    emoji: "🦦", duration: 90,  rarity: "rare",      rarityLabel: "RARE",      rarityColor: "rgba(43,143,240,0.9)",  glowColor: "rgba(43,143,240,0.4)"  },
  // ── 180일 에픽 ────────────────────────────────────
  { id: "eagle",      name: "독수리",    emoji: "🦅", duration: 180, rarity: "epic", rarityLabel: "EPIC", rarityColor: "rgba(160,80,240,0.9)", glowColor: "rgba(160,80,240,0.4)" },
  { id: "babydragon", name: "아기 드래곤", emoji: "🐲", duration: 180, rarity: "epic", rarityLabel: "EPIC", rarityColor: "rgba(160,80,240,0.9)", glowColor: "rgba(160,80,240,0.4)" },
  { id: "butterfly",  name: "나비 요정",  emoji: "🦋", duration: 180, rarity: "epic", rarityLabel: "EPIC", rarityColor: "rgba(160,80,240,0.9)", glowColor: "rgba(160,80,240,0.4)" },
  { id: "dolphin",    name: "돌고래",    emoji: "🐬", duration: 180, rarity: "epic", rarityLabel: "EPIC", rarityColor: "rgba(160,80,240,0.9)", glowColor: "rgba(160,80,240,0.4)" },
  { id: "peacock",    name: "공작새",    emoji: "🦚", duration: 180, rarity: "epic", rarityLabel: "EPIC", rarityColor: "rgba(160,80,240,0.9)", glowColor: "rgba(160,80,240,0.4)" },
  // ── 365일 레전더리 ────────────────────────────────
  { id: "moonwolf", name: "문라이트 울프", emoji: "🐺", duration: 365, rarity: "legendary", rarityLabel: "LEGENDARY", rarityColor: "rgba(255,200,50,0.9)", glowColor: "rgba(255,200,50,0.5)" },
  { id: "dragon",   name: "드래곤",      emoji: "🐉", duration: 365, rarity: "legendary", rarityLabel: "LEGENDARY", rarityColor: "rgba(255,200,50,0.9)", glowColor: "rgba(255,200,50,0.5)" },
  { id: "unicorn",  name: "유니콘",      emoji: "🦄", duration: 365, rarity: "legendary", rarityLabel: "LEGENDARY", rarityColor: "rgba(255,200,50,0.9)", glowColor: "rgba(255,200,50,0.5)" },
  { id: "phoenix",  name: "불사조",      emoji: "🔥", duration: 365, rarity: "legendary", rarityLabel: "LEGENDARY", rarityColor: "rgba(255,200,50,0.9)", glowColor: "rgba(255,200,50,0.5)" },
];

export const DURATION_OPTIONS = [7, 30, 90, 180, 365];

export const DURATION_INFO: Record<number, { label: string; rarity: string; color: string }> = {
  7:   { label: "7일",   rarity: "COMMON",    color: "rgba(180,180,180,0.9)" },
  30:  { label: "30일",  rarity: "UNCOMMON",  color: "rgba(80,200,120,0.9)"  },
  90:  { label: "90일",  rarity: "RARE",      color: "rgba(43,143,240,0.9)"  },
  180: { label: "180일", rarity: "EPIC",      color: "rgba(160,80,240,0.9)"  },
  365: { label: "365일", rarity: "LEGENDARY", color: "rgba(255,200,50,0.9)"  },
};

export function getAnimalsByDuration(duration: number): Animal[] {
  return ANIMALS.filter(a => a.duration === duration);
}
