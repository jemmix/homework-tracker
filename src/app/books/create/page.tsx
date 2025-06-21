import BookForm from "../../_components/book-form";
import Navbar from "../../_components/navbar";

export default function CreateBookPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <BookForm />
      </div>
    </main>
  );
}
