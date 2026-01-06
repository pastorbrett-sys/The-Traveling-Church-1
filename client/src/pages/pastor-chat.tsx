import { useState, useRef, useEffect, forwardRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, Lock, Sparkles, LogIn, MoreVertical, RefreshCw, Book, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import BibleReader from "@/components/bible-reader";
import pastorBrettIcon from "@assets/Pastor_Brett_Chat_Icon_1767476985840.png";
import vagabondLogo from "@assets/Vagabond_Bible_AI_Icon_1767553973302.png";

const WelcomeMessage = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-start"
    >
      <div
        className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3 max-w-[80%]"
        data-testid="message-welcome"
      >
        <img
          src={pastorBrettIcon}
          alt="Pastor Brett"
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <p className="text-sm text-foreground">
          Hey there! I'm Pastor Brett, your AI Bible Buddy. Ask me anything about faith, scripture, or life!
        </p>
      </div>
    </motion.div>
  );
});
WelcomeMessage.displayName = "WelcomeMessage";

const FREE_MESSAGE_LIMIT = 10;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionStats {
  messageCount: number;
  isPro: boolean;
  limit: number;
}

interface SubscriptionStatus {
  subscription: any;
  isProUser: boolean;
  stripeCustomerId: string | null;
}

interface Translation {
  short_name: string;
  full_name: string;
}

