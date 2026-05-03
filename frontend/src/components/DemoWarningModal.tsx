// src/components/DemoWarningModal.tsx
import { useState, useEffect } from "react";

export function DemoWarningModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("demo_warning_dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("demo_warning_dismissed", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-8 shadow-2xl">
        {/* Icon */}
        <div className="mb-5 flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-yellow-400">
              Demo environment
            </p>
            <h2 className="mb-2 text-lg font-medium text-white/90 leading-snug">
              Don't upload sensitive files
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              This is a portfolio demo. Do not upload documents containing
              personal information, financial credentials, passwords, or any
              confidential data.
            </p>
          </div>
        </div>

        {/* Safe to upload note */}
        <div className="mb-6 rounded-xl border border-yellow-500/15 bg-yellow-500/5 px-4 py-3.5">
          <p className="text-sm text-white/50 leading-relaxed">
            Safe to upload:{" "}
            <span className="text-white/80">
              public earnings reports, sample invoices, demo PDFs, or any
              document you're comfortable sharing publicly.
            </span>
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleDismiss}
          className="w-full rounded-[9px] bg-yellow-400 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-opacity hover:opacity-90 active:opacity-80"
        >
          I understand — continue
        </button>

        <p className="mt-3 text-center text-xs text-white/25">
          Files are deleted from the server after processing
        </p>
      </div>
    </div>
  );
}
