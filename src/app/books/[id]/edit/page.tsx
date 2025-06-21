"use client";
import BookForm from "../../../_components/book-form";
import { useParams } from "next/navigation";

export default function EditBookPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <BookForm bookId={id} />
    </main>
  );
}