export default function PastorChat() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tabParam = urlParams.get("tab");
  const seedQuestion = urlParams.get("seedQuestion");
  const seedAnswer = urlParams.get("seedAnswer");
  const seedFollowUp = urlParams.get("seedFollowUp");
  const upgradeParam = urlParams.get("upgrade");
  
  const [activeTab, setActiveTab] = useState<"chat" | "bible">(tabParam === "chat" ? "chat" : "bible");
  const [bibleTranslation, setBibleTranslation] = useState("NIV");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [footerHeight, setFooterHeight] = useState(180);
  const [isNewChatMode, setIsNewChatMode] = useState(() => {
    // Check if user previously cleared their chat
    return localStorage.getItem("bibleBuddyChatCleared") === "true";
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [animateFromIndex, setAnimateFromIndex] = useState<number>(Infinity); // Only animate messages at or after this index
  
  // Track the seed params to detect when they change (for same-page navigation)
  const [lastSeedParams, setLastSeedParams] = useState<string | null>(null);
  
  // Watch for URL param changes and switch to chat tab when seed params are present
  useEffect(() => {
    const currentSeedKey = seedQuestion && seedAnswer ? `${seedQuestion}|${seedAnswer}` : null;
    
    if (currentSeedKey && currentSeedKey !== lastSeedParams) {
      // New seed params detected - switch to chat tab and reset seeding state
      setActiveTab("chat");
      setHasSeeded(false);
      setLastSeedParams(currentSeedKey);
    }
  }, [seedQuestion, seedAnswer, lastSeedParams]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  // Handle upgrade param to show paywall modal
  useEffect(() => {
    if (upgradeParam === "true" && !isAuthLoading) {
      if (isAuthenticated) {
        setShowPaywall(true);
      } else {
        setShowLoginPrompt(true);
      }
    }
  }, [upgradeParam, isAuthenticated, isAuthLoading]);

  // Fetch session stats from server (only for authenticated users)
  const { data: sessionStats, refetch: refetchSessionStats } = useQuery<SessionStats>({
    queryKey: ["/api/chat/session-stats"],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Fetch subscription status for authenticated users
  const { data: subscriptionStatus, refetch: refetchSubscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/my-subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch all conversations to restore the most recent one
  const { data: conversations } = useQuery<Array<{ id: number; title: string; createdAt: string }>>({
    queryKey: ["/api/conversations"],
    refetchOnWindowFocus: false,
  });

  // Fetch Bible translations for the selector
  const { data: bibleTranslations } = useQuery<Translation[]>({
    queryKey: ["/api/bible/translations"],
  });

  // Load the most recent conversation's messages on mount (but not if user started a new chat or we have seed params)
  useEffect(() => {
    if (seedQuestion && seedAnswer) return; // Skip restoration if we're seeding
    if (conversations && conversations.length > 0 && !currentConversationId && !isNewChatMode) {
      const mostRecent = conversations[0]; // Already sorted by createdAt desc
      setCurrentConversationId(mostRecent.id);
      
      // Fetch messages for this conversation
      fetch(`/api/conversations/${mostRecent.id}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            const restoredMessages: ChatMessage[] = data.messages.map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }));
            setMessages(restoredMessages);
            // Don't animate restored messages
            setAnimateFromIndex(restoredMessages.length);
          }
        })
        .catch(err => console.error("Failed to restore conversation:", err));
    }
  }, [conversations, currentConversationId, isNewChatMode, seedQuestion, seedAnswer]);

  // Handle seeding conversation from Smart Search "Continue discussion"
  useEffect(() => {
    if (!seedQuestion || !seedAnswer || hasSeeded || isSeeding) return;
    
    const seedConversation = async () => {
      setIsSeeding(true);
      try {
        // Create a new conversation
        const res = await apiRequest("POST", "/api/conversations", { title: seedQuestion.slice(0, 50) });
        const newConv = await res.json();
        const convId = newConv.id;
        setCurrentConversationId(convId);
        
        // Set initial messages locally (include followUp if provided)
        const initialMessages: ChatMessage[] = [
          { role: "user", content: seedQuestion },
          { role: "assistant", content: seedAnswer },
        ];
        if (seedFollowUp) {
          initialMessages.push({ role: "assistant", content: seedFollowUp });
          // Only animate the last message (the follow-up)
          setAnimateFromIndex(2);
        } else {
          // No follow-up yet, don't animate any seeded messages
          setAnimateFromIndex(2);
        }
        setMessages(initialMessages);
        
        // Save the seeded messages to the server
        await apiRequest("POST", `/api/conversations/${convId}/seed`, {
          question: seedQuestion,
          answer: seedAnswer,
          followUp: seedFollowUp || undefined,
        });
        
        // Only generate a follow-up if one wasn't provided
        if (!seedFollowUp) {
          setIsStreaming(true);
          const followUpRes = await fetch(`/api/conversations/${convId}/follow-up`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: seedQuestion, answer: seedAnswer }),
            credentials: "include",
          });
          
          if (followUpRes.ok && followUpRes.body) {
            const reader = followUpRes.body.getReader();
            const decoder = new TextDecoder();
            let followUpContent = "";
            
            // Add empty assistant message for the follow-up
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);
            
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
                      followUpContent += data.content;
                      setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = {
                          role: "assistant",
                          content: followUpContent,
                        };
                        return newMessages;
                      });
                    }
                  } catch (e) {
                    if (e instanceof SyntaxError) continue;
                  }
                }
              }
            }
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
        localStorage.removeItem("bibleBuddyChatCleared"); // Clear the "chat cleared" flag
        setHasSeeded(true);
      } catch (error) {
        console.error("Failed to seed conversation:", error);
      } finally {
        setIsSeeding(false);
        setIsStreaming(false);
      }
    };
    
    seedConversation();
  }, [seedQuestion, seedAnswer, hasSeeded, isSeeding, queryClient]);

  // Determine if user is pro - check both session stats (server-side check) and subscription status
  const isPro = sessionStats?.isPro || subscriptionStatus?.isProUser || false;
  const messageCount = sessionStats?.messageCount ?? 0;
  const isLimitReached = !isPro && messageCount >= FREE_MESSAGE_LIMIT;

  const systemPrompt: ChatMessage = {
    role: "assistant",
    content: "Hey there! I'm Pastor Brett, your AI Bible Buddy. Ask me anything about faith, scripture, or life!"
  };

  // Measure footer height dynamically - re-run when activeTab changes
  useEffect(() => {
    if (activeTab !== "chat" || !footerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFooterHeight(entry.contentRect.height + 32); // Add extra padding
      }
    });
    
    observer.observe(footerRef.current);
    // Initial measurement
    setFooterHeight(footerRef.current.offsetHeight + 32);
    
    return () => observer.disconnect();
  }, [activeTab]);

  // Helper function to scroll to bottom - scrolls the container to show newest messages
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    });
  };

  // Scroll to show newest messages just above the sticky footer
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll to bottom when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat") {
      setTimeout(scrollToBottom, 50);
    }
  }, [activeTab]);

  useEffect(() => {
    document.title = "AI Bible Buddy | The Traveling Church";
  }, []);

  const handleSubscribe = async () => {
    // Require login before checkout
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setIsCheckingOut(true);
    try {
      // Fetch the Pro plan price
      const productsRes = await fetch("/api/stripe/products-with-prices");
      
      if (!productsRes.ok) {
        const errText = await productsRes.text();
        alert("Failed to load products: " + productsRes.status + " - " + errText);
        return;
      }
      
      const productsData = await productsRes.json();
      console.log("Products data:", productsData);
      
      if (!productsData.data || productsData.data.length === 0) {
        alert("No products found. Products count: " + (productsData.data?.length || 0));
        return;
      }
      
      const proPlan = productsData.data?.find((p: any) => p.metadata?.tier === "pro");
      console.log("Pro plan found:", proPlan);
      
      if (!proPlan) {
        const allProducts = productsData.data.map((p: any) => p.name + " (tier=" + p.metadata?.tier + ")").join(", ");
        alert("Pro plan not found. Available products: " + allProducts);
        return;
      }
      
      const proPrice = proPlan?.prices?.find((p: any) => p.recurring?.interval === "month");
      console.log("Pro price found:", proPrice);
      
      if (!proPrice) {
        alert("Monthly price not found for Pro plan. Prices: " + JSON.stringify(proPlan.prices));
        return;
      }
      
      const checkoutRes = await apiRequest("POST", "/api/stripe/checkout", {
        priceId: proPrice.id,
      });
      const checkoutData = await checkoutRes.json();
      console.log("Checkout response:", checkoutData);
      
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        alert("No checkout URL returned: " + JSON.stringify(checkoutData));
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      // Try to extract more details from the error
      let errorDetail = error?.message || String(error);
      // If the error message contains JSON, try to parse it for more details
      if (errorDetail.includes("{")) {
        try {
          const jsonPart = errorDetail.substring(errorDetail.indexOf("{"));
          const parsed = JSON.parse(jsonPart);
          if (parsed.error) errorDetail = parsed.error;
        } catch {}
      }
      alert("Checkout failed: " + errorDetail);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    // Check if limit reached
    if (isLimitReached) {
      setShowPaywall(true);
      return;
    }

    let convId = currentConversationId;
    if (!convId) {
      const res = await apiRequest("POST", "/api/conversations", { title: input.slice(0, 50) });
      const newConv = await res.json();
      convId = newConv.id;
      setCurrentConversationId(convId);
      setIsNewChatMode(false); // Reset so future visits restore this conversation
      localStorage.removeItem("bibleBuddyChatCleared"); // Clear the "chat cleared" flag
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }

    const userMessage: ChatMessage = { role: "user", content: input };
    const savedInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: savedInput }),
        credentials: "include",
      });

      // Handle payment required (message limit reached) - check both 402 and 429
      if (response.status === 402 || response.status === 429) {
        const errorData = await response.json();
        if (errorData.code === "LIMIT_REACHED") {
          setShowPaywall(true);
          setMessages((prev) => prev.slice(0, -1));
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Refetch session stats to update message count
      refetchSessionStats();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      scrollToBottom();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.content) {
                assistantContent += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return newMessages;
                });
                // Scroll as content streams in
                scrollToBottom();
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      if (!assistantContent) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: "I apologize, but I couldn't generate a response. Please try again.",
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant" && prev[prev.length - 1].content === "") {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: "I apologize, but I encountered an error. Please try again.",
          };
          return newMessages;
        }
        return [
          ...prev,
          { role: "assistant", content: "I apologize, but I encountered an error. Please try again." },
        ];
      });
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", convId] });
      // Force refresh session stats to update message count in UI
      queryClient.invalidateQueries({ queryKey: ["/api/chat/session-stats"] });
      // Refocus input so user can keep typing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = async () => {
    // Delete the current conversation from the server if one exists
    if (currentConversationId) {
      try {
        await apiRequest("DELETE", `/api/conversations/${currentConversationId}`);
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
    // Remember that user wants a fresh chat (persists across page reloads)
    localStorage.setItem("bibleBuddyChatCleared", "true");
    setIsNewChatMode(true);
    setCurrentConversationId(null);
    setMessages([]);
  };

  const displayMessages = messages.length > 0 ? messages : [systemPrompt];

  return (
    <div className="bg-background text-foreground antialiased h-screen flex flex-col overflow-hidden">
      <Navigation customLogo={vagabondLogo} showAuth={true} hideNavLinks={true} />

      {/* Tab Toggle - stays fixed below nav */}
      <div className="flex-shrink-0 bg-background w-full max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex p-1 rounded-lg bg-muted">
            <button
              onClick={() => setActiveTab("bible")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "bible"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-bible"
            >
              {activeTab === "bible" && (
                <motion.div
                  layoutId="tabHighlight"
                  className="absolute inset-0 bg-background rounded-md shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Book className="w-4 h-4" />
                Bible
              </span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-chat"
            >
              {activeTab === "chat" && (
                <motion.div
                  layoutId="tabHighlight"
                  className="absolute inset-0 bg-background rounded-md shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "bible" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Bible Version</span>
                <Select value={bibleTranslation} onValueChange={setBibleTranslation}>
                  <SelectTrigger className="w-20" data-testid="select-bible-translation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bibleTranslations?.map((t) => (
                      <SelectItem key={t.short_name} value={t.short_name}>
                        {t.short_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div 
          className={`w-full max-w-3xl mx-auto px-4 h-full ${activeTab === "bible" ? "" : "hidden"}`}
        >
          <BibleReader translation={bibleTranslation} onTranslationChange={setBibleTranslation} />
        </div>

        <div className={activeTab === "chat" ? "" : "hidden"}>
          <div className="w-full max-w-3xl mx-auto px-4" style={{ paddingBottom: `${footerHeight}px` }}>
            {/* Messages area */}
            <div ref={scrollAreaRef} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayMessages.map((message, index) => {
                const isWelcomeMessage = index === 0 && messages.length === 0 && message.content.includes("Hey there! I'm Pastor Brett");
                
                if (isWelcomeMessage) {
                  return <WelcomeMessage key="welcome-message" />;
                }
                
                const shouldAnimate = index >= animateFromIndex;
                return (
                  <motion.div
                    key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                    initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldAnimate ? { duration: 0.3, ease: "easeOut" } : { duration: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                      data-testid={`message-${message.role}-${index}`}
                    >
                      {message.role === "user" ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 [&_strong]:font-serif [&_strong]:text-foreground">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {isStreaming && (messages.length === 0 || messages[messages.length - 1]?.role === "user" || messages[messages.length - 1]?.content === "") && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Consulting THE Big Guy 👆...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
        </div>
      </div>

      {/* FIXED Input at absolute bottom of viewport - only show for Chat tab */}
      {activeTab === "chat" && (
      <div 
        ref={footerRef}
        className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <div className="w-full max-w-3xl mx-auto">
          {isLimitReached ? (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                <Lock className="w-5 h-5" />
                <span>You've reached your free message limit</span>
              </div>
              <Button onClick={() => setShowPaywall(true)} className="btn-upgrade" data-testid="button-upgrade">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro for Unlimited Access
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your heart..."
                className="min-h-[60px] resize-none w-full"
                disabled={isStreaming}
                data-testid="input-message"
              />
              <div className="flex items-center gap-1">
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="flex-1"
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                      data-testid="button-chat-menu-footer"
                      aria-label="Chat options"
                    >
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={startNewChat}
                      data-testid="menu-clear-chat"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Subscription Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              You've experienced what Vagabond Bible can offer. Upgrade to Pro for unlimited spiritual guidance and support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2">Pro Plan - $9.99/month</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited Vagabond Bible conversations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Priority spiritual guidance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Access to exclusive community content
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Direct prayer request support
                </li>
              </ul>
            </div>
            <Button 
              onClick={handleSubscribe} 
              className="w-full btn-upgrade" 
              disabled={isCheckingOut}
              data-testid="button-checkout"
            >
              {isCheckingOut ? "Redirecting..." : "Subscribe Now"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime. Secure payment via Stripe.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Required Modal */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              Please sign in to your account to subscribe to the Pro plan. This ensures your subscription is linked to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              After signing in, you'll be able to subscribe and your Pro access will be remembered across all your devices.
            </p>
            <Link href="/login?redirect=/pastor-chat">
              <Button 
                className="w-full"
                data-testid="button-signin-modal"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
