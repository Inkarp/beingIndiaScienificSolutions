"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaArrowRight,
} from "react-icons/fa";

// Confetti particle component
function Confetti({ active }) {
  const pieces = Array.from({ length: 18 });
  const colors = ["#FFD700", "#FF4D6D", "#00C2FF", "#7BFF6A", "#FF9F1C", "#E040FB"];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
      {active &&
        pieces.map((_, i) => {
          const color = colors[i % colors.length];
          const left = `${(i / pieces.length) * 100}%`;
          const delay = `${(i * 0.07).toFixed(2)}s`;
          const size = i % 3 === 0 ? 7 : i % 3 === 1 ? 5 : 9;
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                left,
                top: "-10px",
                width: size,
                height: size,
                background: color,
                borderRadius: i % 2 === 0 ? "50%" : "2px",
                animation: `confettiFall 1.3s ease-in forwards`,
                animationDelay: delay,
                opacity: 0,
                transform: `rotate(${i * 25}deg)`,
              }}
            />
          );
        })}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(160px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Discount badge with celebration theme
function DiscountBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: "-13px",
        right: "-13px",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer glow ring */}
      <span
        style={{
          position: "absolute",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFD70066 0%, transparent 80%)",
          animation: "pulse-glow 1.5s ease-in-out infinite",
        }}
      />
      {/* Badge circle */}
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF4D6D 0%, #FF9F1C 100%)",
          boxShadow: "0 4px 16px 0 #FF4D6D88, 0 0 0 3px #FFD700",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          animation: "badge-bounce 1.1s cubic-bezier(.36,.07,.19,.97) infinite alternate",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            lineHeight: 1,
            letterSpacing: "-0.5px",
            textShadow: "0 1px 4px rgba(0,0,0,0.25)",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          50%
        </span>
        <span
          style={{
            color: "#FFD700",
            fontWeight: 800,
            fontSize: 8,
            lineHeight: 1,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          OFF
        </span>
        {/* Stars */}
        <span style={{ position: "absolute", top: 2, left: 5, fontSize: 7 }}>⭐</span>
        <span style={{ position: "absolute", bottom: 2, right: 4, fontSize: 6 }}>🎉</span>
      </span>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        @keyframes badge-bounce {
          0% { transform: scale(1) rotate(-5deg); }
          100% { transform: scale(1.08) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export default function ProductsSidebar() {
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on open
  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(t);
    }
  }, [open]);

  const items = [
    {
      icon: <FaLinkedinIn />,
      label: "Laboratory Drying Oven",
      color: "bg-[#0A66C2]",
      link: "/products/laboratory-ovens/laboratory-drying-oven/bpg-9040a",
      image: "/testImg.webp",
      originalPrice: "₹20,000",
      discountedPrice: "₹10,000 onwards",
      buttonText: "Check Now",
    },
  ];

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* COLLAPSED PILL */}
      <div className="w-6 h-28 bg-[#2F4191] shadow-xl rounded-l-full border border-gray-200 flex items-center justify-center cursor-pointer">
        <div className="w-1 h-10 bg-gray-300 rounded-full" />
      </div>

      {/* EXPANDABLE PANEL */}
      <div
        className={`
          absolute right-6 top-1/2 -translate-y-1/2
          bg-white rounded-3xl shadow-2xl border border-gray-200
          transition-all duration-500 overflow-hidden
          ${open ? "w-60 opacity-100 p-4" : "w-0 opacity-0 p-0"}
        `}
      >
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => window.open(item.link)}
              className="flex items-center gap-3 group/item"
            >
              <div
                className="flex flex-col gap-3 border border-gray-300 justify-center items-center p-5 rounded-2xl shadow-lg hover:shadow-xl"
                style={{ position: "relative" }}
              >
                {/* Confetti burst on open */}
                <Confetti active={showConfetti} />

                {/* 50% Discount Badge */}
                <DiscountBadge />

                {/* Celebration banner */}
                <div
                  style={{
                    background: "linear-gradient(90deg, #FF4D6D 0%, #FF9F1C 100%)",
                    borderRadius: "999px",
                    padding: "2px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 2,
                    boxShadow: "0 2px 8px #FF4D6D55",
                    animation: "shimmer 2s linear infinite",
                    backgroundSize: "200% 100%",
                  }}
                >
                  <span style={{ fontSize: 13 }}>🎊</span>
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 11,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    Limited Offer!
                  </span>
                  <span style={{ fontSize: 13 }}>🎊</span>
                </div>

                {/* Product image */}
                {/* <img
                  src={item.image}
                  alt={item.label}
                  className="h-full w-full object-cover rounded-xl"
                /> */}
                <Image src={item.image} alt={item.label} width={200} height={120} className="rounded-xl" />

                {/* Price row */}
                <div className="flex items-center gap-3 mt-1">
                  <span
                    style={{
                      color: "#aaa",
                      fontSize: 13,
                      textDecoration: "line-through",
                      fontWeight: 500,
                    }}
                  >
                    {item.originalPrice}
                  </span>
                  <span
                    style={{
                      color: "#FF4D6D",
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    {item.discountedPrice}
                  </span>
                </div>

                {/* CTA button */}
                <Link href="/">
                  <div className="flex items-center justify-center gap-3 bg-[#2F3F8D] px-3 py-1 rounded-full w-fit">
                    <span className="text-white font-medium text-[16px]">{item.label}</span>
                    <div className="relative w-[30px] h-[30px] text-white">
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="spin-slow"
                      >
                        <path d="M14.2257 0.947522C14.6258 0.457905 15.3742 0.457905 15.7743 0.947522L16.8781 2.29817C17.181 2.66879 17.704 2.77283 18.1256 2.54633L19.6623 1.72088C20.2193 1.42165 20.9107 1.70806 21.093 2.31352L21.5959 3.98376C21.7339 4.44207 22.1773 4.73834 22.6535 4.69044L24.3891 4.51587C25.0182 4.45258 25.5474 4.98179 25.4841 5.61093L25.3096 7.34647C25.2617 7.8227 25.5579 8.2661 26.0162 8.40409L27.6865 8.90697C28.2919 9.08926 28.5783 9.7807 28.2791 10.3377L27.4537 11.8744C27.2272 12.296 27.3312 12.819 27.7018 13.1219L29.0525 14.2257C29.5421 14.6258 29.5421 15.3742 29.0525 15.7743L27.7018 16.8781C27.3312 17.181 27.2272 17.704 27.4537 18.1256L28.2791 19.6623C28.5783 20.2193 28.2919 20.9107 27.6865 21.093L26.0162 21.5959C25.5579 21.7339 25.2617 22.1773 25.3096 22.6535L25.4841 24.3891C25.5474 25.0182 25.0182 25.5474 24.3891 25.4841L22.6535 25.3096C22.1773 25.2617 21.7339 25.5579 21.5959 26.0162L21.093 27.6865C20.9107 28.2919 20.2193 28.5783 19.6623 28.2791L18.1256 27.4537C17.704 27.2272 17.181 27.3312 16.8781 27.7018L15.7743 29.0525C15.3742 29.5421 14.6258 29.5421 14.2257 29.0525L13.1219 27.7018C12.819 27.3312 12.296 27.2272 11.8744 27.4537L10.3377 28.2791C9.7807 28.5783 9.08926 28.2919 8.90697 27.6865L8.40409 26.0162C8.2661 25.5579 7.8227 25.2617 7.34647 25.3096L5.61093 25.4841C4.98179 25.5474 4.45258 25.0182 4.51587 24.3891L4.69044 22.6535C4.73834 22.1773 4.44207 21.7339 3.98376 21.5959L2.31352 21.093C1.70806 20.9107 1.42165 20.2193 1.72088 19.6623L2.54633 18.1256C2.77283 17.704 2.66879 17.181 2.29817 16.8781L0.947522 15.7743C0.457905 15.3742 0.457905 14.6258 0.947522 14.2257L2.29817 13.1219C2.66879 12.819 2.77283 12.296 2.54633 11.8744L1.72088 10.3377C1.42165 9.7807 1.70806 9.08926 2.31352 8.90697L3.98376 8.40409C4.44207 8.2661 4.73834 7.8227 4.69044 7.34647L4.51587 5.61093C4.45258 4.98179 4.98179 4.45258 5.61093 4.51587L7.34647 4.69044C7.8227 4.73834 8.2661 4.44207 8.40409 3.98376L8.90697 2.31352C9.08926 1.70806 9.7807 1.42165 10.3377 1.72088L11.8744 2.54633C12.296 2.77283 12.819 2.66879 13.1219 2.29817L14.2257 0.947522Z" />
                      </svg>
                      <FaArrowRight
                        size={12}
                        className="absolute top-1/2 left-1/2 text-black transform -translate-x-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </button>
          ))}
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
        `}</style>
      </div>
    </div>
  );
}