import './globals.css';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

export const metadata = {
  title: 'A2Zee - Your Need. Our People. One Platform.',
  description: 'Cooperative Gig Services Platform for Household & Community Services (Ministry of Cooperation & NCCT)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Luckiest+Guy&family=Rubik+Mono+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFF6F0] text-[#0F172A] antialiased selection:bg-[#1F4072]/20 selection:text-[#1F4072] font-secondary font-normal">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
