import { Suspense } from "react";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import Navbar from "../../_components/navbar";

async function BookBreadcrumb({ id }: { id: string }) {
  const session = await auth();
  const book = await db.query.books.findFirst({
    where: (b, { eq: e, and }) =>
      and(e(b.id, Number(id)), e(b.userId, session?.user?.id ?? "")),
    columns: { title: true },
  });

  if (!book) return null;

  return (
    <>
      <span className="text-border text-lg">/</span>
      <span className="text-sm font-medium text-muted-foreground truncate max-w-xs">
        {book.title}
      </span>
    </>
  );
}

export default async function BookLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        showLogout
        breadcrumb={
          <Suspense>
            <BookBreadcrumb id={id} />
          </Suspense>
        }
      />
      {children}
    </div>
  );
}
