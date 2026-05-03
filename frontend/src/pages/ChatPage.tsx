import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
interface Message {
  role: "user" | "assistant";
  content: string;
}

// DocuMind Logo SVG — matches the uploaded brand asset
function DocuMindLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 8 H65 L85 28 V92 H15 Z"
        fill="none"
        stroke="#1a2a6c"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M65 8 L65 28 L85 28"
        fill="none"
        stroke="#1a2a6c"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="38" r="5" fill="#00c2cb" />
      <circle cx="62" cy="44" r="5" fill="#00c2cb" />
      <circle cx="42" cy="62" r="5" fill="#00c2cb" />
      <circle
        cx="58"
        cy="28"
        r="4"
        fill="#050c1a"
        stroke="#00c2cb"
        strokeWidth="2"
      />
      <circle
        cx="28"
        cy="56"
        r="4"
        fill="#050c1a"
        stroke="#00c2cb"
        strokeWidth="2"
      />
      <circle
        cx="64"
        cy="68"
        r="4"
        fill="#050c1a"
        stroke="#00c2cb"
        strokeWidth="2"
      />
      <line
        x1="38"
        y1="38"
        x2="62"
        y2="44"
        stroke="#00c2cb"
        strokeWidth="2"
        opacity="0.7"
      />
      <line
        x1="38"
        y1="38"
        x2="42"
        y2="62"
        stroke="#00c2cb"
        strokeWidth="2"
        opacity="0.7"
      />
      <line
        x1="62"
        y1="44"
        x2="42"
        y2="62"
        stroke="#00c2cb"
        strokeWidth="2"
        opacity="0.7"
      />
      <line
        x1="38"
        y1="38"
        x2="58"
        y2="28"
        stroke="#00c2cb"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="38"
        y1="38"
        x2="28"
        y2="56"
        stroke="#00c2cb"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="62"
        y1="44"
        x2="64"
        y2="68"
        stroke="#00c2cb"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="42"
        y1="62"
        x2="28"
        y2="56"
        stroke="#00c2cb"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="42"
        y1="62"
        x2="64"
        y2="68"
        stroke="#00c2cb"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const currentSessionId = sessionStorage.getItem("session_id");
    const chatSessionId = sessionStorage.getItem("chat_session_id");

    if (currentSessionId !== chatSessionId) {
      sessionStorage.setItem("chat_session_id", currentSessionId ?? "");
      sessionStorage.removeItem("messages");
      return [];
    }

    const saved = sessionStorage.getItem("messages");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const sessionId = sessionStorage.getItem("session_id");

  useEffect(() => {
    if (!sessionId) navigate("/");
  }, [sessionId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await api
        .url("/api/v1/chat/")
        .json({
          question: text,
          session_id: sessionId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        })
        .post()
        .error(429, () => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "⚠️ You've reached the limit of 10 questions per hour. Please try again later.",
            },
          ]);
        })
        .json<{ answer: string }>();

      if (data) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#050c1a",
        backgroundImage: `
          radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0, 194, 203, 0.1), transparent),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(26, 42, 108, 0.25), transparent)
        `,
      }}
    >
      {/* Navbar */}
      <header
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          borderBottom: "1px solid rgba(0, 194, 203, 0.12)",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(5, 12, 26, 0.8)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo lockup */}
          <div className="flex items-center gap-2">
            <DocuMindLogo size={28} />
            <div>
              <span
                className="text-base font-bold"
                style={{ color: "#1a2a6c" }}
              >
                Docu
              </span>
              <span
                className="text-base font-bold"
                style={{ color: "#00c2cb" }}
              >
                Mind
              </span>
            </div>
          </div>
          <Separator
            orientation="vertical"
            className="h-4"
            style={{ backgroundColor: "rgba(0,194,203,0.2)" }}
          />
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#00c2cb" }}
            />
            <span className="text-xs" style={{ color: "#6b8cae" }}>
              Ready
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-xs hover:bg-transparent transition-colors"
          style={{ color: "#3a5070" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#00c2cb")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#3a5070")
          }
        >
          ← Upload new document
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-24">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "rgba(26, 42, 108, 0.2)",
                border: "1px solid rgba(0, 194, 203, 0.25)",
              }}
            >
              <DocuMindLogo size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Your document is ready.
              </p>
              <p className="text-xs mt-1" style={{ color: "#6b8cae" }}>
                Ask about portfolio value, holdings, fees, or performance.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {[
                "What is my total portfolio value?",
                "What are my top holdings?",
                "What fees am I paying?",
              ].map((q) => (
                <Badge
                  key={q}
                  variant="outline"
                  className="cursor-pointer transition-colors text-xs py-1.5 px-3"
                  style={{
                    borderColor: "rgba(0, 194, 203, 0.2)",
                    color: "#6b8cae",
                    backgroundColor: "transparent",
                  }}
                  onClick={() => setInput(q)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(0,194,203,0.5)";
                    (e.currentTarget as HTMLElement).style.color = "#00c2cb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(0, 194, 203, 0.2)";
                    (e.currentTarget as HTMLElement).style.color = "#6b8cae";
                  }}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-lg shrink-0 mt-1 flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(26, 42, 108, 0.3)",
                  border: "1px solid rgba(0, 194, 203, 0.25)",
                }}
              >
                <DocuMindLogo size={18} />
              </div>
            )}
            <Card
              className="max-w-[75%] px-4 py-3 text-sm leading-relaxed border-0 rounded-2xl text-left"
              style={
                msg.role === "user"
                  ? {
                      backgroundColor: "#1a2a6c",
                      color: "white",
                      borderRadius: "1rem 1rem 0.25rem 1rem",
                      border: "1px solid rgba(0,194,203,0.2)",
                    }
                  : {
                      backgroundColor: "rgba(26, 42, 108, 0.12)",
                      color: "#c8daf0",
                      borderRadius: "1rem 1rem 1rem 0.25rem",
                      border: "1px solid rgba(0,194,203,0.1)",
                    }
              }
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong
                        className="font-semibold"
                        style={{ color: "#00c2cb" }}
                      >
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => <li>{children}</li>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="underline"
                        style={{ color: "#00c2cb" }}
                        target="_blank"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: "rgba(26, 42, 108, 0.3)",
                border: "1px solid rgba(0, 194, 203, 0.25)",
              }}
            >
              <DocuMindLogo size={18} />
            </div>
            <Card
              className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{
                backgroundColor: "rgba(26, 42, 108, 0.12)",
                border: "1px solid rgba(0,194,203,0.1)",
                borderRadius: "1rem 1rem 1rem 0.25rem",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]"
                style={{ backgroundColor: "#00c2cb", opacity: 0.6 }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]"
                style={{ backgroundColor: "#00c2cb", opacity: 0.6 }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]"
                style={{ backgroundColor: "#00c2cb", opacity: 0.6 }}
              />
            </Card>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-4"
        style={{
          borderTop: "1px solid rgba(0, 194, 203, 0.12)",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(5, 12, 26, 0.85)",
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about your document..."
              disabled={loading}
              className="flex-1 text-white rounded-xl py-5"
              style={{
                backgroundColor: "rgba(26, 42, 108, 0.12)",
                borderColor: "rgba(0, 194, 203, 0.2)",
                color: "white",
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-5 py-5 rounded-xl transition-all font-semibold"
              style={{
                backgroundColor:
                  !input.trim() || loading ? "#0d1f35" : "#1a2a6c",
                color: !input.trim() || loading ? "#3a5070" : "white",
                border: "1px solid rgba(0,194,203,0.3)",
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !loading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#00c2cb";
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !loading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#1a2a6c";
              }}
            >
              Send
            </Button>
          </div>
          <p className="text-center text-xs" style={{ color: "#3a5070" }}>
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
