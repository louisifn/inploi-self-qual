import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { apiGet } from "@/lib/api";
import { jobSummarySchema, type JobSummary } from "@inploi/shared";

/**
 * Candidate entry: the list of all live, applyable roles. Picking one starts the apply +
 * self-qualification flow for that role. This is what "Candidate: apply" opens.
 */
export function CandidateJobs() {
  const [jobs, setJobs] = useState<JobSummary[] | null>(null);

  useEffect(() => {
    apiGet("/api/jobs", z.array(jobSummarySchema))
      .then(setJobs)
      .catch(() => setJobs([]));
  }, []);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-12">
      <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        ‹ Back
      </Link>
      <h1 className="mt-6 font-serif text-3xl leading-tight tracking-tight">
        Open <span className="text-brand-gradient">roles</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a role to apply. Every one shows you the honest truth of the job before you commit.
      </p>

      {!jobs ? (
        <div className="mt-10 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No open roles right now. Check back soon.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link
                to={`/candidate/${j.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{j.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {j.employer ? `${j.employer} · ` : ""}
                    {j.location ?? "Location"}
                    {j.payRange ? ` · ${j.payRange}` : ""}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
