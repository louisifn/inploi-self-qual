import { create } from "zustand";
import type { BoardApplication } from "@inploi/shared";

/**
 * Shared in-session board state: the "live" channel for the single-screen walkthrough.
 * The recruiter board subscribes here; a candidate submitting in the same tab calls upsert()
 * for an instant, no-round-trip arrival. The cross-device path (a poll against D1) calls
 * setFromPoll(). BOTH feed the same map, so the render path is identical regardless of source.
 */
type BoardState = {
  byId: Record<string, BoardApplication>;
  upsert: (app: BoardApplication) => void;
  setFromPoll: (apps: BoardApplication[]) => void;
};

export const useBoardStore = create<BoardState>((set) => ({
  byId: {},
  upsert: (app) => set((s) => ({ byId: { ...s.byId, [app.id]: app } })),
  setFromPoll: (apps) =>
    set((s) => {
      const next = { ...s.byId };
      for (const a of apps) next[a.id] = a;
      return { byId: next };
    }),
}));

/** Newest first: ordered by arrival, never by any computed fit (anti-ranking guardrail). */
export function selectSortedApplications(s: BoardState): BoardApplication[] {
  return Object.values(s.byId).sort((a, b) => b.submittedAt - a.submittedAt);
}
