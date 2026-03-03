// app/layout.js
import { Geist, Geist_Mono, Raleway, DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import ScrollToTop from "./ScrollToTop";
import Header from "./Home/Header";
import Footer from "./Home/Footer";
import ShareButton from "./ShareButton";
import ChatModal from "./Home/ChatModal";

import ProductsSidebar from "./ProductsSidebar";
import SocialContactBar from "./SocialContactBar";
import SidebarNav from "./Home/SidebarNav";
import FestivalUpdates from "./FestivalUpdates";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const raleway = Raleway({
  // subsets: ["latin"],
  weight: ["800"],
  variable: "--font-raleway",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Being Instruments",
    template: "",
  },
  description: "Scientific & Analytical Instrument Solutions",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} `} >
      {/* // className={`${montserrat.variable}`} */}
      <head>
        <link rel="preload" href="/favicon.png" as="image" />
      </head>
      <body className="bg-white">
        <ScrollToTop />
        <Header />
        {/* <SidebarNav /> */}
        {/* <ShareButton /> */}
        <SocialContactBar />
        <FestivalUpdates />
        <ProductsSidebar />
        <main className="w-[90%] mx-auto pt-20">
          {children}
        </main>
        <ChatModal />
        <Footer />
      </body>
    </html>
  );
}
