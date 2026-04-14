import { Zap, Globe, Server, Cpu } from "lucide-react";

const TRUST_CARDS = [
  {
    icon: Zap,
    title: "Zero-latency processing",
    description: "FFmpeg pipeline runs server-side. Your request is processed before you blink.",
    color: "primary" as const,
  },
  {
    icon: Server,
    title: "Rust-powered backend",
    description: "Blazing-fast binary operations with near-zero overhead and memory safety.",
    color: "primary" as const,
  },
  {
    icon: Globe,
    title: "Direct URL fetching",
    description: "We pull the stream straight from the source. Your bandwidth is untouched.",
    color: "accent" as const,
  },
  {
    icon: Cpu,
    title: "No local upload required",
    description: "100% cloud-side. Nothing touches your disk, ever.",
    color: "accent" as const,
  },
] as const;

function TrustCard({ card }: { card: (typeof TRUST_CARDS)[number] }) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-card p-6 hover:border-primary/25 hover:bg-primary/[0.03] transition-all duration-300 overflow-hidden relative">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(217_91%_60%/0.05),transparent_60%)]" />
      <div className="relative z-10">
        <div
          className={`w-11 h-11 mb-4 rounded-xl flex items-center justify-center ${
            card.color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
          }`}
        >
          <card.icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-base mb-1.5">{card.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
      </div>
    </div>
  );
}

export default function BentoGrid() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Built for <span className="text-gradient-primary">speed</span>
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-base">
            Every layer of the stack optimized for the shortest path from URL to clip.
          </p>
        </div>

        {/* Clean 2×2 trust grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {TRUST_CARDS.map((card) => (
            <TrustCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
