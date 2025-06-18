import { Navbar } from "@/app/components/backend/navbar";
import type { Metadata } from "next";

import "@/styles/globals.css";

// TODO: Add your metadata
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Project",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`flex h-screen w-full flex-col font-sans`}>
      <Navbar />
      <main className="h-full w-full flex-1">{children}</main>
    </div>
  );
}
