import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Friendly catch-all / dead-link page. Used both for unknown URLs (router "*") and for stale
 * candidate links (an application or job that no longer exists, e.g. after a demo reset), so a
 * person who pastes an old link sees this instead of a raw API error.
 */
export function NotFound({
  title = "Page not found",
  message = "That link doesn't lead anywhere. It may have expired, or been reset since you last opened it.",
  actionHref = "/",
  actionLabel = "Back to start",
}: {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent text-primary">
          <Compass className="size-5" />
        </div>
        <p className="mt-6 text-base font-bold tracking-tight">inploi</p>
        <h1 className="mt-1 font-serif text-3xl leading-tight tracking-tight">
          {title.includes(" ") ? (
            <>
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-brand-gradient">{title.split(" ").slice(-1)}</span>
            </>
          ) : (
            <span className="text-brand-gradient">{title}</span>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button asChild size="lg" className="mt-6">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      </motion.div>
    </main>
  );
}
