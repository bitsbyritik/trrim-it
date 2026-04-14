"use client";

import { useState } from "react";
import { Zap, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";

type Package = {
  id: string;
  label: string;
  minutes: number;
  priceCents: number;
  highlight?: boolean;
  note?: string;
};

const PACKAGES: Package[] = [
  { id: "starter", label: "Starter",    minutes: 30,  priceCents: 300 },
  { id: "popular", label: "Popular",    minutes: 100, priceCents: 900,  highlight: true },
  { id: "value",   label: "Best Value", minutes: 300, priceCents: 2400, note: "Save 20%" },
];

const PRICE_PER_MIN = 0.10;

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  currentCredits: number;
};

export default function BuyCreditsModal({ open, onClose, currentCredits }: Props) {
  const [selected, setSelected] = useState<string>("popular");
  const [customMinutes, setCustomMinutes] = useState("");

  const isCustom = selected === "custom";
  const customMin = parseFloat(customMinutes) || 0;

  const selectedPkg = PACKAGES.find((p) => p.id === selected);
  const addMinutes = isCustom ? customMin : (selectedPkg?.minutes ?? 0);
  const totalCents = isCustom
    ? Math.round(customMin * PRICE_PER_MIN * 100)
    : (selectedPkg?.priceCents ?? 0);

  const afterCredits = currentCredits + addMinutes;

  return (
    <Modal open={open} onClose={onClose} title="Top Up Credits" maxWidth="max-w-lg">
      <p className="text-xs text-muted-foreground/50 -mt-2 mb-5">
        1 credit = 1 minute of trimmed output
      </p>

      {/* Package cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PACKAGES.map((pkg) => {
          const active = selected === pkg.id;
          return (
            <button
              key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all ${
                pkg.highlight
                  ? active
                    ? "border-primary/50 bg-primary/10"
                    : "border-primary/20 bg-primary/[0.04] hover:border-primary/35"
                  : active
                    ? "border-white/20 bg-white/[0.06]"
                    : "border-[#1f1f1f] bg-[#111111] hover:border-white/[0.12]"
              }`}
            >
              {pkg.highlight && (
                <span className="absolute -top-2 left-3 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-white uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground/50">{pkg.label}</p>
                  <p className="text-lg font-extrabold text-foreground tabular-nums leading-tight">
                    {pkg.minutes} min
                  </p>
                  <p className="text-xs text-muted-foreground/50 tabular-nums">{fmt(pkg.priceCents)}</p>
                  {pkg.note && (
                    <p className="text-[10px] text-green-400 font-semibold mt-0.5">{pkg.note}</p>
                  )}
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${active ? "border-primary bg-primary" : "border-white/20"}`}>
                  {active && <Check style={{ width: 10, height: 10 }} className="text-white" />}
                </div>
              </div>
            </button>
          );
        })}

        {/* Custom */}
        <button
          onClick={() => setSelected("custom")}
          className={`text-left p-3.5 rounded-xl border transition-all col-span-2 ${
            isCustom ? "border-white/20 bg-white/[0.06]" : "border-[#1f1f1f] bg-[#111111] hover:border-white/[0.12]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground/50 mb-1">Custom amount</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={customMinutes}
                  onChange={(e) => { setSelected("custom"); setCustomMinutes(e.target.value); }}
                  onClick={(e) => { e.stopPropagation(); setSelected("custom"); }}
                  placeholder="Enter minutes"
                  className="w-32 bg-background border border-[#1f1f1f] rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors tabular-nums"
                />
                {isCustom && customMin > 0 && (
                  <span className="text-xs text-muted-foreground/50 tabular-nums">
                    = {fmt(Math.round(customMin * PRICE_PER_MIN * 100))}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/30 mt-1">${PRICE_PER_MIN}/min · no discount</p>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ml-auto shrink-0 transition-all ${isCustom ? "border-primary bg-primary" : "border-white/20"}`}>
              {isCustom && <Check style={{ width: 10, height: 10 }} className="text-white" />}
            </div>
          </div>
        </button>
      </div>

      {/* Balance preview */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-[#1f1f1f] mb-4 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground/40">Current balance</p>
          <p className="font-semibold tabular-nums text-foreground/70">
            <Zap className="inline w-3 h-3 text-cyan-400 mr-1" />
            {currentCredits.toFixed(1)} min
          </p>
        </div>
        <span className="text-muted-foreground/25 text-lg">→</span>
        <div className="space-y-0.5 text-right">
          <p className="text-xs text-muted-foreground/40">After top-up</p>
          <p className={`font-bold tabular-nums ${addMinutes > 0 ? "text-green-400" : "text-foreground/40"}`}>
            <Zap className="inline w-3 h-3 mr-1" />
            {afterCredits.toFixed(1)} min
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        disabled={totalCents === 0}
        onClick={onClose} // TODO: wire to Stripe checkout
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-[0_0_24px_-6px_hsl(217_91%_60%/0.4)]"
        style={{ background: "linear-gradient(135deg, hsl(188 90% 42%), hsl(217 91% 52%))" }}
      >
        <Zap className="w-4 h-4" />
        {totalCents > 0 ? `Add Credits — ${fmt(totalCents)}` : "Select a package"}
      </button>
    </Modal>
  );
}
