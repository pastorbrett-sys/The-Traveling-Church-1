import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Lock, Book, Check, X, Upload, Loader2 } from "lucide-react";

interface EthiopianBook {
  id: number;
  name: string;
  nameAmharic: string | null;
  chapters: number;
  testament: string;
  category: string;
  displayOrder: number;
  verseCount: number;
  hasContent: boolean;
}

export default function AdminEthiopianBible() {
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedBook, setSelectedBook] = useState<EthiopianBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [bulkInput, setBulkInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authHeaders = {
    Authorization: `Bearer ${authToken}`,
  };

  const { data: books, isLoading, error } = useQuery<EthiopianBook[]>({
    queryKey: ["/api/admin/ethiopian-bible/books"],
    enabled: isAuthenticated && !!authToken,
    queryFn: async () => {
      const res = await fetch("/api/admin/ethiopian-bible/books", {
        headers: authHeaders,
      });
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setAuthToken("");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch books");
      }
      return res.json();
    },
  });

  const { data: chapterData, isLoading: isLoadingChapter } = useQuery({
    queryKey: ["/api/admin/ethiopian-bible/chapter", selectedBook?.id, selectedChapter],
    enabled: isAuthenticated && !!selectedBook && !!authToken,
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/ethiopian-bible/books/${selectedBook?.id}/chapters/${selectedChapter}`,
        { headers: authHeaders }
      );
      if (!res.ok) throw new Error("Failed to fetch chapter");
      return res.json();
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: async (verses: any[]) => {
      const res = await fetch("/api/admin/ethiopian-bible/verses/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ verses }),
      });
      if (!res.ok) throw new Error("Failed to add verses");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: `Added ${data.added} verses` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ethiopian-bible/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ethiopian-bible/chapter", selectedBook?.id, selectedChapter] });
      setBulkInput("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add verses", variant: "destructive" });
    },
  });

  const handleLogin = async () => {
    if (!password) return;
    
    setIsLoggingIn(true);
    setLoginError("");
    
    try {
      const res = await fetch("/api/admin/ethiopian-bible/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        setAuthToken(password);
        setIsAuthenticated(true);
        setPassword("");
      } else {
        const data = await res.json();
        setLoginError(data.message || "Invalid password");
      }
    } catch (err) {
      setLoginError("Failed to verify credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBulkImport = () => {
    if (!selectedBook || !bulkInput.trim()) return;
    
    try {
      const lines = bulkInput.trim().split("\n");
      const verses: any[] = [];
      
      for (const line of lines) {
        const match = line.match(/^(\d+):(\d+)\s+(.+)$/);
        if (match) {
          verses.push({
            bookId: selectedBook.id,
            chapter: parseInt(match[1]),
            verse: parseInt(match[2]),
            textEnglish: match[3].trim(),
          });
        }
      }
      
      if (verses.length > 0) {
        bulkAddMutation.mutate(verses);
      } else {
        toast({ title: "Error", description: "No valid verses found. Format: chapter:verse text", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to parse input", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4" data-testid="admin-login-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-stone-600" />
            <CardTitle>Ethiopian Bible Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              disabled={isLoggingIn}
              data-testid="input-admin-password"
            />
            {loginError && (
              <p className="text-sm text-red-600" data-testid="text-login-error">{loginError}</p>
            )}
            <Button 
              onClick={handleLogin} 
              className="w-full" 
              disabled={isLoggingIn || !password}
              data-testid="button-admin-login"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Admin Panel"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBooks = books?.length || 0;
  const booksWithContent = books?.filter(b => b.hasContent).length || 0;
  const progressPercent = totalBooks > 0 ? (booksWithContent / totalBooks) * 100 : 0;

  const groupedBooks = books?.reduce((acc, book) => {
    if (!acc[book.category]) acc[book.category] = [];
    acc[book.category].push(book);
    return acc;
  }, {} as Record<string, EthiopianBook[]>) || {};

  return (
    <div className="min-h-screen bg-stone-100" data-testid="admin-ethiopian-bible-page">
      <div className="bg-stone-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-6 h-6" />
            <h1 className="text-xl font-bold">Ethiopian Bible Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{booksWithContent}/{totalBooks} books with content</span>
            <Progress value={progressPercent} className="w-32 h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Books (81)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-stone-500 mb-2">{category}</h3>
                      <div className="space-y-1">
                        {categoryBooks.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => {
                              setSelectedBook(book);
                              setSelectedChapter(1);
                            }}
                            className={`w-full text-left p-2 rounded flex items-center justify-between text-sm transition-colors ${
                              selectedBook?.id === book.id
                                ? "bg-amber-100 text-amber-900"
                                : "hover:bg-stone-100"
                            }`}
                            data-testid={`button-book-${book.id}`}
                          >
                            <span className="flex items-center gap-2">
                              {book.hasContent ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-stone-300" />
                              )}
                              <span>{book.name}</span>
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {book.chapters} ch
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedBook ? (
                  <span>
                    {selectedBook.name} 
                    {selectedBook.nameAmharic && (
                      <span className="text-stone-500 ml-2">({selectedBook.nameAmharic})</span>
                    )}
                  </span>
                ) : (
                  "Select a book"
                )}
              </CardTitle>
              {selectedBook && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                    disabled={selectedChapter <= 1}
                    data-testid="button-prev-chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm min-w-[80px] text-center">
                    Chapter {selectedChapter} / {selectedBook.chapters}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChapter(Math.min(selectedBook.chapters, selectedChapter + 1))}
                    disabled={selectedChapter >= selectedBook.chapters}
                    data-testid="button-next-chapter"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedBook ? (
              <div className="text-center py-12 text-stone-500">
                <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a book from the list to view or add content</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-stone-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Current Content</h3>
                  {isLoadingChapter ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : chapterData?.verses?.length > 0 ? (
                    <ScrollArea className="h-48">
                      <div className="space-y-1 text-sm">
                        {chapterData.verses.map((v: any, i: number) => (
                          <p key={i}>
                            <span className="text-amber-600 font-medium">{v.verse}</span> {v.text}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-stone-400 text-sm">No verses in this chapter yet</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Bulk Import Verses
                  </h3>
                  <p className="text-sm text-stone-500 mb-2">
                    Format: <code className="bg-stone-100 px-1 rounded">chapter:verse text content</code>
                  </p>
                  <Textarea
                    placeholder={`1:1 In the beginning God created the heavens and the earth.\n1:2 Now the earth was formless and empty...`}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="h-40 font-mono text-sm"
                    data-testid="textarea-bulk-import"
                  />
                  <Button
                    onClick={handleBulkImport}
                    disabled={bulkAddMutation.isPending || !bulkInput.trim()}
                    className="mt-2"
                    data-testid="button-bulk-import"
                  >
                    {bulkAddMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Verses
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
