import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Bookmark, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";

export default function Notes() {
  useEffect(() => {
    document.title = "My Notes | The Traveling Church";
  }, []);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/pastor-chat">
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
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <StickyNote className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No notes yet</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Start reading the Bible and tap on any verse to add notes. Your saved notes will appear here.
            </p>
            <Link href="/pastor-chat?tab=bible">
              <Button data-testid="button-start-reading">
                Start Reading
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
