import { FileDown, Receipt } from "lucide-react";
import { BillingStatusBadge } from "@/components/ui/StatusBadge";
import type { BillingEntry } from "@/lib/mock-data";

type Props = { entries: BillingEntry[] };

export default function BillingHistory({ entries }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
        Billing History
      </h2>
      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] overflow-hidden">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#1f1f1f] flex items-center justify-center">
              <Receipt className="w-5 h-5 text-muted-foreground/20" />
            </div>
            <p className="text-sm text-muted-foreground/35">No billing history yet</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[120px_1fr_80px_100px_60px] gap-3 px-4 py-2.5 border-b border-[#1f1f1f]">
              {["Date", "Description", "Amount", "Status", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>
            {entries.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-1 sm:grid-cols-[120px_1fr_80px_100px_60px] gap-2 sm:gap-3 items-center px-4 py-3.5 border-b border-[#1f1f1f] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-xs text-muted-foreground/45">
                  {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-sm text-foreground/75">{e.description}</span>
                <span className="text-sm font-semibold tabular-nums text-foreground/80">
                  ${(e.amount / 100).toFixed(2)}
                </span>
                <BillingStatusBadge status={e.status} />
                <div className="flex justify-end">
                  {e.invoiceUrl && (
                    <a
                      href={e.invoiceUrl}
                      title="Download invoice"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06] transition-all"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
