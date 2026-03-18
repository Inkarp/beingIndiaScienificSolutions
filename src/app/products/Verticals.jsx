'use client';

import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const profiles = [
    {
        name: "Ovens",
        description: "Hot air ovens for drying, sterilization and thermal testing.",
        link: "/products/laboratory-ovens",
        icon: "/ovens.png",
        color: "from-orange-400 to-red-500", // Unique gradient per category
    },
    {
        name: "Incubators",
        description: "Controlled temperature chambers for cell culture and microbiology.",
        link: "/products/incubators",
        icon: "/incubators.png",
        color: "from-green-400 to-emerald-500",
    },
    {
        name: "Chillers",
        description: "Precision temperature-controlled systems for lab workflows.",
        link: "/products/chillers",
        icon: "/incubators.png",
        color: "from-blue-400 to-cyan-500",
    },
    {
        name: "Water Baths",
        description: "Reliable temperature-controlled water baths for labs.",
        link: "/products/water-baths",
        icon: "/incubators.png",
        color: "from-indigo-400 to-purple-500",
    },
    {
        name: "Rotary Evaporators",
        description: "Efficient solvent evaporation systems for chemistry labs.",
        link: "/products/rotary-evaporators",
        icon: "/incubators.png",
        color: "from-pink-400 to-rose-500",
    },
    {
        name: "Pumps",
        description: "Vacuum and peristaltic pumps for lab applications.",
        link: "/products/pumps",
        icon: "/incubators.png",
        color: "from-teal-400 to-sky-500",
    },
    {
        name: "Cabinet",
        description: "Vacuum and peristaltic pumps for lab applications.",
        link: "/products/cabinet",
        image: "/about.jpg",
        icon: "/incubators.png",
        socials: { whatsapp: "https://wa.me/918019828999" },
    },

    {
        name: "Freezers",
        description: "Vacuum and peristaltic pumps for lab applications.",
        link: "/products/freezers",
        image: "/about.jpg",
        icon: "/incubators.png",
        socials: { whatsapp: "https://wa.me/918019828999" },
    },

    {
        name: "Digital Viscometer",
        description: "Vacuum and peristaltic pumps for lab applications.",
        link: "/products/digital-viscometer",
        image: "/about.jpg",
        icon: "/incubators.png",
        socials: { whatsapp: "https://wa.me/918019828999" },
    },
    {
        name: "Muffle Furnance",
        description: "Vacuum and peristaltic pumps for lab applications.",
        link: "/products/muffle-furnance",
        image: "/about.jpg",
        icon: "/incubators.png",
        socials: { whatsapp: "https://wa.me/918019828999" },
    },
];

