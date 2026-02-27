import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Navbar from "./_components/navbar";
import { BookList } from "./_components/book-list";
import { ShowHideArchived } from "./_components/show-hide-archived";
import { Plus } from "lucide-react";

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

  const activeBooks = books.filter((b) => !b.archived);
  const archivedBooks = books.filter((b) => b.archived);

  return (
    <HydrateClient>
      <div className="min-h-screen bg-background">
        <Navbar showLogout={!!session} />
        <main className="max-w-2xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
              Your Books
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Track your progress across all your coursework.
            </p>
          </div>

          {session ? (
            <>
              {activeBooks.length > 0 ? (
                <BookList books={activeBooks} />
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border/60 bg-card/50 p-10 text-center">
                  <p className="text-muted-foreground">
                    No books yet. Create one to get started.
                  </p>
                </div>
              )}
              {archivedBooks.length > 0 && <ShowHideArchived books={archivedBooks} />}
            </>
          ) : (
            <div className="rounded-2xl border-2 border-border/60 bg-card p-10 text-center shadow-sm">
              <p className="text-muted-foreground text-base">
                Please sign in to see your books.
              </p>
            </div>
          )}

          {session && (
            <div className="mt-8">
              <Link
                href="/books/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl shadow-sm hover:bg-primary/85 hover:shadow-md transition-all duration-200 font-medium text-sm active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Create Book
              </Link>
            </div>
          )}
        </main>
      </div>
    </HydrateClient>
  );
}
