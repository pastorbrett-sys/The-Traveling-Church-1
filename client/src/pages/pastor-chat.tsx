import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, Lock, Sparkles, LogIn } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";

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

export default function PastorChat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [footerHeight, setFooterHeight] = useState(180);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  // Fetch session stats from server (for anonymous message counting)
  const { data: sessionStats, refetch: refetchSessionStats } = useQuery<SessionStats>({
    queryKey: ["/api/chat/session-stats"],
    refetchOnWindowFocus: false,
  });

  // Fetch subscription status for authenticated users
  const { data: subscriptionStatus, refetch: refetchSubscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/my-subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Determine if user is pro - check both session stats (server-side check) and subscription status
  const isPro = sessionStats?.isPro || subscriptionStatus?.isProUser || false;
  const messageCount = sessionStats?.messageCount ?? 0;
  const isLimitReached = !isPro && messageCount >= FREE_MESSAGE_LIMIT;

  const systemPrompt: ChatMessage = {
    role: "assistant",
    content: "Welcome! I'm here to offer pastoral guidance and spiritual support. Feel free to share what's on your heart, ask questions about faith, or seek prayer. I'm here to listen and help you find comfort in God's word. How can I help you today?"
  };

  // Measure footer height dynamically
  useEffect(() => {
    if (!footerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFooterHeight(entry.contentRect.height + 32); // Add extra padding
      }
    });
    
    observer.observe(footerRef.current);
    // Initial measurement
    setFooterHeight(footerRef.current.offsetHeight + 32);
    
    return () => observer.disconnect();
  }, []);

  // Helper function to scroll to bottom - ensures full message is visible above footer
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      // Scroll the window to show the end of messages
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });
    });
  };

  // Scroll to show newest messages just above the sticky footer
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.title = "AI Pastor Chat | The Traveling Church";
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
      const productsData = await productsRes.json();
      console.log("Products data:", productsData);
      
      const proPlan = productsData.data?.find((p: any) => p.metadata?.tier === "pro");
      console.log("Pro plan found:", proPlan);
      
      if (!proPlan) {
        alert("Pro plan not found. Please try again in a moment while we sync with our payment system.");
        return;
      }
      
      const proPrice = proPlan?.prices?.find((p: any) => p.recurring?.interval === "month");
      console.log("Pro price found:", proPrice);
      
      if (!proPrice) {
        alert("Pricing not available. Please try again shortly.");
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
        alert("Could not start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
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

      // Handle payment required (message limit reached)
      if (response.status === 402) {
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayMessages = messages.length > 0 ? messages : [systemPrompt];

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />

      <main style={{ paddingBottom: `${footerHeight}px` }}>
        <div className="w-full max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 border border-border rounded-lg mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-foreground" data-testid="heading-pastor-chat">
                      AI Pastor Chat
                    </h1>
                    {isPro && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground" data-testid="badge-pro">
                        <Sparkles className="w-3 h-3 mr-1" />
                        PRO
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!isAuthenticated && (
                <Link href="/login?redirect=/pastor-chat">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div ref={scrollAreaRef} className="mt-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {displayMessages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* FIXED Input at absolute bottom of viewport */}
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
              <Button onClick={() => setShowPaywall(true)} data-testid="button-upgrade">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro for Unlimited Access
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your heart..."
                className="min-h-[60px] resize-none w-full"
                disabled={isStreaming}
                data-testid="input-message"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="w-full"
                data-testid="button-send"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              You've experienced what the AI Pastor can offer. Upgrade to Pro for unlimited spiritual guidance and support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2">Pro Plan - $9.99/month</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited AI Pastor conversations
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
              className="w-full" 
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
