"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaLinkedin,
  FaMapMarkerAlt,
  FaEnvelope,
  FaLinkedinIn,
} from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import Search from "./Search";
import SearchOverlay from "./SearchOverlay";

export default function HeaderOne() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  const menuItems = [
    { name: "Home", href: "/home" },
    { name: "Products", href: "/products" },
    // {
    //   name: "Insights & Updates",
    //   children: [
    //     { name: "Events", href: "/events" },
    //     { name: "Blogs", href: "/blogs" },
    //   ],
    // },
    { name: "Events", href: "/events" },
    { name: "Blogs", href: "/blogs" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "Product Profile", href: "/product-profile" },
  ];


  
  const socialLinks = [
    {
      icon: <FaLinkedinIn size={28} />,
      url: "https://www.linkedin.com/company/yourcompany",
      bg: "bg-white",
      textColor: "text-blue-600"
    },
    {
      icon: <FaInstagram size={28} />,
      url: "https://www.instagram.com/yourpage",
      bg: "bg-white",
      textColor: "text-pink-500"
    },
    {
      icon: <FaFacebookF size={28} />,
      url: "https://www.facebook.com/yourpage",
      bg: "bg-white",
      textColor: "text-blue-700"
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between font-raleway">
      <header className="flex-1 flex-col  flex  sm:bg-white items-center justify-between lg:justify-center gap-2 sm:gap-4 lg:gap-0">

        {/* DESKTOP MENU */}
        <nav className="hidden lg:flex flex-col flex-1 gap-2 xl:gap-3 font-bold font-raleway text-[#2B7EC2] text-[14px] xl:text-[15px]">

          {menuItems.map((item) => (
            <div key={item.name} className="relative group text-left">
              {/* Parent */}
              {item.children ? (
                <span className="px-2 py-2 cursor-pointer hover:text-black hover:bg-white transition block">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href}>
                  <span className="px-2 py-2 hover:text-black border-b-1 border-black hover:bg-white  transition block">
                    {item.name}
                  </span>
                </Link>
              )}

              {/* Dropdown */}
              {item.children && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white text-black rounded-md shadow-lg w-44 z-50 overflow-hidden">
                  {item.children.map((child) => (
                    <Link key={child.name} href={child.href}>
                      <span className="block px-4 py-2 text-sm hover:bg-[#2B7EC2] hover:text-white transition">
                        {child.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </header >
      {/* <div className="flex gap-3 mt-5  pt-3 lg:pt-0 lg:border-t-0 items-center justify-end">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 lg:bg-black bg-black/40 rounded-full px-4 sm:px-4 py-2 h-12 sm:h-11 lg:h-9 text-white hover:bg-gray-100 transition"
          aria-label="Search products"
        >
          <FaSearch size={24} />
          <span className="hidden lg:inline text-sm text-white">
            Search for products…
          </span>
        </button>
      </div>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      /> */}
    </div >
  );
}
