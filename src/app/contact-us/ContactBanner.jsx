'use client';
export default function ContactHeader() {
  return (
    <section className="relative h-[300px] w-full overflow-hidden">
      {/* Background image with dark overlay */}
      <div className="absolute inset-0">
        {/* <img
          src="/about-us.png" // Replace with actual image
          alt="Contact Banner"
          className="w-full h-full object-cover"
        /> */}
        <div className="absolute inset-0 bg-[#2F4191] rounded-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-between px-10 text-white">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <div className="bg-white px-5 py-2 rounded-md shadow">
          <span className="text-blue-600 font-semibold">Home</span>  <span className="text-blue-700 font-bold">Contact Us</span>
        </div>
      </div>
    </section>
  );
}
