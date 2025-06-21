"use client";
import Link from "next/link";
import { useState } from "react";

export default function ArchivedBooksSection({ books }: { books: { id: number; title: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-6">
      <button
        className="text-sm text-gray-500 hover:underline mb-2"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        {expanded ? "Hide Archived Books" : `Show Archived Books (${books.length})`}
      </button>
      {expanded && (
        <ul className="space-y-2">
          {books.map((book) => (
            <li
              key={book.id}
              className="bg-gray-100 rounded shadow p-4 flex items-center justify-between"
            >
              <span>{book.title}</span>
              <span className="flex gap-4">
                <Link
                  href={`/books/${book.id}/progress`}
                  className="text-blue-600 hover:underline"
                >
                  Open
                </Link>
                <Link
                  href={`/books/${book.id}/edit`}
                  className="text-gray-600 hover:underline"
                >
                  Edit
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
