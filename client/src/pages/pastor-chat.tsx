import { useState, useRef, useEffect, useCallback, useMemo, forwardRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, Lock, LogIn, MoreVertical, RefreshCw, Book, Loader2, BookOpenText, HelpCircle, Heart, Sparkles } from "lucide-react";
import { Link, useSearch, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { LoginSheet } from "@/components/login-sheet";
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
import { apiRequest, apiFetch, getApiUrl } from "@/lib/queryClient";
import { renderTextWithVerseLinks, type VerseRef } from "@/lib/verse-linker";
import { setGlobalActiveTab, getGlobalActiveTab, subscribeToActiveTab } from "@/lib/active-tab-store";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import BibleReader, { type BibleReaderHandle } from "@/components/bible-reader";
import pastorBrettIcon from "@assets/Pastor_Brett_Chat_Icon_1767476985840.png";
import vagabondLogo from "@/assets/vagabond-logo.png";
import { usePlatform } from "@/contexts/platform-context";
import { useRevenueCat } from "@/contexts/revenuecat-context";
import { getBottomNavOffset, getBottomInset } from "@/lib/native-spacing";
import { getDefaultBibleTranslation } from "@/lib/i18n";

// Check if translation is Amharic-based
function isAmharicTranslation(translation: string): boolean {
  return translation === "ETH" || translation === "AMPROT";
}

// Localized UI text for Pastor Chat
const chatUiText = {
  en: {
    welcomeMessage: "Hey I'm Pastor Brett your AI Pastor. How can I help you?",
    pastorBrett: "Pastor Brett",
    askAnything: "Ask Pastor Brett anything...",
    send: "Send",
    chatTab: "Chat",
    bibleTab: "Bible",
    startNewChat: "Start new chat",
    signInRequired: "Sign in Required",
    signInToChat: "Sign in to chat with Pastor Brett",
    signIn: "Sign In",
    messageLimitReached: "Message Limit Reached",
    messageLimitDesc: "You've reached your daily message limit.",
    upgrade: "Upgrade to Pro",
    upgradeToPremium: "Upgrade to Premium",
    messagesRemaining: "messages remaining today",
    unlimited: "Unlimited",
    buyCredits: "Buy Credits",
    dailyResetMessage: "Your daily limit resets at midnight UTC.",
    monthlyResetMessage: "Your limit resets next month.",
    creditsAvailable: "Or buy credits to continue now",
    consultingBigGuy: "Consulting THE Big Guy 👆...",
    bibleVersion: "Bible Version",
    quickGreeting: "What do you need right now?",
    quickStudy: "Study a specific passage",
    quickConfused: "I'm confused about a verse",
    quickStruggling: "I'm struggling with something",
    quickAnything: "Ask anything",
  },
  am: {
    welcomeMessage: "ሰላም! እኔ ፓስተር ብሬት ነኝ፣ የእርስዎ AI ፓስተር። እንዴት ልረዳዎት?",
    pastorBrett: "ፓስተር ብሬት",
    askAnything: "ፓስተር ብሬትን ማንኛውንም ነገር ይጠይቁ...",
    send: "ላክ",
    chatTab: "ውይይት",
    bibleTab: "መጽሐፍ ቅዱስ",
    startNewChat: "አዲስ ውይይት ጀምር",
    signInRequired: "መግባት ያስፈልጋል",
    signInToChat: "ከፓስተር ብሬት ጋር ለመወያየት ይግቡ",
    signIn: "ግባ",
    messageLimitReached: "የመልዕክት ገደብ ደርሷል",
    messageLimitDesc: "የዕለት የመልዕክት ገደብዎን ደርሰዋል።",
    upgrade: "ወደ ፕሮ አሻሽል",
    upgradeToPremium: "ወደ ፕሪሚየም አሻሽል",
    messagesRemaining: "መልዕክቶች ዛሬ ቀርተዋል",
    buyCredits: "ክሬዲት ግዛ",
    dailyResetMessage: "የዕለት ገደብዎ በሌሊት 12 ሰዓት UTC ይታደሳል።",
    monthlyResetMessage: "ገደብዎ በቀጣይ ወር ይታደሳል።",
    creditsAvailable: "ወይም አሁን ለመቀጠል ክሬዲት ይግዙ",
    unlimited: "ያልተገደበ",
    consultingBigGuy: "እግዚአብሔርን በመጠየቅ ላይ 👆...",
    bibleVersion: "የመጽሐፍ ቅዱስ ትርጉም",
    quickGreeting: "አሁን ምን ያስፈልግዎታል?",
    quickStudy: "የተወሰነ ክፍል አጥና",
    quickConfused: "ስለ አንድ ጥቅስ ግራ ተጋብቻለሁ",
    quickStruggling: "በአንድ ነገር እየታገልኩ ነው",
    quickAnything: "ማንኛውንም ነገር ጠይቅ",
  }
};

function getChatLocalizedText(translation: string) {
  return isAmharicTranslation(translation) ? chatUiText.am : chatUiText.en;
}

interface WelcomeMessageProps {
  translation: string;
  onQuickSelect?: (message: string) => void;
  showQuickSelects?: boolean;
}

const quickSelectIcons = [BookOpenText, HelpCircle, Heart, Sparkles];

const WelcomeMessage = forwardRef<HTMLDivElement, WelcomeMessageProps>(({ translation, onQuickSelect, showQuickSelects = true }, ref) => {
  const t = getChatLocalizedText(translation);
  const quickOptions = [
    { label: t.quickStudy, icon: quickSelectIcons[0] },
    { label: t.quickConfused, icon: quickSelectIcons[1] },
    { label: t.quickStruggling, icon: quickSelectIcons[2] },
    { label: t.quickAnything, icon: quickSelectIcons[3] },
  ];
  return (
    <div ref={ref} className="space-y-4">
      <motion.div
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
            alt={t.pastorBrett}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          <p className="text-sm text-foreground">
            {t.welcomeMessage}
          </p>
        </div>
      </motion.div>

      {showQuickSelects && (
        <>
          <div className="flex flex-wrap gap-2 justify-start">
            {quickOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.label}
                  initial={{ opacity: 0, scale: 0.8, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.6 + i * 0.12,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => onQuickSelect?.(opt.label)}
                  className="inline-flex items-center gap-2 bg-[#b8860b]/10 border border-[#b8860b]/30 text-[#9a7209] dark:text-[#d4a843] rounded-full px-4 py-2.5 text-sm font-medium hover:bg-[#b8860b]/20 active:bg-[#b8860b]/25 transition-colors"
                  data-testid={`quick-select-${i}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});
WelcomeMessage.displayName = "WelcomeMessage";

const GUEST_FREE_MESSAGES = 2;
const GUEST_MSG_COUNT_KEY = "vagabondGuestMsgCount";

function getGuestMessageCount(): number {
  try {
    return parseInt(localStorage.getItem(GUEST_MSG_COUNT_KEY) || "0", 10);
  } catch { return 0; }
}

function incrementGuestMessageCount(): number {
  const count = getGuestMessageCount() + 1;
  try { localStorage.setItem(GUEST_MSG_COUNT_KEY, String(count)); } catch {}
  return count;
}

const FREE_MESSAGE_LIMIT = 10;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionStats {
  messageCount: number;
  isPro: boolean;
  limit: number;
  pricingTier?: 'premium' | 'emerging';
  resetType?: 'daily' | 'monthly';
}

interface SubscriptionStatus {
  subscription: any;
  isProUser: boolean;
  stripeCustomerId: string | null;
}

interface Translation {
  short_name: string;
  full_name: string;
  display_name?: string;
}

// Preload Pastor Brett avatar immediately so it's cached before WelcomeMessage renders
const preloadedPastorImage = new Image();
preloadedPastorImage.src = pastorBrettIcon;

function processChildren(children: any, onVerseClick: (ref: VerseRef) => void): any {
  if (typeof children === "string") {
    return renderTextWithVerseLinks(children, onVerseClick);
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        const parts = renderTextWithVerseLinks(child, onVerseClick);
        return parts.length === 1 && typeof parts[0] === "string" ? child : <span key={i}>{parts}</span>;
      }
      return child;
    });
  }
  return children;
}

export default function PastorChat() {
  const { isNative } = usePlatform();
  const { isProUser: revenueCatIsPro, isInitialized: revenueCatInitialized } = useRevenueCat();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tabParam = urlParams.get("tab");
  const seedQuestion = urlParams.get("seedQuestion");
  const seedAnswer = urlParams.get("seedAnswer");
  const seedFollowUp = urlParams.get("seedFollowUp");
  const upgradeParam = urlParams.get("upgrade");
  
  // Deep link params for push notification navigation to specific verse
  const bookParam = urlParams.get("book");
  const bookNameParam = urlParams.get("bookName"); // Book name for reliable lookup
  const chapterParam = urlParams.get("chapter");
  const verseParam = urlParams.get("verse");
  const highlightParam = urlParams.get("highlight");
  const showActionMenuParam = urlParams.get("showActionMenu");
  
  const initialBookId = bookParam ? parseInt(bookParam, 10) : undefined;
  const initialBookName = bookNameParam || undefined;
  const initialChapter = chapterParam ? parseInt(chapterParam, 10) : undefined;
  const initialVerse = verseParam ? parseInt(verseParam, 10) : undefined;
  const triggerHighlight = highlightParam === "true";
  const showActionMenu = showActionMenuParam === "true";
  
  // Debug logging for deep link params
  if (bookParam || bookNameParam || showActionMenuParam) {
    console.log('[PastorChat] Deep link params:', { 
      bookParam, bookNameParam, chapterParam, verseParam, highlightParam, showActionMenuParam,
      parsed: { initialBookId, initialBookName, initialChapter, initialVerse, triggerHighlight, showActionMenu }
    });
  }
  
  const [activeTab, setActiveTab] = useState<"chat" | "bible">(tabParam === "bible" ? "bible" : "chat");
  const bibleReaderRef = useRef<BibleReaderHandle>(null);
  const [, setLocation] = useLocation();

  const handleVerseClick = useCallback((ref: VerseRef) => {
    setActiveTab("bible");
    setGlobalActiveTab("bible");
    setTimeout(() => {
      bibleReaderRef.current?.navigateToVerse(ref.bookName, ref.chapter, ref.verse);
    }, 100);
  }, []);

  const markdownComponents = useMemo(() => ({
    p: ({ children, ...props }: any) => {
      return <p {...props}>{processChildren(children, handleVerseClick)}</p>;
    },
    li: ({ children, ...props }: any) => {
      return <li {...props}>{processChildren(children, handleVerseClick)}</li>;
    },
    strong: ({ children, ...props }: any) => {
      return <strong {...props}>{processChildren(children, handleVerseClick)}</strong>;
    },
    em: ({ children, ...props }: any) => {
      return <em {...props}>{processChildren(children, handleVerseClick)}</em>;
    },
  }), [handleVerseClick]);

  // Sync activeTab with URL param changes (for native tab bar navigation)
  useEffect(() => {
    const newTab = tabParam === "bible" ? "bible" : "chat";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [tabParam]);

  // Listen for global tab changes (e.g. native tab bar clicks when URL doesn't change)
  useEffect(() => {
    return subscribeToActiveTab(() => {
      const globalTab = getGlobalActiveTab();
      if (globalTab === "chat" || globalTab === "bible") {
        setActiveTab(globalTab as "chat" | "bible");
      }
    });
  }, []);

  // Keep global active tab store in sync for the native tab bar
  useEffect(() => {
    setGlobalActiveTab(activeTab);
  }, [activeTab]);
  
  const [bibleTranslation, setBibleTranslation] = useState(() => {
    // Load from localStorage or use locale-aware default (ETHE for Amharic, KJV otherwise)
    return localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
  });
  
  // Persist translation choice to localStorage and notify other components
  useEffect(() => {
    localStorage.setItem("bibleTranslation", bibleTranslation);
    // Dispatch custom event for same-tab listeners (like native tab bar)
    window.dispatchEvent(new CustomEvent("translationChanged", { detail: bibleTranslation }));
  }, [bibleTranslation]);
  
  // Listen for storage changes (when user switches translation in another tab/page)
  useEffect(() => {
    const handleStorageChange = () => {
      const newTranslation = localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
      if (newTranslation !== bibleTranslation) {
        setBibleTranslation(newTranslation);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [bibleTranslation]);
  
  // Get localized text based on translation
  const t = getChatLocalizedText(bibleTranslation);
  
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [footerHeight, setFooterHeight] = useState(180);
  const [isNewChatMode, setIsNewChatMode] = useState(() => {
    // Check if user previously cleared their chat
    return localStorage.getItem("bibleBuddyChatCleared") === "true";
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [animateFromIndex, setAnimateFromIndex] = useState<number>(Infinity);
  const [showQuickSelects, setShowQuickSelects] = useState(true);
  
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
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Fetch Bible translations for the selector
  const { data: bibleTranslations } = useQuery<Translation[]>({
    queryKey: ["/api/bible/translations"],
  });

  // Load the most recent conversation's messages on mount (but not if user started a new chat or we have seed params)
  useEffect(() => {
    if (!isAuthenticated) return; // Skip if not logged in
    if (seedQuestion && seedAnswer) return; // Skip restoration if we're seeding
    if (conversations && conversations.length > 0 && !currentConversationId && !isNewChatMode) {
      const mostRecent = conversations[0]; // Already sorted by createdAt desc
      setCurrentConversationId(mostRecent.id);
      
      // Fetch messages for this conversation
      apiFetch(`/api/conversations/${mostRecent.id}`)
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
    if (!isAuthenticated) return; // Skip if not logged in
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
          const followUpRes = await apiFetch(`/api/conversations/${convId}/follow-up`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: seedQuestion, answer: seedAnswer }),
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

  // Determine if user is pro - check server-side (session stats, Stripe), and RevenueCat (native only)
  const serverIsPro = sessionStats?.isPro || subscriptionStatus?.isProUser || false;
  const isPro = isNative && revenueCatInitialized ? (revenueCatIsPro || serverIsPro) : serverIsPro;
  const messageCount = sessionStats?.messageCount ?? 0;
  const messageLimit = sessionStats?.limit ?? FREE_MESSAGE_LIMIT;
  const isLimitReached = messageCount >= messageLimit;
  const resetType = sessionStats?.resetType ?? (isPro ? 'daily' : 'monthly');

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

  const sendMessageWithText = async (overrideText?: string) => {
    const messageText = overrideText || input.trim();
    if (!messageText || isStreaming) return;

    setShowQuickSelects(false);

    if (!isAuthenticated) {
      const guestCount = getGuestMessageCount();
      if (guestCount >= GUEST_FREE_MESSAGES) {
        setShowLoginPrompt(true);
        return;
      }
      incrementGuestMessageCount();
    }

    if (isAuthenticated && isLimitReached) {
      setShowPaywall(true);
      return;
    }

    let convId = currentConversationId;
    if (isAuthenticated && !convId) {
      const res = await apiRequest("POST", "/api/conversations", { title: messageText.slice(0, 50) });
      const newConv = await res.json();
      convId = newConv.id;
      setCurrentConversationId(convId);
      setIsNewChatMode(false);
      localStorage.removeItem("bibleBuddyChatCleared");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }

    const userMessage: ChatMessage = { role: "user", content: messageText };
    const savedInput = messageText;
    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput("");
    setIsStreaming(true);

    const endpoint = isAuthenticated && convId
      ? `/api/conversations/${convId}/messages`
      : `/api/chat/guest`;

    try {
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: savedInput, translation: bibleTranslation }),
      });

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

      if (isAuthenticated) refetchSessionStats();

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

  const sendMessage = () => sendMessageWithText();

  const handleQuickSelect = (label: string) => {
    setInput("");
    sendMessageWithText(label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = async () => {
    if (currentConversationId && isAuthenticated) {
      try {
        await apiRequest("DELETE", `/api/conversations/${currentConversationId}`);
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
    localStorage.setItem("bibleBuddyChatCleared", "true");
    setIsNewChatMode(true);
    setCurrentConversationId(null);
    setMessages([]);
    setShowQuickSelects(true);
  };

  const displayMessages = messages.length > 0 ? messages : [systemPrompt];

  return (
    <div 
      className="bg-background text-foreground antialiased flex flex-col overflow-hidden"
      style={{ height: "100vh", overscrollBehavior: "none" }}
    >
      <Navigation 
        customLogo={vagabondLogo} 
        showAuth={true} 
        hideNavLinks={true}
        rightContent={isNative && activeTab === "bible" ? (
          <Select value={bibleTranslation} onValueChange={setBibleTranslation}>
            <SelectTrigger className="w-20" data-testid="select-bible-translation-nav">
              <SelectValue placeholder={bibleTranslation} />
            </SelectTrigger>
            <SelectContent>
              {bibleTranslations?.map((t) => (
                <SelectItem key={t.short_name} value={t.short_name}>
                  {t.display_name || t.short_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : undefined}
      />

      {/* Tab Toggle - only shown in web mode (native uses bottom tab bar) */}
      {!isNative && (
        <div className="flex-shrink-0 bg-background w-full max-w-3xl mx-auto px-4 py-3 relative z-0">
          <div className="flex items-center justify-between">
            <div className="inline-flex p-1 rounded-lg bg-muted">
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
                <span className="relative flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t.chatTab}
                </span>
              </button>
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
                <span className="relative flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  {t.bibleTab}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "bible" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">{t.bibleVersion}</span>
                  <Select value={bibleTranslation} onValueChange={setBibleTranslation}>
                    <SelectTrigger className="w-20" data-testid="select-bible-translation">
                      <SelectValue placeholder={bibleTranslation} />
                    </SelectTrigger>
                    <SelectContent>
                      {bibleTranslations?.map((t) => (
                        <SelectItem key={t.short_name} value={t.short_name}>
                          {t.display_name || t.short_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-background" style={{ overscrollBehavior: "none" }}>
        <div 
          className={`w-full max-w-3xl mx-auto px-4 min-h-full ${activeTab === "bible" ? "" : "hidden"}`}
        >
          <BibleReader 
            ref={bibleReaderRef}
            translation={bibleTranslation} 
            onTranslationChange={setBibleTranslation}
            initialBookId={initialBookId}
            initialBookName={initialBookName}
            initialChapter={initialChapter}
            initialVerse={initialVerse}
            triggerHighlight={triggerHighlight}
            showActionMenuOnDeepLink={showActionMenu}
          />
        </div>

        <div className={activeTab === "chat" ? "" : "hidden"}>
          <div className="w-full max-w-3xl mx-auto px-4" style={{ paddingBottom: isNative ? `${footerHeight + 64}px` : `${footerHeight}px` }}>
            {/* Messages area */}
            <div ref={scrollAreaRef} className="space-y-4 pt-4">
            <AnimatePresence mode="popLayout">
              {displayMessages.map((message, index) => {
                const isWelcomeMessage = index === 0 && messages.length === 0 && message.role === "assistant";
                
                if (isWelcomeMessage) {
                  return <WelcomeMessage key="welcome-message" translation={bibleTranslation} onQuickSelect={handleQuickSelect} showQuickSelects={showQuickSelects} />;
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
                        <p className="text-sm whitespace-pre-wrap selectable-text">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 [&_strong]:font-serif [&_strong]:text-foreground selectable-text">
                          <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
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
                      <span>{t.consultingBigGuy}</span>
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
        className="fixed left-0 right-0 p-4 bg-card border-t border-border"
        style={{ 
          bottom: isNative ? getBottomNavOffset() : "0",
          paddingBottom: isNative ? "16px" : `calc(${getBottomInset()} + 16px)` 
        }}
      >
        <div className="w-full max-w-3xl mx-auto">
          {isLimitReached ? (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                <Lock className="w-5 h-5" />
                <span>{t.messageLimitReached}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3" data-testid="text-daily-reset-message">
                {resetType === 'daily' ? t.dailyResetMessage : t.monthlyResetMessage}
              </p>
              {isPro ? (
                <div className="flex flex-col gap-2 items-center">
                  <p className="text-xs text-muted-foreground">{t.creditsAvailable}</p>
                  <Button size="sm" variant="outline" className="border-[#d79942] text-[#d79942]" data-testid="button-buy-credits" onClick={() => setShowPaywall(true)}>
                    {t.buyCredits}
                  </Button>
                  {sessionStats?.pricingTier === 'emerging' && (
                    <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" data-testid="button-upgrade-to-premium" onClick={() => setShowPaywall(true)}>
                      {t.upgradeToPremium}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={() => setShowPaywall(true)} className="btn-upgrade" data-testid="button-upgrade">
                  {t.upgrade}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messageLimit > 0 && messageCount >= Math.floor(messageLimit * 0.8) && !isLimitReached && (
                <div className={`text-xs text-center py-1 px-2 rounded ${
                  messageCount >= Math.floor(messageLimit * 0.9)
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-amber-500 bg-amber-500/10'
                }`} data-testid="text-usage-warning">
                  {messageCount >= Math.floor(messageLimit * 0.9)
                    ? (resetType === 'daily' ? t.dailyResetMessage : t.monthlyResetMessage)
                    : `${messageLimit - messageCount} ${t.messagesRemaining}`
                  }
                </div>
              )}
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.askAnything}
                className="min-h-[60px] resize-none w-full text-foreground"
                disabled={isStreaming}
                data-testid="input-message"
              />
              <div className="flex items-center gap-1">
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="flex-1 bg-[#b8860b] hover:bg-[#9a7209] text-white"
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t.send}
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
                  <DropdownMenuContent align="end" className="w-40 z-[200]">
                    <DropdownMenuItem
                      onClick={startNewChat}
                      data-testid="menu-clear-chat"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t.startNewChat}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      <UpgradeDialog open={showPaywall} onClose={() => setShowPaywall(false)} feature="chat_message" translation={bibleTranslation} />

      {/* Login Sheet */}
      <LoginSheet
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        redirectUrl="/pastor-chat?tab=chat"
        isAmharic={isAmharicTranslation(bibleTranslation)}
      />
    </div>
  );
}
