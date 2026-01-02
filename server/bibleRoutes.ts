import { Router } from "express";
import { db } from "./db";
import { bibleNotes, readingProgress } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as bibleService from "./bibleService";

const router = Router();

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
