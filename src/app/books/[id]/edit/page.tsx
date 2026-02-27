"use client";
import BookForm from "../../../_components/book-form";
import { useParams } from "next/navigation";
import Navbar from "../../../_components/navbar";

export default function EditBookPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <BookForm bookId={id} />
      </div>
    </div>
  );
}
