// src/app/admin/layout.tsx
import AdminSidebar from "@/app/(shop)/components/AdminSidebar";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Memanggil Sidebar dari folder (shop)/components */}
      <AdminSidebar />

      {/* Area Konten Kanan */}
      <div className="lg:pl-64 min-h-screen">
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}