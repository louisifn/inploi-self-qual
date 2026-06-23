import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  PoundSterling,
  Sparkles,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import {
  applicationBasicsSchema,
  cvAnalyseResponseSchema,
  forkOutcomeSchema,
  interpretAnswerResponseSchema,
  jobDetailSchema,
  submitResponseSchema,
  type ApplicationBasics,
  type ClientCriterion,
  type CvAnalysis,
  type ForkOutcome,
  type JobDetail,
} from "@inploi/shared";
import { Button } from "@/components/ui/button";
import { NotFound } from "@/routes/NotFound";
import { useBoardStore } from "@/store/board";
import { cn } from "@/lib/utils";

type Phase = "loading" | "preview" | "questions" | "cv" | "submitting" | "result";

const finalizeSchema = z.object({ ok: z.boolean(), status: z.string() });

// The redirect response also carries the candidate's details forward to the better-fit role.
const redirectResponseSchema = z.object({
  ok: z.boolean(),
  status: z.string(),
  prefill: z
    .object({
      candidateName: z.string(),
      email: z.string(),
      phone: z.string().nullable(),
      cvText: z.string().nullable(),
    })
    .nullable(),
});

function passesLocally(c: ClientCriterion, answer: string): boolean {
  const cfg = c.config;
  if (!cfg) return true;
  if (cfg.kind === "single_select" || cfg.kind === "multi_select" || cfg.kind === "boolean") {
    return cfg.passValues.includes(answer);
  }
  return true;
}

