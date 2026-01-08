import { Router } from "express";
import { db } from "./db";
import { bibleNotes, readingProgress, FEATURE_LIMITS } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as bibleService from "./bibleService";
import OpenAI from "openai";
import type { SmartSearchResponse, SmartSearchResult } from "@shared/models/bible";
import { isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { checkUsageLimit, incrementUsage } from "./usageService";
import { isUserPro } from "./proStatusService";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const BIBLE_BOOKS_MAP: Record<string, { bookId: number; chapters: number }> = {
  "genesis": { bookId: 1, chapters: 50 },
  "exodus": { bookId: 2, chapters: 40 },
  "leviticus": { bookId: 3, chapters: 27 },
  "numbers": { bookId: 4, chapters: 36 },
  "deuteronomy": { bookId: 5, chapters: 34 },
  "joshua": { bookId: 6, chapters: 24 },
  "judges": { bookId: 7, chapters: 21 },
  "ruth": { bookId: 8, chapters: 4 },
  "1 samuel": { bookId: 9, chapters: 31 },
  "2 samuel": { bookId: 10, chapters: 24 },
  "1 kings": { bookId: 11, chapters: 22 },
  "2 kings": { bookId: 12, chapters: 25 },
  "1 chronicles": { bookId: 13, chapters: 29 },
  "2 chronicles": { bookId: 14, chapters: 36 },
  "ezra": { bookId: 15, chapters: 10 },
  "nehemiah": { bookId: 16, chapters: 13 },
  "esther": { bookId: 17, chapters: 10 },
  "job": { bookId: 18, chapters: 42 },
  "psalms": { bookId: 19, chapters: 150 },
  "psalm": { bookId: 19, chapters: 150 },
  "proverbs": { bookId: 20, chapters: 31 },
  "ecclesiastes": { bookId: 21, chapters: 12 },
  "song of solomon": { bookId: 22, chapters: 8 },
  "isaiah": { bookId: 23, chapters: 66 },
  "jeremiah": { bookId: 24, chapters: 52 },
  "lamentations": { bookId: 25, chapters: 5 },
  "ezekiel": { bookId: 26, chapters: 48 },
  "daniel": { bookId: 27, chapters: 12 },
  "hosea": { bookId: 28, chapters: 14 },
  "joel": { bookId: 29, chapters: 3 },
  "amos": { bookId: 30, chapters: 9 },
  "obadiah": { bookId: 31, chapters: 1 },
  "jonah": { bookId: 32, chapters: 4 },
  "micah": { bookId: 33, chapters: 7 },
  "nahum": { bookId: 34, chapters: 3 },
  "habakkuk": { bookId: 35, chapters: 3 },
  "zephaniah": { bookId: 36, chapters: 3 },
  "haggai": { bookId: 37, chapters: 2 },
  "zechariah": { bookId: 38, chapters: 14 },
  "malachi": { bookId: 39, chapters: 4 },
  "matthew": { bookId: 40, chapters: 28 },
  "mark": { bookId: 41, chapters: 16 },
  "luke": { bookId: 42, chapters: 24 },
  "john": { bookId: 43, chapters: 21 },
  "acts": { bookId: 44, chapters: 28 },
  "romans": { bookId: 45, chapters: 16 },
  "1 corinthians": { bookId: 46, chapters: 16 },
  "2 corinthians": { bookId: 47, chapters: 13 },
  "galatians": { bookId: 48, chapters: 6 },
  "ephesians": { bookId: 49, chapters: 6 },
  "philippians": { bookId: 50, chapters: 4 },
  "colossians": { bookId: 51, chapters: 4 },
  "1 thessalonians": { bookId: 52, chapters: 5 },
  "2 thessalonians": { bookId: 53, chapters: 3 },
  "1 timothy": { bookId: 54, chapters: 6 },
  "2 timothy": { bookId: 55, chapters: 4 },
  "titus": { bookId: 56, chapters: 3 },
  "philemon": { bookId: 57, chapters: 1 },
  "hebrews": { bookId: 58, chapters: 13 },
  "james": { bookId: 59, chapters: 5 },
  "1 peter": { bookId: 60, chapters: 5 },
  "2 peter": { bookId: 61, chapters: 3 },
  "1 john": { bookId: 62, chapters: 5 },
  "2 john": { bookId: 63, chapters: 1 },
  "3 john": { bookId: 64, chapters: 1 },
  "jude": { bookId: 65, chapters: 1 },
  "revelation": { bookId: 66, chapters: 22 },
};

const SMART_SEARCH_PROMPT = `You are an AI Bible search assistant. Analyze the user's search query and determine their intent, then provide relevant results.

IMPORTANT: You must respond ONLY with valid JSON, no markdown code blocks or extra text.

Analyze the query and return results in one or more of these categories:

1. "verse" - If user is looking for a specific verse reference (e.g., "John 3:16", "Psalm 23")
2. "topic" - If user is searching for a biblical theme/topic (e.g., "forgiveness", "faith", "love")
3. "question" - If user is asking a theological question (e.g., "Why did Jesus weep?", "What does the Bible say about...")
4. "book" - If user wants to navigate to a book (e.g., "Romans", "Psalms")
5. "character" - If user is searching for a biblical person (e.g., "David", "Paul", "Moses")
6. "word_study" - If user wants to study a word's meaning (e.g., "agape meaning", "Hebrew word for love")

Return a JSON object with this exact structure:
{
  "interpretation": "Brief explanation of what the user is looking for",
  "results": [
    // Include appropriate result objects based on query type
  ]
}

Result object structures:

For "verse":
{
  "type": "verse",
  "reference": "John 3:16",
  "bookId": 43,
  "chapter": 3,
  "verse": 16,
  "preview": "For God so loved the world..."
}

For "topic":
{
  "type": "topic",
  "title": "Forgiveness",
  "description": "Key verses about God's forgiveness and forgiving others",
  "verses": [
    { "reference": "Matthew 6:14", "bookId": 40, "chapter": 6, "verse": 14, "preview": "For if you forgive..." },
    // Include 3-5 relevant verses
  ]
}

For "question":
{
  "type": "question",
  "question": "The user's question rephrased clearly",
  "briefAnswer": "A 1-2 sentence answer",
  "suggestedPrompt": "A prompt to continue the discussion with Pastor Brett"
}

For "book":
{
  "type": "book",
  "bookId": 45,
  "bookName": "Romans",
  "description": "Paul's letter to the Romans about salvation by faith",
  "chapters": 16
}

For "character":
{
  "type": "character",
  "name": "David",
  "description": "King of Israel, author of many Psalms, ancestor of Jesus",
  "keyVerses": [
    { "reference": "1 Samuel 17:45", "bookId": 9, "chapter": 17, "verse": 45, "context": "David vs Goliath" },
    // Include 3-5 key verses
  ]
}

For "word_study":
{
  "type": "word_study",
  "word": "Agape",
  "originalLanguage": "Greek",
  "meaning": "Unconditional, sacrificial love...",
  "usageExamples": [
    { "reference": "1 Corinthians 13:4", "bookId": 46, "chapter": 13, "verse": 4, "context": "Love is patient..." }
  ]
}

Book IDs reference:
Genesis=1, Exodus=2, Leviticus=3, Numbers=4, Deuteronomy=5, Joshua=6, Judges=7, Ruth=8,
1 Samuel=9, 2 Samuel=10, 1 Kings=11, 2 Kings=12, 1 Chronicles=13, 2 Chronicles=14,
Ezra=15, Nehemiah=16, Esther=17, Job=18, Psalms=19, Proverbs=20, Ecclesiastes=21,
Song of Solomon=22, Isaiah=23, Jeremiah=24, Lamentations=25, Ezekiel=26, Daniel=27,
Hosea=28, Joel=29, Amos=30, Obadiah=31, Jonah=32, Micah=33, Nahum=34, Habakkuk=35,
Zephaniah=36, Haggai=37, Zechariah=38, Malachi=39, Matthew=40, Mark=41, Luke=42, John=43,
Acts=44, Romans=45, 1 Corinthians=46, 2 Corinthians=47, Galatians=48, Ephesians=49,
Philippians=50, Colossians=51, 1 Thessalonians=52, 2 Thessalonians=53, 1 Timothy=54,
2 Timothy=55, Titus=56, Philemon=57, Hebrews=58, James=59, 1 Peter=60, 2 Peter=61,
1 John=62, 2 John=63, 3 John=64, Jude=65, Revelation=66

Provide 1-5 results maximum, prioritizing the most relevant result type for the query.
Return ONLY the JSON object, no additional text or formatting.`;

router.post("/smart-search", isAuthenticated, async (req: any, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return res.status(400).json({ message: "Search query required (minimum 2 characters)" });
    }

    // Check if user has credits available (but don't consume yet - consumed on click-through)
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    const isPro = isUserPro(user);
    
    const limitResult = await checkUsageLimit(userId, "smart_search", isPro);
    if (!limitResult.allowed) {
      return res.status(429).json({
        code: "USAGE_LIMIT_REACHED",
        feature: "smart_search",
        remaining: 0,
        limit: FEATURE_LIMITS.smart_search,
        resetAt: limitResult.resetAt?.toISOString(),
        message: "You've reached your Smart Search limit this month. Upgrade to Pro for unlimited access.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SMART_SEARCH_PROMPT },
        { role: "user", content: query.trim() }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    
    let parsed: { interpretation?: string; results?: SmartSearchResult[] };
    try {
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, "").trim();
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ message: "Failed to parse search results" });
    }

    const response: SmartSearchResponse = {
      query: query.trim(),
      interpretation: parsed.interpretation || "Searching for relevant content...",
      results: parsed.results || [],
    };

    res.json(response);
  } catch (error) {
    console.error("Smart search error:", error);
    res.status(500).json({ message: "Smart search failed" });
  }
});

