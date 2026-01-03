import { useState, useEffect, useRef } from "react";
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
  Send
} from "lucide-react";
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
  const [insight, setInsight] = useState("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [compareTranslations, setCompareTranslations] = useState<string[]>(["NIV", "ESV"]);
  const [footerKey, setFooterKey] = useState(0);
  const [wasFooterOpen, setWasFooterOpen] = useState(false);
  const [insightMessages, setInsightMessages] = useState<InsightMessage[]>([]);
  const [insightConversationId, setInsightConversationId] = useState<number | null>(null);
  const [insightInput, setInsightInput] = useState("");
  const [isStreamingInsight, setIsStreamingInsight] = useState(false);
  const [insightVerseRef, setInsightVerseRef] = useState("");
  const [insightVerseText, setInsightVerseText] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const insightChatRef = useRef<HTMLDivElement>(null);
  const insightInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: translations } = useQuery<Translation[]>({
    queryKey: ["/api/bible/translations"],
  });

  const { data: books } = useQuery<BibleBook[]>({
    queryKey: ["/api/bible/books", translation],
    enabled: !!translation,
  });

  const { data: chapter, isLoading: isLoadingChapter } = useQuery<BibleChapter>({
    queryKey: ["/api/bible/chapter", translation, selectedBook?.bookid, selectedChapter],
    enabled: !!selectedBook && !showBookPicker,
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<{ total: number; results: BibleVerse[] }>({
    queryKey: ["/api/bible/search", translation, searchQuery],
    enabled: showSearch && searchQuery.length > 2,
  });

  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery<{ translation: string; verses: BibleVerse[] }[]>({
    queryKey: ["/api/bible/compare", selectedBook?.bookid, selectedChapter, selectedVerse?.verse, compareTranslations],
    queryFn: async () => {
      if (!selectedVerse || !selectedBook) return [];
      const res = await apiRequest("POST", "/api/bible/compare", {
        translations: [translation, ...compareTranslations],
        bookId: selectedBook.bookid,
        chapter: selectedChapter,
        verses: [selectedVerse.verse],
      });
      return res.json();
    },
    enabled: showCompare && !!selectedVerse && !!selectedBook,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data: { book: string; chapter: number; verse: number; translation: string; note: string }) => {
      const res = await apiRequest("POST", "/api/bible/notes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Note saved" });
      setShowNote(false);
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["/api/bible/notes"] });
    },
  });

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookPicker(false);
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
      });
      const conversation = await response.json();
      setInsightConversationId(conversation.id);

      const prompt = `Please explain this Bible verse in plain, accessible language. Include historical context, cultural background, and practical application for today. Keep it concise but insightful.

Verse: "${selectedVerse.text}"
Reference: ${verseRef} (${translation})`;

      const msgResponse = await fetch(`/api/conversations/${conversation.id}/messages`, {
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
      const msgResponse = await fetch(`/api/conversations/${insightConversationId}/messages`, {
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

  const handleSaveNote = () => {
    if (!selectedVerse || !selectedBook || !noteText.trim()) return;
    
    saveNoteMutation.mutate({
      book: selectedBook.name,
      chapter: selectedChapter,
      verse: selectedVerse.verse,
      translation,
      note: noteText,
    });
  };

  const handleCopyVerse = () => {
    if (!selectedVerse || !selectedBook) return;
    const text = `"${selectedVerse.text}" - ${selectedBook.name} ${selectedChapter}:${selectedVerse.verse} (${translation})`;
    navigator.clipboard.writeText(text);
    toast({ title: "Verse copied" });
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
                    window.location.href = "/notes";
                  }}
                  data-testid="button-saved-notes"
                >
                  <Bookmark className="w-7 h-7" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 700,
                damping: 40
              }}
              className="overflow-hidden"
            >
              <div className="p-4">
                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
                {searchResults && searchResults.results.length > 0 && (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {searchResults.results.slice(0, 20).map((result, index) => {
                        const book = books?.find(b => b.bookid === result.book);
                        return (
                          <motion.button
                            key={result.pk}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: index * 0.02,
                              type: "spring",
                              stiffness: 500,
                              damping: 30
                            }}
                            onClick={() => {
                              if (book) {
                                setSelectedBook(book);
                                setSelectedChapter(result.chapter || 1);
                                setShowBookPicker(false);
                                setShowSearch(false);
                                setSearchQuery("");
                              }
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-[#c08e00]/10 active:bg-[#c08e00]/20 transition-colors"
                            data-testid={`search-result-${result.pk}`}
                          >
                            <p className="text-sm font-medium">
                              {book?.name} {result.chapter}:{result.verse}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{result.text}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
                {searchQuery.length > 0 && searchQuery.length <= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Type at least 3 characters to search
                  </p>
                )}
                {searchQuery.length > 2 && !isSearching && searchResults?.results.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No results found
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
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
          <Book className="w-4 h-4" />
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
          <h1 className="text-2xl font-serif font-bold mb-1" data-testid="heading-chapter">
            {chapter?.book} {selectedChapter}
          </h1>
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
                  onClick={() => handleVerseClick(verse)}
                  animate={{
                    backgroundColor: selectedVerse?.verse === verse.verse 
                      ? "rgba(192, 142, 0, 0.15)" 
                      : "rgba(0, 0, 0, 0)"
                  }}
                  transition={{ duration: 0.2 }}
                  className="inline cursor-pointer hover:bg-[#c08e00]/10 rounded px-0.5"
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
            className="absolute inset-0 z-50 bg-background flex flex-col"
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

            <div className="flex-1 overflow-y-auto p-4" ref={insightChatRef}>
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

      <Dialog open={showNote} onOpenChange={setShowNote}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Note</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            {selectedBook?.name} {selectedChapter}:{selectedVerse?.verse}
          </div>
          <Textarea
            placeholder="Write your note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            data-testid="input-note"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowNote(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote}
              disabled={!noteText.trim() || saveNoteMutation.isPending}
              data-testid="button-save-note"
            >
              {saveNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">Compare Translations</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-4">
            {selectedBook?.name} {selectedChapter}:{selectedVerse?.verse}
          </div>
          <ScrollArea className="flex-1">
            {isLoadingComparison ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {comparisonData?.map((item) => (
                  <div key={item.translation} className="p-4 rounded-lg border">
                    <p className="text-sm font-medium text-primary mb-2">{item.translation}</p>
                    {item.verses.map((v) => (
                      <p key={v.pk} className="text-sm leading-relaxed">{v.text}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
