import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

// DocuMind Logo SVG — matches the uploaded brand asset
function DocuMindLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document shape */}
      <path
        d="M15 8 H65 L85 28 V92 H15 Z"
        fill="none"
        stroke="#1a2a6c"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Folded corner */}
      <path
        d="M65 8 L65 28 L85 28"
        fill="none"
        stroke="#1a2a6c"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Neural network nodes */}
      <circle cx="38" cy="38" r="5" fill="#00c2cb" />
      <circle cx="62" cy="44" r="5" fill="#00c2cb" />
      <circle cx="42" cy="62" r="5" fill="#00c2cb" />
      <circle
        cx="58"
        cy="28"
        r="4"
        fill="#1a2a6c"
        stroke="#00c2cb"
        strokeWidth="2"
      />
      <circle
        cx="28"
        cy="56"
        r="4"
        fill="#1a2a6c"
        stroke="#00c2cb"
        strokeWidth="2"
      />
      <circle
        cx="64"
        cy="68"
        r="4"
        fill="#1a2a6c"
        stroke="#00c2cb"
        strokeWidth="2"
      />
      {/* Neural connections */}
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

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setFile(selected);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }, []);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const sessionId = crypto.randomUUID();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api
        .url(`/api/v1/pdf/upload?session_id=${sessionId}`)
        .body(formData)
        .post()
        .error(429, () => {
          setError(
            "⚠️ You've reached the upload limit of 2 per day. Please try again later.",
          );
        })
        .res();

      if (response) {
        sessionStorage.setItem("session_id", sessionId);
        navigate("/chat");
      }
    } catch {
      setError(
        "Upload failed. Something went wrong please wait for a few minutes and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "#050c1a",
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0, 194, 203, 0.12), transparent),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(26, 42, 108, 0.3), transparent)
        `,
      }}
    >
      <div className="w-full max-w-lg flex flex-col gap-8">
        {/* Logo + Header */}
        <div className="text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <DocuMindLogo size={48} />
            <div className="text-left">
              <span
                className="text-3xl font-bold tracking-tight"
                style={{ color: "#1a2a6c" }}
              >
                Docu
              </span>
              <span
                className="text-3xl font-bold tracking-tight"
                style={{ color: "#00c2cb" }}
              >
                Mind
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mt-1">
            Ask your documents{" "}
            <span style={{ color: "#00c2cb" }}>anything.</span>
          </h1>
          <p className="text-sm" style={{ color: "#6b8cae" }}>
            Upload a financial PDF and get instant, grounded answers.
          </p>
        </div>

        {/* Card */}
        <Card
          className="rounded-2xl border"
          style={{
            backgroundColor: "rgba(26, 42, 108, 0.08)",
            borderColor: "rgba(0, 194, 203, 0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white text-base font-semibold">
              Upload your document
            </CardTitle>
            <CardDescription style={{ color: "#6b8cae" }} className="text-sm">
              PDF files only · Max 10MB
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onClick={() => document.getElementById("file-input")?.click()}
              className="relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-10 flex flex-col items-center justify-center gap-3 text-center"
              style={{
                borderColor: dragging
                  ? "#00c2cb"
                  : file
                    ? "rgba(0, 194, 203, 0.5)"
                    : "rgba(0, 194, 203, 0.2)",
                backgroundColor: dragging
                  ? "rgba(0, 194, 203, 0.08)"
                  : file
                    ? "rgba(0, 194, 203, 0.05)"
                    : "transparent",
              }}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              <div className="text-3xl">
                {file ? "✅" : dragging ? "📂" : "📄"}
              </div>

              {file ? (
                <>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#00c2cb" }}
                  >
                    {file.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: "rgba(0,194,203,0.1)",
                      color: "#6b8cae",
                      border: "1px solid rgba(0,194,203,0.2)",
                    }}
                  >
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                  </Badge>
                </>
              ) : (
                <>
                  <p className="text-sm" style={{ color: "#6b8cae" }}>
                    Drop your PDF here, or{" "}
                    <span
                      className="underline underline-offset-2 cursor-pointer"
                      style={{ color: "#00c2cb" }}
                    >
                      browse
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: "#3a5070" }}>
                    Brokerage statements, reports, fund docs
                  </p>
                </>
              )}
            </div>

            {error && (
              <Badge
                variant="destructive"
                className="w-full justify-start px-4 py-2 text-xs rounded-lg"
                style={{
                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                  color: "#f87171",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                }}
              >
                {error}
              </Badge>
            )}
          </CardContent>

          <Separator style={{ backgroundColor: "rgba(0, 194, 203, 0.1)" }} />

          <CardFooter className="pt-4 flex flex-col gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full font-semibold py-5 rounded-xl transition-all duration-200 text-white"
              style={{
                backgroundColor: !file || loading ? "#0d1f35" : "#1a2a6c",
                color: !file || loading ? "#3a5070" : "white",
                border: "1px solid rgba(0,194,203,0.3)",
              }}
              onMouseEnter={(e) => {
                if (file && !loading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#00c2cb";
              }}
              onMouseLeave={(e) => {
                if (file && !loading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#1a2a6c";
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "rgba(0,194,203,0.3)",
                      borderTopColor: "#00c2cb",
                    }}
                  />
                  Uploading...
                </span>
              ) : (
                "Upload & Start Chatting →"
              )}
            </Button>
            <p className="text-center text-xs" style={{ color: "#3a5070" }}>
              Your document is processed securely and never stored permanently.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
