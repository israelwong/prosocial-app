import Navbar from "@/app/ui/main/Navbar";
import Footer from "@/app/ui/main/Footer";
import { GoogleTagManager } from '@next/third-parties/google';
import "../globals.css";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="antialiased h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <GoogleTagManager gtmId="GTM-WCG8X7J" />
        </div>
    );
}