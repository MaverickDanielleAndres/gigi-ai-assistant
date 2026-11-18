export const modes = ["voice", "vision", "workspace", "research", "studio", "coach", "lab"] as const;
export type Mode = (typeof modes)[number];
