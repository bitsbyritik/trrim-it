import { getMockClips } from "@/lib/mock-data";
import ClipsGrid from "@/components/dashboard/ClipsGrid";

export default function ClipsPage() {
  const { clips } = getMockClips();

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Clips</h1>
        <p className="text-sm text-muted-foreground/50 mt-0.5">
          All your trimmed clips in one place.
        </p>
      </div>

      <ClipsGrid clips={clips} pageSize={20} />
    </div>
  );
}
