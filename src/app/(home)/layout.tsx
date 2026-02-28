import { Suspense } from "react";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";

async function AuthNavbar() {
  const session = await auth();
  return <Navbar showLogout={!!session} />;
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<Navbar />}>
        <AuthNavbar />
      </Suspense>
      {children}
    </div>
  );
}
