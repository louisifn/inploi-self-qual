import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Paperclip } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { NotFound } from "@/routes/NotFound";
import { createApplicationResponseSchema, jobDetailSchema, type JobDetail } from "@inploi/shared";

/**
 * Act 2a: the deliberately generic Greenhouse-style "before" form. Plain, dull, familiar.
 * Its whole job is to feel like every other ATS, so the self-qualification page (Act 2b)
 * lands as the contrast. NO decision-relevant questions here. Those all live in Act 2b.
 */

const SAMPLE_CANDIDATE = {
  firstName: "Sam",
  lastName: "Okafor",
  email: "sam.okafor@example.com",
  phone: "07700 900245",
  cvText: `Warehouse operative, DPD depot, Tottenham (1 year). Early shifts loading vans from 4:30am. Never missed a start. Fast, physical, on my feet all shift.
Before that: kitchen porter at a pub for 6 months (weekends), and helped at my uncle's corner shop on the till.
Reliable, fit, used to early mornings. Looking to move into something more front-of-house and customer-facing.`,
};

export function CandidatePage() {
  const { jobId = "" } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [cvOpen, setCvOpen] = useState(false);
  const [cvText, setCvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [hearAbout, setHearAbout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet(`/api/jobs/${jobId}`, jobDetailSchema)
      .then(setJob)
      .catch((e) => setLoadError(String(e)));
  }, [jobId]);

  function fillSample() {
    setFirstName(SAMPLE_CANDIDATE.firstName);
    setLastName(SAMPLE_CANDIDATE.lastName);
    setEmail(SAMPLE_CANDIDATE.email);
    setPhone(SAMPLE_CANDIDATE.phone);
    setCvOpen(true);
    setCvText(SAMPLE_CANDIDATE.cvText);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiPost(
        "/api/applications",
        {
          jobId,
          candidateName: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          phone: phone.trim() || undefined,
          cvText: cvText.trim() || undefined,
        },
        createApplicationResponseSchema,
      );
      navigate(`/candidate/${jobId}/qualify/${res.applicationId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <NotFound
        title="Job not found"
        message="This role isn't available anymore, or the link is mistyped. Head back to the start."
        actionHref="/"
        actionLabel="Back to start"
      />
    );
  }
  if (!job) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const sections = parseJd(job.job.description ?? "", job.job.title);

  return (
    <div
      className="min-h-dvh bg-neutral-50 text-neutral-900"
      style={{ fontFamily: "var(--font-system)" }}
    >
      {/* Generic ATS top bar: deliberately plain system fonts, the dull "before". */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <button onClick={() => navigate("/")} className="text-sm text-neutral-500 hover:text-neutral-800">
            ‹ Back to all jobs
          </button>
          <button onClick={fillSample} className="text-xs text-neutral-400 hover:text-neutral-600">
            Fill sample candidate
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Job header */}
        <h1 className="text-[26px] font-semibold leading-tight">{job.job.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {job.job.employer ?? "Employer"} · {job.job.location ?? "Location"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
          {["Hourly", "On-site", job.job.shiftPattern?.split("·").pop()?.trim() ?? "Part-time / Full-time"].map(
            (chip) => (
              <span key={chip} className="rounded border border-neutral-200 bg-white px-2 py-0.5">
                {chip}
              </span>
            ),
          )}
        </div>

        {/* Prose (the truth is buried in here; Act 2b will surface it) */}
        <div className="mt-8 space-y-5">
          {sections.map((s, i) => (
            <section key={i}>
              {s.heading && <h2 className="mb-1.5 text-base font-semibold text-neutral-900">{s.heading}</h2>}
              {s.body && <p className="text-sm leading-relaxed text-neutral-600">{s.body}</p>}
              {s.bullets.length > 0 && (
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-600">
                  {s.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* The form */}
        <div className="mt-10 border-t border-neutral-200 pt-8">
          <h2 className="text-lg font-semibold">Apply for this job</h2>
          <p className="mt-1 text-xs text-neutral-400">
            <span className="text-red-500">*</span> Required
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <AtsField label="First name" required>
                <AtsInput value={firstName} onChange={setFirstName} autoComplete="given-name" />
              </AtsField>
              <AtsField label="Last name" required>
                <AtsInput value={lastName} onChange={setLastName} autoComplete="family-name" />
              </AtsField>
            </div>
            <AtsField label="Email" required>
              <AtsInput value={email} onChange={setEmail} type="email" autoComplete="email" />
            </AtsField>
            <div className="grid grid-cols-2 gap-4">
              <AtsField label="Phone">
                <AtsInput value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
              </AtsField>
              <AtsField label="City">
                <AtsInput value={city} onChange={setCity} placeholder="Start typing…" autoComplete="address-level2" />
              </AtsField>
            </div>

            {/* Resume / CV: file is cosmetic; pasted text is what we actually keep */}
            <AtsField label="Resume / CV">
              <div className="rounded-md border border-dashed border-neutral-300 bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100">
                    <Paperclip className="size-4" />
                    Attach a file
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                    />
                  </label>
                  <span className="text-sm text-neutral-400">
                    {fileName ?? "PDF, DOCX up to 10MB"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCvOpen((v) => !v)}
                  className="mt-2 text-xs text-neutral-500 underline-offset-2 hover:underline"
                >
                  {cvOpen ? "Hide" : "Or enter your experience manually"}
                </button>
                {cvOpen && (
                  <textarea
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Paste your CV or a few lines about your experience…"
                    className="mt-2 min-h-28 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                  />
                )}
              </div>
            </AtsField>

            <AtsField label="Cover letter">
              <textarea
                placeholder="Optional"
                className="min-h-24 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
              />
            </AtsField>

            <AtsField label="How did you hear about us?">
              <select
                value={hearAbout}
                onChange={(e) => setHearAbout(e.target.value)}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 focus:border-neutral-400 focus:outline-none"
              >
                <option value="">Please select…</option>
                <option>Job board</option>
                <option>A friend</option>
                <option>Walked past the shop</option>
                <option>Social media</option>
              </select>
            </AtsField>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Submit application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── plain ATS field primitives (intentionally generic) ────────────────────────────────
function AtsField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function AtsInput(props: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={props.type ?? "text"}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
    />
  );
}

// ── JD prose parsing ──────────────────────────────────────────────────────────────────
type JdSection = { heading?: string; body: string; bullets: string[] };

function parseJd(desc: string, title: string): JdSection[] {
  const blocks = desc
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks
    .map((block): JdSection => {
      const lines = block.split("\n");
      const first = lines[0];
      const isHeading = first.length < 42 && !first.endsWith(".") && !first.startsWith("- ");
      const heading = isHeading ? first : undefined;
      const rest = isHeading ? lines.slice(1) : lines;
      const bullets = rest.filter((l) => l.startsWith("- ")).map((l) => l.replace(/^- /, ""));
      const body = rest.filter((l) => !l.startsWith("- ")).join(" ").trim();
      return { heading, body, bullets };
    })
    .filter((s) => s.heading !== title);
}
