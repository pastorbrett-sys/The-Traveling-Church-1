import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Book, 
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
  Loader2
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
  const contentRef = useRef<HTMLDivElement>(null);
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
    setSelectedVerse(verse);
  };

  const handleGetInsight = async () => {
    if (!selectedVerse || !selectedBook) return;
    
    setShowInsight(true);
    setIsLoadingInsight(true);
    setInsight("");

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Bible Insight" }),
      });
      const conversation = await response.json();

      const verseRef = `${selectedBook.name} ${selectedChapter}:${selectedVerse.verse}`;
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
                  setInsight(fullText);
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

  if (showBookPicker) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold font-serif">Select a Book</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            data-testid="button-bible-search"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {showSearch && (
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search the Bible..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-bible-search"
              />
            </div>
            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
            {searchResults && searchResults.results.length > 0 && (
              <ScrollArea className="h-64 mt-4">
                <div className="space-y-2">
                  {searchResults.results.slice(0, 20).map((result) => {
                    const book = books?.find(b => b.bookid === result.book);
                    return (
                      <button
                        key={result.pk}
                        onClick={() => {
                          if (book) {
                            setSelectedBook(book);
                            setSelectedChapter(result.chapter || 1);
                            setShowBookPicker(false);
                            setShowSearch(false);
                            setSearchQuery("");
                          }
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                        data-testid={`search-result-${result.pk}`}
                      >
                        <p className="text-sm font-medium">
                          {book?.name} {result.chapter}:{result.verse}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{result.text}</p>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {groupedBooks && Object.entries(groupedBooks).map(([testament, bookList]) => (
              <div key={testament}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{testament}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {bookList.map((book) => (
                    <button
                      key={book.bookid}
                      onClick={() => handleBookSelect(book)}
                      className="p-3 text-left rounded-lg border hover:bg-muted transition-colors"
                      data-testid={`book-${book.bookid}`}
                    >
                      <p className="font-medium text-sm">{book.name}</p>
                      <p className="text-xs text-muted-foreground">{book.chapters} chapters</p>
                    </button>
                  ))}
                </div>
              </div>
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
            <div className="space-y-1">
              {chapter?.verses.map((verse) => (
                <span
                  key={verse.pk}
                  onClick={() => handleVerseClick(verse)}
                  className={`inline cursor-pointer transition-colors hover:bg-primary/10 rounded px-0.5 ${
                    selectedVerse?.verse === verse.verse ? "bg-primary/20" : ""
                  }`}
                  data-testid={`verse-${verse.verse}`}
                >
                  <sup className="text-xs text-primary font-medium mr-1">{verse.verse}</sup>
                  <span className="text-base leading-relaxed">{verse.text} </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {selectedVerse && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
            <p className="text-sm font-medium truncate">
              {selectedBook?.name} {selectedChapter}:{selectedVerse.verse}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetInsight}
                className="gap-1"
                data-testid="button-get-insight"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Insight</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompare(true)}
                className="gap-1"
                data-testid="button-compare"
              >
                <Columns2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNote(true)}
                className="gap-1"
                data-testid="button-add-note"
              >
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">Note</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyVerse}
                data-testid="button-copy-verse"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVerse(null)}
                data-testid="button-deselect-verse"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showInsight} onOpenChange={setShowInsight}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Sparkles className="w-5 h-5 text-primary" />
              Verse Insight
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">
            {selectedBook?.name} {selectedChapter}:{selectedVerse?.verse}
          </div>
          <blockquote className="border-l-2 border-primary pl-3 italic text-sm mb-4">
            "{selectedVerse?.text}"
          </blockquote>
          <ScrollArea className="flex-1 pr-4">
            {isLoadingInsight && !insight ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    strong: ({ children }) => (
                      <strong className="font-serif font-bold">{children}</strong>
                    ),
                  }}
                >
                  {insight}
                </ReactMarkdown>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
