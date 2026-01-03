import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Bookmark, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  X,
  ChevronDown,
  Calendar,
  BookOpen,
  Tag,
  Loader2,
  SortAsc,
  SortDesc,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@shared/schema";

type NotesResponse = {
  notes: Note[];
  count: number;
};

const TAGS = ["Faith", "Hope", "Gratitude", "Prayer", "Question"];
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
  "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
  "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

type SortOption = "newest" | "oldest" | "book";

export default function Notes() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<Note | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "My Notes | The Traveling Church";
  }, []);

  const { data: notesData, isLoading } = useQuery<NotesResponse>({
    queryKey: ["/api/notes"],
  });
  
  const notes = notesData?.notes || [];

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: string; content: string; tags: string[] }) => {
      const res = await apiRequest("PATCH", `/api/notes/${data.id}`, {
        content: data.content,
        tags: data.tags,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Note updated" });
      setEditingNote(null);
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
    onError: () => {
      toast({ title: "Failed to update note", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Note deleted" });
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
    onError: () => {
      toast({ title: "Failed to delete note", variant: "destructive" });
    },
  });

  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        note =>
          note.content.toLowerCase().includes(query) ||
          note.verseRef.toLowerCase().includes(query) ||
          note.verseText.toLowerCase().includes(query)
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(note =>
        selectedTags.some(tag => note.tags?.includes(tag))
      );
    }

    if (selectedBook) {
      result = result.filter(note => note.verseRef.startsWith(selectedBook));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "book":
          return a.bookId - b.bookId || a.chapter - b.chapter || a.verse - b.verse;
        default:
          return 0;
      }
    });

    return result;
  }, [notes, searchQuery, selectedTags, selectedBook, sortBy]);

  const usedBooks = useMemo(() => {
    const books = new Set<string>();
    notes.forEach(note => {
      const bookName = note.verseRef.split(" ").slice(0, -1).join(" ");
      if (bookName) books.add(bookName);
    });
    return Array.from(books).sort((a, b) => {
      const aIndex = BIBLE_BOOKS.indexOf(a);
      const bIndex = BIBLE_BOOKS.indexOf(b);
      return aIndex - bIndex;
    });
  }, [notes]);

  const usedTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [notes]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedBook(null);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedBook;

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
    setEditTags(note.tags || []);
  };

  const handleSaveEdit = () => {
    if (!editingNote || !editContent.trim()) return;
    updateNoteMutation.mutate({
      id: editingNote.id,
      content: editContent,
      tags: editTags,
    });
  };

  const toggleEditTag = (tag: string) => {
    setEditTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c08e00]" />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/pastor-chat?tab=bible">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-[#c08e00]/10 hover:text-[#c08e00]"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-[#c08e00]" />
                <h1 className="text-2xl font-serif font-bold">My Notes</h1>
                <span className="text-sm text-muted-foreground">
                  ({notes.length})
                </span>
              </div>
            </div>
            <Link href="/pastor-chat?tab=bible">
              <button
                className="w-10 h-10 rounded-full bg-[#c08e00] flex items-center justify-center hover:bg-[#a07800] transition-colors -translate-x-[13px] sm:translate-x-0"
                data-testid="button-create-note"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>

          {notes.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-notes"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2" data-testid="button-filter">
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-1 bg-[#c08e00] text-white">
                            {(selectedTags.length > 0 ? 1 : 0) + (selectedBook ? 1 : 0)}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {usedBooks.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <BookOpen className="w-3 h-3" />
                            Book
                          </div>
                          {usedBooks.map(book => (
                            <DropdownMenuCheckboxItem
                              key={book}
                              checked={selectedBook === book}
                              onCheckedChange={() => setSelectedBook(selectedBook === book ? null : book)}
                            >
                              {book}
                            </DropdownMenuCheckboxItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {usedTags.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            Tags
                          </div>
                          {usedTags.map(tag => (
                            <DropdownMenuCheckboxItem
                              key={tag}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() =>
                                setSelectedTags(prev =>
                                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                )
                              }
                            >
                              {tag}
                            </DropdownMenuCheckboxItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {hasActiveFilters && (
                        <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                          <X className="w-4 h-4 mr-2" />
                          Clear all filters
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2" data-testid="button-sort">
                        {sortBy === "newest" || sortBy === "oldest" ? (
                          <Calendar className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                        Sort
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>
                        <SortDesc className="w-4 h-4 mr-2" />
                        Newest first
                        {sortBy === "newest" && " ✓"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                        <SortAsc className="w-4 h-4 mr-2" />
                        Oldest first
                        {sortBy === "oldest" && " ✓"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("book")}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        By book order
                        {sortBy === "book" && " ✓"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedBook && (
                    <Badge
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/20"
                      onClick={() => setSelectedBook(null)}
                    >
                      <BookOpen className="w-3 h-3" />
                      {selectedBook}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  )}
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/20"
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              {filteredAndSortedNotes.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes match your filters</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className="border rounded-lg p-4 hover:border-[#c08e00]/50 transition-colors group"
                          data-testid={`note-card-${note.id}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-[#c08e00]">{note.verseRef}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground italic mt-1 line-clamp-1">
                                "{note.verseText}"
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-[#c08e00]/10 hover:text-[#c08e00]"
                                onClick={() => handleEditNote(note)}
                                data-testid={`button-edit-${note.id}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteConfirm(note)}
                                data-testid={`button-delete-${note.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {note.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-16 text-center">
              <img 
                src="/attached_assets/Scroll_Image_1767410029173.png" 
                alt="Ancient scroll" 
                className="w-48 h-48 object-contain mb-4 opacity-80"
              />
              <h2 className="text-xl font-semibold mb-2">No notes yet</h2>
              <p className="text-muted-foreground max-w-sm mb-6">
                Start reading the Bible and tap on any verse to add notes. Your saved notes will appear here.
              </p>
              <Link href="/pastor-chat?tab=bible">
                <Button className="bg-[#c08e00] hover:bg-[#a07800] text-white" data-testid="button-start-reading">
                  Start Reading
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#c08e00]" />
              Edit Note
            </DialogTitle>
          </DialogHeader>
          
          {editingNote && (
            <>
              <div className="border-l-2 border-[#c08e00] pl-3 py-1">
                <p className="font-medium">{editingNote.verseRef}</p>
                <p className="text-sm text-muted-foreground italic line-clamp-2">"{editingNote.verseText}"</p>
              </div>

              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="resize-none"
                data-testid="input-edit-note"
              />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleEditTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        editTags.includes(tag)
                          ? "bg-[#c08e00] text-white border-[#c08e00]"
                          : "hover:bg-[#c08e00]/10 hover:border-[#c08e00]"
                      }`}
                      data-testid={`edit-tag-${tag.toLowerCase()}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || updateNoteMutation.isPending}
                  className="bg-[#c08e00] hover:bg-[#a07800] text-white"
                  data-testid="button-save-edit"
                >
                  {updateNoteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteConfirm && (
            <div className="border-l-2 border-destructive pl-3 py-1 mb-4">
              <p className="font-medium">{deleteConfirm.verseRef}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{deleteConfirm.content}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteNoteMutation.mutate(deleteConfirm.id)}
              disabled={deleteNoteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
