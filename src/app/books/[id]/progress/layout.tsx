import type { Metadata } from "next";
import { db } from "../../../../server/db/index";
import { books } from "../../../../server/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const bookArr = await db.select().from(books).where(eq(books.id, Number((await params).id)));
  const book = bookArr[0];
  return {
    title: book ? `${book.title} - Book Progress - Homework Tracker` : "Book Not Found - Homework Tracker",
  };
}

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
