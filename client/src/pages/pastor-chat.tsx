import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, Plus, Trash2, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import type { Conversation, Message } from "@shared/schema";

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

export default function PastorChat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch session stats from server
  const { data: sessionStats, refetch: refetchSessionStats } = useQuery<SessionStats>({
    queryKey: ["/api/chat/session-stats"],
    refetchOnWindowFocus: false,
  });

  const messageCount = sessionStats?.messageCount ?? 0;
  const isPro = sessionStats?.isPro ?? false;
  const isLimitReached = !isPro && messageCount >= FREE_MESSAGE_LIMIT;

  const systemPrompt: ChatMessage = {
    role: "assistant",
    content: "Welcome! I'm here to offer pastoral guidance and spiritual support. Feel free to share what's on your heart, ask questions about faith, or seek prayer. I'm here to listen and help you find comfort in God's word. How can I help you today?"
  };

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: conversationData } = useQuery<Conversation & { messages: Message[] }>({
    queryKey: ["/api/conversations", currentConversationId],
    enabled: !!currentConversationId,
  });

  useEffect(() => {
    if (conversationData?.messages) {
      setMessages(
        conversationData.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
    }
  }, [conversationData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.title = "AI Pastor Chat | The Traveling Church";
  }, []);

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { title: "New Conversation" });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      setCurrentConversationId(data.id);
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      if (currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSubscribe = async () => {
    setIsCheckingOut(true);
    try {
      // Fetch the Pro plan price
      const productsRes = await fetch("/api/stripe/products-with-prices");
      const productsData = await productsRes.json();
      const proPlan = productsData.data?.find((p: any) => p.metadata?.tier === "pro");
      const proPrice = proPlan?.prices?.find((p: any) => p.recurring?.interval === "month");
      
      if (proPrice) {
        const checkoutRes = await apiRequest("POST", "/api/stripe/checkout", {
          priceId: proPrice.id,
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
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
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-5 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Conversations */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-card rounded-lg shadow-md border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground" data-testid="heading-conversations">
                    Conversations
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createConversation.mutate()}
                    disabled={createConversation.isPending}
                    data-testid="button-new-chat"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <ScrollArea className="h-48 lg:h-64">
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                          currentConversationId === conv.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setCurrentConversationId(conv.id)}
                        data-testid={`conversation-${conv.id}`}
                      >
                        <span className="text-sm truncate flex-1">{conv.title}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation.mutate(conv.id);
                          }}
                          data-testid={`button-delete-${conv.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1">
              <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-foreground" data-testid="heading-pastor-chat">
                        AI Pastor Chat
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Seek spiritual guidance and pastoral support
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="h-96 md:h-[500px] p-4">
                  <div className="space-y-4">
                    {displayMessages.map((message, index) => (
                      <div
                        key={index}
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
                      </div>
                    ))}
                    {isStreaming && messages[messages.length - 1]?.content === "" && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  {isLimitReached ? (
                    <div className="text-center py-4">
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
                    <>
                      <div className="flex gap-2">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Share what's on your heart..."
                          className="min-h-[60px] resize-none"
                          disabled={isStreaming}
                          data-testid="input-message"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!input.trim() || isStreaming}
                          className="self-end"
                          data-testid="button-send"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          This AI provides general spiritual guidance. For personal counseling, please contact a pastor directly.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {FREE_MESSAGE_LIMIT - messageCount} free messages remaining
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      <Footer />
    </div>
  );
}