// Use a smart search credit when clicking through to a result
router.post("/smart-search/use-credit", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    const isPro = isUserPro(user);
    
    const limitResult = await checkUsageLimit(userId, "smart_search", isPro);
    if (!limitResult.allowed) {
      return res.status(429).json({
        code: "USAGE_LIMIT_REACHED",
        feature: "smart_search",
        remaining: 0,
        limit: FEATURE_LIMITS.smart_search,
        resetAt: limitResult.resetAt?.toISOString(),
        message: "You've reached your Smart Search limit this month. Upgrade to Pro for unlimited access.",
      });
    }

    await incrementUsage(userId, "smart_search", isPro);
    res.json({ 
      success: true, 
      remaining: limitResult.remaining - 1,
      limit: limitResult.limit 
    });
  } catch (error) {
    console.error("Smart search use credit error:", error);
    res.status(500).json({ message: "Failed to use search credit" });
  }
});

router.get("/translations", async (req, res) => {
  try {
    const translations = await bibleService.getTranslations();
    res.json(translations);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ message: "Failed to fetch translations" });
  }
});

router.get("/books/:translation", async (req, res) => {
  try {
    const { translation } = req.params;
    const books = await bibleService.getBooks(translation);
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

router.get("/chapter/:translation/:bookId/:chapter", async (req, res) => {
  try {
    const { translation, bookId, chapter } = req.params;
    const chapterData = await bibleService.getChapter(
      translation,
      parseInt(bookId),
      parseInt(chapter)
    );
    res.json(chapterData);
  } catch (error) {
    console.error("Error fetching chapter:", error);
    res.status(500).json({ message: "Failed to fetch chapter" });
  }
});

router.get("/verse/:translation/:bookId/:chapter/:verse", async (req, res) => {
  try {
    const { translation, bookId, chapter, verse } = req.params;
    const verseData = await bibleService.getVerse(
      translation,
      parseInt(bookId),
      parseInt(chapter),
      parseInt(verse)
    );
    if (!verseData) {
      return res.status(404).json({ message: "Verse not found" });
    }
    res.json(verseData);
  } catch (error) {
    console.error("Error fetching verse:", error);
    res.status(500).json({ message: "Failed to fetch verse" });
  }
});

router.get("/search/:translation", async (req, res) => {
  try {
    const { translation } = req.params;
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }
    const results = await bibleService.searchBible(translation, query);
    res.json(results);
  } catch (error) {
    console.error("Error searching Bible:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

router.post("/compare", async (req, res) => {
  try {
    const { translations, bookId, chapter, verses } = req.body;
    const results = await bibleService.compareTranslations(
      translations,
      bookId,
      chapter,
      verses
    );
    res.json(results);
  } catch (error) {
    console.error("Error comparing translations:", error);
    res.status(500).json({ message: "Compare failed" });
  }
});

router.post("/book-synopsis", isAuthenticated, async (req: any, res) => {
  try {
    const { bookName } = req.body;
    if (!bookName) {
      return res.status(400).json({ message: "Book name is required" });
    }

    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    const isPro = isUserPro(user);
    
    const limitResult = await checkUsageLimit(userId, "book_synopsis", isPro);
    if (!limitResult.allowed) {
      return res.status(429).json({
        code: "USAGE_LIMIT_REACHED",
        feature: "book_synopsis",
        remaining: 0,
        limit: FEATURE_LIMITS.book_synopsis,
        resetAt: limitResult.resetAt?.toISOString(),
        message: "You've reached your Book Synopsis limit this month. Upgrade to Pro for unlimited access.",
      });
    }

    const question = `Give me a short synopsis of the book of ${bookName} in the Bible.`;
    
    const [synopsisCompletion, followUpCompletion] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable and warm Bible study assistant. When asked about a book of the Bible, provide a concise yet comprehensive synopsis in one short paragraph (3-5 sentences). Include:
1. The author and approximate time period
2. The main theme or purpose
3. Key events or teachings
4. Its significance to the overall biblical narrative

Be engaging and accessible, avoiding overly academic language. Make it interesting for both new and experienced Bible readers. Only provide the synopsis paragraph, nothing else.`
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a warm Bible study assistant. Generate a single engaging follow-up question about the book of ${bookName} to encourage continued conversation. The question should invite the user to explore a specific theme, character, chapter, or teaching from this book. Only output the question, nothing else.`
          },
          {
            role: "user",
            content: `Generate a follow-up question for someone who just read a synopsis of ${bookName}.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      })
    ]);

    const synopsis = synopsisCompletion.choices[0]?.message?.content || "Unable to generate synopsis at this time.";
    const followUpQuestion = followUpCompletion.choices[0]?.message?.content || "Would you like to explore a specific theme or character from this book?";
    
    const followUpMessage = `Synopsis Above ☝️\n\n${followUpQuestion}`;

    await incrementUsage(userId, "book_synopsis", isPro);
    res.json({
      question,
      answer: synopsis,
      followUp: followUpMessage,
      bookName,
    });
  } catch (error) {
    console.error("Error generating book synopsis:", error);
    res.status(500).json({ message: "Failed to generate book synopsis" });
  }
});

router.get("/notes", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.json([]);
    }
    const notes = await db
      .select()
      .from(bibleNotes)
      .where(eq(bibleNotes.sessionId, sessionId))
      .orderBy(desc(bibleNotes.createdAt));
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

router.get("/notes/:book/:chapter/:verse", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    const { book, chapter, verse } = req.params;
    if (!sessionId) {
      return res.json([]);
    }
    const notes = await db
      .select()
      .from(bibleNotes)
      .where(
        and(
          eq(bibleNotes.sessionId, sessionId),
          eq(bibleNotes.book, book),
          eq(bibleNotes.chapter, parseInt(chapter)),
          eq(bibleNotes.verse, parseInt(verse))
        )
      )
      .orderBy(desc(bibleNotes.createdAt));
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

router.post("/notes", async (req, res) => {
  try {
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = nanoid();
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }

    const { book, chapter, verse, translation, note, isPublic } = req.body;
    const shareId = isPublic ? nanoid(10) : null;

    const [newNote] = await db
      .insert(bibleNotes)
      .values({
        sessionId,
        book,
        chapter,
        verse,
        translation: translation || "KJV",
        note,
        isPublic: isPublic || false,
        shareId,
      })
      .returning();

    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Failed to create note" });
  }
});

router.put("/notes/:id", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    const { id } = req.params;
    const { note, isPublic } = req.body;

    if (!sessionId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const shareId = isPublic ? nanoid(10) : null;

    const [updatedNote] = await db
      .update(bibleNotes)
      .set({
        note,
        isPublic: isPublic || false,
        shareId,
        updatedAt: new Date(),
      })
      .where(and(eq(bibleNotes.id, id), eq(bibleNotes.sessionId, sessionId)))
      .returning();

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Failed to update note" });
  }
});

router.delete("/notes/:id", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    const { id } = req.params;

    if (!sessionId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await db
      .delete(bibleNotes)
      .where(and(eq(bibleNotes.id, id), eq(bibleNotes.sessionId, sessionId)));

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Failed to delete note" });
  }
});

router.get("/shared/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const [note] = await db
      .select()
      .from(bibleNotes)
      .where(and(eq(bibleNotes.shareId, shareId), eq(bibleNotes.isPublic, true)));

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error fetching shared note:", error);
    res.status(500).json({ message: "Failed to fetch note" });
  }
});

router.get("/progress", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.json([]);
    }
    const progress = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.sessionId, sessionId))
      .orderBy(desc(readingProgress.completedAt));
    res.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

router.post("/progress", async (req, res) => {
  try {
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = nanoid();
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }

    const { book, chapter } = req.body;

    const existing = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.sessionId, sessionId),
          eq(readingProgress.book, book),
          eq(readingProgress.chapter, chapter)
        )
      );

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    const [progress] = await db
      .insert(readingProgress)
      .values({
        sessionId,
        book,
        chapter,
      })
      .returning();

    res.status(201).json(progress);
  } catch (error) {
    console.error("Error recording progress:", error);
    res.status(500).json({ message: "Failed to record progress" });
  }
});

export default router;
