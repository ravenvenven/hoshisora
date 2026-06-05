// src/app/(shop)/layout.tsx
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header hanya muncul di area toko depan */}
      <Header />
      
      <main>{children}</main>
      
      {/* BottomNav hanya muncul di area toko depan */}
      <BottomNav />
    </>
  );
}