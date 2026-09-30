"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Language } from "@/lib/translations";

type Destination = "/" | "/report" | "/dashboard" | "/policymaker" | "/profile" | "/login";
type Message = { role: "user" | "assistant"; content: string; destination?: Destination | null };

const copy: Record<Language, {
  title: string;
  subtitle: string;
  welcome: string;
  placeholder: string;
  send: string;
  working: string;
  error: string;
  starters: string[];
  destinations: Record<Destination, string>;
}> = {
  en: {
    title: "JanSetu guide",
    subtitle: "Website help, powered by Gemini",
    welcome: "Ask a question about reporting, priority scores, or finding your way around JanSetu AI.",
    placeholder: "Ask about the website...",
    send: "Send message",
    working: "Thinking",
    error: "I couldn't reach the assistant. Please try again.",
    starters: ["How do I report an issue?", "What does the priority score mean?", "Where can I track my report?"],
    destinations: { "/": "Home", "/report": "Report an issue", "/dashboard": "Government dashboard", "/policymaker": "Policymaker insights", "/profile": "My reports", "/login": "Sign in" },
  },
  hi: {
    title: "JanSetu सहायक",
    subtitle: "Gemini द्वारा वेबसाइट सहायता",
    welcome: "रिपोर्ट दर्ज करने, प्राथमिकता स्कोर या JanSetu AI का उपयोग करने के बारे में पूछें।",
    placeholder: "वेबसाइट के बारे में पूछें...",
    send: "संदेश भेजें",
    working: "सोच रहा है",
    error: "सहायक से संपर्क नहीं हो सका। फिर से प्रयास करें।",
    starters: ["समस्या कैसे दर्ज करूँ?", "प्राथमिकता स्कोर क्या है?", "अपनी रिपोर्ट कहाँ देखूँ?"],
    destinations: { "/": "होम", "/report": "समस्या दर्ज करें", "/dashboard": "सरकारी डैशबोर्ड", "/policymaker": "नीति अंतर्दृष्टि", "/profile": "मेरी रिपोर्ट", "/login": "साइन इन" },
  },
  te: {
    title: "JanSetu సహాయకుడు",
    subtitle: "Gemini వెబ్‌సైట్ సహాయం",
    welcome: "నివేదికలు, ప్రాధాన్యత స్కోర్లు లేదా JanSetu AI వినియోగం గురించి అడగండి.",
    placeholder: "వెబ్‌సైట్ గురించి అడగండి...",
    send: "సందేశం పంపండి",
    working: "ఆలోచిస్తోంది",
    error: "సహాయకుడిని సంప్రదించలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    starters: ["సమస్యను ఎలా నివేదించాలి?", "ప్రాధాన్యత స్కోర్ అంటే ఏమిటి?", "నా నివేదికను ఎక్కడ చూడాలి?"],
    destinations: { "/": "హోమ్", "/report": "సమస్యను నివేదించండి", "/dashboard": "ప్రభుత్వ డాష్‌బోర్డ్", "/policymaker": "విధాన సమాచారం", "/profile": "నా నివేదికలు", "/login": "సైన్ ఇన్" },
  },
};

export default function HelpChat() {
  const { lang } = useLanguage();
  const text = copy[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const sendMessage = async (rawMessage: string) => {
    const content = rawMessage.trim();
    if (!content || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12).map(({ role, content: messageContent }) => ({ role, content: messageContent })) }),
      });
      const result = await response.json() as { answer?: string; destination?: Destination | null; error?: string };
      if (!response.ok || !result.answer) throw new Error(result.error || text.error);
      setMessages((current) => [...current, { role: "assistant", content: result.answer!, destination: result.destination }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : text.error;
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section className="mb-3 flex h-[min(38rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[24rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.24)] dark:border-slate-700 dark:bg-slate-900" aria-label={text.title}>
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-4 py-3.5 text-white dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950"><Bot className="h-5 w-5" /></span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">{text.title}</h2>
                <p className="truncate text-xs text-slate-300">{text.subtitle}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollAreaRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-3 py-4 dark:bg-slate-950/70" role="log" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && (
              <p className="px-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{text.welcome}</p>
            )}
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-cyan-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"}`}>
                  {message.role === "assistant" && <Sparkles className="mb-1.5 h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.destination && (
                    <Link href={message.destination} onClick={() => setIsOpen(false)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-300 dark:hover:bg-cyan-900/60">
                      {text.destinations[message.destination]} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pl-1">
                {text.starters.map((starter) => (
                  <button key={starter} type="button" onClick={() => void sendMessage(starter)} disabled={isLoading} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-800 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300">
                    {starter}
                  </button>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 pl-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin" /> {text.working}...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <label className="sr-only" htmlFor="help-chat-input">{text.placeholder}</label>
            <textarea
              id="help-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder={text.placeholder}
              className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button type="submit" disabled={isLoading || !input.trim()} title={text.send} aria-label={text.send} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close JanSetu guide" : "Open JanSetu guide"}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-white shadow-lg shadow-cyan-950/25 transition hover:-translate-y-0.5 hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/30"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
