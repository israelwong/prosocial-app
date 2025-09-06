import Navbar from "@/app/ui/main/Navbar";
import { FooterMarketing } from "@/app/components/shared";
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
            <FooterMarketing />
            <GoogleTagManager gtmId="GTM-WCG8X7J" />
        </div>
    );
}