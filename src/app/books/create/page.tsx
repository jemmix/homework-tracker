import BookForm from "../../_components/book-form";
import Navbar from "../../_components/navbar";
import Head from "next/head";

export default function CreateBookPage() {
  return (
    <>
      <Head>
        <title>Create Book – Homework Tracker</title>
      </Head>
      <main className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <BookForm />
        </div>
      </main>
    </>
  );
}
