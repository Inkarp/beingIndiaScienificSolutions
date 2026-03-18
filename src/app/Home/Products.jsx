'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const causes = [
  {
    title: 'Ovens',
    percentage: 10,
    image: '/ovens.png',
    link: "products/laboratory-ovens",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Incubators',
    percentage: 12,
    image: '/incubators.png',
    link: "/products/incubators",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Chillers',
    percentage: 9,
    image: '/incubators.png',
    link: "/products/chillers",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Water Baths',
    percentage: 7,
    image: '/incubators.png',
    link: "/products/water-baths",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Rotary Evaporators',
    percentage: 20,
    image: '/water-baths.png',
    link: "/products/rotary-evaporators",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Pumps',
    percentage: 15,
    image: '/incubators.png',
    link: "/products/pumps",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Cabinet',
    percentage: 5,
    image: '/incubators.png',
    link: "/products/cabinet",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Freezers',
    percentage: 6,
    image: '/incubators.png',
    link: "/products/freezers",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Digital Viscometers',
    percentage: 6,
    image: '/incubators.png',
    link: "/products/digital-viscometer",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
  {
    title: 'Muffle furnance',
    percentage: 6,
    image: '/incubators.png',
    link: "/products/muffle-furnance",
    description: 'Totam rem aperiam, eaque ipsa quae ab illosa inventore veritatis et quasi.',
  },
];

export default function Products() {
  return (
    <section className="py-5 relative">
      <div className="w-full mx-auto  text-center">
        <div className="inline-flex items-center">
          <span className="px-5 py-2.5 bg-gradient-to-br from-[#2F4191]/50 to-[#2B7EC2]/50 text-xs font-bold uppercase tracking-widest border-2 border-gray-200 rounded-full shadow-sm">
            Our Products
          </span>
        </div>

        <p className="text-gray-600">
          Our <span className="text-black font-medium">Customers</span> love our products
        </p>

        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 transition-all duration-500 rounded-2xl py-3">
          {causes.map((cause, index) => (
            <div
              key={index}
              className="group border border-gray-100 shadow-xl overflow-hidden rounded-[30px] hover:border-[#2B7EC2] hover:scale-[1.05] transition-all duration-500"
            >
              <div className="relative">
                <Image
                  src={cause.image}
                  alt={cause.title}
                  width={600}
                  height={400}
                  className="w-full h-48 border-b-2 border-[#2B7EC2] bg-gradient-to-r from-blue-50 via-white to-blue-50 p-6"
                />

                <div className="absolute bottom-[-16px] left-1/3 bg-white border-2 border-[#2B7EC2] text-[#2B7EC2] font-semibold text-sm px-3 py-1 rounded-full shadow-sm">
                  <span className='text-[#2F3F8D]'>{cause.percentage}+</span> Products
                </div>
              </div>

              <div className="p-5 flex flex-col justify-center items-center text-center space-y-3">
                <h3 className="text-lg font-semibold">{cause.title}</h3>
                <p className="text-gray-500 text-sm">{cause.description}</p>

                <Link href={cause.link} >
                  <div className="flex items-center justify-center gap-3 bg-[#2F3F8D] px-3 py-2 rounded-full w-fit">
                    <span className="text-white font-medium text-[16px]">Know More</span>

                    <div className="relative w-[30px] h-[30px] text-white">
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
                  </div>
                </Link>


              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