export function SelfQualify() {
  const { jobId = "", applicationId = "" } = useParams();
  const [phase, setPhase] = useState<Phase>("loading");
  const [job, setJob] = useState<JobDetail | null>(null);
  const [basics, setBasics] = useState<ApplicationBasics | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Verbatim free text per criterion, when answered via the "none of these fit" escape hatch.
  const [freeText, setFreeText] = useState<Record<string, string>>({});
  const [gapExplanations, setGapExplanations] = useState<{ requirement: string; text: string }[]>([]);
  const [outcome, setOutcome] = useState<ForkOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Fatal: the job or application couldn't be loaded (e.g. a stale link after a demo reset).
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet(`/api/jobs/${jobId}`, jobDetailSchema),
      apiGet(`/api/applications/${applicationId}`, applicationBasicsSchema),
    ])
      .then(([j, b]) => {
        setJob(j);
        setBasics(b);
        setPhase("preview");
      })
      .catch(() => setLoadFailed(true));
  }, [jobId, applicationId]);

  const questions = (job?.criteria ?? []).filter((c) => c.type !== "cv_check");

  async function submitQualify(finalGaps: { requirement: string; text: string }[]) {
    setPhase("submitting");
    try {
      const res = await apiPost(
        `/api/applications/${applicationId}/qualify`,
        {
          answers: Object.entries(answers).map(([criteriaId, answer]) => ({
            criteriaId,
            answer,
            explanation: freeText[criteriaId],
          })),
          gapExplanations: finalGaps,
        },
        forkOutcomeSchema,
      );
      setOutcome(res);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("cv");
    }
  }

  function afterQuestions() {
    if (basics?.hasCv) setPhase("cv");
    else submitQualify([]);
  }

  if (loadFailed) {
    return (
      <NotFound
        title="Link expired"
        message="We couldn't find this application. It may have been reset since you last opened it. Head back to the start to pick up again."
        actionHref="/"
        actionLabel="Back to start"
      />
    );
  }
  if (error) {
    // Recoverable (e.g. a submit hiccup) — keep them in the flow with a friendly retry.
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => setError(null)} className="mt-4">
          Try again
        </Button>
      </div>
    );
  }
  if (phase === "loading" || !job) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-5 py-8">
      <ProgressHeader phase={phase} />

      <AnimatePresence mode="wait">
        {phase === "preview" && (
          <PreviewBlock key="preview" job={job} onContinue={() => setPhase("questions")} />
        )}
        {phase === "questions" && (
          <QuestionsBlock
            key="questions"
            applicationId={applicationId}
            questions={questions}
            answers={answers}
            onAnswer={(id, a, explanation) => {
              setAnswers((s) => ({ ...s, [id]: a }));
              if (explanation) setFreeText((s) => ({ ...s, [id]: explanation }));
            }}
            onDone={afterQuestions}
          />
        )}
        {phase === "cv" && (
          <CvBlock
            key="cv"
            applicationId={applicationId}
            onDone={(gaps) => {
              setGapExplanations(gaps);
              submitQualify(gaps);
            }}
          />
        )}
        {phase === "submitting" && <SubmittingBlock key="submitting" />}
        {phase === "result" && outcome && (
          <ResultBlock
            key="result"
            outcome={outcome}
            applicationId={applicationId}
            firstName={basics?.candidateName.split(" ")[0] ?? "there"}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Progress ──────────────────────────────────────────────────────────────────────────
function ProgressHeader({ phase }: { phase: Phase }) {
  const steps = [
    { key: "preview", label: "The real role" },
    { key: "questions", label: "A few honest questions" },
    { key: "cv", label: "Your experience" },
  ];
  const activeIdx =
    phase === "preview" ? 0 : phase === "questions" ? 1 : phase === "cv" ? 2 : 3;
  if (phase === "result" || phase === "submitting") return <div className="h-8" />;
  return (
    <div className="mb-8 flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex flex-1 flex-col gap-1.5">
          <div
            className={cn(
              "h-1 rounded-full transition-colors",
              i < activeIdx ? "bg-fit" : i === activeIdx ? "bg-foreground" : "bg-border",
            )}
          />
          <span className={cn("text-[11px]", i === activeIdx ? "text-foreground" : "text-muted-foreground")}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Block 1: realistic preview ─────────────────────────────────────────────────────────
const factIcon: Record<string, typeof Clock> = {
  hours: Clock,
  pay: PoundSterling,
  location: MapPin,
};

function PreviewBlock({ job, onContinue }: { job: JobDetail; onContinue: () => void }) {
  const facts = job.job.previewFacts ?? [];
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm font-medium text-fit">{job.job.employer}</p>
      <h1 className="mt-1 font-serif text-3xl leading-tight tracking-tight">{job.job.title}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        Before you answer anything, here's the real shape of this role: the honest version, not the
        brochure.
      </p>

      <motion.ul
        className="mt-6 space-y-2.5"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      >
        {facts.map((f, i) => {
          const Icon = factIcon[f.category] ?? ChevronRight;
          return (
            <motion.li
              key={i}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4",
                f.emphasis ? "border-fit/30 bg-fit-muted/40" : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  f.emphasis ? "bg-fit/15 text-fit" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-sm text-muted-foreground">{f.value}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 + facts.length * 0.09 + 0.2 }}
        className="mt-7"
      >
        <Button size="lg" className="w-full" onClick={onContinue}>
          I've read this, continue <ArrowRight />
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Three quick, honest questions next. No CV scan, no tricks.
        </p>
      </motion.div>
    </motion.section>
  );
}

// ── Block 2: questions, one in focus, dealbreakers noted (never blocked) ───────────────
function QuestionsBlock({
  applicationId,
  questions,
  answers,
  onAnswer,
  onDone,
}: {
  applicationId: string;
  questions: ClientCriterion[];
  answers: Record<string, string>;
  onAnswer: (id: string, a: string, explanation?: string) => void;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ pass: boolean } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [idx]);

  function handleSubmit(q: ClientCriterion, answer: string, explanation?: string) {
    onAnswer(q.id, answer, explanation);
    if (q.isDealbreaker) {
      const pass = passesLocally(q, answer);
      setFeedback({ pass });
      setTimeout(() => {
        setFeedback(null);
        advance();
      }, 900);
    } else {
      advance();
    }
  }
  function advance() {
    if (idx < questions.length - 1) setIdx((i) => i + 1);
    else onDone();
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="space-y-2.5">
        {questions.slice(0, idx).map((q) => (
          <AnsweredRow key={q.id} q={q} answer={answers[q.id] ?? ""} />
        ))}
      </div>

      <div className="mt-2.5">
        <QuestionCard
          key={questions[idx].id}
          q={questions[idx]}
          applicationId={applicationId}
          feedback={feedback}
          onSubmit={(a, explanation) => handleSubmit(questions[idx], a, explanation)}
        />
      </div>
      <div ref={bottomRef} />
    </motion.section>
  );
}

function AnsweredRow({ q, answer }: { q: ClientCriterion; answer: string }) {
  const pass = q.isDealbreaker ? passesLocally(q, answer) : true;
  const noted = q.isDealbreaker && !pass;
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3.5 py-2.5"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          noted ? "bg-noted-muted text-noted-foreground" : "bg-fit-muted text-fit",
        )}
      >
        <Check className="size-3" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{q.prompt}</span>
      <span className={cn("shrink-0 text-sm font-medium", noted ? "text-noted-foreground" : "text-foreground")}>
        {answer}
      </span>
    </motion.div>
  );
}

function QuestionCard({
  q,
  applicationId,
  feedback,
  onSubmit,
}: {
  q: ClientCriterion;
  applicationId: string;
  feedback: { pass: boolean } | null;
  onSubmit: (answer: string, explanation?: string) => void;
}) {
  const [text, setText] = useState("");
  const kind = q.config?.kind ?? (q.isDealbreaker ? "single_select" : "short_text");
  const options =
    kind === "boolean"
      ? [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]
      : kind === "single_select" && q.config?.kind === "single_select"
        ? q.config.options.map((o) => ({ value: o, label: o }))
        : [];

  // Escape hatch: only routable single-select dealbreakers (availability/logistics).
  // The terminal right-to-work (boolean, routable:false) and role questions never get it.
  const canExplain = q.isDealbreaker && q.config?.kind === "single_select" && q.config.routable === true;
  const [mode, setMode] = useState<"options" | "typing" | "checking" | "confirm">("options");
  const [freeAnswer, setFreeAnswer] = useState("");
  const [interp, setInterp] = useState<{ mappedValue: string | null; restatement: string } | null>(null);
  const [interpError, setInterpError] = useState<string | null>(null);

  async function checkFreeText() {
    if (!freeAnswer.trim()) return;
    setMode("checking");
    setInterpError(null);
    try {
      const res = await apiPost(
        "/api/answers/interpret",
        { applicationId, criteriaId: q.id, text: freeAnswer.trim() },
        interpretAnswerResponseSchema,
      );
      setInterp({ mappedValue: res.mappedValue, restatement: res.restatement });
      setMode("confirm");
    } catch {
      setInterpError("Couldn't check that just now. Try the options, or rephrase.");
      setMode("typing");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <p className="font-serif text-xl leading-snug tracking-tight">{q.prompt}</p>
      {q.helpText && <p className="mt-1.5 text-sm text-muted-foreground">{q.helpText}</p>}

      {/* Default: the closed options (or a free-text box for role questions). */}
      {mode === "options" &&
        (options.length > 0 ? (
          <div className="mt-4 space-y-2">
            {options.map((o) => (
              <button
                key={o.value}
                disabled={!!feedback}
                onClick={() => onSubmit(o.value)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5 text-left text-[15px] font-medium transition-colors hover:border-foreground/30 hover:bg-muted disabled:opacity-60"
              >
                {o.label}
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
            {canExplain && !feedback && (
              <button
                onClick={() => setMode("typing")}
                className="pt-1 text-sm text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                None of these fit. Let me explain
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="A sentence or two, in your own words…"
              className="min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <Button className="mt-3 w-full" onClick={() => onSubmit(text.trim() || "N/A")}>
              Continue <ArrowRight />
            </Button>
          </div>
        ))}

      {/* Escape hatch: type it, we interpret it, you confirm it. */}
      {(mode === "typing" || mode === "checking") && (
        <div className="mt-4">
          <textarea
            value={freeAnswer}
            onChange={(e) => setFreeAnswer(e.target.value)}
            placeholder={"In your own words, e.g. “I can do Saturdays but never Sundays”"}
            disabled={mode === "checking"}
            className="min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            autoFocus
          />
          {interpError && <p className="mt-2 text-sm text-destructive">{interpError}</p>}
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={checkFreeText} disabled={mode === "checking" || !freeAnswer.trim()}>
              {mode === "checking" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Reading what you wrote…
                </>
              ) : (
                <>
                  Check this <ArrowRight />
                </>
              )}
            </Button>
            <button
              onClick={() => setMode("options")}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to options
            </button>
          </div>
        </div>
      )}

      {/* Confirmation: the candidate stays in control; nothing counts until they say so. */}
      {mode === "confirm" && interp && (
        <div className="mt-4">
          {interp.mappedValue ? (
            <div className="rounded-xl border border-fit/30 bg-fit-muted/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Here's what I understood
              </p>
              <p className="mt-1.5 text-[15px] font-medium">
                {interp.restatement || `That sounds like “${interp.mappedValue}”. Is that right?`}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  variant="fit"
                  onClick={() => {
                    setMode("options");
                    onSubmit(interp.mappedValue!, freeAnswer.trim());
                  }}
                >
                  <Check /> Yes, that's right
                </Button>
                <button
                  onClick={() => setMode("typing")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Let me re-edit
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-noted/40 bg-noted-muted p-4">
              <p className="text-[15px] font-medium text-noted-foreground">
                I couldn't quite place that, and that's okay.
              </p>
              <p className="mt-1 text-sm text-noted-foreground/90">
                We'll keep it in your exact words. Nothing's blocked. You'll decide what to do at the end.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  onClick={() => {
                    setMode("options");
                    onSubmit(freeAnswer.trim(), freeAnswer.trim());
                  }}
                >
                  Got it, continue <ArrowRight />
                </Button>
                <button
                  onClick={() => setMode("typing")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Let me try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              feedback.pass ? "bg-fit-muted text-fit" : "bg-noted-muted text-noted-foreground",
            )}
          >
            {feedback.pass ? (
              <>
                <Check className="size-4" /> Got it.
              </>
            ) : (
              <>
                <span className="font-medium">Thanks for being honest, noted.</span> Nothing's blocked;
                you'll choose what to do at the end.
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Block 3: CV gap-explanation: the signature "gaps resolving" moment ────────────────
function CvBlock({
  applicationId,
  onDone,
}: {
  applicationId: string;
  onDone: (gaps: { requirement: string; text: string }[]) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  useEffect(() => {
    apiPost(`/api/cv/analyse`, { applicationId }, cvAnalyseResponseSchema)
      .then((r) => setAnalysis(r.analysis))
      .catch(() => setAnalysis({ alignments: [], gaps: [], noCvSignal: true, disclaimer: "" }));
  }, [applicationId]);

  const items = analysis
    ? [
        ...analysis.alignments.map((a) => ({ kind: "align" as const, ...a })),
        ...analysis.gaps.map((g) => ({ kind: "gap" as const, ...g })),
      ]
    : [];

  useEffect(() => {
    if (!analysis) return;
    if (revealed >= items.length) return;
    // Reduced-motion: resolve everything at once instead of the staggered reveal.
    if (reduceMotion) {
      setRevealed(items.length);
      return;
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 500 : 650);
    return () => clearTimeout(t);
  }, [analysis, revealed, items.length, reduceMotion]);

  if (!analysis) {
    return (
      <motion.section key="cvloading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
        <p className="flex items-center gap-2 font-serif text-xl tracking-tight">
          <Sparkles className="size-5 animate-pulse text-fit" /> Looking over what you shared…
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We're matching your experience to the role: to help you add context, never to score you.
        </p>
      </motion.section>
    );
  }

  if (analysis.noCvSignal) {
    return (
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-serif text-2xl tracking-tight">No CV? No problem.</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {analysis.disclaimer || "Plenty of brilliant people start here with no CV at all. What you told us about your availability is what matters most."}
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => onDone([])}>
          Continue <ArrowRight />
        </Button>
      </motion.section>
    );
  }

  const allRevealed = revealed >= items.length;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-serif text-2xl tracking-tight">A quick look at your experience</h2>
      <p className="mt-2 text-sm text-muted-foreground">{analysis.disclaimer}</p>

      <ul className="mt-5 space-y-2.5">
        {items.map((item, i) => {
          const shown = i < revealed;
          return (
            <li key={i}>
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "rounded-xl border p-4",
                  !shown
                    ? "border-border bg-card"
                    : item.kind === "align"
                      ? "border-fit/30 bg-fit-muted/30"
                      : "border-explain/30 bg-explain-muted/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                      !shown
                        ? "bg-muted text-muted-foreground"
                        : item.kind === "align"
                          ? "bg-fit text-fit-foreground"
                          : "bg-explain text-explain-foreground",
                    )}
                  >
                    {!shown ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : item.kind === "align" ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="text-xs font-bold">?</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.requirement}</p>
                    {shown && item.kind === "align" && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        “{item.evidenceQuote}”, {item.confirmPrompt}
                      </p>
                    )}
                    {shown && item.kind === "gap" && (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground">{item.explainPrompt}</p>
                        {item.transferableHint && (
                          <p className="mt-0.5 text-xs italic text-muted-foreground">
                            {item.transferableHint}
                          </p>
                        )}
                        <textarea
                          value={explanations[item.requirement] ?? ""}
                          onChange={(e) =>
                            setExplanations((s) => ({ ...s, [item.requirement]: e.target.value }))
                          }
                          placeholder="Optional: add anything you'd like us to know"
                          className="mt-2 min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!allRevealed}
        onClick={() =>
          onDone(
            analysis.gaps
              .map((g) => ({ requirement: g.requirement, text: (explanations[g.requirement] ?? "").trim() }))
              .filter((g) => g.text.length > 0),
          )
        }
      >
        {allRevealed ? (
          <>
            That's me, continue <ArrowRight />
          </>
        ) : (
          "Reviewing…"
        )}
      </Button>
    </motion.section>
  );
}

function SubmittingBlock() {
  return (
    <motion.div
      key="sub"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center py-24 text-center"
    >
      <Loader2 className="size-6 animate-spin text-fit" />
      <p className="mt-4 font-serif text-lg tracking-tight">Putting it together…</p>
    </motion.div>
  );
}

// ── Act 3 result (the honest fork) ─────────────────────────────────────────────────────
function ResultBlock({
  outcome,
  applicationId,
  firstName,
}: {
  outcome: ForkOutcome;
  applicationId: string;
  firstName: string;
}) {
  const navigate = useNavigate();
  const [finalized, setFinalized] = useState<null | "submitted" | "redirected">(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await apiPost(`/api/applications/${applicationId}/submit`, {}, submitResponseSchema);
      // Same-tab liveness: the recruiter board (if mounted) sees this arrive instantly.
      useBoardStore.getState().upsert(res.application);
    } catch {
      /* board will still pick it up via polling */
    }
    setFinalized("submitted");
  }
  async function takeRedirect(toJobId: string) {
    setBusy(true);
    const res = await apiPost(
      `/api/applications/${applicationId}/redirect`,
      { toJobId },
      redirectResponseSchema,
    ).catch(() => null);
    // Send them to actually apply for the better-fit role, with their details carried over so the
    // form is pre-filled. They still self-qualify for the new role themselves (never auto-passed).
    navigate(`/candidate/${toJobId}`, { state: { prefill: res?.prefill ?? null } });
  }

  if (finalized === "submitted") {
    return <DoneCard headline={`You're in, ${firstName}.`} body="Your application is with the team, with your availability and your own words attached. Good luck." />;
  }
  if (finalized === "redirected") {
    return <DoneCard headline="Nice. That's a better fit." body="We've pointed you at the role that matches what you told us. No time wasted on either side." />;
  }

  const strong = outcome.decision === "strong_fit";

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          strong ? "bg-fit-muted text-fit" : "bg-noted-muted text-noted-foreground",
        )}
      >
        {strong ? <Check className="size-6" /> : <span className="text-xl">↪</span>}
      </div>
      <h1 className="mt-5 font-serif text-3xl leading-tight tracking-tight">{outcome.message.headline}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{outcome.message.body}</p>

      {strong && outcome.matchedDealbreakers.length > 0 && (
        <ul className="mt-5 space-y-1.5">
          {outcome.matchedDealbreakers.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-fit" /> {m}
            </li>
          ))}
        </ul>
      )}

      {outcome.suggestedRoles.length > 0 && (
        <motion.div
          className="mt-6 space-y-2.5"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Roles that fit what you told us
          </p>
          {outcome.suggestedRoles.map((r) => (
            <motion.button
              key={r.jobId}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              disabled={busy}
              onClick={() => takeRedirect(r.jobId)}
              className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-fit/40 hover:bg-fit-muted/20 disabled:opacity-60"
            >
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted-foreground">
                  {[r.location, r.shiftPattern].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-sm text-fit">{r.whyItFits}</p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </motion.button>
          ))}
        </motion.div>
      )}

      <div className="mt-7">
        {strong ? (
          <Button size="lg" variant="fit" className="w-full" disabled={busy} onClick={submit}>
            Submit with confidence <ArrowRight />
          </Button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={submit}
              disabled={busy}
              className="w-full text-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Submit for this role anyway, it's your call
            </button>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          className="mt-3 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Not right now
        </button>
      </div>
    </motion.section>
  );
}

function DoneCard({ headline, body }: { headline: string; body: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-10 text-center"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-fit-muted">
        <Check className="size-6 text-fit" />
      </div>
      <h1 className="mt-5 font-serif text-3xl tracking-tight">{headline}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
      <Link to="/" className="mt-8 inline-block text-sm text-fit hover:text-fit/80">
        Back to inploi
      </Link>
    </motion.section>
  );
}