export default function Verticals() {
    return (
        <section className="w-full py-5 relative overflow-hidden">
            {/* Heading */}
            <div className="text-center max-w-3xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl py-2 font-bold bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent drop-shadow-lg">
                    Everything you need <span className="text-[#2B7EC2] drop-shadow-md">in one place</span>
                </h2>
                <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    Scientific instruments designed to support research, testing, and production
                </p>
            </div>

            {/* Cards */}
            <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6 relative z-10">
                {profiles.map((profile, index) => (
                    <Link
                        key={index}
                        href={profile.link}
                        className="group bg-[#2F4191]  border-2 border-[#2F4191]/50 rounded-3xl p-8 flex items-start gap-6 hover:border-[#2B7EC2]/70 hover:shadow-2xl hover:shadow-[#2B7EC2]/20 hover:-translate-y-3 hover:rotate-x-1 transition-all duration-500 origin-bottom relative overflow-hidden"
                    >
                        {/* Category Badge */}
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white backdrop-blur-sm border-3 border-black/50 rounded-2xl flex items-center justify-center shadow-2xl rotate-15 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                            <span className="text-lg font-bold text-gray-800 uppercase tracking-wider drop-shadow-md">{index + 1}</span>
                        </div>

                         <div className="w-[30px] h-[30px] text-white absolute bottom-4 right-4 ">
                            <svg
                                width="30"
                                height="30"
                                viewBox="0 0 30 30"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                className='spin-slow'
                            >
                                <path d="M14.2257 0.947522C14.6258 0.457905 15.3742 0.457905 15.7743 0.947522L16.8781 2.29817C17.181 2.66879 17.704 2.77283 18.1256 2.54633L19.6623 1.72088C20.2193 1.42165 20.9107 1.70806 21.093 2.31352L21.5959 3.98376C21.7339 4.44207 22.1773 4.73834 22.6535 4.69044L24.3891 4.51587C25.0182 4.45258 25.5474 4.98179 25.4841 5.61093L25.3096 7.34647C25.2617 7.8227 25.5579 8.2661 26.0162 8.40409L27.6865 8.90697C28.2919 9.08926 28.5783 9.7807 28.2791 10.3377L27.4537 11.8744C27.2272 12.296 27.3312 12.819 27.7018 13.1219L29.0525 14.2257C29.5421 14.6258 29.5421 15.3742 29.0525 15.7743L27.7018 16.8781C27.3312 17.181 27.2272 17.704 27.4537 18.1256L28.2791 19.6623C28.5783 20.2193 28.2919 20.9107 27.6865 21.093L26.0162 21.5959C25.5579 21.7339 25.2617 22.1773 25.3096 22.6535L25.4841 24.3891C25.5474 25.0182 25.0182 25.5474 24.3891 25.4841L22.6535 25.3096C22.1773 25.2617 21.7339 25.5579 21.5959 26.0162L21.093 27.6865C20.9107 28.2919 20.2193 28.5783 19.6623 28.2791L18.1256 27.4537C17.704 27.2272 17.181 27.3312 16.8781 27.7018L15.7743 29.0525C15.3742 29.5421 14.6258 29.5421 14.2257 29.0525L13.1219 27.7018C12.819 27.3312 12.296 27.2272 11.8744 27.4537L10.3377 28.2791C9.7807 28.5783 9.08926 28.2919 8.90697 27.6865L8.40409 26.0162C8.2661 25.5579 7.8227 25.2617 7.34647 25.3096L5.61093 25.4841C4.98179 25.5474 4.45258 25.0182 4.51587 24.3891L4.69044 22.6535C4.73834 22.1773 4.44207 21.7339 3.98376 21.5959L2.31352 21.093C1.70806 20.9107 1.42165 20.2193 1.72088 19.6623L2.54633 18.1256C2.77283 17.704 2.66879 17.181 2.29817 16.8781L0.947522 15.7743C0.457905 15.3742 0.457905 14.6258 0.947522 14.2257L2.29817 13.1219C2.66879 12.819 2.77283 12.296 2.54633 11.8744L1.72088 10.3377C1.42165 9.7807 1.70806 9.08926 2.31352 8.90697L3.98376 8.40409C4.44207 8.2661 4.73834 7.8227 4.69044 7.34647L4.51587 5.61093C4.45258 4.98179 4.98179 4.45258 5.61093 4.51587L7.34647 4.69044C7.8227 4.73834 8.2661 4.44207 8.40409 3.98376L8.90697 2.31352C9.08926 1.70806 9.7807 1.42165 10.3377 1.72088L11.8744 2.54633C12.296 2.77283 12.819 2.66879 13.1219 2.29817L14.2257 0.947522Z" />
                            </svg>

                            <FaArrowRight
                                size={12}
                                className="absolute top-1/2 left-1/2 text-black transform -translate-x-1/2 -translate-y-1/2 "
                            />
                        </div>

                        {/* Icon Orb */}
                        <div className={`w-28 h-28 rounded-3xl bg-white flex items-center justify-center shrink-0 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 ring-2 ring-[#2F4191]/50 group-hover:ring-[#2B7EC2]/50`}>
                            <Image
                                src={profile.icon}
                                alt={profile.name}
                                width={100}
                                height={100}
                                className="group-hover:scale-110 transition-transform duration-300 group-hover:invert-0"
                            />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pt-4">
                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-white transition-colors duration-300 line-clamp-2">
                                {profile.name}
                            </h3>
                            <p className="mt-3 text-sm md:text-base text-white leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
                                {profile.description}
                            </p>
                        </div>                    
                    </Link>
                ))}
            </div>
        </section>
    );
}
