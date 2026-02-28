import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import BookForm, { type BookFormInitialData } from "../../../_components/book-form";
import Navbar from "../../../_components/navbar";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const book = await api.book.get({ id });
  if (!book) notFound();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <BookForm initialData={book as BookFormInitialData} />
      </div>
    </div>
  );
}
