'use client';

import Image from 'next/image';
import { FaFileDownload, FaShare } from 'react-icons/fa';
import { FcCollaboration } from 'react-icons/fc';
import ProductTabs from './ProductsTab';
import ProductTabContent from './ProductTabContent';

export default function ProductActionSection({
    product,
    activeTab,
    setActiveTab,
    handleShare,
    priceUnlocked,
    setIsPriceOpen,
    setIsEnquiryOpen,
    setIsExclusivePatnership,
    setIsServiceOpen,
    setIsServiceRenewalOpen
}) {
    return (
        <div className="mt-5 border border-gray-200 rounded-2xl">

            {/* ================= ACTION BAR ================= */}
            <div
                className="bg-gray-200 rounded-t-2xl px-4 py-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center"
            >

                {/* ===== ROW 1 : BRAND / PARTNER (MOBILE) ===== */}
                <div className="flex justify-center lg:justify-start items-center gap-4 flex-wrap">
                    <button
                        onClick={() => setIsExclusivePatnership(true)}
                        className="group flex items-center gap-3 bg-[#2B7EC2] text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#2F4191] transition duration-300 hover:scale-105 cursor-pointer"
                    >
                        <span className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                            <FcCollaboration size={18} />
                        </span>
                        <span className="leading-tight text-left">
                            <span className="block">Be Our</span>
                            <span className="block font-bold">Exclusive Partner</span>
                        </span>
                    </button>
                    {product.gem && (
                        <Image
                            src="/Gem.png"
                            alt="Gem Product"
                            width={90}
                            height={90}
                            className="shrink-0"
                        />
                    )}
                </div>

                {/* ===== ROW 2 : ACTION BUTTONS ===== */}
                <div
                    className="flex flex-wrap justify-center gap-3 lg:justify-end"
                >
                    <button
                        onClick={() => setIsEnquiryOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white text-[#2F4191] border border-[#2F4191] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2F4191] hover:text-white transition duration-300 w-full sm:w-auto cursor-pointer hover:scale-105"
                    >
                        <FaFileDownload size={14} />
                        Download Brochure
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 bg-white text-[#2F4191] border border-[#2F4191] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2F4191] hover:text-white transition duration-300 w-full sm:w-auto cursor-pointer hover:scale-105"
                    >
                        <FaShare size={14} />
                        Share
                    </button>
                     <button
                        onClick={() => setIsEnquiryOpen(true)}
                        className="bg-[#2F4191] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2B7EC2] transition duration-300 w-full sm:w-auto cursor-pointer hover:scale-105"
                    >
                        Get a Quote
                    </button>
                    {product.price && (
                        <button
                            onClick={() => !priceUnlocked && setIsPriceOpen(true)}
                            className="bg-[#2F4191] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2B7EC2] transition duration-300 w-full sm:w-auto cursor-pointer hover:scale-105"

                        >
                            {priceUnlocked ? `₹ ${product.price}` : 'Request Price'}
                        </button>
                    )}
                    <button
                        onClick={() => setIsEnquiryOpen(true)}
                        className="bg-[#2F4191] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2B7EC2] transition duration-300 w-full sm:w-auto cursor-pointer hover:scale-105"
                    >
                        Enquiry
                    </button>
                </div>
            </div>


            {/* ================= TABS ================= */}
            <ProductTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                hasFeatures={product.features?.items?.length > 0}
                hasSpecs={product.specifications?.items?.length > 0}
                hasApplications={product.applications?.items?.length > 0}
                hasFaqs={Array.isArray(product.faqs?.items) && product.faqs.items.length > 0}
                hasServices={!!product.services}
                hasFeedback={!!product.installations}
            />

            {/* ================= TAB CONTENT ================= */}
            <ProductTabContent
                product={product}
                activeTab={activeTab}
                setIsServiceOpen={setIsServiceOpen}
                setIsServiceRenewalOpen={setIsServiceRenewalOpen}
            />
        </div>
    );
}
