import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { getBottomNavOffset, getBottomInset } from "@/lib/native-spacing";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingTooltip, useOnboardingState } from "@/components/onboarding";
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
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { apiRequest, apiFetch } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { VerseShareSheet } from "@/components/verse-share-sheet";
import { usePlatform } from "@/contexts/platform-context";

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
  display_name?: string;
}

interface InsightMessage {
  role: "user" | "assistant";
  content: string;
  isInitialInsight?: boolean;
}

interface DiscussionMessage {
  role: "user" | "assistant";
  content: string;
  isInitialAnswer?: boolean;
}

interface BibleReaderProps {
  translation: string;
  onTranslationChange: (translation: string) => void;
  initialBookId?: number;
  initialChapter?: number;
  initialVerse?: number;
  triggerHighlight?: boolean;
  showActionMenuOnDeepLink?: boolean;
}

// Parse verse text to extract heading if present (marked with §heading§)
// Also removes paragraph symbols (¶) which are formatting marks in KJV text
function parseVerseText(text: string): { heading?: string; content: string } {
  const headingMatch = text.match(/^§([^§]+)§\s*/);
  if (headingMatch) {
    return {
      heading: headingMatch[1],
      content: text.slice(headingMatch[0].length).replace(/¶\s*/g, '')
    };
  }
  return { content: text.replace(/¶\s*/g, '') };
}

// Check if translation is Amharic-based
function isAmharicTranslation(translation: string): boolean {
  return translation === "ETH" || translation === "AMPROT";
}

// Localized UI text
const uiText = {
  en: {
    search: "Search",
    searchPlaceholder: "Search the Bible...",
    books: "Books",
    chapters: "Chapters",
    notes: "Notes",
    compare: "Compare",
    compareTranslations: "Compare Translations",
    verseInsights: "Verse Insights",
    copy: "Copy",
    share: "Share",
    addNote: "Add Note",
    saveNote: "Save Note",
    cancel: "Cancel",
    close: "Close",
    oldTestament: "Old Testament",
    newTestament: "New Testament",
    apocrypha: "Apocrypha",
    selectBook: "Select a book to begin reading",
    loading: "Loading...",
    noResults: "No results found",
    askQuestion: "Ask a question about this verse...",
    continueDiscussion: "Continue Discussion",
    typeMessage: "Type a message...",
    send: "Send",
    bookSynopsis: "Book Synopsis",
    copied: "Copied!",
    verseCopied: "Verse copied to clipboard",
    noteSaved: "Note saved",
    noteAddedTo: "Note added to",
    searchLimitReached: "Search limit reached",
    upgradeForMore: "Upgrade for unlimited searches",
    resetsAt: "Resets at",
    chapter: "Chapter",
    verse: "Verse",
    translation: "Translation",
    noteTags: "Tags",
    enterTags: "Enter tags separated by commas",
    writeNote: "Write your note here...",
    relatedVerses: "Related Verses",
    topics: "Topics",
    questions: "Questions",
    wordStudy: "Word Study",
    characters: "Characters",
    bookInfo: "Book Info",
    smartSearch: "Smart Search",
    smartSearchLimitReached: "Smart Search Limit Reached",
    upgradeForUnlimited: "Upgrade to Pro for unlimited access",
    consultingBigGuy: "Consulting THE Big Guy...",
    current: "Current",
    quickPrompts: "Quick prompts",
    whatDoesThisMean: "What does this mean to me?",
    prayerBasedOnThis: "A prayer based on this",
    howCanIApply: "How can I apply this?",
    writeReflection: "Write your reflection...",
    tags: "Tags",
    faith: "Faith",
    hope: "Hope",
    gratitude: "Gratitude",
    prayer: "Prayer",
    question: "Question",
    insight: "Insight",
    note: "Note",
    searchingWithAI: "Searching with AI...",
    usedAllSearches: "You've used all your AI-powered searches for this month.",
    resetsOn: "Resets on",
    upgradeToProUnlimited: "Upgrade to Pro for Unlimited",
    askFollowUp: "Ask a follow-up question...",
  },
  am: {
    search: "ፈልግ",
    searchPlaceholder: "መጽሐፍ ቅዱስን ፈልግ...",
    books: "መጻሕፍት",
    chapters: "ምዕራፎች",
    notes: "ማስታወሻዎች",
    compare: "አወዳድር",
    compareTranslations: "ትርጉሞችን አወዳድር",
    verseInsights: "የጥቅስ ግንዛቤዎች",
    copy: "ቅዳ",
    share: "አጋራ",
    addNote: "ማስታወሻ ጨምር",
    saveNote: "ማስታወሻ አስቀምጥ",
    cancel: "ሰርዝ",
    close: "ዝጋ",
    oldTestament: "ብሉይ ኪዳን",
    newTestament: "አዲስ ኪዳን",
    apocrypha: "መጻሕፍተ ሰለሞን",
    selectBook: "ለማንበብ መጽሐፍ ይምረጡ",
    loading: "በመጫን ላይ...",
    noResults: "ውጤት አልተገኘም",
    askQuestion: "ስለዚህ ጥቅስ ጥያቄ ይጠይቁ...",
    continueDiscussion: "ውይይት ቀጥል",
    typeMessage: "መልዕክት ይጻፉ...",
    send: "ላክ",
    bookSynopsis: "የመጽሐፍ ማጠቃለያ",
    copied: "ተቀድቷል!",
    verseCopied: "ጥቅሱ ተቀድቷል",
    noteSaved: "ማስታወሻ ተቀምጧል",
    noteAddedTo: "ማስታወሻ ተጨምሯል ወደ",
    searchLimitReached: "የፍለጋ ገደብ ደርሷል",
    upgradeForMore: "ለተጨማሪ ፍለጋ ያሻሽሉ",
    resetsAt: "የሚታደስበት",
    chapter: "ምዕራፍ",
    verse: "ጥቅስ",
    translation: "ትርጉም",
    noteTags: "መለያዎች",
    enterTags: "መለያዎችን በኮማ ለይተው ያስገቡ",
    writeNote: "ማስታወሻዎን እዚህ ይጻፉ...",
    relatedVerses: "ተዛማጅ ጥቅሶች",
    topics: "ርዕሶች",
    questions: "ጥያቄዎች",
    wordStudy: "የቃላት ጥናት",
    characters: "ገፀ ባህሪያት",
    bookInfo: "የመጽሐፍ መረጃ",
    smartSearch: "ብልጥ ፍለጋ",
    smartSearchLimitReached: "የፍለጋ ገደብ ደርሷል",
    upgradeForUnlimited: "ለያልተገደበ መዳረሻ ወደ ፕሮ ያሻሽሉ",
    consultingBigGuy: "እግዚአብሔርን በመጠየቅ ላይ...",
    current: "አሁኑኑ",
    quickPrompts: "ፈጣን ጥቆማዎች",
    whatDoesThisMean: "ይህ ለእኔ ምን ማለት ነው?",
    prayerBasedOnThis: "በዚህ ላይ የተመሰረተ ጸሎት",
    howCanIApply: "ይህን እንዴት ልተገብር?",
    writeReflection: "ማንፀባረቅዎን ይጻፉ...",
    tags: "መለያዎች",
    faith: "እምነት",
    hope: "ተስፋ",
    gratitude: "ምስጋና",
    prayer: "ጸሎት",
    question: "ጥያቄ",
    insight: "ግንዛቤ",
    note: "ማስታወሻ",
    searchingWithAI: "በ AI ፍለጋ ላይ...",
    usedAllSearches: "የዚህ ወር የ AI ፍለጋዎችዎን ሙሉ በሙሉ ተጠቅመዋል።",
    resetsOn: "የሚታደስበት",
    upgradeToProUnlimited: "ለያልተገደበ ወደ ፕሮ ያሻሽሉ",
    askFollowUp: "ተጨማሪ ጥያቄ ይጠይቁ...",
  }
};

