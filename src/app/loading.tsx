import Navbar from "./_components/navbar";

function SkeletonBookCard() {
  return (
    <div className="bg-card rounded-xl border-2 border-border/50 px-4 py-4 pb-5 flex items-center justify-between relative">
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <div className="w-4 h-4 rounded bg-border/30 animate-pulse shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
          <div className="h-4 rounded bg-border/40 animate-pulse" style={{ width: "55%" }} />
          <div className="h-3 w-28 rounded bg-border/25 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-1.5 ml-4 shrink-0">
        <div className="h-8 w-16 rounded-lg bg-border/25 animate-pulse" />
        <div className="h-8 w-8 rounded-lg bg-border/20 animate-pulse" />
      </div>
      <span className="absolute left-4 right-4 bottom-1.5 h-1 rounded-full bg-secondary" />
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar showLogout />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="h-8 w-40 rounded bg-border/40 animate-pulse" />
          <div className="h-4 w-64 rounded bg-border/25 animate-pulse mt-2" />
        </div>
        <div className="space-y-3 mb-6">
          <SkeletonBookCard />
          <SkeletonBookCard />
          <SkeletonBookCard />
        </div>
      </main>
    </div>
  );
}
