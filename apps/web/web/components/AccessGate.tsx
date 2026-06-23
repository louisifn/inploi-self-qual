import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { authStatusSchema } from "@inploi/shared";
import { z } from "zod";
import { Button } from "@/components/ui/button";

/**
 * Wraps the app. If the deployed demo is gated (DEMO_PASSWORD set server-side) and this
 * session isn't authenticated, it shows an on-brand access-code screen. Locally the gate is
 * off, so this renders its children immediately.
 */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");

  useEffect(() => {
    apiGet("/api/auth/status", authStatusSchema)
      .then((s) => setState(!s.enabled || s.authed ? "open" : "locked"))
      .catch(() => setState("open")); // fail open, never trap the user out of a non-gated app
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (state === "locked") {
    return <AccessScreen onUnlocked={() => setState("open")} />;
  }
  return <>{children}</>;
}

function AccessScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(false);
    try {
      await apiPost("/api/auth", { password: code.trim() }, z.object({ ok: z.boolean() }));
      onUnlocked();
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
          <Lock className="size-5" />
        </div>
        <p className="mt-6 text-base font-bold tracking-tight">inploi</p>
        <h1 className="mt-1 font-serif text-3xl leading-tight tracking-tight">
          This demo is <span className="text-brand-gradient">private</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the access code to open the self-qualification demo.
        </p>

        <form onSubmit={submit} className="mt-6">
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="Access code"
            autoFocus
            className="h-12 w-full rounded-full border border-input bg-background px-5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          />
          {error && <p className="mt-2 px-2 text-sm text-destructive">That code didn't work. Try again.</p>}
          <Button type="submit" size="lg" className="mt-3 w-full" disabled={busy || !code.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Enter"}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
