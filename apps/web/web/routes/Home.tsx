import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { healthSchema, type Health } from "@inploi/shared";
import { Button } from "@/components/ui/button";

export function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/api/health", healthSchema)
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-base font-bold tracking-tight text-foreground">inploi</p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight sm:text-[3.4rem]">
        An honest, two-sided{" "}
        <span className="text-brand-gradient">self-qualification</span> layer for frontline hiring.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Instead of filtering people out with a CV scan, we show them the truth of the role and let
        the wrong fits choose to walk, then send them somewhere better.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/recruiter">
            Recruiter: set up a role <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/candidate">Candidate: apply</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link to="/recruiter/board">Active applications</Link>
        </Button>
      </div>

      <div className="mt-16 border-t border-border pt-6">
        <HealthRow health={health} error={error} />
      </div>
    </main>
  );
}

function HealthRow({ health, error }: { health: Health | null; error: string | null }) {
  if (error) {
    return <p className="text-sm text-destructive">Health check failed: {error}</p>;
  }
  if (!health) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Checking the stack…
      </p>
    );
  }
  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-fit" />
        web → Worker → D1 healthy
      </span>
      <span>
        store: <span className="text-foreground">{health.store.toUpperCase()}</span>
      </span>
      <span>
        jobs seeded: <span className="text-foreground">{health.jobs}</span>
      </span>
      <span>
        live AI:{" "}
        <span className="text-foreground">
          {health.liveAiConfigured ? "configured" : "demo-safe fallback"}
        </span>
      </span>
    </dl>
  );
}
