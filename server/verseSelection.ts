import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const VERSE_THEMES = [
  'Hope & Promise',
  'Encouragement & Strength',
  'Love & Acceptance',
  'Guidance in Tough Times',
  'Motivation & Purpose',
  'Peace & Comfort',
  'Faith & Trust',
  'Joy & Gratitude',
];

const FALLBACK_VERSES: Omit<SelectedVerse, 'theme'>[] = [
  // Hope & Promise
  { book: 'Jeremiah', bookId: 24, chapter: 29, verse: 11, text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', notificationText: 'God has plans to give you hope and a future.' },
  { book: 'Romans', bookId: 45, chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', notificationText: 'God works all things for your good.' },
  { book: 'Isaiah', bookId: 23, chapter: 40, verse: 31, text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', notificationText: 'Hope in the Lord and renew your strength.' },
  { book: 'Lamentations', bookId: 25, chapter: 3, verse: 22, endVerse: 23, text: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.', notificationText: 'His compassions are new every morning.' },
  
  // Encouragement & Strength
  { book: 'Philippians', bookId: 50, chapter: 4, verse: 13, text: 'I can do all this through him who gives me strength.', notificationText: 'You can do all things through Christ.' },
  { book: 'Joshua', bookId: 6, chapter: 1, verse: 9, text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', notificationText: 'Be strong and courageous - God is with you.' },
  { book: 'Isaiah', bookId: 23, chapter: 41, verse: 10, text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.', notificationText: 'Do not fear - God will strengthen you.' },
  { book: 'Deuteronomy', bookId: 5, chapter: 31, verse: 6, text: 'Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.', notificationText: 'God will never leave you nor forsake you.' },
  
  // Love & Acceptance
  { book: 'Romans', bookId: 45, chapter: 8, verse: 38, endVerse: 39, text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.', notificationText: 'Nothing can separate you from God\'s love.' },
  { book: '1 John', bookId: 62, chapter: 4, verse: 19, text: 'We love because he first loved us.', notificationText: 'We love because He first loved us.' },
  { book: 'John', bookId: 43, chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', notificationText: 'God so loved the world He gave His Son.' },
  { book: 'Zephaniah', bookId: 36, chapter: 3, verse: 17, text: 'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.', notificationText: 'God rejoices over you with singing.' },
  
  // Guidance in Tough Times
  { book: 'Psalms', bookId: 19, chapter: 23, verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.', notificationText: 'Walk through valleys fearing no evil.' },
  { book: 'Proverbs', bookId: 20, chapter: 3, verse: 5, endVerse: 6, text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', notificationText: 'Trust in the Lord with all your heart.' },
  { book: 'James', bookId: 59, chapter: 1, verse: 5, text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.', notificationText: 'Ask God for wisdom - He gives generously.' },
  { book: 'Psalms', bookId: 19, chapter: 32, verse: 8, text: 'I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.', notificationText: 'God will guide you in the way to go.' },
  
  // Motivation & Purpose
  { book: 'Ephesians', bookId: 49, chapter: 2, verse: 10, text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.', notificationText: 'You are God\'s masterpiece with a purpose.' },
  { book: 'Colossians', bookId: 51, chapter: 3, verse: 23, text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.', notificationText: 'Work with all your heart for the Lord.' },
  { book: '2 Timothy', bookId: 55, chapter: 1, verse: 7, text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.', notificationText: 'God gave you power, love, and self-discipline.' },
  { book: 'Philippians', bookId: 50, chapter: 1, verse: 6, text: 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.', notificationText: 'God will complete the good work in you.' },
  
  // Peace & Comfort
  { book: 'John', bookId: 43, chapter: 14, verse: 27, text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.', notificationText: 'Jesus gives you His peace.' },
  { book: 'Philippians', bookId: 50, chapter: 4, verse: 6, endVerse: 7, text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.', notificationText: 'Don\'t be anxious - God\'s peace will guard you.' },
  { book: 'Matthew', bookId: 40, chapter: 11, verse: 28, text: 'Come to me, all you who are weary and burdened, and I will give you rest.', notificationText: 'Come to Jesus and find rest.' },
  { book: 'Psalms', bookId: 19, chapter: 46, verse: 10, text: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.', notificationText: 'Be still and know that He is God.' },
  
  // Faith & Trust
  { book: 'Hebrews', bookId: 58, chapter: 11, verse: 1, text: 'Now faith is confidence in what we hope for and assurance about what we do not see.', notificationText: 'Faith is confidence in what you hope for.' },
  { book: 'Mark', bookId: 41, chapter: 11, verse: 24, text: 'Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.', notificationText: 'Believe in prayer and it will be yours.' },
  { book: 'Psalms', bookId: 19, chapter: 37, verse: 5, text: 'Commit your way to the Lord; trust in him and he will do this.', notificationText: 'Commit your way to the Lord.' },
  { book: '2 Corinthians', bookId: 47, chapter: 5, verse: 7, text: 'For we live by faith, not by sight.', notificationText: 'Live by faith, not by sight.' },
  
  // Joy & Gratitude
  { book: 'Psalms', bookId: 19, chapter: 118, verse: 24, text: 'This is the day the Lord has made; let us rejoice and be glad in it.', notificationText: 'Rejoice in the day the Lord has made.' },
  { book: 'Nehemiah', bookId: 16, chapter: 8, verse: 10, text: 'Do not grieve, for the joy of the Lord is your strength.', notificationText: 'The joy of the Lord is your strength.' },
  { book: '1 Thessalonians', bookId: 52, chapter: 5, verse: 16, endVerse: 18, text: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.', notificationText: 'Rejoice always, pray continually, give thanks.' },
  { book: 'James', bookId: 59, chapter: 1, verse: 2, endVerse: 3, text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.', notificationText: 'Consider trials as pure joy.' },
];

export interface SelectedVerse {
  book: string;
  bookId: number;
  chapter: number;
  verse: number;
  endVerse?: number;
  text: string;
  theme: string;
  notificationText: string;
}

const BOOK_ID_MAP: Record<string, number> = {
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14,
  'Ezra': 15, 'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19,
  'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Solomon': 22, 'Isaiah': 23,
  'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26, 'Daniel': 27,
  'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
  'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37,
  'Zechariah': 38, 'Malachi': 39, 'Matthew': 40, 'Mark': 41, 'Luke': 42,
  'John': 43, 'Acts': 44, 'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47,
  'Galatians': 48, 'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
  '1 Thessalonians': 52, '2 Thessalonians': 53, '1 Timothy': 54, '2 Timothy': 55,
  'Titus': 56, 'Philemon': 57, 'Hebrews': 58, 'James': 59, '1 Peter': 60,
  '2 Peter': 61, '1 John': 62, '2 John': 63, '3 John': 64, 'Jude': 65,
  'Revelation': 66,
};

export async function selectVerseOfTheWeek(): Promise<SelectedVerse> {
  // Rotate through themes based on week of year
  const weekOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const themeIndex = weekOfYear % VERSE_THEMES.length;
  const theme = VERSE_THEMES[themeIndex];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You are a Bible verse selector for a weekly notification feature. Select ONE uplifting, encouraging Bible verse that fits the theme provided.

Rules:
- Choose verses that are complete thoughts (you can include 1-3 consecutive verses if needed)
- Prefer well-known, impactful verses
- The verse should be encouraging and uplifting
- Don't repeat commonly overused verses like John 3:16 or Jeremiah 29:11 too often
- Include the full verse text as it appears in the NIV translation

Respond ONLY with valid JSON in this exact format:
{
  "book": "Book Name",
  "chapter": 29,
  "verse": 11,
  "endVerse": null,
  "text": "Full verse text here",
  "notificationText": "Short preview under 100 chars..."
}`
      }, {
        role: 'user',
        content: `Select an uplifting Bible verse for this week's theme: "${theme}"`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    const bookId = BOOK_ID_MAP[parsed.book] || 1;

    return {
      book: parsed.book,
      bookId,
      chapter: parsed.chapter,
      verse: parsed.verse,
      endVerse: parsed.endVerse || undefined,
      text: parsed.text,
      theme,
      notificationText: parsed.notificationText.substring(0, 100),
    };
  } catch (error) {
    console.error('Error selecting verse:', error);
    // Fallback to rotating through the preset list
    const fallbackIndex = weekOfYear % FALLBACK_VERSES.length;
    const fallbackVerse = FALLBACK_VERSES[fallbackIndex];
    return {
      ...fallbackVerse,
      theme,
    };
  }
}
