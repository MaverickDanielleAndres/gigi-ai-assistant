import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`brand ${compact ? "brand--compact" : ""}`} aria-label="GIGI, home">
    <span className="brand-mark" aria-hidden="true"><i /></span>
    <span>GIGI</span>
  </Link>;
}
