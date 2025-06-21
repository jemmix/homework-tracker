"use client";
import { useParams } from "next/navigation";

export default function BookProgressPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div>Book Progress for ID: {id}</div>
    </main>
  );
}
