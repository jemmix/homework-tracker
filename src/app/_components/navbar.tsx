import Link from "next/link";
import { Progress } from "../../components/ui/progress";

export default function Navbar({ progress, bookTitle, showLogout }: { progress?: number; bookTitle?: string; showLogout?: boolean }) {
  return (
    <nav className="w-full bg-slate-900 text-white shadow-sm py-3 px-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-bold tracking-tight hover:underline">
          Homework Tracker
        </Link>
        {bookTitle && (
          <span className="ml-4 text-base font-semibold text-slate-200 truncate max-w-xs">{bookTitle}</span>
        )}
      </div>
      {typeof progress === "number" && (
        <div className="w-full md:w-96 flex flex-col items-center justify-center">
          <Progress value={progress} className="w-full max-w-xs mx-auto" />
          <span className="text-xs text-slate-200 mt-1 text-center">{progress}% complete</span>
        </div>
      )}
      {showLogout && (
        <div className="flex items-center justify-end mt-2 md:mt-0">
          <Link href="/api/auth/signout" className="hover:underline text-slate-200 text-sm px-3 py-1 rounded">
            Logout
          </Link>
        </div>
      )}
    </nav>
  );
}
