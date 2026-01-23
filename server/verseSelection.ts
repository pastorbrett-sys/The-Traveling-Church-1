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
    // Fallback to a default verse
    return {
      book: 'Philippians',
      bookId: 50,
      chapter: 4,
      verse: 13,
      text: 'I can do all this through him who gives me strength.',
      theme,
      notificationText: 'I can do all this through him who gives me strength.',
    };
  }
}
