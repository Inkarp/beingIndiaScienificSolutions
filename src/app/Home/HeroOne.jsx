'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import SearchOverlay from './SearchOverlay';
import HeaderOne from './HeaderOne';
import Image from 'next/image';

const FULL_LINE1    = 'India';
const FULL_LINE2    = 'Scientific Solutions';
const SUBTITLE      = 'Discover our cutting-edge solutions to accelerate scientific excellence.';
const TYPING_SPEED  = 80;

export default function HeroOne() {
  const [animKey,          setAnimKey]          = useState(0);
  const [line1,            setLine1]            = useState('');
  const [line2,            setLine2]            = useState('');
  const [subtitle,         setSubtitle]         = useState('');
  const [showCursor1,      setShowCursor1]      = useState(false);
  const [showCursor2,      setShowCursor2]      = useState(false);
  const [showCursorSub,    setShowCursorSub]    = useState(false);
  const [badgeVisible,     setBadgeVisible]     = useState(false);
  const [indiaFullyTyped,  setIndiaFullyTyped]  = useState(false);
  const [logoVisible,      setLogoVisible]      = useState(false);
  const [isSearchOpen,     setIsSearchOpen]     = useState(false);
  // Nav slides in from right once the full typing sequence completes
  const [navVisible,       setNavVisible]       = useState(false);

  const sectionRef  = useRef(null);
  const timeoutsRef = useRef([]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const typeText = useCallback(
    (fullText, setter, setCursor, onDone, startDelay = 0) => {
      let i = 0;
      setter('');
      setCursor(true);
      const start = setTimeout(() => {
        const tick = () => {
          i++;
          setter(fullText.slice(0, i));
          if (i < fullText.length) {
            const t = setTimeout(tick, TYPING_SPEED);
            timeoutsRef.current.push(t);
          } else {
            setCursor(false);
            if (onDone) {
              const t = setTimeout(onDone, 200);
              timeoutsRef.current.push(t);
            }
          }
        };
        tick();
      }, startDelay);
      timeoutsRef.current.push(start);
    },
    []
  );

  const startAnimation = useCallback(() => {
    clearAll();
    setLine1('');
    setLine2('');
    setSubtitle('');
    setShowCursor1(false);
    setShowCursor2(false);
    setShowCursorSub(false);
    setBadgeVisible(false);
    setIndiaFullyTyped(false);
    setLogoVisible(false);
    setNavVisible(false);

    const tBadge = setTimeout(() => setBadgeVisible(true), 200);
    const tLogo  = setTimeout(() => setLogoVisible(true),  400);
    timeoutsRef.current.push(tBadge, tLogo);

    typeText(FULL_LINE1, setLine1, setShowCursor1, () => {
      setIndiaFullyTyped(true);
      typeText(FULL_LINE2, setLine2, setShowCursor2, () => {
        typeText(SUBTITLE, setSubtitle, setShowCursorSub, () => {
          // ← trigger nav after entire typing sequence ends
          const tNav = setTimeout(() => setNavVisible(true), 300);
          timeoutsRef.current.push(tNav);
        }, 300);
      });
    }, 500);
  }, [typeText]);

  // Restart animation every time section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setAnimKey((k) => k + 1); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (animKey === 0) return;
    startAnimation();
    return clearAll;
  }, [animKey, startAnimation]);

  /* ── Render line 1 ──────────────────────────────────────────── */
  const renderLine1 = () => {
    const hasIndia = line1.length > 0;
    return (
      <span className="inline-flex flex-wrap items-center gap-x-3 leading-tight">
        {/* "Welcome to" fades in with logo */}
        <span className={`opacity-0 ${logoVisible ? 'logo-fade-in' : ''}`}>
          Welcome to
        </span>

        {/* Logo — white-inverted, vertically centred */}
        <span
          className={`inline-flex items-center opacity-0 ${logoVisible ? 'logo-fade-in' : ''}`}
          style={{ verticalAlign: 'middle' }}
        >
          <Image
            src="/logo.webp"
            alt="Being India"
            width={220}
            height={64}
            className="inline-block"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </span>

        {/* "India" — tricolour + underline */}
        {hasIndia && (
          <span className={`relative inline-block ${indiaFullyTyped ? 'india-revealed' : ''}`}>
            <span className="india-text">{line1}</span>
            {indiaFullyTyped && (
              <span className="india-underline absolute left-0 -bottom-[5px] h-[3px] rounded" />
            )}
          </span>
        )}

        {showCursor1 && <span className="typing-cursor" />}
      </span>
    );
  };

  /* ── JSX ────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;700&display=swap');

        /* keyframes */
        @keyframes indiaSlideIn {
          0%   { clip-path:inset(0 100% 0 0); opacity:.3; transform:translateX(-10px); }
          65%  { clip-path:inset(0 0 0 0);    opacity:1;  transform:translateX(3px);  }
          100% { clip-path:inset(0 0 0 0);    opacity:1;  transform:translateX(0);    }
        }
        @keyframes underlineExpand {
          0%   { width:0;    opacity:0; }
          100% { width:100%; opacity:1; }
        }
        @keyframes badgeFadeUp {
          0%   { opacity:0; transform:translateY(14px); }
          100% { opacity:1; transform:translateY(0);    }
        }
        @keyframes logoFadeIn {
          0%   { opacity:0; transform:translateY(10px); }
          100% { opacity:1; transform:translateY(0);    }
        }
        @keyframes searchFadeIn {
          0%   { opacity:0; transform:translateY(12px); }
          100% { opacity:1; transform:translateY(0);    }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        /* nav slides in from the right */
        @keyframes navSlideIn {
          0%   { transform:translateX(110%); opacity:0; }
          65%  { transform:translateX(-8px); opacity:1; }
          100% { transform:translateX(0);   opacity:1; }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateY(0)   translateX(-50%); }
          50%     { transform:translateY(8px) translateX(-50%); }
        }

        /* utility classes */
        .logo-fade-in  { animation: logoFadeIn  .5s ease forwards; }
        .badge-visible { animation: badgeFadeUp .6s ease forwards; }
        .search-visible{ animation: searchFadeIn .55s .2s ease forwards; }

        .india-text {
          display: inline-block;
          background: linear-gradient(90deg,
            #FF9933 0%, #FF9933 24%,
            #fff 44%, #fff 56%,
            #138808 76%, #138808 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          clip-path: inset(0 100% 0 0);
          opacity: 0;
          transform: translateX(-10px);
          font-weight: 900;
        }
        .india-revealed .india-text {
          animation: indiaSlideIn .8s cubic-bezier(.22,1,.36,1) forwards;
        }
        .india-underline {
          background: linear-gradient(90deg,#FF9933,#FFD700,#138808);
          animation: underlineExpand .7s .6s ease-out forwards;
          box-shadow: 0 0 10px rgba(255,180,0,.6);
          width: 0; opacity: 0;
        }
        .typing-cursor {
          display: inline-block;
          width: 3px; height: .85em;
          background: #FFD700;
          margin-left: 3px; border-radius: 1px;
          animation: blink .75s step-end infinite;
        }

        /* made-in badge base (opacity starts 0; .badge-visible animates it in) */
        .made-in-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,200,0,.45);
          backdrop-filter: blur(8px);
          padding: 5px 14px 5px 10px; border-radius: 100px;
          font-size: 12px; font-weight: 700; letter-spacing:.1em;
          color: #FFD700; text-transform: uppercase;
          margin-bottom: 12px; opacity: 0;
        }

        /* nav panel */
        .nav-panel {
          opacity: 0;
          transform: translateX(110%);
        }
        .nav-panel.nav-in {
          animation: navSlideIn .9s cubic-bezier(.22,1,.36,1) forwards;
        }

        /* scroll indicator */
        .scroll-indicator {
          animation: scrollBounce 1.6s ease-in-out infinite;
          position: absolute;
          bottom: 2rem;
          left: 50%;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          color: white; opacity: .8; z-index: 20;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full lg:h-[800px] h-[500px] overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Background image (desktop only) */}
        <Image
          src="/HeroImage.webp"
          alt="Hero background"
          fill priority quality={100} sizes="100vw"
          className="object-cover absolute inset-0 hidden lg:block"
        />

        {/* Gradient overlay on desktop */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/30 to-transparent hidden lg:block" />

        {/* Mobile solid bg */}
        <div className="absolute inset-0 bg-[#2B7EC2] lg:hidden" />

        {/* ── Hero content ── */}
        <div className="relative z-20 h-full flex items-start lg:mt-20 mt-0 px-6 md:px-14 lg:px-24">
          <div className="w-full lg:max-w-3xl max-w-2xl space-y-5">

            {/* Badge */}
            <div>
              <span className={`made-in-badge ${badgeVisible ? 'badge-visible' : ''}`}>
                Proudly Now in India
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl font-black text-white"
              style={{ fontFamily: "'DM Serif Display', serif", minHeight: '7.5rem' }}
            >
              {renderLine1()}
              {line1 === FULL_LINE1 && (
                <>
                  <br />
                  <span>
                    {line2}
                    {showCursor2 && <span className="typing-cursor" />}
                  </span>
                </>
              )}
            </h1>

            {/* Search bar */}
            {subtitle && (
              <div
                onClick={() => setIsSearchOpen(true)}
                className={`inline-flex items-center bg-white/95 rounded-full px-5 py-2 gap-3
                            shadow-xl cursor-pointer opacity-0 ${subtitle ? 'search-visible' : ''}`}
              >
                <FaSearch className="text-[#2F4191]" size={16} />
                <input
                  type="text"
                  placeholder="Search for products..."
                  readOnly
                  className="bg-transparent outline-none text-sm w-[200px] font-medium text-gray-700"
                />
                <span className="bg-gradient-to-r from-[#2F4191] to-[#2B7EC2] text-white
                                 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Search
                </span>
              </div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm md:text-base text-gray-200 max-w-lg leading-relaxed">
                {subtitle}
                {showCursorSub && <span className="typing-cursor" />}
              </p>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator hidden lg:flex">
          <div className="w-[20px] h-[32px] border-2 border-white rounded-xl relative">
            <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[4px] h-[7px] bg-[#2F4191] rounded" />
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase">Scroll</span>
        </div>

        {/* ── Nav panel — slides in from the right after typing ends ── */}
        <div className={`nav-panel fixed top-1/3 right-6 z-50 ${navVisible ? 'nav-in' : ''}`}>
          <HeaderOne />
        </div>
      </section>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}