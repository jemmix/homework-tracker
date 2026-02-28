export default function EditLoading() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 opacity-0" style={{ animation: 'skeleton-in 150ms ease-in 200ms forwards' }}>
      <div className="p-8 w-full max-w-lg mx-auto rounded-2xl border-2 border-border/60 bg-card shadow-sm">
        <div className="h-7 w-32 rounded bg-border/40 animate-pulse mb-6" />
        <div className="h-4 w-20 rounded bg-border/30 animate-pulse mb-1.5" />
        <div className="h-10 w-full rounded-lg bg-border/30 animate-pulse mb-5" />
        <div className="h-4 w-14 rounded bg-border/30 animate-pulse mb-1.5" />
        <div className="flex gap-2 mb-5">
          <div className="h-10 flex-1 rounded-lg bg-border/30 animate-pulse" />
          <div className="h-10 w-20 rounded-lg bg-border/30 animate-pulse" />
          <div className="h-10 w-20 rounded-lg bg-border/30 animate-pulse" />
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-10 rounded-lg bg-border/20 animate-pulse" />
          <div className="h-10 rounded-lg bg-border/20 animate-pulse" />
        </div>
        <div className="h-12 w-full rounded-xl bg-border/40 animate-pulse" />
      </div>
    </div>
  );
}
