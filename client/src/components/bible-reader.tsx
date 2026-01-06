import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, 
  Bookmark,
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Sparkles,
  StickyNote,
  Columns2,
  Check,
  Share2,
  Copy,
  Loader2,
  Send,
  MessageCircle,
  User,
  BookOpen,
  Languages,
  ArrowRight
} from "lucide-react";
import type { 
  SmartSearchResponse, 
  SmartSearchResult,
  SmartSearchResultVerse,
  SmartSearchResultTopic,
  SmartSearchResultQuestion,
  SmartSearchResultBook,
  SmartSearchResultCharacter,
  SmartSearchResultWordStudy
} from "@shared/models/bible";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import { UpgradeDialog } from "@/components/upgrade-dialog";

interface BibleBook {
  bookid: number;
  name: string;
  chapters: number;
}

interface BibleVerse {
  pk: number;
  verse: number;
  text: string;
  book?: number;
  chapter?: number;
}

interface BibleChapter {
  book: string;
  bookId: number;
  chapter: number;
  verses: BibleVerse[];
  translation: string;
}

interface Translation {
  short_name: string;
  full_name: string;
}

interface InsightMessage {
  role: "user" | "assistant";
  content: string;
  isInitialInsight?: boolean;
}

interface BibleReaderProps {
  translation: string;
  onTranslationChange: (translation: string) => void;
}

