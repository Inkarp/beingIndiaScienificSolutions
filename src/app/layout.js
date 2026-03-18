// app/layout.js
import { Geist, Geist_Mono, Raleway, DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";


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
    default: "Being India",
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
        {children}
      </body>
    </html>
  );
}
