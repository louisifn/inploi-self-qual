import { createBrowserRouter } from "react-router-dom";
import { Home } from "./routes/Home";
import { RecruiterSetup } from "./recruiter/RecruiterSetup";
import { RecruiterBoard } from "./recruiter/RecruiterBoard";
import { CandidatePage } from "./candidate/CandidatePage";
import { SelfQualify } from "./candidate/SelfQualify";
import { NotFound } from "./routes/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/recruiter", element: <RecruiterSetup /> },
  { path: "/recruiter/board", element: <RecruiterBoard /> },
  { path: "/recruiter/board/:jobId", element: <RecruiterBoard /> },
  { path: "/candidate/:jobId", element: <CandidatePage /> },
  { path: "/candidate/:jobId/qualify/:applicationId", element: <SelfQualify /> },
  // Catch-all: unknown URLs land on the friendly not-found page.
  { path: "*", element: <NotFound /> },
]);