export default function BibleReader({ translation, onTranslationChange }: BibleReaderProps) {
  const [, navigate] = useLocation();
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [showSaveGlow, setShowSaveGlow] = useState(false);
  const [insight, setInsight] = useState("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [compareTranslations, setCompareTranslations] = useState<string[]>(["KJV", "NIV", "NIV2011", "ESV", "NLT", "NKJV", "NASB", "AMP", "MSG"]);
  const [footerKey, setFooterKey] = useState(0);
  const [wasFooterOpen, setWasFooterOpen] = useState(false);
  const [insightMessages, setInsightMessages] = useState<InsightMessage[]>([]);
  const [insightConversationId, setInsightConversationId] = useState<number | null>(null);
  const [insightInput, setInsightInput] = useState("");
  const [isStreamingInsight, setIsStreamingInsight] = useState(false);
  const [insightVerseRef, setInsightVerseRef] = useState("");
  const [insightVerseText, setInsightVerseText] = useState("");
  const [smartSearchResults, setSmartSearchResults] = useState<SmartSearchResponse | null>(null);
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [searchLimitResetAt, setSearchLimitResetAt] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoadingBookSynopsis, setIsLoadingBookSynopsis] = useState(false);
  const [scrollToVerse, setScrollToVerse] = useState<number | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>("smart_search");
  const [upgradeResetAt, setUpgradeResetAt] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const insightChatRef = useRef<HTMLDivElement>(null);
  const insightInputRef = useRef<HTMLTextAreaElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevTranslationRef = useRef<string>(translation);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // When translation changes and there's a selected verse, scroll to it
  useEffect(() => {
    if (prevTranslationRef.current !== translation && selectedVerse) {
      setScrollToVerse(selectedVerse.verse);
    }
    prevTranslationRef.current = translation;
  }, [translation, selectedVerse]);

  // Lock body scroll when insight modal is open (prevents iOS background scrolling)
  useEffect(() => {
    if (showInsight) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [showInsight]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    if (searchQuery.length >= 2) {
      searchDebounceRef.current = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
      }, 500);
    } else {
      setSmartSearchResults(null);
      setDebouncedSearchQuery("");
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.length >= 2 && showSearch) {
      performSmartSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, showSearch]);

  useEffect(() => {
    if (selectedBook && !showBookPicker) {
      contentRef.current?.scrollTo(0, 0);
    }
  }, [selectedBook, showBookPicker]);

  const performSmartSearch = async (query: string) => {
    // If limit is already reached, don't make another request
    if (searchLimitReached) {
      return;
    }
    
    setIsSmartSearching(true);
    try {
      const res = await fetch("/api/bible/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include",
      });
      if (res.status === 429) {
        const data = await res.json();
        setSearchLimitReached(true);
        setSearchLimitResetAt(data.resetAt || null);
        setSmartSearchResults(null);
        return;
      }
      if (!res.ok) {
        throw new Error("Search failed");
      }
      const data: SmartSearchResponse = await res.json();
      setSmartSearchResults(data);
    } catch (error) {
      console.error("Smart search error:", error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSmartSearching(false);
    }
  };

  const handleSmartSearchResult = (result: SmartSearchResult) => {
    switch (result.type) {
      case "verse":
        const verseResult = result as SmartSearchResultVerse;
        const book = books?.find(b => b.bookid === verseResult.bookId);
        if (book) {
          setSelectedBook(book);
          setSelectedChapter(verseResult.chapter);
          setScrollToVerse(verseResult.verse);
          setShowBookPicker(false);
          setShowSearch(false);
          setSearchQuery("");
          setSmartSearchResults(null);
        }
        break;
      case "book":
        const bookResult = result as SmartSearchResultBook;
        const targetBook = books?.find(b => b.bookid === bookResult.bookId);
        if (targetBook) {
          setSelectedBook(targetBook);
          setSelectedChapter(1);
          setShowBookPicker(false);
          setShowSearch(false);
          setSearchQuery("");
          setSmartSearchResults(null);
          contentRef.current?.scrollTo(0, 0);
        }
        break;
      case "question":
        const questionResult = result as SmartSearchResultQuestion;
        navigate(`/pastor-chat?tab=chat&seedQuestion=${encodeURIComponent(questionResult.question)}&seedAnswer=${encodeURIComponent(questionResult.briefAnswer)}`);
        break;
      case "topic":
      case "character":
      case "word_study":
        break;
    }
  };

  const handleTopicVerseClick = (verse: { bookId: number; chapter: number; verse: number }) => {
    const book = books?.find(b => b.bookid === verse.bookId);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(verse.chapter);
      setScrollToVerse(verse.verse);
      setShowBookPicker(false);
      setShowSearch(false);
      setSearchQuery("");
      setSmartSearchResults(null);
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const { data: translations } = useQuery<Translation[]>({
    queryKey: ["/api/bible/translations"],
  });

  const { data: books } = useQuery<BibleBook[]>({
    queryKey: ["/api/bible/books", translation],
    enabled: !!translation,
    select: (data) => {
      const seen = new Set<string>();
      return data.filter(book => {
        if (seen.has(book.name)) return false;
        seen.add(book.name);
        return true;
      });
    },
  });

  const { data: chapter, isLoading: isLoadingChapter } = useQuery<BibleChapter>({
    queryKey: ["/api/bible/chapter", translation, selectedBook?.bookid, selectedChapter],
    enabled: !!selectedBook && !showBookPicker,
  });

  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery<{ translation: string; verses: BibleVerse[] }[]>({
    queryKey: ["/api/bible/compare", selectedBook?.bookid, selectedChapter, selectedVerse?.verse, compareTranslations],
    queryFn: async () => {
      if (!selectedVerse || !selectedBook) return [];
      const allTranslations = Array.from(new Set(compareTranslations));
      const res = await apiRequest("POST", "/api/bible/compare", {
        translations: allTranslations,
        bookId: selectedBook.bookid,
        chapter: selectedChapter,
        verses: [selectedVerse.verse],
      });
      return res.json();
    },
    enabled: showCompare && !!selectedVerse && !!selectedBook,
  });

  // Scroll to specific verse when chapter loads
  useEffect(() => {
    if (scrollToVerse && chapter && !isLoadingChapter) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        const verseElement = verseRefs.current.get(scrollToVerse);
        if (verseElement) {
          // Check if verse is already visible in viewport
          const rect = verseElement.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          if (isVisible) {
            // Already visible - trigger burst immediately
            verseElement.classList.add("verse-burst-highlight");
            setTimeout(() => {
              verseElement.classList.remove("verse-burst-highlight");
            }, 4000);
          } else {
            // Need to scroll - trigger burst after scroll completes
            verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
            
            // Wait for scroll to complete before triggering burst
            let scrollTimeout: NodeJS.Timeout;
            const checkScrollEnd = () => {
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                verseElement.classList.add("verse-burst-highlight");
                setTimeout(() => {
                  verseElement.classList.remove("verse-burst-highlight");
                }, 4000);
                window.removeEventListener("scroll", checkScrollEnd, true);
              }, 150);
            };
            
            window.addEventListener("scroll", checkScrollEnd, true);
            // Fallback in case scroll event doesn't fire
            setTimeout(() => {
              window.removeEventListener("scroll", checkScrollEnd, true);
              if (!verseElement.classList.contains("verse-burst-highlight")) {
                verseElement.classList.add("verse-burst-highlight");
                setTimeout(() => {
                  verseElement.classList.remove("verse-burst-highlight");
                }, 4000);
              }
            }, 1000);
          }
        }
        setScrollToVerse(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scrollToVerse, chapter, isLoadingChapter]);

  const MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
  const getMilestoneMessage = (count: number) => {
    switch (count) {
      case 1: return "Your journey begins! First note saved.";
      case 5: return "You're building a habit! 5 notes.";
      case 10: return "Double digits! 10 notes and counting.";
      case 25: return "Quarter century of reflections!";
      case 50: return "Halfway to 100! Amazing dedication.";
      case 100: return "A hundred reflections! You're truly devoted.";
      case 250: return "250 notes! Your wisdom grows.";
      case 500: return "500 notes! An incredible milestone.";
      default: return null;
    }
  };

  const saveNoteMutation = useMutation({
    mutationFn: async (data: { 
      verseRef: string; 
      verseText: string; 
      content: string; 
      tags: string[];
      bookId: number;
      chapter: number;
      verse: number;
    }) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (res.status === 429) {
        const errorData = await res.json();
        throw { status: 429, ...errorData };
      }
      if (!res.ok) {
        throw new Error("Failed to save note");
      }
      return res.json();
    },
    onSuccess: (data: { note: any; count: number }) => {
      setShowSaveGlow(true);
      const newCount = data.count;
      const milestoneMessage = getMilestoneMessage(newCount);
      
      setTimeout(() => {
        setShowSaveGlow(false);
        setShowNote(false);
        setNoteText("");
        setNoteTags([]);
        
        if (milestoneMessage) {
          toast({ 
            title: `🎉 Milestone: ${newCount} notes!`, 
            description: milestoneMessage,
          });
        } else {
          toast({ title: "Note saved", description: "Your reflection has been saved" });
        }
      }, 600);
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
    onError: (error: any) => {
      if (error?.status === 429) {
        setUpgradeFeature("notes");
        setUpgradeResetAt(null);
        setUpgradeDialogOpen(true);
        return;
      }
      toast({ title: "Failed to save note", variant: "destructive" });
    },
  });

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookPicker(false);
    contentRef.current?.scrollTo(0, 0);
  };

  const handleChapterChange = (direction: "prev" | "next") => {
    if (!selectedBook) return;
    
    if (direction === "next") {
      if (selectedChapter < selectedBook.chapters) {
        setSelectedChapter(selectedChapter + 1);
      } else {
        const currentIndex = books?.findIndex(b => b.bookid === selectedBook.bookid) || 0;
        if (books && currentIndex < books.length - 1) {
          const nextBook = books[currentIndex + 1];
          setSelectedBook(nextBook);
          setSelectedChapter(1);
        }
      }
    } else {
      if (selectedChapter > 1) {
        setSelectedChapter(selectedChapter - 1);
      } else {
        const currentIndex = books?.findIndex(b => b.bookid === selectedBook.bookid) || 0;
        if (books && currentIndex > 0) {
          const prevBook = books[currentIndex - 1];
          setSelectedBook(prevBook);
          setSelectedChapter(prevBook.chapters);
        }
      }
    }
    contentRef.current?.scrollTo(0, 0);
  };

  const handleVerseClick = (verse: BibleVerse) => {
    // If clicking the same verse that's already selected, deselect it
    if (selectedVerse?.verse === verse.verse) {
      setSelectedVerse(null);
      return;
    }
    
    const isFooterCurrentlyOpen = selectedVerse !== null;
    if (!isFooterCurrentlyOpen) {
      setFooterKey(prev => prev + 1);
    }
    setWasFooterOpen(isFooterCurrentlyOpen);
    setSelectedVerse(verse);
  };

  const handleGetInsight = async () => {
    if (!selectedVerse || !selectedBook) return;
    
    const verseRef = `${selectedBook.name} ${selectedChapter}:${selectedVerse.verse}`;
    setInsightVerseRef(verseRef);
    setInsightVerseText(selectedVerse.text);
    setShowInsight(true);
    setIsLoadingInsight(true);
    setInsightMessages([]);
    setInsightInput("");

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Insight: ${verseRef}` }),
        credentials: "include",
      });
      
      if (response.status === 429) {
        const data = await response.json();
        setShowInsight(false);
        setUpgradeFeature("verse_insight");
        setUpgradeResetAt(data.resetAt || null);
        setUpgradeDialogOpen(true);
        setIsLoadingInsight(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }
      const conversation = await response.json();
      setInsightConversationId(conversation.id);

      const prompt = `Please explain this Bible verse in plain, accessible language. Include historical context, cultural background, and practical application for today. Keep it concise but insightful.

Verse: "${selectedVerse.text}"
Reference: ${verseRef} (${translation})`;

      const msgResponse = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: prompt }),
        credentials: "include",
      });

      const reader = msgResponse.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullText += data.content;
                  setInsightMessages([{ role: "assistant", content: fullText, isInitialInsight: true }]);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting insight:", error);
      toast({ title: "Failed to get insight", variant: "destructive" });
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleSendInsightMessage = async () => {
    if (!insightInput.trim() || !insightConversationId || isStreamingInsight) return;

    const userMessage = insightInput.trim();
    setInsightInput("");
    setInsightMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreamingInsight(true);

    try {
      const msgResponse = await fetch(`/api/conversations/${insightConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: userMessage }),
        credentials: "include",
      });

      const reader = msgResponse.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullText += data.content;
                  setInsightMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg?.role === "assistant" && !lastMsg.isInitialInsight) {
                      lastMsg.content = fullText;
                    } else {
                      newMessages.push({ role: "assistant", content: fullText });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsStreamingInsight(false);
      insightInputRef.current?.focus();
    }
  };

  const handleCloseInsight = () => {
    setShowInsight(false);
    setInsightMessages([]);
    setInsightConversationId(null);
    setInsightInput("");
    setInsightVerseRef("");
    setInsightVerseText("");
  };

  useEffect(() => {
    if (insightChatRef.current) {
      insightChatRef.current.scrollTop = insightChatRef.current.scrollHeight;
    }
  }, [insightMessages]);

  const handleSaveNote = () => {
    if (!selectedVerse || !selectedBook || !noteText.trim()) return;
    
    saveNoteMutation.mutate({
      verseRef: `${selectedBook.name} ${selectedChapter}:${selectedVerse.verse}`,
      verseText: selectedVerse.text,
      content: noteText,
      tags: noteTags,
      bookId: selectedBook.bookid,
      chapter: selectedChapter,
      verse: selectedVerse.verse,
    });
  };

  const toggleTag = (tag: string) => {
    setNoteTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const insertPrompt = (prompt: string) => {
    setNoteText(prev => prev ? `${prev}\n\n${prompt}` : prompt);
  };

  const handleCopyVerse = () => {
    if (!selectedVerse || !selectedBook) return;
    const text = `"${selectedVerse.text}" - ${selectedBook.name} ${selectedChapter}:${selectedVerse.verse} (${translation})`;
    navigator.clipboard.writeText(text);
    toast({ title: "Verse copied" });
  };

  const handleBookSynopsis = async () => {
    if (!selectedBook) return;
    
    setIsLoadingBookSynopsis(true);
    try {
      const res = await fetch("/api/bible/book-synopsis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName: selectedBook.name }),
        credentials: "include",
      });
      
      if (res.status === 429) {
        const data = await res.json();
        setUpgradeFeature("book_synopsis");
        setUpgradeResetAt(data.resetAt || null);
        setUpgradeDialogOpen(true);
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to get synopsis");
      }
      
      const data = await res.json();
      
      if (data.question && data.answer) {
        const params = new URLSearchParams({
          tab: "chat",
          seedQuestion: data.question,
          seedAnswer: data.answer,
        });
        if (data.followUp) {
          params.set("seedFollowUp", data.followUp);
        }
        navigate(`/pastor-chat?${params.toString()}`);
      }
    } catch (error) {
      console.error("Book synopsis error:", error);
      toast({ 
        title: "Unable to get synopsis", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoadingBookSynopsis(false);
    }
  };

  const groupedBooks = books?.reduce((acc, book) => {
    const isOT = book.bookid <= 39;
    const key = isOT ? "Old Testament" : "New Testament";
    if (!acc[key]) acc[key] = [];
    acc[key].push(book);
    return acc;
  }, {} as Record<string, BibleBook[]>);

  const handleSearchToggle = () => {
    if (!showSearch) {
      setShowSearch(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  if (showBookPicker) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div 
          className={`flex items-center justify-between p-4 border-b overflow-hidden ${!showSearch ? "cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors" : ""}`}
          onClick={() => !showSearch && handleSearchToggle()}
        >
          <AnimatePresence mode="popLayout">
            {showSearch ? (
              <motion.div
                key="search-input"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 700,
                  damping: 40,
                  mass: 0.3
                }}
                className="flex-1 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search verses, topics, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 focus-visible:ring-[#c08e00]"
                    data-testid="input-bible-search"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchToggle}
                  className="h-9 w-9 flex-shrink-0 hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
                  data-testid="button-close-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="title-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center relative"
              >
                <motion.h2
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 700,
                    damping: 40
                  }}
                  className="text-xl font-semibold font-serif flex items-center gap-2"
                >
                  <Search className="w-5 h-5 text-muted-foreground" />
                  Smart Search
                </motion.h2>
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer hover:text-[#c08e00] active:text-[#c08e00]/80 transition-colors z-10 p-2 -mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigate("/notes");
                  }}
                  data-testid="button-saved-notes"
                >
                  <Bookmark className="w-7 h-7" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {showSearch && searchQuery.length >= 2 ? (
              <div className="space-y-4">
                {isSmartSearching && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
                    <p className="text-sm text-muted-foreground">Searching with AI...</p>
                  </div>
                )}
                
                {!isSmartSearching && searchLimitReached && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8 gap-4 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[hsl(25,35%,45%)]/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[hsl(25,35%,45%)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Smart Search Limit Reached</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        You've used all your AI-powered searches for this month.
                      </p>
                      {searchLimitResetAt && (
                        <p className="text-xs text-muted-foreground">
                          Resets on {new Date(searchLimitResetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <Link href="/pastor-chat?upgrade=true">
                      <Button 
                        className="bg-[hsl(25,35%,45%)] hover:bg-[hsl(25,35%,38%)] text-white"
                        data-testid="button-upgrade-search"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade to Pro for Unlimited
                      </Button>
                    </Link>
                  </motion.div>
                )}
                
                {!isSmartSearching && !searchLimitReached && smartSearchResults && (
                  <>
                    {smartSearchResults.interpretation && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-muted-foreground italic border-l-2 border-[#c08e00] pl-3"
                      >
                        {smartSearchResults.interpretation}
                      </motion.p>
                    )}
                    
                    <div className="space-y-3">
                      {smartSearchResults.results.map((result, index) => (
                        <motion.div
                          key={`${result.type}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {result.type === "verse" && (
                            <button
                              onClick={() => handleSmartSearchResult(result)}
                              className="w-full text-left p-4 rounded-lg border hover:bg-[#c08e00]/10 hover:border-[#c08e00]/30 transition-colors"
                              data-testid={`smart-result-verse-${index}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-[#c08e00]" />
                                <span className="font-medium text-sm">{(result as SmartSearchResultVerse).reference}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{(result as SmartSearchResultVerse).preview}</p>
                            </button>
                          )}
                          
                          {result.type === "book" && (
                            <button
                              onClick={() => handleSmartSearchResult(result)}
                              className="w-full text-left p-4 rounded-lg border hover:bg-[#c08e00]/10 hover:border-[#c08e00]/30 transition-colors"
                              data-testid={`smart-result-book-${index}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Book className="w-4 h-4 text-[#c08e00]" />
                                <span className="font-medium">{(result as SmartSearchResultBook).bookName}</span>
                                <span className="text-xs text-muted-foreground">({(result as SmartSearchResultBook).chapters} chapters)</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{(result as SmartSearchResultBook).description}</p>
                            </button>
                          )}
                          
                          {result.type === "question" && (
                            <button
                              onClick={() => handleSmartSearchResult(result)}
                              className="w-full text-left p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                              data-testid={`smart-result-question-${index}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-sm">Ask Pastor Brett</span>
                              </div>
                              <p className="text-sm font-medium mb-1">{(result as SmartSearchResultQuestion).question}</p>
                              <p className="text-sm text-muted-foreground mb-2">{(result as SmartSearchResultQuestion).briefAnswer}</p>
                              <div className="flex items-center gap-1 text-xs text-blue-500">
                                <span>Continue discussion</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </button>
                          )}
                          
                          {result.type === "topic" && (
                            <div className="p-4 rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-[#c08e00]" />
                                <span className="font-medium">{(result as SmartSearchResultTopic).title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{(result as SmartSearchResultTopic).description}</p>
                              <div className="space-y-2">
                                {(result as SmartSearchResultTopic).verses.map((v, vIndex) => (
                                  <button
                                    key={vIndex}
                                    onClick={() => handleTopicVerseClick(v)}
                                    className="w-full text-left p-2 rounded hover:bg-[#c08e00]/10 transition-colors"
                                    data-testid={`topic-verse-${index}-${vIndex}`}
                                  >
                                    <p className="text-sm font-medium text-[#c08e00]">{v.reference}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{v.preview}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {result.type === "character" && (
                            <div className="p-4 rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-[#c08e00]" />
                                <span className="font-medium">{(result as SmartSearchResultCharacter).name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{(result as SmartSearchResultCharacter).description}</p>
                              <div className="space-y-2">
                                {(result as SmartSearchResultCharacter).keyVerses.map((v, vIndex) => (
                                  <button
                                    key={vIndex}
                                    onClick={() => handleTopicVerseClick(v)}
                                    className="w-full text-left p-2 rounded hover:bg-[#c08e00]/10 transition-colors"
                                    data-testid={`character-verse-${index}-${vIndex}`}
                                  >
                                    <p className="text-sm font-medium text-[#c08e00]">{v.reference}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{v.context}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {result.type === "word_study" && (
                            <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex items-center gap-2 mb-2">
                                <Languages className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{(result as SmartSearchResultWordStudy).word}</span>
                                <span className="text-xs text-muted-foreground">({(result as SmartSearchResultWordStudy).originalLanguage})</span>
                              </div>
                              <p className="text-sm mb-3">{(result as SmartSearchResultWordStudy).meaning}</p>
                              <div className="space-y-2">
                                {(result as SmartSearchResultWordStudy).usageExamples.map((v, vIndex) => (
                                  <button
                                    key={vIndex}
                                    onClick={() => handleTopicVerseClick(v)}
                                    className="w-full text-left p-2 rounded hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
                                    data-testid={`word-study-verse-${index}-${vIndex}`}
                                  >
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{v.reference}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{v.context}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    {smartSearchResults.results.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                      </div>
                    )}
                  </>
                )}
                
                {showSearch && searchQuery.length > 0 && searchQuery.length < 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Type at least 2 characters to search
                  </p>
                )}
              </div>
            ) : (
              <>
                {groupedBooks && Object.entries(groupedBooks).map(([testament, bookList], testamentIndex) => (
                  <motion.div 
                    key={testament}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: testamentIndex * 0.1 }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{testament}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {bookList.map((book, bookIndex) => (
                        <motion.button
                          key={book.bookid}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: testamentIndex * 0.1 + Math.min(bookIndex * 0.015, 0.3) }}
                          onClick={() => handleBookSelect(book)}
                          className="p-3 text-left rounded-lg border hover:bg-[#c08e00]/10 hover:border-[#c08e00]/30 active:bg-[#c08e00]/20 transition-colors"
                          data-testid={`book-${book.bookid}`}
                        >
                          <p className="font-medium text-sm">{book.name}</p>
                          <p className="text-xs text-muted-foreground">{book.chapters} chapters</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-3 border-b gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBookPicker(true)}
          className="flex items-center gap-2"
          data-testid="button-book-picker"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium truncate max-w-[120px] sm:max-w-none">
            {selectedBook?.name}
          </span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleChapterChange("prev")}
            disabled={selectedBook?.bookid === 1 && selectedChapter === 1}
            className="hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
            data-testid="button-prev-chapter"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Select 
            value={selectedChapter.toString()} 
            onValueChange={(v) => {
              setSelectedChapter(parseInt(v));
              contentRef.current?.scrollTo(0, 0);
            }}
          >
            <SelectTrigger className="w-16" data-testid="select-chapter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleChapterChange("next")}
            disabled={books && selectedBook?.bookid === books[books.length - 1]?.bookid && selectedChapter === selectedBook?.chapters}
            className="hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
            data-testid="button-next-chapter"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

      </div>

      <ScrollArea className="flex-1" ref={contentRef}>
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          {selectedChapter === 1 && selectedBook?.name && (() => {
            const bookHeaderImages: Record<string, string> = {
              "Genesis": "/attached_assets/Genesis_1767411601006.png",
              "Exodus": "/attached_assets/Exodus_1767412636802.png",
              "Leviticus": "/attached_assets/Leviticus_1767412914057.png",
              "Numbers": "/attached_assets/Numbers_1767413000653.png",
              "Deuteronomy": "/attached_assets/Deuteronomy_1767413178601.png",
              "Joshua": "/attached_assets/Joshua_1767413275284.png",
              "Judges": "/attached_assets/Judges_1767413305628.png",
              "Ruth": "/attached_assets/Ruth_1767413374084.png",
              "1 Samuel": "/attached_assets/1_samuel_1767413735216.png",
              "2 Samuel": "/attached_assets/2_samuel_1767413735217.png",
              "1 Kings": "/attached_assets/1_Kings_1767413857065.png",
              "2 Kings": "/attached_assets/2_kings_1767413943019.png",
              "1 Chronicles": "/attached_assets/1_chronicles_1767414102105.png",
              "2 Chronicles": "/attached_assets/2_chronicles_1767414225684.png",
              "Ezra": "/attached_assets/Ezra_1767414326404.png",
              "Nehemiah": "/attached_assets/Nehemia_1767414455924.png",
              "Esther": "/attached_assets/Esther_1767414581937.png",
              "Job": "/attached_assets/Job_1767415276443.png",
              "Psalms": "/attached_assets/Psalm_1767415345681.png",
              "Proverbs": "/attached_assets/proverbs_1767415425100.png",
              "Ecclesiastes": "/attached_assets/ecclesiastes_1767415636619.png",
              "Song of Solomon": "/attached_assets/Song_of_Solomon_1767415703406.png",
              "Isaiah": "/attached_assets/Isaiah_1767415854208.png",
              "Jeremiah": "/attached_assets/Jeremiah_1767415967086.png",
              "Lamentations": "/attached_assets/Lamentations_1767416138635.png",
              "Ezekiel": "/attached_assets/Ezekial_1767416354333.png",
              "Daniel": "/attached_assets/Daniel_1767416552550.png",
              "Hosea": "/attached_assets/Hosea_1767416671710.png",
              "Joel": "/attached_assets/Joel_1767416752872.png",
              "Amos": "/attached_assets/Amos_1767416900316.png",
              "Obadiah": "/attached_assets/Obadiah_1767416910129.png",
              "Jonah": "/attached_assets/Jonah_1767416994034.png",
              "Micah": "/attached_assets/Micah_1767417074729.png",
              "Nahum": "/attached_assets/Nahum_1767417179478.png",
              "Habakkuk": "/attached_assets/Habakkuk_1767417257097.png",
              "Zephaniah": "/attached_assets/Zephaniah_1767417501572.png",
              "Haggai": "/attached_assets/Haggai_1767417622721.png",
              "Zechariah": "/attached_assets/Zechariah_1767417826870.png",
              "Malachi": "/attached_assets/Malachi_1767418993072.png",
              "Matthew": "/attached_assets/Matthew_1767419474550.png",
              "Mark": "/attached_assets/Mark_1767420620236.png",
              "Luke": "/attached_assets/Luke_1767421254835.png",
              "John": "/attached_assets/John_1767421355415.png",
              "Acts": "/attached_assets/Acts_1767421479985.png",
              "Romans": "/attached_assets/Romans_1767421617285.png",
              "1 Corinthians": "/attached_assets/1_Corinthians_1767428700264.png",
              "2 Corinthians": "/attached_assets/2_Corinthians_1767429135473.png",
              "Galatians": "/attached_assets/Galations_1767429121337.png",
              "Ephesians": "/attached_assets/Ephesians_1767429594997.png",
              "Philippians": "/attached_assets/image_1767458321782.png",
              "Colossians": "/attached_assets/58df8405-6738-4315-bc88-5792866c1f6a_1767459105574.png",
              "1 Thessalonians": "/attached_assets/0a8a2f9c-4862-4186-9fb3-bd92fb1bc9e7_1767459379498.png",
              "2 Thessalonians": "/attached_assets/fb5960a8-c1f4-440f-b8cc-b67527a1093c_1767459381009.png",
              "1 Timothy": "/attached_assets/1_Timothy_1767460433842.png",
              "2 Timothy": "/attached_assets/2_timothy_1767461142916.png",
              "Titus": "/attached_assets/Titus_1767461633372.png",
              "Philemon": "/attached_assets/Philemon_1767461904106.png",
              "Hebrews": "/attached_assets/Hebrews_1767462145956.png",
              "James": "/attached_assets/James_1767462437109.png",
              "1 Peter": "/attached_assets/1_Peter_1767462523972.png",
              "2 Peter": "/attached_assets/2_Peter_1767462672373.png",
              "1 John": "/attached_assets/1_John_1767463715610.png",
              "2 John": "/attached_assets/2_John_1767463802345.png",
              "3 John": "/attached_assets/3_John_1767463941002.png",
              "Jude": "/attached_assets/Jude_1767464016099.png",
              "Revelation": "/attached_assets/Revelation_1767464176577.png",
              "Tobit": "/attached_assets/Tobit_1767464568378.png",
              "Judith": "/attached_assets/Judith_1767464687292.png",
              "1 Maccabees": "/attached_assets/A_pen-and-ink-style_digital_illustration_in_mustar_1767465895165.png",
              "2 Maccabees": "/attached_assets/A_traditional-style_line_drawing_in_sepia_tone_dep_1767465792706.png",
              "1 Esdras": "/attached_assets/Esdras_1767465072053.png",
              "2 Esdras": "/attached_assets/2_Esdras_1767475181847.png",
              "Wisdom": "/attached_assets/Wisdome_Fix_Test_1767465366994.png",
              "Sirach": "/attached_assets/Sirach_1767475181849.png",
              "Baruch": "/attached_assets/Baruch_1767475181848.png",
              "Epistle of Jeremiah": "/attached_assets/Epistle_of_Jeremiah_1767475239079.png",
              "Prayer of Azariah": "/attached_assets/Prayer_of_Azariah_1767475181848.png",
              "Susanna": "/attached_assets/Susanna_1767475181849.png",
              "Bel and Dragon": "/attached_assets/Bel_and_the_Dragon_1767475239079.png",
              "Prayer of Manasseh": "/attached_assets/Prayer_of_Manasseh_1767475181849.png",
            };
            const imageSrc = bookHeaderImages[selectedBook.name];
            return imageSrc ? (
              <img 
                src={imageSrc}
                alt={`${selectedBook.name} decorative header`}
                className="w-full h-auto mb-4"
              />
            ) : null;
          })()}

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-serif font-bold" data-testid="heading-chapter">
              {chapter?.book} {selectedChapter}
            </h1>
            {selectedChapter === 1 && selectedBook && (
              <button
                onClick={handleBookSynopsis}
                disabled={isLoadingBookSynopsis}
                className="text-[hsl(35,65%,55%)] hover:text-[hsl(35,65%,45%)] hover:bg-[hsl(35,65%,55%)]/10 p-1 rounded-md transition-colors disabled:opacity-50"
                title={`Get AI synopsis of ${selectedBook.name}`}
                data-testid="button-book-synopsis"
              >
                {isLoadingBookSynopsis ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-6">{translation}</p>

          {isLoadingChapter ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 pb-20">
              {chapter?.verses.map((verse) => (
                <motion.span
                  key={verse.pk}
                  ref={(el) => {
                    if (el) verseRefs.current.set(verse.verse, el as unknown as HTMLDivElement);
                  }}
                  onClick={() => handleVerseClick(verse)}
                  animate={{
                    backgroundColor: selectedVerse?.verse === verse.verse 
                      ? "rgba(192, 142, 0, 0.15)" 
                      : "rgba(0, 0, 0, 0)"
                  }}
                  transition={{ duration: 0.025 }}
                  className="inline cursor-pointer hover:bg-[#c08e00]/10 rounded px-0.5 transition-colors"
                  data-testid={`verse-${verse.verse}`}
                >
                  <sup className={`text-xs font-medium mr-1 transition-colors ${
                    selectedVerse?.verse === verse.verse ? "text-[#c08e00]" : "text-primary"
                  }`}>{verse.verse}</sup>
                  <span className="text-base leading-relaxed">{verse.text} </span>
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <AnimatePresence>
        {selectedVerse && (
          <motion.div
            key={footerKey}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 border-t p-3 bg-background shadow-lg z-50"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
          >
            <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${selectedBook?.name}-${selectedChapter}-${selectedVerse.verse}`}
                  initial={{ x: wasFooterOpen ? 30 : 0, opacity: wasFooterOpen ? 0 : 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="text-sm font-medium truncate"
                >
                  {selectedBook?.name} {selectedChapter}:{selectedVerse.verse}
                </motion.p>
              </AnimatePresence>
              <div className="flex items-center gap-1">
                {[
                  { icon: Sparkles, label: "Insight", onClick: handleGetInsight, testId: "button-get-insight" },
                  { icon: Columns2, label: "Compare", onClick: () => setShowCompare(true), testId: "button-compare" },
                  { icon: StickyNote, label: "Note", onClick: () => setShowNote(true), testId: "button-add-note" },
                  { icon: Copy, label: null, onClick: handleCopyVerse, testId: "button-copy-verse" },
                  { icon: X, label: null, onClick: () => setSelectedVerse(null), testId: "button-deselect-verse" },
                ].map((item, index) => (
                  <motion.div
                    key={`${footerKey}-${item.testId}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.1 + index * 0.06,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onClick}
                      className="gap-1 hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
                      data-testid={item.testId}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label && <span className="hidden sm:inline">{item.label}</span>}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background flex flex-col touch-none"
            style={{ touchAction: "none" }}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c08e00]" />
                <span className="font-serif font-bold">Verse Insight</span>
              </div>
              <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseInsight}
                className="hover:bg-[#c08e00]/10 hover:text-[#c08e00]"
                data-testid="button-close-insight"
              >
                <X className="w-5 h-5" />
              </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 touch-auto overscroll-contain" ref={insightChatRef} style={{ touchAction: "pan-y" }}>
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="border-l-2 border-[#c08e00] pl-3 mb-6 mt-2">
                  <p className="text-2xl font-serif font-bold mb-1">{insightVerseRef}</p>
                  <p className="text-sm italic">"{insightVerseText}"</p>
                </div>

                {isLoadingInsight && insightMessages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  insightMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${msg.role === "user" ? "flex justify-end" : ""}`}
                    >
                      {msg.role === "user" ? (
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 max-w-[85%]">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ) : (
                        <div className={msg.isInitialInsight ? "border-l-2 border-[#c08e00]/50 pl-3" : ""}>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                strong: ({ children }) => (
                                  <strong className="font-serif font-bold">{children}</strong>
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}

                {isStreamingInsight && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Consulting the big guy...</span>
                  </div>
                )}
              </div>
            </div>

            <div 
              className="border-t p-3 bg-background"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
            >
              <div className="max-w-2xl mx-auto flex gap-2 items-stretch">
                <Textarea
                  ref={insightInputRef}
                  placeholder="Ask a follow-up question..."
                  value={insightInput}
                  onChange={(e) => setInsightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendInsightMessage();
                    }
                  }}
                  rows={1}
                  className="resize-none min-h-[44px] max-h-32 py-[10px] flex items-center"
                  data-testid="input-insight-followup"
                />
                <Button
                  onClick={handleSendInsightMessage}
                  disabled={!insightInput.trim() || isStreamingInsight}
                  className="shrink-0 bg-[#c08e00] hover:bg-[#a07800] text-white aspect-square h-[44px] w-[44px] p-0"
                  data-testid="button-send-insight"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showNote} onOpenChange={(open) => {
        setShowNote(open);
        if (!open) {
          setNoteText("");
          setNoteTags([]);
        }
      }}>
        <DialogContent className={`max-w-lg transition-all duration-300 ${showSaveGlow ? "ring-4 ring-[#c08e00]/50 shadow-[0_0_30px_rgba(192,142,0,0.4)]" : ""}`}>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-[#c08e00]" />
              Add Note
            </DialogTitle>
          </DialogHeader>
          
          <div className="border-l-2 border-[#c08e00] pl-3 py-1">
            <p className="font-medium">{selectedBook?.name} {selectedChapter}:{selectedVerse?.verse}</p>
            <p className="text-sm text-muted-foreground italic line-clamp-2">"{selectedVerse?.text}"</p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick prompts</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What does this mean to me?",
                  "A prayer based on this",
                  "How can I apply this?"
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => insertPrompt(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border hover:bg-[#c08e00]/10 hover:border-[#c08e00] hover:text-[#c08e00] transition-colors"
                    data-testid={`chip-prompt-${prompt.slice(0, 10).replace(/\s/g, '-')}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Write your reflection..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="resize-none"
              data-testid="input-note"
            />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {["Faith", "Hope", "Gratitude", "Prayer", "Question"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      noteTags.includes(tag)
                        ? "bg-[#c08e00] text-white border-[#c08e00]"
                        : "hover:bg-[#c08e00]/10 hover:border-[#c08e00]"
                    }`}
                    data-testid={`tag-${tag.toLowerCase()}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowNote(false)} data-testid="button-cancel-note">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote}
              disabled={!noteText.trim() || saveNoteMutation.isPending}
              className={`bg-[#c08e00] hover:bg-[#a07800] text-white transition-all ${showSaveGlow ? "scale-105" : ""}`}
              data-testid="button-save-note"
            >
              {saveNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : showSaveGlow ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <Check className="w-4 h-4 mr-1" />
                </motion.div>
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              {showSaveGlow ? "Saved!" : "Save Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-2xl w-[95vw] h-[90vh] sm:h-auto sm:max-h-[80vh] overflow-hidden flex flex-col p-0 sm:p-6">
          <DialogHeader className="p-4 sm:p-0 pb-0 sm:pb-0">
            <DialogTitle className="font-serif">Compare Translations</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground px-4 sm:px-0 mb-2">
            {selectedBook?.name} {selectedChapter}:{selectedVerse?.verse}
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-0 pb-4 sm:pb-0">
            {isLoadingComparison ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {comparisonData?.map((item) => (
                  <div 
                    key={item.translation} 
                    className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      onTranslationChange(item.translation);
                      // Trigger scroll to the same verse with highlight animation
                      if (selectedVerse) {
                        setScrollToVerse(selectedVerse.verse);
                      }
                      setShowCompare(false);
                    }}
                    data-testid={`comparison-${item.translation}`}
                  >
                    <p className="text-sm font-medium text-primary mb-2">{item.translation}</p>
                    {item.verses.map((v) => (
                      <p key={v.pk} className="text-sm leading-relaxed">{v.text}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        feature={upgradeFeature}
        resetAt={upgradeResetAt}
      />
    </div>
  );
}
