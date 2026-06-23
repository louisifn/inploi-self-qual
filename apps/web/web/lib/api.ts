import type { z } from "zod";

/** Thin typed fetch helper. Validates every response against a shared Zod schema. */
export async function apiGet<S extends z.ZodType>(
  path: string,
  schema: S,
): Promise<z.infer<S>> {
  const res = await fetch(path, { headers: { accept: "application/json" } });
  if (!res.ok) throw new ApiError(res.status, await safeText(res));
  return schema.parse(await res.json());
}

export async function apiPost<S extends z.ZodType>(
  path: string,
  body: unknown,
  schema: S,
): Promise<z.infer<S>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new ApiError(res.status, await safeText(res));
  return schema.parse(await res.json());
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return res.statusText;
  }
}
