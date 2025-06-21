"use client";
import BookForm from "../../../_components/book-form";
import { useParams } from "next/navigation";
import Navbar from "../../../_components/navbar";

export default function EditBookPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <>
      <main className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <BookForm bookId={id} />
        </div>
      </main>
    </>
  );
}
