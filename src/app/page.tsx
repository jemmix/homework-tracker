import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Navbar from "./_components/navbar";
import { BookList } from "./_components/book-list";
import { ShowHideArchived } from "./_components/show-hide-archived";

export interface TaskPart {
  completed: boolean;
}
export interface Task {
  parts: TaskPart[];
  completed: boolean;
}
export interface Unit {
  tasks: Task[];
}

export default async function Home() {
  const session = await auth();
  let books: { id: number; title: string; archived?: boolean; units?: Unit[] }[] = [];
  if (session?.user) {
    books = await api.book.list();
  }

  // Split books into active and archived
  const activeBooks = books.filter((b) => !b.archived);
  const archivedBooks = books.filter((b) => b.archived);

  // This is a React Server Component, so we can't use useState directly here.
  // We'll use a client component for the archived section.

  return (
    <>
      <HydrateClient>
        <Navbar showLogout={!!session} />
        <main className="max-w-2xl mx-auto p-6">
          <h2 className="text-xl font-semibold mb-4">Your Books</h2>
          {session ? (
            <>
              {activeBooks.length > 0 ? (
                <BookList books={activeBooks} />
              ) : (
                <p className="text-gray-600 mb-6">No books found.</p>
              )}
              {archivedBooks.length > 0 && <ShowHideArchived books={archivedBooks} />}
            </>
          ) : (
            <p className="text-gray-600 mb-6">Please log in to see your books.</p>
          )}
          {session && (
            <Link
              href="/books/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
            >
              Create Book
            </Link>
          )}
        </main>
      </HydrateClient>
    </>
  );
}
