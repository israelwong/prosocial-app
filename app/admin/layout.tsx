import { Metadata } from "next";
import { Toaster } from "sonner";
import "../globals.css";

export const metadata: Metadata = {
    title: {
        template: '%s | ProSocial',
        default: 'Bienvenido | ProSocial',
    },
    metadataBase: new URL('https://prosocial.mx'),
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="antialiased h-screen">
            {children}
            <Toaster
                position="top-right"
                theme="dark"
                richColors
                closeButton
                duration={4000}
            />
        </div>
    );
}