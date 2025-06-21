import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Book - Homework Tracker",
};

export default function CreateBookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
