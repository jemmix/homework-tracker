import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();
  let books: { id: number; title: string }[] = [];
  if (session?.user) {
    books = await api.book.list();
  }

  return (
    <HydrateClient>
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shadow">
        <h1 className="text-2xl font-bold tracking-tight">Homework Tracker</h1>
        <nav className="flex items-center gap-4">
          {session ? (
            <Link href="/api/auth/signout" className="hover:underline">
              Logout
            </Link>
          ) : (
            <Link href="/api/auth/signin" className="hover:underline">
              Login
            </Link>
          )}
        </nav>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Your Books</h2>
        {session ? (
          books.length > 0 ? (
            <ul className="space-y-2 mb-6">
              {books.map((book) => (
                <li
                  key={book.id}
                  className="bg-white rounded shadow p-4 flex items-center justify-between"
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
          ) : (
            <p className="text-gray-600 mb-6">No books found.</p>
          )
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
  );
}
