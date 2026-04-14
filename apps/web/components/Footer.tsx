import { Scissors, Github } from "lucide-react";
import { FOOTER } from "@/lib/copy";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/30 py-12">
      <div className="container">
        {/* Tagline — the mic drop line */}
        <p className="text-center text-base sm:text-lg font-semibold text-foreground/40 mb-10 tracking-tight">
          {FOOTER.tagline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">
              trrim<span className="text-primary">.it</span>
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground/60">
            {FOOTER.nav.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="X (Twitter)"
              className="w-8 h-8 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-white/15 transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="w-8 h-8 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-white/15 transition-all"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/35">
          <span>{FOOTER.copyright}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
            {FOOTER.status}
          </span>
        </div>
      </div>
    </footer>
  );
}
