import Navbar from "../../../_components/navbar";

function SkeletonUnit({ width }: { width: string }) {
  return (
    <div className="rounded-xl bg-card border-2 border-border/40 mb-3 overflow-hidden">
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="h-4 w-6 rounded bg-border/40 animate-pulse" />
        <div className={`h-4 rounded bg-border/40 animate-pulse`} style={{ width }} />
        <div className="ml-auto h-6 w-10 rounded-full bg-border/30 animate-pulse" />
      </div>
    </div>
  );
}

export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar showLogout />
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-1">
          <SkeletonUnit width="45%" />
          <SkeletonUnit width="60%" />
          <SkeletonUnit width="35%" />
          <SkeletonUnit width="52%" />
          <SkeletonUnit width="40%" />
        </div>
      </main>
    </div>
  );
}
