"use client";
import { BookList } from "./book-list";
import { useState } from "react";
import type { Unit } from "../page";

export function ShowHideArchived({ books }: { books: { id: number; title: string; archived?: boolean; units?: Unit[] }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 mb-6"> {/* Added mb-6 for spacing below */}
      <button
        className="text-sm text-gray-600 hover:underline mb-2"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? "Hide" : "Show"} Archived Books
      </button>
      {open && (
        <div className="bg-gray-50 rounded p-4 border border-gray-200">
          <BookList books={books} />
        </div>
      )}
    </div>
  );
}
