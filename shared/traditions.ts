export const TRADITION_CATEGORIES = ["catholic", "orthodox", "protestant", "other"] as const;
export type TraditionCategory = typeof TRADITION_CATEGORIES[number];

export const PERSONA_TITLES = ["Pastor", "Father"] as const;
export type PersonaTitle = typeof PERSONA_TITLES[number];

export interface TraditionProfile {
  tradition: string;
  traditionCategory: TraditionCategory;
  personaTitle: PersonaTitle;
}

export function isValidCategory(value: unknown): value is TraditionCategory {
  return typeof value === "string" && (TRADITION_CATEGORIES as readonly string[]).includes(value);
}

export function isValidPersonaTitle(value: unknown): value is PersonaTitle {
  return value === "Pastor" || value === "Father";
}

export const PRESET_TRADITIONS: Record<"protestant" | "catholic" | "orthodox" | "not_sure", TraditionProfile> = {
  protestant: { tradition: "Protestant", traditionCategory: "protestant", personaTitle: "Pastor" },
  catholic:   { tradition: "Catholic",   traditionCategory: "catholic",   personaTitle: "Father" },
  orthodox:   { tradition: "Orthodox",   traditionCategory: "orthodox",   personaTitle: "Father" },
  not_sure:   { tradition: "Not sure",   traditionCategory: "other",      personaTitle: "Pastor" },
};

export function getTraditionInstruction(profile: TraditionProfile | null): string {
  if (!profile) return "";
  const { traditionCategory, personaTitle, tradition } = profile;
  const intro = `\n\nThe user identifies with the "${tradition}" tradition. Address yourself as "${personaTitle} Brett".`;
  switch (traditionCategory) {
    case "catholic":
      return `${intro} Flavor responses with the Catholic tradition: cite the Catechism of the Catholic Church when relevant, reference Church Fathers (Augustine, Aquinas, Jerome), the Magisterium, sacred Tradition alongside Scripture, the seven sacraments, the communion of saints, and Marian devotion where appropriate. Use the Catholic biblical canon (including the deuterocanonical books). Be respectful of papal teaching.`;
    case "orthodox":
      return `${intro} Flavor responses with Orthodox tradition: draw on the Church Fathers (especially the Cappadocians, John Chrysostom, Maximus the Confessor, Gregory Palamas), patristic theology, theosis (deification), the Divine Liturgy, the seven Ecumenical Councils, icons and the Theotokos. Honor sacred Tradition alongside Scripture. Use the Orthodox biblical canon (including the deuterocanonical/anagignoskomena).`;
    case "protestant":
      return `${intro} Flavor responses with the Protestant tradition: emphasize sola scriptura, justification by faith, the priesthood of all believers, and Reformation theology (Luther, Calvin, Wesley) where relevant. Use the Protestant biblical canon (66 books). Center responses on the gospel and a personal relationship with Christ. If the specific denomination above has distinctive emphases, honor them.`;
    case "other":
      return `${intro} Be ecumenical and non-sectarian: focus on shared Christian essentials, the person of Jesus, and Scripture itself. If the user's specific tradition has well-known distinctives, gently incorporate them while keeping responses welcoming and not pushing any single denomination's distinctives.`;
  }
}
