import { z } from "zod";
import { modes, type Mode } from "./modes";

export { modes };
export type { Mode };
export const modeSchema = z.enum(modes);
export const turnSchema = z.object({
  id: z.string().max(80),
  role: z.enum(["user", "assistant"]),
  text: z.string().max(12000),
  createdAt: z.number(),
  mode: modeSchema.optional(),
  sources: z.array(z.object({ title: z.string(), url: z.url() })).max(15).optional(),
});
export type Turn = z.infer<typeof turnSchema>;

export const chatRequestSchema = z.object({
  requestId: z.uuid(),
  mode: modeSchema,
  locale: z.enum(["en", "fil"]),
  text: z.string().trim().min(1).max(12000),
  history: z.array(turnSchema.pick({ role: true, text: true })).max(8).refine(turns => turns.reduce((size, turn) => size + turn.text.length, 0) <= 24_000),
  image: z.object({ dataUrl: z.string().max(7_100_000), name: z.string().max(120) }).optional(),
  turnstileToken: z.string().max(2500).optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ChatEvent =
  | { type: "start"; requestId: string }
  | { type: "status"; label: string }
  | { type: "text_delta"; text: string }
  | { type: "citation"; title: string; url: string }
  | { type: "done" }
  | { type: "error"; code: string; message: string };

export type Artifact = { id: string; title: string; text: string; mode: Mode; createdAt: number; sources?: { title: string; url: string }[] };
