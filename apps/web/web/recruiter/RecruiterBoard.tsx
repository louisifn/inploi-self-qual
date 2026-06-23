import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, MessageSquareQuote, Radio } from "lucide-react";
import { apiGet } from "@/lib/api";
import { boardApplicationSchema, type BoardApplication } from "@inploi/shared";
import { useBoardStore } from "@/store/board";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const POLL_MS = 1500;

export function RecruiterBoard() {
  const { jobId } = useParams();
  const setFromPoll = useBoardStore((s) => s.setFromPoll);
  const byId = useBoardStore((s) => s.byId);
  const apps = useMemo(
    () => Object.values(byId).sort((a, b) => b.submittedAt - a.submittedAt),
    [byId],
  );
  const [, force] = useState(0);

  // Poll D1: the cross-device liveness path. Feeds the same store the same-tab path uses.
  useEffect(() => {
    let alive = true;
    const url = `/api/applications${jobId ? `?jobId=${jobId}` : ""}`;
    const tick = () =>
      apiGet(url, z.array(boardApplicationSchema))
        .then((rows) => {
          if (alive) setFromPoll(rows);
        })
        .catch(() => {});
    tick();
    const id = setInterval(tick, POLL_MS);
    // keep relative timestamps fresh
    const t = setInterval(() => force((n) => n + 1), 10_000);
    return () => {
      alive = false;
      clearInterval(id);
      clearInterval(t);
    };
  }, [jobId, setFromPoll]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← inploi
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-medium text-fit">
          <Radio className="size-3.5 animate-pulse" /> Live
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Active applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Only genuine, available, interested people. Triage on signal, not a CV.
          </p>
        </div>
        <div className="text-right">
          <div className="font-serif text-3xl tabular-nums">{apps.length}</div>
          <div className="text-xs text-muted-foreground">qualified</div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <AnimatePresence initial={false}>
          {apps.map((app) => (
            <BoardCard key={app.id} app={app} />
          ))}
        </AnimatePresence>
        {apps.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            Waiting for applications. Mismatches self-select out. They'll never land here.
          </div>
        )}
      </div>
    </main>
  );
}

function ago(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

const intentLabel: Record<string, string> = {
  strong: "Explained their interest",
  some: "Gave some context",
  unclear: "Brief answers",
};

function BoardCard({ app }: { app: BoardApplication }) {
  const [open, setOpen] = useState(false);
  const initials = app.candidateName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const availPass = app.availabilityFit === "pass";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{app.candidateName}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{ago(app.submittedAt)}</span>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant={availPass ? "fit" : "noted"}>
              {availPass ? <Check className="size-3" /> : null}
              {availPass ? "Available for every shift" : "Misses a shift requirement"}
            </Badge>
            {app.intentSignal && (
              <Badge variant="outline">{intentLabel[app.intentSignal] ?? app.intentSignal}</Badge>
            )}
            {app.gapNotes.length > 0 && (
              <Badge variant="explain">
                <MessageSquareQuote className="size-3" /> Explained {app.gapNotes.length} gap
                {app.gapNotes.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {app.summary && <p className="mt-2.5 text-sm text-muted-foreground">{app.summary}</p>}

          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            {open ? "Hide what they told us" : "What they told us"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="space-y-2 border-t border-border bg-secondary/30 px-4 py-3">
              {app.responses.map((r, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-start gap-2">
                    {r.isDealbreaker && (
                      <span
                        className={cn(
                          "mt-1 size-1.5 shrink-0 rounded-full",
                          r.fitFlag === "pass" ? "bg-fit" : r.fitFlag === "fail" ? "bg-noted" : "bg-muted-foreground",
                        )}
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-muted-foreground">{r.prompt}</span>{" "}
                      <span className="font-medium text-foreground">{r.answer}</span>
                      {r.explanation && (
                        <p className="mt-0.5 border-l-2 border-explain/40 pl-2 text-muted-foreground">
                          “{r.explanation}”
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
