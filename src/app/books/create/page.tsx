import BookForm from "../../_components/book-form";
import Navbar from "../../_components/navbar";

export default function CreateBookPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <BookForm />
      </div>
    </div>
  );
}
