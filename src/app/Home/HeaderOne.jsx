"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import SearchOverlay from "./SearchOverlay";

const menuItems = [
  // { name: "Home", href: "/home", icon: "⌂" },
  { name: "Products", href: "/products", icon: <FaHome /> },
  { name: "Events", href: "/events", icon: "◈" },
  { name: "Blogs", href: "/blogs", icon: "◎" },
  { name: "About Us", href: "/about-us", icon: "◇" },
  { name: "Contact Us", href: "/contact-us", icon: "◉" },
  { name: "Product Profile", href: "/product-profile", icon:"◇"  },
];

export default function HeaderOne() {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');

        /* ─── glass pill container ─── */
        .nav-glass {
        
          backdrop-filter: blur(30px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 1px 0 rgba(255,255,255,0.1) inset;
          position: relative;
          overflow: hidden;
        }

        /* shimmer top line */
        .nav-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 16px; right: 16px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(255,200,80,0.6) 40%,
            rgba(43,126,194,0.6) 60%,
            transparent);
        }

        /* ─── each nav item ─── */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px 8px 12px;
          border-radius: 14px;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: background 0.22s ease;
          white-space: nowrap;
         
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: white;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(135deg,
            rgba(255,200,80,0.0),
            rgba(43,126,194,0.0));
          transition: background 0.25s ease;
        }

        .nav-item:hover::before,
        .nav-item.active::before {
          background: linear-gradient(135deg,
            rgba(255,200,80,0.12),
            rgba(43,126,194,0.18));
        }

        .nav-item:hover,
        .nav-item.active {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }

        /* glowing left accent on active */
        .nav-item.active::after {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          border-radius: 0 2px 2px 0;
          background: linear-gradient(180deg, #FFD700, #2B7EC2);
          box-shadow: 0 0 8px rgba(255,215,0,0.7);
        }

        /* icon glyph */
        .nav-icon {
          font-style: normal;
          font-size: 14px;
          opacity: 0.5;
          transition: opacity 0.2s, transform 0.2s;
          flex-shrink: 0;
          width: 18px;
          text-align: center;
        }
        .nav-item:hover .nav-icon,
        .nav-item.active .nav-icon {
          opacity: 1;
          transform: scale(1.15);
        }

        /* label */
        .nav-label {
          transition: letter-spacing 0.25s ease;
        }
        .nav-item:hover .nav-label {
          letter-spacing: 0.04em;
        }

        /* active dot */
        .nav-dot {
          margin-left: auto;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFD700, #2B7EC2);
          box-shadow: 0 0 6px rgba(255,215,0,0.8);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .nav-item.active .nav-dot,
        .nav-item:hover .nav-dot {
          opacity: 1;
        }

        /* ─── search button ─── */
        .nav-search-btn {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg,
            rgba(255,200,80,0.15),
            rgba(43,126,194,0.2));
          border: 1px solid rgba(255,200,80,0.25);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,220,100,0.9);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: all 0.25s ease;
        }
        .nav-search-btn:hover {
          background: linear-gradient(135deg,
            rgba(255,200,80,0.25),
            rgba(43,126,194,0.3));
          border-color: rgba(255,200,80,0.5);
          color: #FFD700;
          box-shadow: 0 0 16px rgba(255,200,80,0.2);
        }

        /* divider */
        .nav-divider {
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(255,255,255,0.08),
            transparent);
          margin: 6px 8px;
        }
      `}</style>

      <div className="nav-glass bg-black/50 hidden lg:flex" role="navigation" aria-label="Main navigation">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item sm:flex ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <em className="nav-icon">{item.icon}</em>
              <div className="border-b border-white/30">
                <span className="nav-label">{item.name}</span></div>
              {/* <span className="nav-dot" /> */}
            </Link>
          );
        })}

        <div className="nav-divider" />

        {/* <button
          className="nav-search-btn"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search products"
        >
          <FaSearch size={12} />
          <span>Search</span>
        </button> */}
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}