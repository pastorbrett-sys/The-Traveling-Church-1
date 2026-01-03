import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BibleReader from "@/components/bible-reader";

export default function Bible() {
  const [translation, setTranslation] = useState("KJV");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 items-center px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover:text-[#c08e00]" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <h1 className="ml-4 font-playfair text-xl font-semibold">Bible Study</h1>
        </div>
      </header>

      <main className="container px-4 py-4" style={{ height: "calc(100vh - 56px)" }}>
        <BibleReader translation={translation} onTranslationChange={setTranslation} />
      </main>
    </div>
  );
}
