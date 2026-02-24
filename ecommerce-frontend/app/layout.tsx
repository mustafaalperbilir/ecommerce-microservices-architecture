import type { Metadata } from "next";
import "./globals.css";

// Az önce oluşturduğumuz Navbar bileşenini içeri aktarıyoruz
import Navbar from "@/components/Navbar"; 

// Sitenin SEO (Arama Motoru Optimizasyonu) ayarları
export const metadata: Metadata = {
  title: "TechStore | Profesyonel E-Ticaret",
  description: "Mikroservis mimarisi ile güçlendirilmiş modern e-ticaret platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {/* Navbar'ı buraya koyarak TÜM sayfalarda en üstte görünmesini sağlıyoruz */}
        <Navbar />
        
        {/* Sitenin değişen kısımları (Örn: page.tsx içindeki vitrin) buraya gelir */}
        {children}
      </body>
    </html>
  );
}