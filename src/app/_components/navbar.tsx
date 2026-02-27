import Link from "next/link";
import { Progress } from "../../components/ui/progress";
import { BookOpen } from "lucide-react";

export default function Navbar({
  progress,
  bookTitle,
  showLogout,
}: {
  progress?: number;
  bookTitle?: string;
  showLogout?: boolean;
}) {
  return (
    <nav className="w-full border-b-2 border-border/50 bg-card/80 backdrop-blur-sm py-4 px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <span className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <BookOpen className="size-4" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Homework Tracker
          </span>
        </Link>
        {bookTitle && (
          <>
            <span className="text-border text-lg">/</span>
            <span className="text-sm font-medium text-muted-foreground truncate max-w-xs">
              {bookTitle}
            </span>
          </>
        )}
      </div>
      {typeof progress === "number" && (
        <div className="w-full md:w-72 flex flex-col items-center gap-1.5">
          <Progress value={progress} />
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            {progress}% complete
          </span>
        </div>
      )}
      <div className="flex items-center justify-end">
        {showLogout ? (
          <Link
            href="/api/auth/signout"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
          >
            Logout
          </Link>
        ) : (
          <Link
            href="/api/auth/signin"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-1.5 rounded-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
