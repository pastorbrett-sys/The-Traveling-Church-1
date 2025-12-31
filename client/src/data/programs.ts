export interface Program {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  purpose: string;
  activities: string[];
  useOfFunds: string;
  oversight: string;
  icon: string;
  image: string;
  donateLink: string;
}

export const programs: Program[] = [
  {
    id: "1",
    slug: "iron-men",
    title: "Iron Men Program",
    shortDescription: "Providing men of faith with resources to navigate the modern world through support and spiritual counseling.",
    purpose: "The Iron Men Program exists to provide men of faith resources to navigate the modern world. This program recognizes the unique challenges men face and offers a supportive community for growth and accountability.",
    activities: [
      "Support groups for men facing life's challenges",
      "Media and content created specifically for men of faith",
      "Spiritual counseling services designed for men",
      "Community building and fellowship opportunities",
      "Resources for personal and spiritual development"
    ],
    useOfFunds: "Each donation will sponsor men in need of these resources, providing access to support groups, counseling services, and educational materials.",
    oversight: "This program is overseen by the Senior Pastor and male leadership within the church.",
    icon: "shield",
    image: "iron-men",
    donateLink: "https://donate.stripe.com/eVq28t786cEK79n5SL4wM06"
  },
  {
    id: "2",
    slug: "persecuted-christians",
    title: "Persecuted Christians Support & Relief Program",
    shortDescription: "Providing spiritual, practical, and humanitarian assistance to Christians facing persecution.",
    purpose: "The Persecuted Christians Support & Relief Program exists to provide spiritual, practical, and humanitarian assistance to Christians facing social, economic, or religious persecution. The program seeks to strengthen individuals and families through presence, encouragement, and targeted aid while respecting local laws and cultural sensitivities.",
    activities: [
      "Providing pastoral support, prayer, and encouragement to Christians experiencing persecution or marginalization",
      "Offering material assistance such as food, shelter support, transportation, or emergency aid where appropriate",
      "Supporting safe travel, relocation assistance, or temporary refuge when legally permissible",
      "Partnering informally with trusted local individuals or organizations to identify needs and distribute aid responsibly",
      "Facilitating spiritual resources, connection, and follow-up support through digital communication"
    ],
    useOfFunds: "Funds are used for humanitarian assistance, food and basic necessities, temporary lodging, travel support, communication tools, and other lawful aid consistent with the protection and well-being of persecuted Christians.",
    oversight: "This program is overseen by the Senior Pastor, with careful attention to legal compliance, safety considerations, and appropriate stewardship of resources.",
    icon: "hand-heart",
    image: "persecuted-christians",
    donateLink: "https://buy.stripe.com/8x2cN7eAybAGbpDch94wM02"
  },
  {
    id: "3",
    slug: "global-itinerant-ministry",
    title: "Global Ministry & Presence Program",
    shortDescription: "Carrying the Gospel to places others won't go through physical presence and in-person ministry across diverse global locations.",
    purpose: "The Global Ministry & Presence Program exists to carry the message of the Gospel in person across diverse global locations. Modeled after the early apostles, this program emphasizes going where God leads rather than operating from a fixed location.",
    activities: [
      "International and domestic travel by the Senior Pastor to locations of spiritual need or opportunity",
      "One-on-one spiritual conversations, teaching, prayer, and pastoral care",
      "Informal gatherings, discussions, and ministry encounters in public and private settings",
      "Engagement with individuals from different faith backgrounds for respectful dialogue and Gospel introduction",
      "Digital ministry and follow-up with individuals encountered during travel"
    ],
    useOfFunds: "Program funds are used for travel expenses, lodging, meals, local transportation, communication tools, and ministry-related materials necessary to support itinerant ministry activities.",
    oversight: "This program is overseen directly by the Senior Pastor.",
    icon: "globe",
    image: "global-ministry",
    donateLink: "https://donate.stripe.com/aFa00lcsqcEK8drftl4wM03"
  },
  {
    id: "4",
    slug: "community-feeding",
    title: "Community Feeding & Direct Aid Program",
    shortDescription: "Meeting immediate physical needs as an expression of Christian love, hospitality, and compassion.",
    purpose: "The Community Feeding & Direct Aid Program exists to meet immediate physical needs as an expression of Christian love, hospitality, and compassion. This program recognizes that tangible acts of service often open doors for deeper human connection and spiritual care.",
    activities: [
      "Purchasing and distributing food to individuals and families in need",
      "Providing meals or basic necessities during travel and local outreach",
      "Supporting individuals with immediate needs such as transportation, lodging, or essential expenses",
      "Assisting individuals in accessing opportunities for growth, safety, or spiritual enrichment",
      "Occasional direct sponsorship of individuals for humanitarian or spiritually meaningful travel"
    ],
    useOfFunds: "Funds are used for food purchases, meals, essential goods, travel assistance, lodging support, and other direct aid consistent with the mission of compassionate service.",
    oversight: "This program is overseen by the Senior Pastor, with financial accountability maintained through standard church recordkeeping.",
    icon: "utensils",
    image: "community-feeding",
    donateLink: "https://buy.stripe.com/8x25kF3VU2062T76WP4wM04"
  },
  {
    id: "5",
    slug: "economic-empowerment",
    title: "Economic Empowerment & Business Stewardship Program",
    shortDescription: "Promoting dignity, freedom, and sustainable livelihoods through business ownership and economic independence.",
    purpose: "The Economic Empowerment & Business Stewardship Program exists to promote dignity, freedom, and sustainable livelihoods by supporting business ownership, economic independence, and responsible stewardship. The program seeks to reduce dependence on exploitative labor structures and encourage financial self-sufficiency within the broader faith community.",
    activities: [
      "Identifying and supporting business opportunities aligned with ethical and legal standards",
      "Investing in or partnering with cash-flowing businesses operated by trusted individuals",
      "Encouraging vocational ownership and entrepreneurial responsibility",
      "Facilitating collaboration between businesses within the broader network to strengthen economic resilience",
      "Using generated profits to support ministry and charitable activities"
    ],
    useOfFunds: "Funds are allocated toward business investments, operational support, professional services, and related expenses. Business activities are structured to comply with applicable laws and maintain appropriate separation between nonprofit and for-profit operations.",
    oversight: "This program operates in coordination with our business arm and is overseen by the Senior Pastor and Treasurer or their appointed designee.",
    icon: "briefcase",
    image: "economic-empowerment",
    donateLink: "https://donate.stripe.com/3cIfZjakigV0gJX94X4wM05"
  },
  {
    id: "6",
    slug: "animal-conservation",
    title: "Animal Conservation & Creation Care Program",
    shortDescription: "Protecting and stewarding God's creation by supporting ethical animal care, conservation efforts, and sustainable coexistence between communities and wildlife.",
    purpose: "The Traveling Church's Animal Conservation & Creation Care Program exists to protect and steward God's creation by supporting ethical animal care, conservation efforts, and sustainable coexistence between communities and wildlife. We believe caring for animals is part of faithful stewardship—honoring life, preserving ecosystems, and acting responsibly toward the world entrusted to us.",
    activities: [
      "Support for wildlife protection and habitat preservation",
      "Aid for animals affected by conflict, disaster, or environmental degradation",
      "Partnerships with local organizations providing humane animal care",
      "Education and community initiatives that promote responsible stewardship",
      "Sustainable practices that protect both people and wildlife"
    ],
    useOfFunds: "Donations to the Animal Conservation & Creation Care Program may be used for direct conservation and animal care efforts, emergency response for animals affected by crisis, support of vetted local partners and initiatives, supplies, transport, and basic operational needs related to conservation work. Funds are deployed carefully, transparently, and in alignment with the Traveling Church's mission.",
    oversight: "This program is overseen by the Senior Pastor, with careful attention to ethical practices, local partnerships, and appropriate stewardship of resources.",
    icon: "leaf",
    image: "animal-conservation",
    donateLink: "https://donate.stripe.com/8x28wR0JI8ouctH1Cv4wM08"
  }
];

export const DONATE_LINK = "https://donate.stripe.com/7sYbJ34ZY7kq3Xbbd54wM07";
