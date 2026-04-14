import type { ClipStatus, BillingStatus } from "@/lib/mock-data";

type ClipBadgeProps = { status: ClipStatus };
type BillingBadgeProps = { status: BillingStatus };

const CLIP_STYLES: Record<ClipStatus, string> = {
  ready: "bg-green-500/10 border-green-500/20 text-green-400",
  processing: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  failed: "bg-red-500/10 border-red-500/20 text-red-400",
};

const BILLING_STYLES: Record<BillingStatus, string> = {
  paid: "bg-green-500/10 border-green-500/20 text-green-400",
  pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  failed: "bg-red-500/10 border-red-500/20 text-red-400",
};

function Dot({ className }: { className: string }) {
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${className}`} />;
}

export function ClipStatusBadge({ status }: ClipBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${CLIP_STYLES[status]}`}
    >
      {status === "processing" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      ) : (
        <Dot
          className={
            status === "ready" ? "bg-green-400" : "bg-red-400"
          }
        />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function BillingStatusBadge({ status }: BillingBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${BILLING_STYLES[status]}`}
    >
      <Dot
        className={
          status === "paid"
            ? "bg-green-400"
            : status === "pending"
              ? "bg-amber-400"
              : "bg-red-400"
        }
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
