import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import { generateJobResponseSchema, postJobResponseSchema } from "@inploi/shared";
import {
  blankCriterion,
  fromEditModel,
  toEditModel,
  type EditCriterion,
  type EditModel,
} from "@/lib/screening-edit";
import { SAMPLE_JD } from "./sample-jd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Phase = "input" | "generating" | "review" | "posted";

export function RecruiterSetup() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("input");
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [model, setModel] = useState<EditModel | null>(null);
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [error, setError] = useState<string | null>(null);
  const [postedJobId, setPostedJobId] = useState<string | null>(null);

  const dealbreakerCount = model?.criteria.filter((c) => c.isDealbreaker).length ?? 0;
  const canPost = dealbreakerCount >= 1 && (model?.criteria.length ?? 0) >= 1;

  function update(fn: (m: EditModel) => EditModel) {
    setModel((m) => (m ? fn(m) : m));
  }
  function patchCriterion(key: string, patch: Partial<EditCriterion>) {
    update((m) => ({ ...m, criteria: m.criteria.map((c) => (c.key === key ? { ...c, ...patch } : c)) }));
  }
  function moveCriterion(key: string, dir: -1 | 1) {
    update((m) => {
      const i = m.criteria.findIndex((c) => c.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= m.criteria.length) return m;
      const arr = [...m.criteria];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...m, criteria: arr };
    });
  }
  function deleteCriterion(key: string) {
    update((m) => ({ ...m, criteria: m.criteria.filter((c) => c.key !== key) }));
  }
  function addCriterion(isDealbreaker: boolean) {
    update((m) => ({ ...m, criteria: [...m.criteria, blankCriterion(isDealbreaker)] }));
  }

  async function handleGenerate() {
    setError(null);
    setPhase("generating");
    const started = Date.now();
    try {
      const res = await apiPost(
        "/api/jobs/generate",
        { jd, title: title || undefined, employer: employer || undefined },
        generateJobResponseSchema,
      );
      const elapsed = Date.now() - started;
      if (elapsed < 1600) await new Promise((r) => setTimeout(r, 1600 - elapsed));
      setSource(res.source);
      setModel(toEditModel(res.screening));
      setPhase("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setPhase("input");
    }
  }

  async function handlePost() {
    if (!model || !canPost) return;
    try {
      const res = await apiPost(
        "/api/jobs",
        { jd: jd || SAMPLE_JD, screening: fromEditModel(model) },
        postJobResponseSchema,
      );
      setPostedJobId(res.jobId);
      setPhase("posted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post the job");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← inploi
        </Link>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Recruiter · Act 1</span>
      </div>

      {phase === "input" && (
        <InputPanel
          jd={jd}
          setJd={setJd}
          title={title}
          setTitle={setTitle}
          employer={employer}
          setEmployer={setEmployer}
          onGenerate={handleGenerate}
          onLoadSample={() => {
            setJd(SAMPLE_JD);
            setTitle("Bakery Barista, Team Member");
            setEmployer("Maple & Crumb");
          }}
          error={error}
        />
      )}

      {phase === "generating" && <GeneratingPanel />}

      {phase === "review" && model && (
        <ReviewPanel
          model={model}
          source={source}
          dealbreakerCount={dealbreakerCount}
          canPost={canPost}
          error={error}
          onBack={() => setPhase("input")}
          onPost={handlePost}
          patchCriterion={patchCriterion}
          moveCriterion={moveCriterion}
          deleteCriterion={deleteCriterion}
          addCriterion={addCriterion}
          updateSummary={(field, val) =>
            update((m) => ({ ...m, jobSummary: { ...m.jobSummary, [field]: val } }))
          }
          updateFact={(i, value) =>
            update((m) => ({
              ...m,
              previewFacts: m.previewFacts.map((f, idx) => (idx === i ? { ...f, value } : f)),
            }))
          }
          deleteFact={(i) =>
            update((m) => ({ ...m, previewFacts: m.previewFacts.filter((_, idx) => idx !== i) }))
          }
          addFact={() =>
            update((m) => ({
              ...m,
              previewFacts: [
                ...m.previewFacts,
                { label: "New fact", value: "", category: "hours", sourceQuote: "" },
              ],
            }))
          }
        />
      )}

      {phase === "posted" && postedJobId && (
        <PostedPanel
          jobId={postedJobId}
          onCandidate={() => navigate(`/candidate/${postedJobId}`)}
          onBoard={() => navigate(`/recruiter/board/${postedJobId}`)}
        />
      )}
    </main>
  );
}

// -- Input --------------------------------------------------------------------------------
function InputPanel(props: {
  jd: string;
  setJd: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  employer: string;
  setEmployer: (v: string) => void;
  onGenerate: () => void;
  onLoadSample: () => void;
  error: string | null;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="mt-8 font-serif text-3xl tracking-tight">Set up a role</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Paste a job description. The AI reads it and drafts the screening logic: the dealbreakers and
        the questions that actually decide fit. You review and edit everything before it goes live.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">Job title (optional)</Label>
          <Input id="title" value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="Bakery Barista" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="employer">Employer (optional)</Label>
          <Input id="employer" value={props.employer} onChange={(e) => props.setEmployer(e.target.value)} placeholder="Maple & Crumb" />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="jd">Job description</Label>
          <button
            onClick={props.onLoadSample}
            className="text-xs font-medium text-fit transition-colors hover:text-fit/80"
          >
            Load the sample role
          </button>
        </div>
        <Textarea
          id="jd"
          value={props.jd}
          onChange={(e) => props.setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-64 font-mono text-[13px] leading-relaxed"
        />
      </div>

      {props.error && <p className="mt-3 text-sm text-destructive">{props.error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <Button size="lg" onClick={props.onGenerate} disabled={props.jd.trim().length < 20}>
          <Wand2 /> Generate screening logic
        </Button>
        <span className="text-sm text-muted-foreground">Nothing is posted until you review it.</span>
      </div>
    </motion.div>
  );
}

// -- Generating (meaningful motion: reads as work, not a spinner) -----------------------
const GEN_STEPS = [
  "Reading the job description",
  "Finding the real dealbreakers",
  "Drafting the questions that decide fit",
  "Pulling out the honest preview",
];

function GeneratingPanel() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, GEN_STEPS.length - 1)), 420);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-24 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 text-fit">
        <Sparkles className="size-5 animate-pulse" />
        <span className="font-serif text-xl tracking-tight text-foreground">Reading the role</span>
      </div>
      <ul className="mt-8 w-full max-w-sm space-y-3 text-left">
        {GEN_STEPS.map((label, i) => (
          <motion.li
            key={label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: i <= step ? 1 : 0.25, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                i < step
                  ? "border-fit bg-fit text-fit-foreground"
                  : i === step
                    ? "border-fit text-fit"
                    : "border-border text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3" /> : <Loader2 className={cn("size-3", i === step && "animate-spin")} />}
            </span>
            <span className={cn(i <= step ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// -- Review + edit ----------------------------------------------------------------------
function ReviewPanel(props: {
  model: EditModel;
  source: "live" | "fallback";
  dealbreakerCount: number;
  canPost: boolean;
  error: string | null;
  onBack: () => void;
  onPost: () => void;
  patchCriterion: (key: string, patch: Partial<EditCriterion>) => void;
  moveCriterion: (key: string, dir: -1 | 1) => void;
  deleteCriterion: (key: string) => void;
  addCriterion: (isDealbreaker: boolean) => void;
  updateSummary: (field: "title" | "location" | "shiftPattern" | "payRange", val: string) => void;
  updateFact: (i: number, value: string) => void;
  deleteFact: (i: number) => void;
  addFact: () => void;
}) {
  const { model } = props;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <div className="mt-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Review the screening logic</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            This is a draft. Reword anything, toggle what counts as a dealbreaker, set which answers
            pass, reorder, or delete. You're the decision-maker. The AI just did the first pass.
          </p>
        </div>
        {props.source === "live" ? (
          <Badge variant="fit" className="shrink-0">
            <Sparkles className="size-3" /> Drafted by AI
          </Badge>
        ) : (
          <Badge variant="outline" className="shrink-0">
            Demo-safe draft
          </Badge>
        )}
      </div>

      {/* Job summary */}
      <section className="mt-8">
        <SectionLabel>The role</SectionLabel>
        <Card className="mt-3 grid grid-cols-2 gap-4 p-5">
          <SummaryField label="Title" value={model.jobSummary.title} onChange={(v) => props.updateSummary("title", v)} />
          <SummaryField label="Location" value={model.jobSummary.location} onChange={(v) => props.updateSummary("location", v)} />
          <SummaryField label="Shift pattern" value={model.jobSummary.shiftPattern} onChange={(v) => props.updateSummary("shiftPattern", v)} />
          <SummaryField label="Pay" value={model.jobSummary.payRange} onChange={(v) => props.updateSummary("payRange", v)} />
        </Card>
      </section>

      {/* Realistic preview facts */}
      <section className="mt-8">
        <SectionLabel>The honest preview: what the candidate sees first</SectionLabel>
        <p className="mt-1 text-xs text-muted-foreground">Tap any line to edit it, or add your own below.</p>
        <div className="mt-3 space-y-2">
          {model.previewFacts.map((f, i) => {
            const emphasis = f.category === "pay" || f.category === "location";
            return (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
              <Badge variant={emphasis ? "fit" : "outline"} className="shrink-0 capitalize">
                {f.category}
              </Badge>
              <input
                value={f.value}
                onChange={(e) => props.updateFact(i, e.target.value)}
                title="Tap to edit this fact"
                className="flex-1 rounded-md border border-dashed border-transparent bg-transparent px-2 py-1 text-sm outline-none transition-colors hover:border-border hover:bg-muted/40 focus:border-solid focus:border-input focus:bg-background"
              />
              <button onClick={() => props.deleteFact(i)} className="text-muted-foreground transition-colors hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
            );
          })}
        </div>
        <Button variant="outline" size="sm" onClick={props.addFact} className="mt-2">
          <Plus /> Add fact
        </Button>
      </section>

      {/* Criteria */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <SectionLabel>The questions: {props.dealbreakerCount} dealbreaker{props.dealbreakerCount === 1 ? "" : "s"}</SectionLabel>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Tap a question or an answer to edit it. Add answers or new questions below.</p>
        <motion.div
          className="mt-3 space-y-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence initial={false}>
            {model.criteria.map((c, i) => (
              <CriterionCard
                key={c.key}
                criterion={c}
                index={i}
                isFirst={i === 0}
                isLast={i === model.criteria.length - 1}
                onPatch={(patch) => props.patchCriterion(c.key, patch)}
                onMove={(dir) => props.moveCriterion(c.key, dir)}
                onDelete={() => props.deleteCriterion(c.key)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => props.addCriterion(true)}>
            <Plus /> Add dealbreaker
          </Button>
          <Button variant="ghost" size="sm" onClick={() => props.addCriterion(false)}>
            <Plus /> Add question
          </Button>
        </div>
      </section>

      {/* Exclusions: transparency artefact */}
      {model.exclusions.length > 0 && (
        <section className="mt-8">
          <Card className="bg-secondary/50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-fit" /> What the AI deliberately did <em>not</em> add
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {model.exclusions.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <X className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* Post bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <button onClick={props.onBack} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← Edit the JD
          </button>
          <div className="flex items-center gap-3">
            {!props.canPost && <span className="text-sm text-noted-foreground">Keep at least one dealbreaker</span>}
            {props.error && <span className="text-sm text-destructive">{props.error}</span>}
            <Button onClick={props.onPost} disabled={!props.canPost}>
              Post job <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CriterionCard(props: {
  criterion: EditCriterion;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: Partial<EditCriterion>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const c = props.criterion;
  const togglePass = (opt: string) =>
    props.onPatch({
      passValues: c.passValues.includes(opt)
        ? c.passValues.filter((v) => v !== opt)
        : [...c.passValues, opt],
    });
  const setOption = (idx: number, val: string) =>
    props.onPatch({ options: c.options.map((o, i) => (i === idx ? val : o)) });

  return (
    <motion.div
      layout
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className={cn("p-4", c.isDealbreaker ? "border-l-[3px] border-l-primary" : "border-l-[3px] border-l-border")}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button disabled={props.isFirst} onClick={() => props.onMove(-1)} className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25">
              <ArrowUp className="size-4" />
            </button>
            <span className="text-xs tabular-nums text-muted-foreground">{props.index + 1}</span>
            <button disabled={props.isLast} onClick={() => props.onMove(1)} className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25">
              <ArrowDown className="size-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Switch checked={c.isDealbreaker} onCheckedChange={(v) => props.onPatch({ isDealbreaker: v })} />
                Dealbreaker
              </label>
              <div className="flex items-center gap-2">
                {c.isDealbreaker && (
                  <Badge variant={c.routable ? "outline" : "noted"} className="cursor-pointer" onClick={() => props.onPatch({ routable: !c.routable })}>
                    {c.routable ? "routable" : "terminal"}
                  </Badge>
                )}
                <button onClick={props.onDelete} className="text-muted-foreground transition-colors hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <Textarea
              value={c.prompt}
              onChange={(e) => props.onPatch({ prompt: e.target.value })}
              placeholder="The candidate-facing question…"
              title="Tap to edit the question"
              className="min-h-0 w-full resize-none rounded-md border border-dashed border-transparent bg-transparent px-2 py-1 text-[15px] font-medium transition-colors hover:border-border hover:bg-muted/40 focus:border-input focus:border-solid focus:bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={2}
            />

            {c.isDealbreaker ? (
              <div className="mt-2">
                <p className="mb-1.5 text-xs text-muted-foreground">
                  Tap an answer to mark it as <span className="text-fit">passing</span>.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.options.map((opt, idx) => {
                    const passing = c.passValues.includes(opt);
                    return (
                      <span
                        key={idx}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                          passing ? "border-fit bg-fit-muted text-fit" : "border-border text-muted-foreground",
                        )}
                      >
                        <button onClick={() => togglePass(opt)} className="flex items-center gap-1">
                          {passing && <Check className="size-3" />}
                          <input
                            value={opt}
                            onChange={(e) => setOption(idx, e.target.value)}
                            className="w-auto min-w-8 bg-transparent outline-none"
                            style={{ width: `${Math.max(opt.length, 3)}ch` }}
                          />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={() => props.onPatch({ options: [...c.options, "New answer"] })}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="size-3" /> Add answer
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Free-text answer · not a gate</p>
            )}

            {c.rationale && <p className="mt-2 text-xs italic text-muted-foreground">Why: {c.rationale}</p>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// -- Posted -------------------------------------------------------------------------------
function PostedPanel(props: { jobId: string; onCandidate: () => void; onBoard: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-16 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-fit-muted">
        <Check className="size-6 text-fit" />
      </div>
      <h1 className="mt-5 font-serif text-3xl tracking-tight">It's live.</h1>
      <p className="mt-2 text-muted-foreground">
        Candidates can now apply, and you'll only see the ones who are genuinely available and interested.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button size="lg" onClick={props.onCandidate}>
          Open the candidate flow <ArrowRight />
        </Button>
        <Button size="lg" variant="outline" onClick={props.onBoard}>
          Go to the live board
        </Button>
      </div>
    </motion.div>
  );
}

// -- Small helpers ------------------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</h2>;
}

function SummaryField(props: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{props.label}</span>
      <Input ref={ref} value={props.value} onChange={(e) => props.onChange(e.target.value)} className="h-9" />
    </div>
  );
}
