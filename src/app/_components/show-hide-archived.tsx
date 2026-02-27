"use client";
import { BookList } from "./book-list";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Unit } from "../page";

export function ShowHideArchived({ books }: { books: { id: number; title: string; archived?: boolean; units?: Unit[] }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 mb-6">
      <button
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        {open ? "Hide" : "Show"} Archived Books
      </button>
      {open && (
        <div className="rounded-xl border-2 border-dashed border-border/50 bg-secondary/30 p-4">
          <BookList books={books} />
        </div>
      )}
    </div>
  );
}
