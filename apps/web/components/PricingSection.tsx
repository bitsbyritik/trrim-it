import { Check, Shield, Zap } from "lucide-react";

const features = [
  "First clip is on us — free",
  "No subscription. Ever.",
  "Server-side processing, no install",
  "All major platforms supported",
];

type Props = {
  onSignIn: () => void;
};

export default function PricingSection({ onSignIn }: Props) {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container flex justify-center">
        <div className="w-full max-w-md relative rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-[0_0_80px_-20px_hsl(217_91%_60%/0.3)]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="p-10 text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-xs font-semibold text-primary">
              <Zap className="w-3 h-3" />
              Pay-per-clip
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              No subscriptions.
              <br />
              Just snippets.
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">Pay only for what you clip and download.</p>

            <div className="mb-2 flex items-end justify-center gap-1">
              <span className="text-7xl sm:text-8xl font-extrabold text-gradient-primary leading-none tabular-nums">
                10¢
              </span>
            </div>
            <p className="text-base text-foreground/70 font-medium mb-1">per clip download</p>
            <p className="text-sm text-muted-foreground mb-8">Buy a credit pack to save more.</p>

            <ul className="space-y-3 mb-8 text-left">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground/75">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={onSignIn}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-[0.99] text-white font-semibold text-base transition-all duration-150 shadow-[0_0_40px_-8px_hsl(217_91%_60%/0.6)] mb-7"
            >
              Get Your First Clip Free
            </button>

            <div className="flex items-center justify-center gap-5 text-muted-foreground/40">
              <Shield className="w-4 h-4" />
              {["Visa", "Mastercard", "Google Pay", "Polar"].map((p) => (
                <span key={p} className="text-[11px] font-medium tracking-wide">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
