'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

const sliderImages = ['/incubators.png', '/water-baths.png', '/ovens.png'];
const names = ['Incubators', 'Water Baths', 'Ovens'];

const FULL_LINE1 = 'Welcome to Being India';
const FULL_LINE2 = 'Scientific Solutions';
const SUBTITLE = 'Discover our cutting-edge solutions to accelerate scientific excellence.';
const TYPING_SPEED = 55;

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Typing state
    const [animKey, setAnimKey] = useState(0);
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [showCursor1, setShowCursor1] = useState(false);
    const [showCursor2, setShowCursor2] = useState(false);
    const [showCursorSub, setShowCursorSub] = useState(false);
    const [badgeVisible, setBadgeVisible] = useState(false);

    const sectionRef = useRef(null);
    const timeoutsRef = useRef([]);

    // Auto slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const clearAll = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const typeText = useCallback((fullText, setter, setCursor, onDone, startDelay = 0) => {
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
    }, []);

    const startAnimation = useCallback(() => {
        clearAll();
        setLine1('');
        setLine2('');
        setSubtitle('');
        setShowCursor1(false);
        setShowCursor2(false);
        setShowCursorSub(false);
        setBadgeVisible(false);

        const t = setTimeout(() => setBadgeVisible(true), 200);
        timeoutsRef.current.push(t);

        typeText(FULL_LINE1, setLine1, setShowCursor1, () => {
            typeText(FULL_LINE2, setLine2, setShowCursor2, () => {
                typeText(SUBTITLE, setSubtitle, setShowCursorSub, null, 300);
            });
        }, 500);
    }, [typeText]);

    // IntersectionObserver — retrigger every time section enters viewport
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAnimKey(k => k + 1);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (animKey === 0) return;
        startAnimation();
        return clearAll;
    }, [animKey, startAnimation]);

    return (
        <>
            <style>{`
                @keyframes badgeFadeUp {
                    0%   { opacity: 0; transform: translateY(12px); }
                    100% { opacity: 1; transform: translateY(0);    }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0; }
                }
                @keyframes flagWave {
                    0%, 100% { transform: rotate(0deg);  }
                    25%      { transform: rotate(-8deg); }
                    75%      { transform: rotate( 8deg); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes underlineExpand {
                    0%   { width: 0%;   opacity: 0; }
                    100% { width: 100%; opacity: 1; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg);   }
                    to   { transform: rotate(360deg); }
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,200,0,0.45);
                    backdrop-filter: blur(8px);
                    padding: 5px 14px 5px 10px;
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    color: #FFD700;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                    opacity: 0;
                }
                .hero-badge.badge-visible {
                    animation: badgeFadeUp 0.6s ease forwards;
                }

                .flag-emoji {
                    font-size: 18px;
                    display: inline-block;
                    animation: flagWave 1.8s ease-in-out infinite;
                    transform-origin: bottom center;
                }

                .typing-cursor {
                    display: inline-block;
                    width: 3px;
                    height: 0.85em;
                    background: #FFD700;
                    margin-left: 3px;
                    vertical-align: middle;
                    border-radius: 1px;
                    animation: blink 0.75s step-end infinite;
                }

                .hero-h1 {
                    min-height: 7.5rem;
                }

                .spin-slow {
                    animation: spin-slow 6s linear infinite;
                }
            `}</style>

            <section
                ref={sectionRef}
                className="w-full mx-auto h-screen flex flex-col md:flex-row overflow-hidden"
            >
                {/* Left: Video + typing text */}
                <div className="relative w-full md:w-1/2 h-full">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    >
                        <source src="/bg-video.mov" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/30 z-10" />

                    {/* Text content */}
                    <div className="relative z-20 h-full flex items-center px-6 md:px-16 text-white">
                        <div className="max-w-xl space-y-5">

                            {/* Badge */}
                            <div>
                                <span className={`hero-badge ${badgeVisible ? 'badge-visible' : ''}`}>
                                    <span className="flag-emoji">🇮🇳</span>
                                    Proudly Made in India
                                </span>
                            </div>

                            {/* Typing headline */}
                            <h1 className="hero-h1 text-4xl md:text-6xl font-bold leading-tight">
                                {line1}
                                {showCursor1 && <span className="typing-cursor" />}
                                {line1 === FULL_LINE1 && (
                                    <>
                                        {' '}
                                        <span>
                                            {line2}
                                            {showCursor2 && <span className="typing-cursor" />}
                                        </span>
                                    </>
                                )}
                            </h1>

                            {/* Subtitle */}
                            {subtitle && (
                                <p className="text-lg md:text-xl text-gray-200">
                                    {subtitle}
                                    {showCursorSub && <span className="typing-cursor" />}
                                </p>
                            )}

                            <Link href='/'>
                                <div className="flex items-center justify-center gap-3 bg-[#2F3F8D] px-3 py-2 rounded-full w-fit">
                                    <span className="text-white font-medium text-[16px]">Know More</span>
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
                    </div>
                </div>

                {/* Right: Auto-sliding image — unchanged */}
                <div className="md:w-1/2 w-full relative bg-gray-300 min-h-[400px] md:min-h-[600px]">
                    <div className="absolute top-50 left-0 z-20 bg-white flex flex-col gap-5 rounded-r-xl flex justify-center items-center px-2 py-5 shadow-lg">
                        <div className='rounded-full p-1 bg-[#2B7EC2] text-white shadow-2xl'>
                            <MdNavigateNext className='h-5 w-5' />
                        </div>
                        <div className='rounded-full p-1 bg-[#2B7EC2] text-white shadow-2xl'>
                            <MdNavigateBefore className='h-5 w-5' />
                        </div>
                    </div>

                    <Image
                        src={sliderImages[currentSlide]}
                        alt="Auto slider"
                        width={600}
                        height={750}
                        objectFit='cover'
                        sizes="(max-width: 100px)"
                    />

                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 duration-300 flex items-center gap-3 bg-[#2F3F8D] px-3 py-2 rounded-full w-fit">
                        <span className="text-white font-medium text-[16px]">{names[currentSlide]}</span>
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
                </div>
            </section>
        </>
    );
}