import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import ProgressClient, { type BookData } from "./progress-client";

export default async function BookProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const book = await api.book.progress({ id });
  if (!book) notFound();

  return <ProgressClient initialBook={book as BookData} />;
}