// Get localized text based on translation
function getLocalizedText(translation: string) {
  return isAmharicTranslation(translation) ? uiText.am : uiText.en;
}

function BookHeaderImage({ src, bookName, isNative }: { src: string; bookName: string; isNative: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  if (hasError) return null;

  // On native, prefix asset paths with production URL
  const imageSrc = isNative && src.startsWith('/') 
    ? `https://vagabondbible.com${src}` 
    : src;

  return (
    <div className="relative w-full mb-4">
      {!isLoaded && (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#f5f0e6] to-[#e8e0d0] animate-pulse rounded-lg" />
      )}
      <motion.img
        src={imageSrc}
        alt={`${bookName} decorative header`}
        className={`w-full h-auto rounded-lg ${!isLoaded ? 'absolute top-0 left-0 opacity-0' : ''}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function BibleReader({ 
  translation, 
  onTranslationChange,
  initialBookId,
  initialChapter,
  initialVerse,
  triggerHighlight,
  showActionMenuOnDeepLink 
}: BibleReaderProps) {
  const { isNative, platform } = usePlatform();
  const [, navigate] = useLocation();
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [hasAppliedInitialNav, setHasAppliedInitialNav] = useState(false);
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
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [insight, setInsight] = useState("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [compareTranslations, setCompareTranslations] = useState<string[]>(["KJV", "BSB", "WEB", "ASV"]);
  const [footerKey, setFooterKey] = useState(0);
  const [wasFooterOpen, setWasFooterOpen] = useState(false);
  const [insightMessages, setInsightMessages] = useState<InsightMessage[]>([]);
  const [insightConversationId, setInsightConversationId] = useState<number | null>(null);
  const [insightInput, setInsightInput] = useState("");
  const [isStreamingInsight, setIsStreamingInsight] = useState(false);
  const [insightVerseRef, setInsightVerseRef] = useState("");
  const [insightVerseText, setInsightVerseText] = useState("");
  
  // Continue Discussion modal state (temporary chat from Smart Search)
  const [showContinueDiscussion, setShowContinueDiscussion] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState<DiscussionMessage[]>([]);
  const [discussionConversationId, setDiscussionConversationId] = useState<number | null>(null);
  const [discussionInput, setDiscussionInput] = useState("");
  const [isStreamingDiscussion, setIsStreamingDiscussion] = useState(false);
  const [discussionQuestion, setDiscussionQuestion] = useState("");
  const [discussionAnswer, setDiscussionAnswer] = useState("");
  const [smartSearchResults, setSmartSearchResults] = useState<SmartSearchResponse | null>(null);
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [searchLimitResetAt, setSearchLimitResetAt] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoadingBookSynopsis, setIsLoadingBookSynopsis] = useState(false);
  const [scrollToVerse, setScrollToVerse] = useState<number | null>(null);
  const [persistentHighlightVerse, setPersistentHighlightVerse] = useState<number | null>(null);
  const isDeepLinkScrollRef = useRef(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>("smart_search");
  const [upgradeResetAt, setUpgradeResetAt] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const insightChatRef = useRef<HTMLDivElement>(null);
  const insightInputRef = useRef<HTMLTextAreaElement>(null);
  const discussionChatRef = useRef<HTMLDivElement>(null);
  const discussionInputRef = useRef<HTMLTextAreaElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevTranslationRef = useRef<string>(translation);
  const verseAreaRef = useRef<HTMLDivElement>(null);
  const firstVerseRef = useRef<HTMLSpanElement>(null);
  const sparkleButtonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Authentication and onboarding
  const { user } = useAuth();
  const { shouldShowTooltip, markSeen, getTooltipText, isReady } = useOnboardingState(user?.id);
  const [showVerseTooltip, setShowVerseTooltip] = useState(false);
  const [showActionBarTooltip, setShowActionBarTooltip] = useState(false);
  const hasTriggeredVerseTooltip = useRef(false);
  const hasTriggeredActionBarTooltip = useRef(false);
  
  // Get localized UI text based on current translation
  const t = getLocalizedText(translation);

  // Store translation in localStorage for other pages to access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bibleTranslation', translation);
    }
  }, [translation]);

  // When translation changes and there's a selected verse, scroll to it
  useEffect(() => {
    if (prevTranslationRef.current !== translation && selectedVerse) {
      setScrollToVerse(selectedVerse.verse);
    }
    prevTranslationRef.current = translation;
  }, [translation, selectedVerse]);

  // Lock body scroll when portal modals are open (prevents iOS background scrolling)
  // Only touch document.body - never documentElement as it breaks env(safe-area-inset-*) values
  // Note: Dialog components (Add Note, Compare) handle their own scroll locking via Radix
  useEffect(() => {
    const anyPortalModalOpen = showInsight || showContinueDiscussion;
    
    if (anyPortalModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showInsight, showContinueDiscussion]);
  
  // Separate unmount cleanup to ensure scroll is restored when navigating away
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
      const res = await apiFetch("/api/bible/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, translation }),
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

  const handleSmartSearchResult = async (result: SmartSearchResult) => {
    // Check and use credit before navigating to result
    try {
      const res = await apiFetch("/api/bible/smart-search/use-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.status === 429) {
        const data = await res.json();
        setSearchLimitReached(true);
        setSearchLimitResetAt(data.resetAt || null);
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to use search credit");
      }
    } catch (error) {
      console.error("Credit check error:", error);
      toast({
        title: "Error",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }

    // Credit used successfully, navigate to result
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
          // Reset viewport position (fixes iOS Safari visual viewport issue after keyboard dismissal)
          window.scrollTo(0, 0);
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
          // Reset viewport position (fixes iOS Safari visual viewport issue after keyboard dismissal)
          window.scrollTo(0, 0);
        }
        break;
      case "question":
        const questionResult = result as SmartSearchResultQuestion;
        handleOpenContinueDiscussion(questionResult.question, questionResult.briefAnswer);
        break;
      case "topic":
      case "character":
      case "word_study":
        break;
    }
  };

  const handleTopicVerseClick = async (verse: { bookId: number; chapter: number; verse: number }) => {
    // Check and use credit before navigating to verse
    try {
      const res = await apiFetch("/api/bible/smart-search/use-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.status === 429) {
        const data = await res.json();
        setSearchLimitReached(true);
        setSearchLimitResetAt(data.resetAt || null);
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to use search credit");
      }
    } catch (error) {
      console.error("Credit check error:", error);
      return;
    }

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

  // Handle initial navigation from push notifications (deep links)
  useEffect(() => {
    if (books && initialBookId && !hasAppliedInitialNav) {
      const targetBook = books.find(b => b.bookid === initialBookId);
      if (targetBook) {
        console.log('[BibleReader] Deep link navigation to:', targetBook.name, initialChapter, initialVerse);
        setSelectedBook(targetBook);
        setSelectedChapter(initialChapter || 1);
        setShowBookPicker(false);
        if (initialVerse && triggerHighlight) {
          // Delay to ensure chapter is loaded first (reduced from 500ms to 200ms)
          setTimeout(() => {
            // Mark as deep link to auto-open action bar if showActionMenu is requested
            isDeepLinkScrollRef.current = !!showActionMenuOnDeepLink;
            console.log('[BibleReader] Setting deep link scroll, showActionMenu:', showActionMenuOnDeepLink);
            setScrollToVerse(initialVerse);
          }, 200);
        }
        setHasAppliedInitialNav(true);
      }
    }
  }, [books, initialBookId, initialChapter, initialVerse, triggerHighlight, showActionMenuOnDeepLink, hasAppliedInitialNav]);

  const { data: chapter, isLoading: isLoadingChapter } = useQuery<BibleChapter>({
    queryKey: ["/api/bible/chapter", translation, selectedBook?.bookid, selectedChapter],
    enabled: !!selectedBook && !showBookPicker,
  });

  // Onboarding: Trigger verse tooltip when chapter loads AND onboarding data is ready
  useEffect(() => {
    if (
      isReady &&
      chapter?.verses?.length &&
      selectedBook &&
      !showBookPicker &&
      !hasTriggeredVerseTooltip.current &&
      shouldShowTooltip("verse")
    ) {
      // Poll for the ref to be ready (handles async rendering)
      let attempts = 0;
      const maxAttempts = 30;
      const interval = setInterval(() => {
        attempts++;
        if (firstVerseRef.current && !hasTriggeredVerseTooltip.current) {
          clearInterval(interval);
          hasTriggeredVerseTooltip.current = true;
          setShowVerseTooltip(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isReady, chapter?.verses?.length, selectedBook, showBookPicker, shouldShowTooltip]);

  // Onboarding: Trigger action bar tooltip when user selects a verse (only once)
  useEffect(() => {
    if (
      isReady &&
      selectedVerse &&
      !hasTriggeredActionBarTooltip.current &&
      shouldShowTooltip("actionBar")
    ) {
      const timer = setTimeout(() => {
        if (!hasTriggeredActionBarTooltip.current) {
          hasTriggeredActionBarTooltip.current = true;
          setShowActionBarTooltip(true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isReady, selectedVerse, shouldShowTooltip]);

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
        // Clear any existing persistent highlights before adding new one
        document.querySelectorAll('.verse-persistent-highlight').forEach(el => {
          el.classList.remove('verse-persistent-highlight');
        });
        
        const verseElement = verseRefs.current.get(scrollToVerse);
        if (verseElement) {
          // Check if verse is already visible in viewport
          const rect = verseElement.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          // Clear any previous persistent highlight
          setPersistentHighlightVerse(null);
          
          // Find the verse data to auto-open action bar
          const verseData = chapter.verses?.find(v => v.verse === scrollToVerse);
          
          // Open action bar immediately if this is a deep link with showActionMenu
          if (isDeepLinkScrollRef.current && verseData) {
            console.log('[BibleReader] Deep link - opening action bar immediately for verse:', scrollToVerse);
            setSelectedVerse(verseData);
            isDeepLinkScrollRef.current = false;
          }
          
          const applyBurstAndPersist = (verseNum: number) => {
            verseElement.classList.add("verse-burst-highlight");
            setTimeout(() => {
              verseElement.classList.remove("verse-burst-highlight");
              setPersistentHighlightVerse(verseNum);
            }, 4000);
          };
          
          if (isVisible) {
            // Already visible - trigger burst immediately
            applyBurstAndPersist(scrollToVerse);
          } else {
            // Need to scroll - trigger burst after scroll completes
            verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
            
            // Wait for scroll to complete before triggering burst
            let scrollTimeout: NodeJS.Timeout;
            const checkScrollEnd = () => {
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                applyBurstAndPersist(scrollToVerse);
                window.removeEventListener("scroll", checkScrollEnd, true);
              }, 150);
            };
            
            window.addEventListener("scroll", checkScrollEnd, true);
            // Fallback in case scroll event doesn't fire
            setTimeout(() => {
              window.removeEventListener("scroll", checkScrollEnd, true);
              if (!verseElement.classList.contains("verse-burst-highlight")) {
                applyBurstAndPersist(scrollToVerse);
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
      const res = await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        
        const handleViewNotes = () => {
          navigate("/notes");
        };
        
        if (milestoneMessage) {
          toast({ 
            title: `🎉 Milestone: ${newCount} notes!`, 
            description: milestoneMessage,
            action: <ToastAction altText="View Notes" onClick={handleViewNotes}>View Notes</ToastAction>,
          });
        } else {
          toast({ 
            title: "Note saved", 
            description: "Your reflection has been saved",
            action: <ToastAction altText="View Notes" onClick={handleViewNotes}>View Notes</ToastAction>,
          });
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
    // Light haptic feedback on verse tap
    try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    // Dismiss verse tooltip when user taps a verse (onboarding progression)
    if (showVerseTooltip) {
      setShowVerseTooltip(false);
      markSeen("verse");
    }
    
    // If clicking the persistently highlighted verse, just clear highlight and don't select
    if (persistentHighlightVerse === verse.verse) {
      setPersistentHighlightVerse(null);
      return;
    }
    
    // Clear any persistent highlight from smart search when user interacts
    setPersistentHighlightVerse(null);
    
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
      const response = await apiFetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Insight: ${verseRef}` }),
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

      const isAmharic = isAmharicTranslation(translation);
      const languageInstruction = isAmharic 
        ? "IMPORTANT: Please respond entirely in Amharic (አማርኛ). Do not use English."
        : "";
      
      const prompt = `${languageInstruction}
Please explain this Bible verse in plain, accessible language. Include historical context, cultural background, and practical application for today. Keep it concise but insightful.

Verse: "${selectedVerse.text}"
Reference: ${verseRef} (${translation})`;

      const msgResponse = await apiFetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: prompt }),
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
      const msgResponse = await apiFetch(`/api/conversations/${insightConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: userMessage }),
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

  // Continue Discussion handlers (temporary modal from Smart Search)
  const handleOpenContinueDiscussion = async (question: string, answer: string) => {
    setDiscussionQuestion(question);
    setDiscussionAnswer(answer);
    setDiscussionMessages([{ role: "assistant", content: answer, isInitialAnswer: true }]);
    setShowContinueDiscussion(true);
    setShowBookPicker(false);
    setShowSearch(false);
    setSearchQuery("");
    setSmartSearchResults(null);

    try {
      const response = await apiFetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Discussion: ${question.slice(0, 50)}...` }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");
      const conversation = await response.json();
      setDiscussionConversationId(conversation.id);
    } catch (error) {
      console.error("Error creating discussion conversation:", error);
      toast({ title: "Failed to start discussion", variant: "destructive" });
    }
  };

  const handleCloseContinueDiscussion = async () => {
    // Delete the temporary conversation from the backend
    if (discussionConversationId) {
      try {
        await apiFetch(`/api/conversations/${discussionConversationId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting discussion conversation:", error);
      }
    }
    
    setShowContinueDiscussion(false);
    setDiscussionMessages([]);
    setDiscussionConversationId(null);
    setDiscussionInput("");
    setDiscussionQuestion("");
    setDiscussionAnswer("");
  };

  const handleSendDiscussionMessage = async () => {
    if (!discussionInput.trim() || !discussionConversationId || isStreamingDiscussion) return;

    const userMessage = discussionInput.trim();
    setDiscussionInput("");
    setDiscussionMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreamingDiscussion(true);

    try {
      const msgResponse = await apiFetch(`/api/conversations/${discussionConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: userMessage }),
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
                  setDiscussionMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg?.role === "assistant" && !lastMsg.isInitialAnswer) {
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
      console.error("Error sending discussion message:", error);
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsStreamingDiscussion(false);
      discussionInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (discussionChatRef.current) {
      discussionChatRef.current.scrollTop = discussionChatRef.current.scrollHeight;
    }
  }, [discussionMessages]);

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
    toast({ title: t.verseCopied });
  };

  const handleBookSynopsis = async () => {
    if (!selectedBook) return;
    
    // Light haptic feedback on synopsis tap
    try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    setIsLoadingBookSynopsis(true);
    try {
      const res = await apiFetch("/api/bible/book-synopsis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName: selectedBook.name, translation }),
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
        handleOpenContinueDiscussion(data.question, data.answer);
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
    // Ethiopian Orthodox (ETH/ETHE) uses different book ordering: OT is 1-54, NT is 55-81
    // All other translations use standard Protestant ordering: OT is 1-39, NT is 40-66
    const isEthiopianOrthodox = translation === "ETH" || translation === "ETHE";
    const isOT = isEthiopianOrthodox ? book.bookid <= 54 : book.bookid <= 39;
    const key = isOT ? t.oldTestament : t.newTestament;
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
                    placeholder={t.searchPlaceholder}
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
                  {t.smartSearch}
                </motion.h2>
                {!isNative && (
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6" style={{ paddingBottom: isNative ? 'calc(40px + env(safe-area-inset-bottom, 0px))' : undefined }}>
            {showSearch && searchQuery.length >= 2 ? (
              <div className="space-y-4">
                {isSmartSearching && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
                    <p className="text-sm text-muted-foreground">{t.searchingWithAI}</p>
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
                      <h3 className="font-semibold text-lg mb-1">{t.smartSearchLimitReached}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t.usedAllSearches}
                      </p>
                      {searchLimitResetAt && (
                        <p className="text-xs text-muted-foreground">
                          {t.resetsOn} {new Date(searchLimitResetAt).toLocaleDateString(isAmharicTranslation(translation) ? 'am-ET' : 'en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <Link href="/pastor-chat?upgrade=true">
                      <Button 
                        className="btn-upgrade"
                        data-testid="button-upgrade-search"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t.upgradeToProUnlimited}
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
                          <p className="text-xs text-muted-foreground">{book.chapters} {t.chapters}</p>
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
          className="flex items-center gap-2 hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
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
              <BookHeaderImage 
                src={imageSrc} 
                bookName={selectedBook.name} 
                isNative={isNative}
                key={selectedBook.name}
              />
            ) : null;
          })()}

          <motion.div 
            className="flex items-center justify-between mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            key={`header-${selectedBook?.name}-${selectedChapter}`}
          >
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
          </motion.div>
          <p className="text-sm text-muted-foreground mb-6">{translation}</p>

          {isLoadingChapter ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <motion.div 
              ref={verseAreaRef}
              className="space-y-1 pb-20"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
              key={`${selectedBook?.name}-${selectedChapter}`}
            >
              {chapter?.verses.map((verse) => {
                const { heading, content } = parseVerseText(verse.text);
                // Only skip spacer if heading is in verse 1 (first verse of chapter)
                const isFirstVerse = verse.verse === 1;
                const showSpacer = heading && !isFirstVerse;
                return (
                  <span key={verse.pk}>
                    {heading && (
                      <>
                        {showSpacer && <div className="block w-full h-6" />}
                        <h3 className={`block text-sm uppercase tracking-widest font-bold text-[hsl(35,50%,40%)] mb-3 ${showSpacer ? 'mt-4' : 'mt-0'}`}>
                          {heading}
                        </h3>
                      </>
                    )}
                    <motion.span
                      ref={(el) => {
                        if (el) {
                          verseRefs.current.set(verse.verse, el as unknown as HTMLDivElement);
                          // Also set firstVerseRef for onboarding tooltip
                          if (isFirstVerse) {
                            (firstVerseRef as React.MutableRefObject<HTMLSpanElement | null>).current = el as unknown as HTMLSpanElement;
                          }
                        }
                      }}
                      onClick={() => handleVerseClick(verse)}
                      animate={{
                        backgroundColor: selectedVerse?.verse === verse.verse || persistentHighlightVerse === verse.verse
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
                      <span className="text-base leading-relaxed">{content} </span>
                    </motion.span>
                  </span>
                );
              })}
            </motion.div>
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
            className="fixed left-0 right-0 border-t p-3 bg-background shadow-lg z-50"
            style={{ 
              bottom: isNative ? getBottomNavOffset() : "0",
              paddingBottom: isNative ? "12px" : `calc(${getBottomInset()} + 12px)` 
            }}
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
                {/* Sparkles button - separate for onboarding tooltip ref */}
                <motion.div
                  key={`${footerKey}-button-get-insight`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  <Button
                    ref={sparkleButtonRef}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (showActionBarTooltip) {
                        setShowActionBarTooltip(false);
                        markSeen("actionBar");
                      }
                      handleGetInsight();
                    }}
                    className="gap-1 hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
                    data-testid="button-get-insight"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.insight}</span>
                  </Button>
                </motion.div>
                {/* Other action buttons */}
                {[
                  { icon: Columns2, label: t.compare, onClick: () => setShowCompare(true), testId: "button-compare" },
                  { icon: StickyNote, label: t.note, onClick: () => setShowNote(true), testId: "button-add-note" },
                  { icon: Share2, label: t.share, onClick: () => setShowShareSheet(true), testId: "button-share-verse" },
                  { icon: Copy, label: null, onClick: handleCopyVerse, testId: "button-copy-verse" },
                  { icon: X, label: null, onClick: () => setSelectedVerse(null), testId: "button-deselect-verse" },
                ].map((item, index) => {
                  const wrappedOnClick = () => {
                    if (showActionBarTooltip) {
                      setShowActionBarTooltip(false);
                      markSeen("actionBar");
                    }
                    item.onClick();
                  };
                  return (
                  <motion.div
                    key={`${footerKey}-${item.testId}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.1 + (index + 1) * 0.06,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={wrappedOnClick}
                      className="gap-1 hover:bg-[#c08e00]/10 hover:text-[#c08e00] active:bg-[#c08e00]/20"
                      data-testid={item.testId}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label && <span className="hidden sm:inline">{item.label}</span>}
                    </Button>
                  </motion.div>
                );})}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {showInsight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col touch-none"
              style={{ touchAction: "none" }}
            >
              {/* Android status bar spacer */}
              {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' && (
                <div style={{ height: 'var(--android-status-bar-height, 44px)', flexShrink: 0 }} />
              )}
              {/* iOS safe area spacer */}
              {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios' && (
                <div style={{ height: 'env(safe-area-inset-top, 0px)', flexShrink: 0 }} />
              )}
              <div className="flex items-center justify-between p-3 border-b">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c08e00]" />
                <span className="font-serif font-bold text-foreground">{t.verseInsights}</span>
              </div>
              <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseInsight}
                className="text-foreground hover:bg-[#c08e00]/10 hover:text-[#c08e00]"
                data-testid="button-close-insight"
              >
                <X className="w-5 h-5" />
              </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 touch-auto overscroll-contain" ref={insightChatRef} style={{ touchAction: "pan-y", paddingBottom: isNative ? "calc(160px + env(safe-area-inset-bottom, 0px))" : "100px" }}>
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="border-l-2 border-[#c08e00] pl-3 mb-6 mt-2">
                  <p className="text-2xl font-serif font-bold mb-1 text-foreground">{insightVerseRef}</p>
                  <p className="text-sm italic text-foreground">"{insightVerseText}"</p>
                </div>

                {isLoadingInsight && insightMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
                    <span className="text-sm text-muted-foreground">{t.consultingBigGuy} 👆</span>
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
                    <Loader2 className="w-4 h-4 animate-spin text-[#c08e00]" />
                    <span className="text-sm">{t.consultingBigGuy} 👆</span>
                  </div>
                )}
              </div>
            </div>

            <div 
              className="fixed left-0 right-0 border-t p-3 bg-background"
              style={{ 
                bottom: isNative ? getBottomNavOffset() : "0",
                paddingBottom: isNative ? "12px" : `calc(${getBottomInset()} + 12px)` 
              }}
            >
              <div className="max-w-2xl mx-auto flex gap-2 items-stretch">
                <Textarea
                  ref={insightInputRef}
                  placeholder={t.askFollowUp}
                  value={insightInput}
                  onChange={(e) => setInsightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendInsightMessage();
                    }
                  }}
                  rows={1}
                  className="resize-none min-h-[44px] max-h-32 py-[10px] flex items-center text-foreground"
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
        </AnimatePresence>,
        document.body
      )}

      {/* Continue Discussion Modal (temporary - disappears on close) */}
      {createPortal(
        <AnimatePresence>
          {showContinueDiscussion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col touch-none"
              style={{ touchAction: "none" }}
            >
              {/* Android status bar spacer */}
              {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' && (
                <div style={{ height: 'var(--android-status-bar-height, 44px)', flexShrink: 0 }} />
              )}
              {/* iOS safe area spacer */}
              {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios' && (
                <div style={{ height: 'env(safe-area-inset-top, 0px)', flexShrink: 0 }} />
              )}
              <div className="flex items-center justify-between p-3 border-b">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#c08e00]" />
                <span className="font-serif font-bold text-foreground">{t.continueDiscussion}</span>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseContinueDiscussion}
                  className="text-foreground hover:bg-[#c08e00]/10 hover:text-[#c08e00]"
                  data-testid="button-close-discussion"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 touch-auto overscroll-contain" ref={discussionChatRef} style={{ touchAction: "pan-y", paddingBottom: isNative ? "calc(160px + env(safe-area-inset-bottom, 0px))" : "100px" }}>
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="border-l-2 border-[#c08e00] pl-3 mb-6 mt-2">
                  <p className="text-lg font-serif font-bold mb-1 text-foreground">{discussionQuestion}</p>
                </div>

                {discussionMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c08e00]" />
                    <span className="text-sm text-muted-foreground">{t.consultingBigGuy} 👆</span>
                  </div>
                ) : (
                  discussionMessages.map((msg, index) => (
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
                        <div className={msg.isInitialAnswer ? "border-l-2 border-[#c08e00]/50 pl-3" : ""}>
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

                {isStreamingDiscussion && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-[#c08e00]" />
                    <span className="text-sm">{t.consultingBigGuy} 👆</span>
                  </div>
                )}
              </div>
            </div>

            <div 
              className="fixed left-0 right-0 border-t p-3 bg-background"
              style={{ 
                bottom: isNative ? getBottomNavOffset() : "0",
                paddingBottom: isNative ? "12px" : `calc(${getBottomInset()} + 12px)` 
              }}
            >
              <div className="max-w-2xl mx-auto flex gap-2 items-stretch">
                <Textarea
                  ref={discussionInputRef}
                  placeholder={t.askFollowUp}
                  value={discussionInput}
                  onChange={(e) => setDiscussionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendDiscussionMessage();
                    }
                  }}
                  rows={1}
                  className="resize-none min-h-[44px] max-h-32 py-[10px] flex items-center text-foreground"
                  data-testid="input-discussion-followup"
                />
                <Button
                  onClick={handleSendDiscussionMessage}
                  disabled={!discussionInput.trim() || isStreamingDiscussion || !discussionConversationId}
                  className="shrink-0 bg-[#c08e00] hover:bg-[#a07800] text-white aspect-square h-[44px] w-[44px] p-0"
                  data-testid="button-send-discussion"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Dialog open={showNote} onOpenChange={(open) => {
        setShowNote(open);
        if (!open) {
          setNoteText("");
          setNoteTags([]);
        }
      }}>
        <DialogContent className={`fixed left-0 top-0 translate-x-0 translate-y-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-lg sm:border bg-background overflow-y-auto p-6 [&>button]:hidden transition-all duration-300 ${showSaveGlow ? "ring-4 ring-[#c08e00]/50 shadow-[0_0_30px_rgba(192,142,0,0.4)]" : ""}`} style={platform === 'android' ? { paddingTop: 'calc(var(--android-status-bar-height, 44px) + 24px)', paddingBottom: '80px' } : platform === 'ios' ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' } : undefined}>
          <div className="absolute right-4 z-10" style={platform === 'android' ? { top: 'calc(var(--android-status-bar-height, 44px) + 24px)' } : platform === 'ios' ? { top: 'calc(env(safe-area-inset-top, 0px) + 24px)' } : { top: '24px' }}>
            <DialogClose className="h-7 w-7 flex items-center justify-center rounded-sm opacity-70 hover:opacity-100 transition-opacity text-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <DialogHeader className="pr-10">
            <DialogTitle className="font-serif flex items-center gap-2 text-foreground">
              <StickyNote className="w-5 h-5 text-[#c08e00]" />
              {t.addNote}
            </DialogTitle>
          </DialogHeader>
          
          <div className="border-l-2 border-[#c08e00] pl-3 py-1">
            <p className="font-medium text-foreground">{selectedBook?.name} {selectedChapter}:{selectedVerse?.verse}</p>
            <p className="text-sm text-muted-foreground italic line-clamp-2">"{selectedVerse?.text}"</p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t.quickPrompts}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "whatDoesThisMean", text: t.whatDoesThisMean },
                  { key: "prayerBasedOnThis", text: t.prayerBasedOnThis },
                  { key: "howCanIApply", text: t.howCanIApply }
                ].map((prompt) => (
                  <button
                    key={prompt.key}
                    onClick={() => insertPrompt(prompt.text)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-[#c08e00]/10 hover:border-[#c08e00] hover:text-[#c08e00] transition-colors"
                    data-testid={`chip-prompt-${prompt.key}`}
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder={t.writeReflection}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="resize-none text-foreground"
              data-testid="input-note"
            />

            <div>
              <p className="text-xs text-muted-foreground mb-2">{t.tags}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "Faith", text: t.faith },
                  { key: "Hope", text: t.hope },
                  { key: "Gratitude", text: t.gratitude },
                  { key: "Prayer", text: t.prayer },
                  { key: "Question", text: t.question }
                ].map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => toggleTag(tag.key)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      noteTags.includes(tag.key)
                        ? "bg-[#c08e00] text-white border-[#c08e00]"
                        : "border-border text-foreground hover:bg-[#c08e00]/10 hover:border-[#c08e00]"
                    }`}
                    data-testid={`tag-${tag.key.toLowerCase()}`}
                  >
                    {tag.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowNote(false)} className="text-foreground" data-testid="button-cancel-note">
              {t.cancel}
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
              {showSaveGlow ? t.noteSaved : t.saveNote}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:w-[95vw] sm:rounded-lg sm:border overflow-hidden flex flex-col p-0 sm:p-6 [&>button]:hidden" style={platform === 'android' ? { paddingTop: 'calc(var(--android-status-bar-height, 44px) + 16px)', paddingBottom: '80px' } : platform === 'ios' ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' } : undefined}>
          <DialogHeader className="p-4 sm:p-0 pb-0 sm:pb-0 flex flex-row items-center justify-between">
            <DialogTitle className="font-serif text-foreground">{t.compareTranslations}</DialogTitle>
            <DialogClose className="h-7 w-7 flex items-center justify-center rounded-sm opacity-70 hover:opacity-100 transition-opacity text-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
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
                {comparisonData
                  ?.slice()
                  .sort((a, b) => {
                    // Current translation comes first
                    if (a.translation === translation) return -1;
                    if (b.translation === translation) return 1;
                    return 0;
                  })
                  .map((item) => {
                    const isCurrent = item.translation === translation;
                    return (
                      <div 
                        key={item.translation} 
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          isCurrent 
                            ? "border-[#c08e00] bg-[#c08e00]/10" 
                            : "hover:bg-muted/50"
                        }`}
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
                        <div className="flex items-center gap-2 mb-2">
                          <p className={`text-sm font-medium ${isCurrent ? "text-[#c08e00]" : "text-primary"}`}>
                            {item.translation}
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-[#c08e00] text-white px-2 py-0.5 rounded-full">
                              {t.current}
                            </span>
                          )}
                        </div>
                        {item.verses.map((v) => {
                          const { content } = parseVerseText(v.text);
                          return <p key={v.pk} className="text-sm leading-relaxed text-foreground">{content}</p>;
                        })}
                      </div>
                    );
                  })}
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
        translation={translation}
      />

      {/* Onboarding Tooltips */}
      <OnboardingTooltip
        targetRef={firstVerseRef}
        text={getTooltipText("verse")}
        visible={showVerseTooltip}
        position="below"
        offset={10}
        onDismiss={() => {
          setShowVerseTooltip(false);
          markSeen("verse");
        }}
      />

      <OnboardingTooltip
        targetRef={sparkleButtonRef}
        text={getTooltipText("actionBar")}
        visible={showActionBarTooltip}
        position="above"
        offset={10}
        dismissOnAnyTap={true}
        onDismiss={() => {
          setShowActionBarTooltip(false);
          markSeen("actionBar");
        }}
      />

      <VerseShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        verseText={selectedVerse?.text || ""}
        verseReference={selectedVerse && selectedBook ? `${selectedBook.name} ${selectedChapter}:${selectedVerse.verse}` : ""}
      />
    </div>
  );
}
