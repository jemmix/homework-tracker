import type { Metadata } from "next";
import { db } from "../../../../server/db/index";
import { books } from "../../../../server/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const bookArr = await db.select().from(books).where(eq(books.id, Number((await params).id)));
  const book = bookArr[0];
  return {
    title: book ? `Edit: ${book.title} - Homework Tracker` : "Edit Book - Homework Tracker",
  };
}

export default function EditBookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
